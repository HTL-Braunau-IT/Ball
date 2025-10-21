import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { ticketRouter } from "~/server/api/routers/ticket";
import { reservesRouter } from "~/server/api/routers/reserves";
import { buyersRouter } from "~/server/api/routers/buyers";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  reserves: reservesRouter,
  buyers: buyersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.ticket.all();
 */
export const createCaller = createCallerFactory(appRouter);
