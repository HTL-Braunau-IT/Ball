import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { reservesInput } from "~/types";

export const reservesRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const reserves = await ctx.db.ticketReserves.findMany({
      include: { 
        type: true, 
        deliveryMethods: true,
        soldTickets: true
      }
    });
    return reserves.map(({ type, amount, price, updatedAt, updatedBy, deliveryMethods, soldTickets }) => ({ 
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
  })
});