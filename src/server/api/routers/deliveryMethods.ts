import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const deliveryMethodsRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const methods = await ctx.db.deliveryMethods.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    return methods;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        surcharge: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deliveryMethods.update({
        where: { id: input.id },
        data: {
          surcharge: input.surcharge,
        },
      });
    }),
});

