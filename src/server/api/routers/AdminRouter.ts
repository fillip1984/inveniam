import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const AdminRouter = createTRPCRouter({
  export: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.prisma.board.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        name: true,
        description: true,
        buckets: {
          select: {
            name: true,
            position: true,
            tasks: {
              select: {
                text: true,
                description: true,
                position: true,
                startDate: true,
                dueDate: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return result;
  }),
  import: protectedProcedure
    .input(z.object({ data: z.string() }))
    .mutation(({ ctx, input }) => {
      console.log("importing", input);
    }),
});
