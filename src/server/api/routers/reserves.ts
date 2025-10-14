import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const reservesRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const reserves = await ctx.db.ticketReserves.findMany({
      include: { type: true, deliveryMethods: true }
    });
    return reserves.map(({ type, amount, price, updatedAt, updatedBy, deliveryMethods }) => ({ type, amount, price, updatedAt, updatedBy, deliveryMethods }));
  })
});



