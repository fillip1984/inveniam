import { tagFormSchema } from "~/utils/types";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const TagRouter = createTRPCRouter({
  create: publicProcedure
    .input(tagFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.tag.create({
        data: { name: input.name, description: input.description },
      });
      return result;
    }),
  readAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.tag.findMany({ orderBy: { name: "asc" } });
    return result;
  }),
  readOne: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.prisma.tag.findUnique({
        where: { id: input.id },
      });
      return tag;
    }),
  update: publicProcedure
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
  delete: publicProcedure
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
