import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const systemSettingsRouter = createTRPCRouter({
  // Get sales enabled status (public for homepage access)
  getSalesEnabled: publicProcedure.query(async ({ ctx }) => {
    const setting = await ctx.db.systemSettings.findUnique({
      where: { id: 1 },
    });
    // Default to true if row doesn't exist (backward compatible)
    return setting?.salesEnabled ?? true;
  }),

  // Toggle sales enabled (admin only)
  setSalesEnabled: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is a backend user (admin)
      const backendUser = await ctx.db.backendUsers.findUnique({
        where: { email: ctx.session.user.email! },
      });

      if (!backendUser) {
        throw new Error("Unauthorized: Backend access required");
      }

      await ctx.db.systemSettings.upsert({
        where: { id: 1 },
        update: {
          salesEnabled: input.enabled,
          updatedBy: ctx.session.user.name ?? "Unknown",
        },
        create: {
          id: 1,
          salesEnabled: input.enabled,
          updatedBy: ctx.session.user.name ?? "Unknown",
        },
      });

      return { success: true, enabled: input.enabled };
    }),
});

