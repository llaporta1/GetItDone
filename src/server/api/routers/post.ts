import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

const ListInput    = z.object({ done: z.boolean().optional() }).optional();
const CreateInput  = z.object({ text: z.string().min(1, "Task text is required") });
const ToggleInput  = z.object({ id: z.string(), done: z.boolean() });
const RenameInput  = z.object({ id: z.string(), text: z.string().min(1) });
const RemoveInput  = z.object({ id: z.string() });

export const taskRouter = createTRPCRouter({
  // Read
  list: publicProcedure
    .input(ListInput)
    .query(async ({ ctx, input }) => {
      const where: Prisma.TaskWhereInput = {};
      const userId = ctx.session?.user?.id;
      if (userId) where.userId = userId;
      if (input?.done !== undefined) where.done = input.done;

      return ctx.db.task.findMany({
        where,
        orderBy: [{ done: "asc" }, { createdAt: "desc" }],
      });
    }),

  // Create
  create: publicProcedure
    .input(CreateInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      return ctx.db.task.create({
        data: { text: input.text, ...(userId ? { userId } : {}) },
      });
    }),

  // Update: toggle done
  toggle: publicProcedure
    .input(ToggleInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: { id: input.id },
        data: { done: input.done },
      });
    }),

  // Update
  rename: publicProcedure
    .input(RenameInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: { id: input.id },
        data: { text: input.text },
      });
    }),

  remove: publicProcedure
    .input(RemoveInput)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.task.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
