import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const buyerRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const tickets = await ctx.db.soldTickets.findMany({
      where: {
        buyerId: parseInt(ctx.session.user.id),
      },
    });
    return tickets.map(({ id, delivery, code, paid, sent, timestamp }) => ({ id, delivery, code, paid, sent, timestamp }));
  })
});
