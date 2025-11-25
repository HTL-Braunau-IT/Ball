import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { reservesInput } from "~/types";
import { z } from "zod";

export const reservesRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const reserves = await ctx.db.ticketReserves.findMany({
      include: { 
        type: {
          orderBy: {
            name: 'asc'
          },
          select: {
            id: true,
            name: true,
            maxTickets: true
          }
        }, 
        deliveryMethods: true,
        soldTickets: {
          select: {
            id: true,
            buyerId: true,
            soldPrice: true,
            paid: true
          }
        }
      }
    });
    
    // Sort reserves by type name (first type's name)
    const sortedReserves = reserves.sort((a, b) => {
      const aTypeName = a.type[0]?.name || '';
      const bTypeName = b.type[0]?.name || '';
      return aTypeName.localeCompare(bTypeName);
    });
    
    return sortedReserves.map(({ id, type, amount, price, updatedAt, updatedBy, deliveryMethods, soldTickets }) => ({ 
      id,
      type: type.map(t => ({ id: t.id, name: t.name, maxTickets: t.maxTickets })), 
      amount, 
      price, 
      updatedAt, 
      updatedBy, 
      deliveryMethods,
      soldTickets
    }));
  }),
  
  getTypes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.buyerGroups.findMany();
  }),
  
  getDeliveryMethods: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.deliveryMethods.findMany();
  }),
  
  create: protectedProcedure.input(reservesInput).mutation(async ({ ctx, input }) => {
    return ctx.db.ticketReserves.create({
      data: {
        amount: input.amount,
        price: input.price,  
        type: {
          connect: { id: input.typeId}
        },
        deliveryMethods: {
          connect: input.deliveryMethodIds.map(id => ({ id}))
        }, 
        updatedBy: ctx.session.user.name ?? "Unbekannt"
      }
    });
  }),

  update: protectedProcedure.input(
    reservesInput.extend({
      id: z.number()
    })
  ).mutation(async ({ ctx, input }) => {
    // Validate that amount is not negative (schema already enforces min 0, but double-check)
    if (input.amount < 0) {
      throw new Error("Die Anzahl darf nicht negativ sein.");
    }

    const currentReserve = await ctx.db.ticketReserves.findUnique({
      where: { id: input.id }
    });

    if (!currentReserve) {
      throw new Error("Kontingent nicht gefunden");
    }

    return ctx.db.ticketReserves.update({
      where: { id: input.id },
      data: {
        amount: input.amount,
        price: input.price,
        type: {
          set: [],
          connect: { id: input.typeId }
        },
        deliveryMethods: {
          set: [],
          connect: input.deliveryMethodIds.map(id => ({ id }))
        },
        updatedBy: ctx.session.user.name ?? "Unbekannt"
      }
    });
  })
});