import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Bucket } from "sst/node/bucket";

import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"; // ES Modules import
import {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { z } from "zod";
import { renderStatusReportEmail } from "~/email/EmailTemplates";
import { prisma } from "~/server/db";
import {
  taskFormSchema,
  taskPositionUpdate,
  type S3PresignedUrlType,
  type StatusReportType,
} from "~/utils/types";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const TaskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        description: z.string().nullish(),
        position: z.number(),
        bucketId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.task.create({
        data: {
          text: input.text,
          description: input.description,
          position: input.position,
          bucketId: input.bucketId,
          userId: ctx.session.user.id,
        },
      });

      return result;
    }),
  readOne: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.task.findUnique({
        where: {
          id: input.taskId,
        },
        include: {
          checkListItems: true,
          tags: {
            include: {
              tag: true,
            },
          },
          comments: true,
          attachments: {
            include: {
              link: true,
            },
          },
          bucket: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      return result;
    }),
  update: protectedProcedure
    .input(taskFormSchema)
    .mutation(async ({ ctx, input }) => {
      const freshAttachments = await ctx.prisma.attachment.findMany({
        where: { taskId: input.id },
      });
      const freshAttachmentIds = freshAttachments.map((a) => a.id);
      const currentAttachmentIds = input.attachments.map(
        (a) => a.id,
      ) as string[];
      const attachmentDeletes = freshAttachmentIds.filter(
        (a) => !currentAttachmentIds.includes(a),
      );
      await ctx.prisma.attachment.deleteMany({
        where: {
          id: {
            in: attachmentDeletes,
          },
        },
      });
      const attachmentAdds = currentAttachmentIds.filter(
        (a) => !freshAttachmentIds.includes(a),
      );
      for (const attachmentId of attachmentAdds) {
        const attachment = input.attachments.find((a) => a.id === attachmentId);
        if (!attachment) {
          throw new Error("Unable to find attachment by id: " + attachmentId);
        }

        const link = await ctx.prisma.s3StoredObject.create({
          data: {
            url: attachment.link.url,
            bucketName: attachment.link.bucketName,
            key: attachment.link.key,
            userId: ctx.session.user.id,
          },
        });

        await ctx.prisma.attachment.create({
          data: {
            text: attachment.text,
            added: attachment.added,
            taskId: input.id,
            linkId: link.id,
            userId: ctx.session.user.id,
          },
        });
      }

      const freshTaskTagList = await ctx.prisma.taskTags.findMany({
        where: { taskId: input.id },
      });
      const freshTagIds = freshTaskTagList.map((t) => t.tagId);
      const currentTagIds = input.taskTag.map((t) => t.tag.id) as string[];
      const tagDeletes = freshTagIds.filter((t) => !currentTagIds.includes(t));
      await ctx.prisma.taskTags.deleteMany({
        where: {
          tagId: {
            in: tagDeletes,
          },
        },
      });
      const tagAdds = currentTagIds.filter((t) => !freshTagIds.includes(t));
      for (const tagId of tagAdds) {
        await ctx.prisma.taskTags.create({
          data: {
            tagId,
            taskId: input.id,
          },
        });
      }

      const freshComments = await ctx.prisma.comment.findMany({
        where: { taskId: input.id },
      });
      const freshCommentIds = freshComments.map((c) => c.id);
      const currentCommentIds = input.comments.map((c) => c.id) as string[];
      const commentDeletes = freshCommentIds.filter(
        (c) => !currentCommentIds.includes(c),
      );
      await ctx.prisma.comment.deleteMany({
        where: {
          id: {
            in: commentDeletes,
          },
        },
      });
      const commentAdds = currentCommentIds.filter(
        (c) => !freshCommentIds.includes(c),
      );
      for (const commentAdd of commentAdds) {
        const comment = input.comments.find((c) => c.id === commentAdd);
        if (!comment) {
          throw new Error("Unable to find comment by id: " + commentAdd);
        }
        await ctx.prisma.comment.create({
          data: {
            text: comment.text,
            posted: comment.posted,
            taskId: input.id,
            userId: ctx.session.user.id,
          },
        });
      }

      // shoddy solution but this works to maintain checklist items...should be separated out
      const freshChecklist = await ctx.prisma.checkListItem.findMany({
        where: { taskId: input.id },
      });
      const freshIds = freshChecklist.map((i) => i.id);
      const currentIds = input.checklistItems.map((i) => i.id);
      const deletes = freshIds.filter((i) => !currentIds.includes(i));
      await ctx.prisma.checkListItem.deleteMany({
        where: {
          id: {
            in: deletes,
          },
        },
      });
      for (const item of input.checklistItems) {
        await ctx.prisma.checkListItem.upsert({
          where: {
            id: item.id ?? "",
          },
          update: {
            text: item.text,
            complete: item.complete,
          },
          create: {
            text: item.text,
            complete: item.complete,
            taskId: input.id,
            userId: ctx.session.user.id,
          },
        });
      }

      //date time adjustments
      if (input.startDate) {
        input.startDate = zonedTimeToUtc(input.startDate, "America/New_York");
      } else {
        input.startDate = null;
      }

      if (input.dueDate) {
        input.dueDate = zonedTimeToUtc(input.dueDate, "America/New_York");
      } else {
        input.dueDate = null;
      }

      // TODO: stop hard coding timezone
      if (input.startDate || input.dueDate) {
        console.warn(
          "adjusted to hardcoded timezone! America/New_York, should pull from user's location or preferences",
          input.startDate,
          input.dueDate,
        );
      }

      let bucketId = input.bucketId;
      console.log({ bucketId });
      if (input.complete) {
        const completeBucket = await ctx.prisma.bucket.findFirst({
          where: {
            boardId: input.boardId,
            userId: ctx.session.user.id,
            name: {
              equals: "Complete",
              mode: "insensitive",
            },
          },
          select: {
            id: true,
          },
        });

        if (completeBucket) {
          bucketId = completeBucket.id;
        }
      }
      console.log({ bucketId });

      const result = ctx.prisma.task.update({
        where: {
          id: input.id,
        },
        data: {
          text: input.text,
          description: input.description,
          complete: input.complete,
          bucketId,
          // status: input.status,
          priority: input.priority,
          startDate: input.startDate,
          dueDate: input.dueDate,
        },
      });

      return result;
    }),
  updatePositions: protectedProcedure
    .input(z.object({ tasks: z.array(taskPositionUpdate) }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.$transaction(async (tx) => {
        for (const task of input.tasks) {
          await tx.task.update({
            where: {
              id: task.id,
            },
            data: {
              position: task.position,
              bucketId: task.bucketId,
            },
          });
        }
      });

      return result;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.task.delete({
        where: {
          id: input.taskId,
        },
      });

      return result;
    }),
  generateS3PresignedUrl: protectedProcedure.query(async ({ ctx }) => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    console.log(
      "Generating S3 presigned url for user: ",
      ctx.session.user.email,
    );

    const bucketName = Bucket["inveniam-attachment-storage"].bucketName;
    const key = crypto.randomUUID();

    const command = new PutObjectCommand({
      ACL: "public-read",
      Key: key,
      Bucket: bucketName,
    });
    const url = await getSignedUrl(new S3Client({}), command);

    const presignedUrl: S3PresignedUrlType = {
      url,
      bucketName,
      key,
    };

    // console.log(
    //   "Generated S3 presigned url for user: ",
    //   ctx.session.user,
    //   "S3 presigned url: ",
    //   url
    // );
    return presignedUrl;
  }),
  status: protectedProcedure.query(async ({ ctx }) => {
    const result = generateStatusReport(ctx.session.user.id);
    return result;
  }),
  sendReportEmail: publicProcedure
    // .input(z.object({ userId: z.string() }))
    .query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany();
      for (const user of users) {
        if (!user.email) {
          throw new Error(
            "Unable to check if user has been invited due to user not having an email value",
          );
        }
        const invitation = await ctx.prisma.invitation.findFirst({
          where: {
            email: user.email,
          },
        });
        if (
          invitation?.enabled &&
          invitation.email !== "fillip1984@gmail.com"
        ) {
          console.warn(
            "Invitation is either not enabled or email has not verified by aws ses so no report sent",
          );
          continue;
        }
        try {
          const status = await generateStatusReport(user.id);

          const email = renderStatusReportEmail(status);
          if (!email) {
            throw new Error("failed to render email content");
          }

          const client = new SESClient({
            region: "us-east-1",
          });
          const emailOptions = {
            Source: "inveniam@illizen.com",
            Destination: {
              ToAddresses: ["fillip1984@gmail.com"],
              // CcAddresses: ["STRING_VALUE"],
              // BccAddresses: ["STRING_VALUE"],
            },
            Message: {
              Subject: {
                Data: `Status for ${format(new Date(), "EEEE (M/dd)")}`,
              },
              Body: {
                Html: {
                  Data: email,
                },
              },
            },
            // ReplyToAddresses: ["STRING_VALUE"],
            // ReturnPath: "STRING_VALUE",
            // SourceArn: "STRING_VALUE",
            // ReturnPathArn: "STRING_VALUE",
            // Tags: [
            // MessageTagList
            // {
            // MessageTag
            // Name: "STRING_VALUE", // required
            // Value: "STRING_VALUE", // required
            // },
            // ],
            // ConfigurationSetName: "STRING_VALUE",
          };
          const command = new SendEmailCommand(emailOptions);
          await client.send(command);

          return "success";
        } catch (e) {
          console.error("sending email error", e);
          return e;
        }
      }
    }),
});

