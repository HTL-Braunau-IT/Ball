import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const buyersRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const buyers = await ctx.db.buyers.findMany({
      include: { group: true }
    });
    return buyers.map(({ id, name, email, address, postal, province, country, verified, maxTickets, group }) => ({ 
      id, name, email, address, postal, province, country, verified, maxTickets, group 
    }));
  })
});
