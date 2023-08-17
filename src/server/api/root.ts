import { createTRPCRouter } from "~/server/api/trpc";
import { AdminRouter } from "./routers/AdminRouter";
import { BoardRouter } from "./routers/BoardRouter";
import { TagRouter } from "./routers/TagRouter";
import { TaskRouter } from "./routers/TaskRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: AdminRouter,
  boards: BoardRouter,
  tags: TagRouter,
  tasks: TaskRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
