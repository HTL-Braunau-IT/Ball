import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { reservesInput } from "~/types";
import { z } from "zod";

export const reservesRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const reserves = await ctx.db.ticketReserves.findMany({
      include: { 
        type: true, 
        deliveryMethods: true,
        soldTickets: {
          select: {
            id: true,
            buyerId: true,
            soldPrice: true
          }
        }
      }
    });
    return reserves.map(({ id, type, amount, price, updatedAt, updatedBy, deliveryMethods, soldTickets }) => ({ 
      id,
      type, 
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