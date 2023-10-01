import {
  addDays,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { z } from "zod";
import { boardFormSchema, bucketPositionUpdate } from "~/utils/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// TODO: this is hardcoded and baaaad. Should do what we did in ex-nhilio and ask user for their timezone
const userTimezone = "America/New_York";

export const BoardRouter = createTRPCRouter({
  create: protectedProcedure
    .input(boardFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.board.create({
        data: {
          name: input.name,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
      return result;
    }),
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const results = await ctx.prisma.board.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        buckets: {
          select: {
            name: true,
            tasks: {
              select: {
                text: true,
                description: true,
                complete: true,
              },
            },
          },
        },
      },
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: { name: "desc" },
    });
    return results;
  }),
  readOne: protectedProcedure
    .input(z.object({ id: z.string().cuid(), search: z.string().nullish() }))
    .query(async ({ ctx, input }) => {
      let tagSearch = undefined;
      let dueStart: Date | null = null;
      let dueEnd: Date | null = null;
      let noDue = false;
      let textContains = input.search ?? "";
      if (input.search?.includes('tag:"')) {
        textContains = input.search.replace("tag:", "").trim();
        // const tagName = /"([^"]*)"/.exec(textContains);
        const tagName = textContains.match(/"([^"]*)"/);
        if (tagName && tagName[1]) {
          tagSearch = tagName[1];
          textContains = textContains.replace(tagSearch, "").trim();
        }
      } else if (input.search?.includes("due:none")) {
        textContains = textContains.replace("due:none", "").trim();
        noDue = true;
      } else if (input.search?.includes("due:today")) {
        textContains = textContains.replace("due:today", "").trim();
        dueStart = startOfDay(utcToZonedTime(new Date(), userTimezone));
        dueEnd = endOfDay(dueStart);
      } else if (input.search?.includes("due:this week")) {
        textContains = textContains.replace("due:this week", "").trim();
        dueStart = startOfWeek(utcToZonedTime(new Date(), userTimezone));
        dueEnd = endOfWeek(dueStart);
      } else if (input.search?.includes("overdue:true")) {
        textContains = textContains.replace("overdue:true", "").trim();
        dueStart = new Date(0);
        dueEnd = addDays(
          endOfDay(utcToZonedTime(new Date(), userTimezone)),
          -1,
        );
      }

      console.dir({ dueStart, dueEnd, textContains, tagSearch });

      const board = await ctx.prisma.board.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
        include: {
          buckets: {
            orderBy: {
              position: "asc",
            },
            include: {
              tasks: {
                // See: https://stackoverflow.com/questions/72197774/how-to-call-where-clause-conditionally-prisma
                where: {
                  // find tasks with no due date
                  ...(tagSearch
                    ? {
                        tags: {
                          some: {
                            tag: {
                              name: tagSearch,
                            },
                          },
                        },
                      }
                    : noDue
                    ? {
                        dueDate: {
                          equals: null,
                        },
                        OR: [
                          {
                            text: {
                              contains: textContains,
                              mode: "insensitive",
                            },
                          },
                          {
                            description: {
                              contains: textContains,
                              mode: "insensitive",
                            },
                          },
                        ],
                      }
                    : dueStart && dueEnd
                    ? // find tasks with specific date ranges
                      {
                        dueDate: {
                          gte: dueStart,
                          lte: dueEnd,
                        },
                        OR: [
                          {
                            text: {
                              contains: textContains,
                              mode: "insensitive",
                            },
                          },
                          {
                            description: {
                              contains: textContains,
                              mode: "insensitive",
                            },
                          },
                        ],
                      }
                    : {
                        // search by text/description
                        OR: [
                          {
                            text: {
                              contains: textContains,
                              mode: "insensitive",
                            },
                          },
                          {
                            description: {
                              contains: textContains,
                              mode: "insensitive",
                            },
                          },
                        ],
                      }),
                },
                orderBy: {
                  position: "asc",
                },
                include: {
                  checkListItems: {
                    orderBy: {
                      createdAt: "asc",
                    },
                  },
                  tags: {
                    include: {
                      tag: true,
                    },
                  },
                  comments: {
                    orderBy: {
                      createdAt: "asc",
                    },
                  },
                  attachments: {
                    include: {
                      link: true,
                    },
                    orderBy: {
                      createdAt: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      });

      return board;
    }),
  update: protectedProcedure
    .input(boardFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new Error("unable to update without id");
      }

      const result = await ctx.prisma.board.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });

      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.board.delete({
        where: {
          id: input.id,
        },
      });
    }),
  readAllBuckets: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = ctx.prisma.bucket.findMany({
        where: { boardId: input.boardId },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          position: "asc",
        },
      });
      return results;
    }),
  addBucket: protectedProcedure
    .input(
      z.object({
        bucketName: z.string().min(1),
        position: z.number(),
        boardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.bucket.create({
        data: {
          name: input.bucketName,
          position: input.position,
          boardId: input.boardId,
          userId: ctx.session.user.id,
        },
      });

      return result;
    }),
  updateBucketPositions: protectedProcedure
    .input(z.object({ buckets: z.array(bucketPositionUpdate) }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.$transaction(async (tx) => {
        for (const bucket of input.buckets) {
          await tx.bucket.update({
            where: {
              id: bucket.id,
            },
            data: {
              position: bucket.position,
            },
          });
        }
      });

      return result;
    }),
  removeBucket: protectedProcedure
    .input(
      z.object({
        bucketId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.bucket.delete({
        where: {
          id: input.bucketId,
        },
      });

      return result;
    }),
});
