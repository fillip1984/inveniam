import { createTRPCRouter } from "~/server/api/trpc";
import { BoardRouter } from "./routers/BoardRouter";
import { TagRouter } from "./routers/TagRouter";
import { TaskRouter } from "./routers/TaskRouter";
import { exampleRouter } from "./routers/example";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  boards: BoardRouter,
  tags: TagRouter,
  tasks: TaskRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
