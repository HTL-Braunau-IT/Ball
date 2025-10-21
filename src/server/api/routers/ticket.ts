import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const ticketRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const tickets = await ctx.db.soldTickets.findMany({
      // Z - Uncomment or use in another router to only return owned tickets
      // where: {
      //   buyerId: parseInt(ctx.session.user.id),
      // },
    });
    return tickets.map(({ id, delivery, code, paid, sent, timestamp }) => ({ id, delivery, code, paid, sent, timestamp }));
  })
});