const generateStatusReport = async (userId: string) => {
  const timezone = "America/New_York";
  const nowUTC = new Date();
  const now = utcToZonedTime(nowUTC, timezone);
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const overdueQuery = prisma.task.findMany({
    where: {
      userId: userId,
      dueDate: {
        lt: zonedTimeToUtc(today, timezone),
      },
      complete: false,
    },
    select: {
      id: true,
      text: true,
      description: true,
    },
  });

  const dueTodayQuery = prisma.task.findMany({
    where: {
      dueDate: {
        gte: zonedTimeToUtc(todayStart, timezone),
        lte: zonedTimeToUtc(todayEnd, timezone),
      },
      complete: false,
    },
    select: {
      id: true,
      text: true,
      description: true,
    },
  });

  const upcomingQuery = prisma.task.findMany({
    where: {
      dueDate: {
        gte: zonedTimeToUtc(tomorrow, timezone),
        lte: zonedTimeToUtc(weekEnd, timezone),
      },
      complete: false,
    },
    select: {
      id: true,
      text: true,
      description: true,
    },
  });

  const completedThisWeekQuery = prisma.task.findMany({
    where: {
      dueDate: {
        gte: zonedTimeToUtc(weekStart, timezone),
        lte: zonedTimeToUtc(weekEnd, timezone),
      },
      complete: true,
    },
    select: {
      id: true,
      text: true,
      description: true,
    },
  });

  const [overdue, dueToday, upcoming, completedThisWeek] = await Promise.all([
    overdueQuery,
    dueTodayQuery,
    upcomingQuery,
    completedThisWeekQuery,
  ]);

  const status: StatusReportType = {
    date: now,
    overdue,
    dueToday,
    upcoming,
    completedThisWeek,
  };

  return status;
};
