import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const buyerGroupsRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const buyerGroups = await ctx.db.buyerGroups.findMany({
      include: {
        ticketReserves: {
          select: {
            id: true,
            amount: true,
            price: true,
            type: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return buyerGroups.map(({ id, name, maxTickets, updatedAt, updatedBy, ticketReserves }) => ({
      id,
      name,
      maxTickets,
      updatedAt,
      updatedBy,
      ticketReserves
    }));
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        maxTickets: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.buyerGroups.update({
        where: { id: input.id },
        data: {
          maxTickets: input.maxTickets,
          updatedBy: ctx.session.user.name ?? "Unbekannt",
        },
      });
    }),
});

