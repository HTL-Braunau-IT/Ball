import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const buyersRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const buyers = await ctx.db.buyers.findMany({
      include: { group: true }
    });
    return buyers.map(({ id, name, email, address, postal, province, country, verified, maxTickets, group }) => ({ 
      id, name, email, address, postal, province, country, verified, maxTickets, group 
    }));
  }),

  // Import alumni from CSV
  importAlumni: protectedProcedure
    .input(z.object({
      csvContent: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { csvContent } = input;
      
      // Get Absolventen group
      const alumniGroup = await ctx.db.buyerGroups.findFirst({
        where: { name: "Absolventen" }
      });

      if (!alumniGroup) {
        throw new Error("Absolventen group not found. Please run seed-buyer-groups script first.");
      }

      // Parse CSV content
      const lines = csvContent.trim().split('\n');
      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        // Skip header row if it exists
        if (i === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('name'))) {
          continue;
        }

        // Parse CSV line (email,name)
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 1) {
          results.errors.push(`Line ${i + 1}: Invalid format`);
          continue;
        }

        const email = parts[0];
        const name = parts[1] || "";

        if (!email?.includes('@')) {
          results.errors.push(`Line ${i + 1}: Invalid email "${email}"`);
          continue;
        }

        try {
          // Check if buyer already exists
          const existingBuyer = await ctx.db.buyers.findUnique({
            where: { email }
          });

          if (existingBuyer) {
            // Update existing buyer to Absolventen group if not already
            if (existingBuyer.groupId !== alumniGroup.id) {
              await ctx.db.buyers.update({
                where: { email },
                data: { 
                  groupId: alumniGroup.id,
                  name: name || existingBuyer.name,
                }
              });
              results.updated++;
            } else {
              results.skipped++;
            }
          } else {
            // Create new buyer
            await ctx.db.buyers.create({
              data: {
                email,
                name: name || "",
                phone: "",
                address: "",
                postal: 0,
                province: "",
                country: "",
                verified: false,
                maxTickets: 10,
                groupId: alumniGroup.id,
              }
            });
            results.created++;
          }
        } catch (error) {
          results.errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return results;
    }),
});
