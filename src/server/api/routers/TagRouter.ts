import { tagFormSchema } from "~/utils/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const TagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tagFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.tag.create({
        data: {
          name: input.name,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
      return result;
    }),
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.tag.findMany({ orderBy: { name: "asc" } });
    return result;
  }),
  readOne: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.prisma.tag.findUnique({
        where: { id: input.id },
      });
      return tag;
    }),
  update: protectedProcedure
    .input(tagFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = ctx.prisma.tag.update({
        where: {
          id: input.id as string,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });
      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = ctx.prisma.tag.delete({
        where: {
          id: input.id,
        },
      });
      return result;
    }),
});
