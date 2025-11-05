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
        maxTickets: z.number().min(0),
        reserveId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If reserveId is provided, validate maxTickets against remaining tickets (available)
      if (input.reserveId) {
        const reserve = await ctx.db.ticketReserves.findUnique({
          where: { id: input.reserveId },
          include: {
            soldTickets: {
              select: {
                id: true
              }
            }
          }
        });

        if (!reserve) {
          throw new Error("Reserve not found");
        }

        const soldCount = reserve.soldTickets?.length || 0;
        const remainingCount = reserve.amount - soldCount;

        if (input.maxTickets > remainingCount) {
          throw new Error(`Max Tickets (${input.maxTickets}) cannot exceed available tickets (${remainingCount} von ${reserve.amount} insgesamt)`);
        }
      }

      return ctx.db.buyerGroups.update({
        where: { id: input.id },
        data: {
          maxTickets: input.maxTickets,
          updatedBy: ctx.session.user.name ?? "Unbekannt",
        },
      });
    }),
});

