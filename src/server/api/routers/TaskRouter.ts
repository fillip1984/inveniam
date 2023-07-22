import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"; // ES Modules import
import { endOfWeek, format, startOfWeek } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import fs from "fs";
import { z } from "zod";
import { renderStatusReportEmail } from "~/email/EmailTemplates";
import { prisma } from "~/server/db";
import {
  taskFormSchema,
  taskPositionUpdate,
  type StatusReportType,
} from "~/utils/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const uploadsDir = process.cwd() + "/public/uploads";

export const TaskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        description: z.string().nullish(),
        position: z.number(),
        bucketId: z.string(),
      })
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
      })
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
          attachments: true,
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
      if (input.attachments[0]) {
        const dataUrl = input.attachments[0].imageData_Base64Encoded as string;
        const data = dataUrl.split(",")[1] as string;
        const buffer = Buffer.from(data, "base64");
        fs.writeFileSync(`${uploadsDir}/test.jpg`, buffer);
      }

      const freshAttachments = await ctx.prisma.attachment.findMany({
        where: { taskId: input.id },
      });
      const freshAttachmentIds = freshAttachments.map((a) => a.id);
      const currentAttachmentIds = input.attachments.map(
        (a) => a.id
      ) as string[];
      const attachmentDeletes = freshAttachmentIds.filter(
        (a) => !currentAttachmentIds.includes(a)
      );
      await ctx.prisma.attachment.deleteMany({
        where: {
          id: {
            in: attachmentDeletes,
          },
        },
      });
      const attachmentAdds = currentAttachmentIds.filter(
        (a) => !freshAttachmentIds.includes(a)
      );
      for (const attachmentId of attachmentAdds) {
        const attachment = input.attachments.find((a) => a.id === attachmentId);
        if (!attachment) {
          throw new Error("Unable to find attachment by id: " + attachmentId);
        }
        await ctx.prisma.attachment.create({
          data: {
            text: attachment.text,
            added: attachment.added,
            taskId: input.id,
            location: `/uploads/test.jpg`,
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
        (c) => !currentCommentIds.includes(c)
      );
      await ctx.prisma.comment.deleteMany({
        where: {
          id: {
            in: commentDeletes,
          },
        },
      });
      const commentAdds = currentCommentIds.filter(
        (c) => !freshCommentIds.includes(c)
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
          },
        });
      }

      //date time adjustments
      console.log(input.startDate, input.dueDate);
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
      console.log(
        "adjusted to hardcoded timezone! America/New_York, should pull from user's location or preferences",
        input.startDate,
        input.dueDate
      );

      const result = ctx.prisma.task.update({
        where: {
          id: input.id,
        },
        data: {
          text: input.text,
          description: input.description,
          complete: input.complete,
          status: input.status,
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.task.delete({
        where: {
          id: input.taskId,
        },
      });

      return result;
    }),
  status: protectedProcedure.query(async ({ ctx }) => {
    const result = generateStatusReport(ctx.session.user.id);
    return result;
  }),
  sendReportEmail: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      console.log("sending email");
      const status = await generateStatusReport(ctx.session.user.id);

      const email = renderStatusReportEmail(status);
      if (!email) {
        throw new Error("failed to render email content");
      }

      const client = new SESClient({
        region: "us-east-1",
      });
      const input = {
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
      const command = new SendEmailCommand(input);
      await client.send(command);

      return "sucess";
    } catch (e) {
      console.error("sending email error", e);
      return e;
    }
  }),
});

const generateStatusReport = async (userId: string) => {
  const date = new Date();

  const overdueQuery = prisma.task.findMany({
    where: {
      userId: userId,
      dueDate: {
        lt: date,
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
      dueDate: date,
      complete: false,
    },
    select: {
      id: true,
      text: true,
      description: true,
    },
  });

  const dueThisWeekQuery = prisma.task.findMany({
    where: {
      dueDate: {
        gte: startOfWeek(date),
        lte: endOfWeek(date),
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
        gte: startOfWeek(date),
        lte: endOfWeek(date),
      },
      complete: true,
    },
    select: {
      id: true,
      text: true,
      description: true,
    },
  });

  const [overdue, dueToday, dueThisWeek, completedThisWeek] = await Promise.all(
    [overdueQuery, dueTodayQuery, dueThisWeekQuery, completedThisWeekQuery]
  );

  const status: StatusReportType = {
    date,
    overdue,
    dueToday,
    dueThisWeek,
    completedThisWeek,
  };

  return status;
};
