import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { sendShippingNotificationEmail, sendPickupNotificationEmail } from "~/utils/email";

export const buyersRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const buyers = await ctx.db.buyers.findMany({
      include: { group: true, tickets: true }
    });
    return buyers.map(({ id, name, email, address, postal, city, country, verified, group, tickets }) => ({ 
      id, name, email, address, postal, city, country, verified, group, tickets 
    }));
  }),

  // Get current user's buyer information including group
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const buyer = await ctx.db.buyers.findFirst({
      where: {
        email: {
          equals: ctx.session.user.email!,
          mode: 'insensitive',
        },
      },
      include: { group: true },
    });
    
    if (!buyer) {
      return null;
    }
    
    return {
      id: buyer.id,
      name: buyer.name,
      email: buyer.email.toLowerCase(), // Always return lowercase for consistency
      group: buyer.group ? {
        id: buyer.group.id,
        name: buyer.group.name,
      } : null,
    };
  }),

  // Get all buyers with Absolventen group
  getAlumni: protectedProcedure.query(async ({ ctx }) => {
    const alumniGroup = await ctx.db.buyerGroups.findFirst({
      where: { name: "Absolventen" }
    });

    if (!alumniGroup) {
      return [];
    }

    const buyers = await ctx.db.buyers.findMany({
      where: { groupId: alumniGroup.id },
      include: { group: true },
      orderBy: { id: 'asc' }
    });

    return buyers.map(({ id, name, email, address, postal, city, country, verified, group }) => ({
      id, name, email, address, postal, city, country, verified, group
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
        throw new Error("Absolventen-Gruppe nicht gefunden. Bitte kontaktiere einen Administrator.");
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

        // Check if line contains semicolon (wrong separator)
        if (line.includes(';') && !line.includes(',')) {
          results.errors.push(`Datei verwendet Semikolon (;) statt Komma (,) als Trennzeichen. Bitte verwenden Sie Komma als Trennzeichen.`);
          continue;
        }

        // Check if line doesn't contain comma (required separator)
        if (!line.includes(',')) {
          results.errors.push(`Zeile ${i + 1}: Kein Komma (,) gefunden. Format muss sein: email,name`);
          continue;
        }

        // Parse CSV line (email,name)
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 1) {
          results.errors.push(`Zeile ${i + 1}: Ungültiges Format`);
          continue;
        }

        const emailRaw = parts[0];
        const name = parts[1] || "";

        // Validate email format - must be a valid email and not contain semicolons
        const emailRegex = /^[^\s@;]+@[^\s@;]+\.[^\s@;]+$/;
        if (!emailRaw || !emailRegex.test(emailRaw)) {
          if (emailRaw?.includes(';')) {
            results.errors.push(`Zeile ${i + 1}: E-Mail-Adresse enthält ein Semikolon (;). Bitte verwenden Sie Komma (,) als Trennzeichen. Gefunden: "${emailRaw}"`);
          } else {
            results.errors.push(`Zeile ${i + 1}: Ungültige E-Mail-Adresse "${emailRaw}"`);
          }
          continue;
        }

        // Normalize email to lowercase (emails are case-insensitive)
        const email = emailRaw.toLowerCase();

        try {
          // Check if buyer already exists (case-insensitive search)
          const existingBuyer = await ctx.db.buyers.findFirst({
            where: {
              email: {
                equals: email,
                mode: 'insensitive',
              }
            }
          });

          if (existingBuyer) {
            // Update existing buyer: always update name if provided, and update group if needed
            // Also normalize email to lowercase to prevent case-sensitivity issues
            const needsGroupUpdate = existingBuyer.groupId !== alumniGroup.id;
            const needsNameUpdate = name?.trim() && name !== existingBuyer.name;
            const needsEmailUpdate = existingBuyer.email.toLowerCase() !== email;
            
            if (needsGroupUpdate || needsNameUpdate || needsEmailUpdate) {
              await ctx.db.buyers.update({
                where: { id: existingBuyer.id }, // Use id instead of email
                data: { 
                  ...(needsGroupUpdate && { groupId: alumniGroup.id }),
                  ...(needsNameUpdate && { name: name.trim() }),
                  ...(needsEmailUpdate && { email }), // Normalize email to lowercase
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
                email, // Already normalized to lowercase
                name: name || "",
                phone: "",
                address: "",
                postal: 0,
                city: "",
                country: "",
                verified: false,
                groupId: alumniGroup.id,
              }
            });
            results.created++;
          }
        } catch (error) {
          results.errors.push(`Zeile ${i + 1}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
        }
      }

      return results;
    }),

  // Mark all tickets for a buyer as sent
  markBuyerTicketsAsSent: protectedProcedure
    .input(z.object({ buyerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is a backend user (admin)
      const backendUser = await ctx.db.backendUsers.findUnique({
        where: { email: ctx.session.user.email! },
      });

      if (!backendUser) {
        throw new Error("Unauthorized: Backend access required");
      }

      // Get buyer with tickets
      const buyer = await ctx.db.buyers.findUnique({
        where: { id: input.buyerId },
        include: { tickets: true },
      });

      if (!buyer) {
        throw new Error("Buyer not found");
      }

      if (!buyer.tickets?.length) {
        throw new Error("No tickets found for this buyer");
      }

      // Check if all tickets are already sent
      const allSent = buyer.tickets.every(ticket => ticket.sent === true);
      if (allSent) {
        throw new Error("All tickets already marked as sent");
      }

      // Only update paid tickets
      const unpaidTickets = buyer.tickets.filter(ticket => !ticket.paid);
      if (unpaidTickets.length > 0) {
        throw new Error("Cannot mark unpaid tickets as sent");
      }

      // Get the delivery method from the first ticket (all tickets in a purchase share the same delivery method)
      const firstTicket = buyer.tickets[0];
      const deliveryMethodLower = (firstTicket?.delivery ?? "").toLowerCase();
      const isShippingDelivery = deliveryMethodLower.includes('versand');
      const isPickupDelivery = deliveryMethodLower.includes('abholung');
      const pickupCode = firstTicket?.code;

      // Update all tickets for this buyer as sent
      await ctx.db.soldTickets.updateMany({
        where: { 
          buyerId: input.buyerId,
          sent: false,
          paid: true,
        },
        data: { sent: true },
      });

      // Send shipping notification email if delivery method is shipping
      if (isShippingDelivery && pickupCode) {
        try {
          const shippingData = {
            to: buyer.email,
            name: buyer.name,
            code: pickupCode,
            address: {
              street: buyer.address,
              postal: buyer.postal,
              city: buyer.city,
              country: buyer.country === "AT" ? "Österreich" : "Deutschland",
            },
          };

          await sendShippingNotificationEmail(shippingData);
        } catch (emailError) {
          console.error(`[markBuyerTicketsAsSent] Failed to send shipping notification email for buyer ${input.buyerId}:`, emailError);
          // Don't fail the entire operation if email fails
        }
      }

      // Send pickup notification email if delivery method is self-pickup (Abholung)
      if (isPickupDelivery && pickupCode) {
        try {
          const pickupData = {
            to: buyer.email,
            name: buyer.name,
            code: pickupCode,
          };

          await sendPickupNotificationEmail(pickupData);
          console.log(`[markBuyerTicketsAsSent] Pickup notification email sent to ${buyer.email} for buyer ${input.buyerId}`);
        } catch (emailError) {
          console.error(`[markBuyerTicketsAsSent] Failed to send pickup notification email for buyer ${input.buyerId}:`, emailError);
          // Don't fail the entire operation if email fails
        }
      }

      return { success: true };
    }),
});
