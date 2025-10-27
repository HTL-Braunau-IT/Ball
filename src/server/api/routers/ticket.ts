import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { env } from "~/env";
import { generatePickupCode } from "~/utils/generatePickupCode";
import { shippingAddressSchema, selfPickupSchema, type ShippingAddress } from "~/utils/validateAddress";
import { sendConfirmationEmail, sendShippingNotificationEmail } from "~/utils/email";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

export const ticketRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const tickets = await ctx.db.soldTickets.findMany({
      include: { buyer: true },
      // Z - Uncomment or use in another router to only return owned tickets
      // where: {
      //   buyerId: parseInt(ctx.session.user.id),
      // },
    });
    return tickets.map(({ id, delivery, code, paid, sent, timestamp, buyer }) => ({ id, delivery, code, paid, sent, timestamp, buyer }));
  }),

  // Get available ticket types for the user's group
  getAvailableTickets: protectedProcedure.query(async ({ ctx }) => {
    // Check if user exists in Buyers table to determine their group
    const buyer = await ctx.db.buyers.findUnique({
      where: { email: ctx.session.user.email! },
      include: { group: true },
    });

    // Get user's group name (default to "Öffentlich" if not found)
    const userGroupName = buyer?.group.name || "Öffentlich";

    // Get all ticket reserves with their groups
    const reserves = await ctx.db.ticketReserves.findMany({
      include: {
        type: true,
        deliveryMethods: true,
      },
    });

    // Filter tickets based on user's group
    const filteredReserves = reserves.filter(({ type }) => {
      const ticketGroupName = type[0]?.name || "";
      
      // Everyone can see "Öffentlich" tickets
      if (ticketGroupName === "Öffentlich") {
        return true;
      }
      
      // Only alumni can see "Absolventen" tickets
      if (ticketGroupName === "Absolventen") {
        return userGroupName === "Absolventen";
      }
      
      // Default: show the ticket
      return true;
    });

    return filteredReserves.map(({ id, amount, price, type, deliveryMethods }) => ({
      id,
      amount,
      price,
      type: type[0]?.name || "Unknown",
      groupId: type[0]?.id || 0,
      maxTickets: buyer?.maxTickets || 10, // Include user's max ticket limit
      deliveryMethods: deliveryMethods.map(({ id, name, surcharge }) => ({
        id,
        name,
        surcharge: surcharge ?? 0,
      })),
    }));
  }),

  // Get delivery methods
  getDeliveryMethods: publicProcedure.query(async ({ ctx }) => {
    const deliveryMethods = await ctx.db.deliveryMethods.findMany();
    return deliveryMethods.map(({ id, name, surcharge }) => ({
      id,
      name,
      surcharge: surcharge ?? 0,
    }));
  }),

  // Get user's purchased tickets
  getUserTickets: protectedProcedure.query(async ({ ctx }) => {
    const buyer = await ctx.db.buyers.findUnique({
      where: { email: ctx.session.user.email! },
    });

    if (!buyer) {
      return [];
    }

    const tickets = await ctx.db.soldTickets.findMany({
      where: { buyerId: buyer.id },
      orderBy: { timestamp: 'desc' },
    });

    return tickets.map(({ id, delivery, code, paid, sent, transref, timestamp }) => ({
      id,
      delivery,
      code,
      paid,
      sent,
      transref,
      timestamp,
    }));
  }),

  // Check contingent for specific ticket type
  checkContingent: protectedProcedure
    .input(z.object({ ticketTypeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const reserve = await ctx.db.ticketReserves.findFirst({
        where: { id: input.ticketTypeId },
        include: { type: true },
      });

      if (!reserve) {
        throw new Error("Ticket type not found");
      }

      return {
        available: reserve.amount,
        price: reserve.price,
        type: reserve.type[0]?.name || "Unknown",
      };
    }),

  // Create purchase and Stripe checkout session
  createPurchase: protectedProcedure
    .input(
      z.object({
        deliveryMethod: z.enum(["shipping", "self-pickup"]),
        contactInfo: z.union([shippingAddressSchema, selfPickupSchema]),
        ticketTypeId: z.number(),
        quantity: z.number().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { deliveryMethod, contactInfo, ticketTypeId, quantity } = input;

      // Get ticket reserve info
      const ticketReserve = await ctx.db.ticketReserves.findFirst({
        where: { id: ticketTypeId },
        include: { type: true, deliveryMethods: true },
      });

      if (!ticketReserve) {
        throw new Error("Ticket type not found");
      }

      // Check contingent
      if (ticketReserve.amount < quantity) {
        throw new Error("Nicht genügend Tickets verfügbar");
      }

      // Get delivery method info
      const deliveryMethodInfo = ticketReserve.deliveryMethods.find(
        (dm) => dm.name.toLowerCase().includes(deliveryMethod === "shipping" ? "versand" : "abholung")
      );

      if (!deliveryMethodInfo) {
        throw new Error("Delivery method not found");
      }

      // Calculate shipping fee
      const shippingFee = deliveryMethod === "shipping" ? (deliveryMethodInfo.surcharge ?? 0) : 0;

      // Check if buyer already has tickets (prevent multiple purchases)
      const existingBuyer = await ctx.db.buyers.findUnique({
        where: { email: ctx.session.user.email! },
        include: { tickets: true },
      });

      if (existingBuyer && existingBuyer.tickets.length > 0) {
        throw new Error("Sie haben bereits Tickets gekauft. Jede E-Mail-Adresse kann nur einmal Tickets kaufen.");
      }

      // Create or update buyer record
      let buyer = await ctx.db.buyers.findUnique({
        where: { email: ctx.session.user.email! },
      });

      if (!buyer) {
        // Create new buyer record - default to "Öffentlich" group
        const publicGroup = await ctx.db.buyerGroups.findFirst({
          where: { name: "Öffentlich" }
        });
        
        if (!publicGroup) {
          throw new Error("Öffentlich group not found");
        }

        buyer = await ctx.db.buyers.create({
          data: {
            name: contactInfo.name,
            email: ctx.session.user.email!,
            phone: contactInfo.phone, 
            address: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).address : "",
            postal: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).postal : 0,
            province: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).province : "",
            country: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).country : "",
            verified: true,
            maxTickets: 10, // Default max tickets
            groupId: publicGroup.id,
          },
        });
      } else {
        // Update existing buyer record
        buyer = await ctx.db.buyers.update({
          where: { id: buyer.id },
          data: {
            name: contactInfo.name,
            phone: contactInfo.phone, // TODO: Fix Prisma schema issue
            address: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).address : buyer.address,
            postal: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).postal : buyer.postal,
            province: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).province : buyer.province,
            country: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).country : buyer.country,
          },
        });
      }

      // Generate unique code for both pickup and shipping (for tracking purposes)
      let pickupCode = generatePickupCode();
      
      // Ensure code is unique (retry if collision)
      let attempts = 0;
      while (attempts < 5) {
        const existingTicket = await ctx.db.soldTickets.findUnique({
          where: { code: pickupCode }
        });
        
        if (!existingTicket) {
          break; // Code is unique
        }
        
        pickupCode = generatePickupCode();
        attempts++;
      }
      
      if (attempts >= 5) {
        throw new Error("Unable to generate unique pickup code");
      }

      // Create sold tickets record
      const soldTicket = await ctx.db.soldTickets.create({
        data: {
          delivery: deliveryMethodInfo.name,
          code: pickupCode,
          paid: false,
          sent: false,
          transref: "", // Will be updated after payment
          buyerId: buyer.id,
          reserveId: ticketReserve.id,
          soldPrice: ticketReserve.price + shippingFee,
        },
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `HTL Ball 2026 - ${ticketReserve.type[0]?.name || "Ticket"}`,
                description: `Ticket für den HTL Ball 2026 - Ball der Auserwählten`,
              },
              unit_amount: ticketReserve.price * 100, // Convert to cents
            },
            quantity: quantity,
          },
          ...(shippingFee > 0
            ? [
                {
                  price_data: {
                    currency: "eur",
                    product_data: {
                      name: "Versandkosten",
                      description: "Versand der Tickets",
                    },
                    unit_amount: shippingFee * 100,
                  },
                  quantity: 1,
                },
              ]
            : []),
        ],
        mode: "payment",
        success_url: `${env.NEXTAUTH_URL}/buyer/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXTAUTH_URL}/buyer?cancelled=true`,
        metadata: {
          soldTicketId: soldTicket.id.toString(),
          buyerId: buyer.id.toString(),
          deliveryMethod,
          quantity: quantity.toString(),
          ticketType: ticketReserve.type[0]?.name || "Unknown",
        },
      });

      return {
        checkoutUrl: session.url,
        soldTicketId: soldTicket.id,
      };
    }),

  // Handle successful payment (called from webhook or success page)
  confirmPayment: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(`[confirmPayment] Processing session: ${input.sessionId}`);
      
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      const soldTicketId = parseInt(session.metadata?.soldTicketId ?? "0");
      const buyerId = parseInt(session.metadata?.buyerId ?? "0");

      console.log(`[confirmPayment] Ticket ID: ${soldTicketId}, Buyer ID: ${buyerId}`);

      // Check if payment has already been processed
      const existingTicket = await ctx.db.soldTickets.findUnique({
        where: { id: soldTicketId },
        include: { buyer: true },
      });

      if (!existingTicket) {
        throw new Error("Ticket not found");
      }

      // If already paid, return existing data (idempotency)
      if (existingTicket.paid) {
        console.log(`[confirmPayment] Payment already processed for ticket ${soldTicketId}`);
        return {
          success: true,
          soldTicket: existingTicket,
          pickupCode: existingTicket.code,
          alreadyProcessed: true,
        };
      }

      console.log(`[confirmPayment] Processing new payment for ticket ${soldTicketId}`);

      // Update sold ticket record
      const soldTicket = await ctx.db.soldTickets.update({
        where: { id: soldTicketId },
        data: {
          paid: true,
          transref: session.payment_intent as string,
        },
        include: {
          buyer: true,
        },
      });

      // Update ticket contingent (only if not already processed)
      const quantity = parseInt(session.metadata?.quantity ?? "1");
      await ctx.db.ticketReserves.updateMany({
        where: {
          type: {
            some: {
              buyers: {
                some: { id: buyerId },
              },
            },
          },
        },
        data: {
          amount: {
            decrement: quantity,
          },
        },
      });

      // Send confirmation email
      try {
        const emailData = {
          to: soldTicket.buyer.email,
          name: soldTicket.buyer.name,
          ticketType: session.metadata?.ticketType || "Unknown",
          quantity: parseInt(session.metadata?.quantity ?? "1"),
          totalPrice: (session.amount_total ?? 0) / 100, // Convert from cents
          deliveryMethod: soldTicket.delivery,
          pickupCode: soldTicket.code,
          address: soldTicket.delivery.toLowerCase().includes('versand') ? {
            street: soldTicket.buyer.address,
            postal: soldTicket.buyer.postal,
            city: soldTicket.buyer.province,
            country: soldTicket.buyer.country === "AT" ? "Österreich" : "Deutschland",
          } : undefined,
        };

        console.log(`[confirmPayment] Sending email with data:`, {
          ticketType: emailData.ticketType,
          quantity: emailData.quantity,
          totalPrice: emailData.totalPrice,
          deliveryMethod: emailData.deliveryMethod,
        });

        await sendConfirmationEmail(emailData);
        console.log(`[confirmPayment] Confirmation email sent to ${soldTicket.buyer.email}`);
      } catch (emailError) {
        console.error(`[confirmPayment] Failed to send confirmation email:`, emailError);
        // Don't fail the entire transaction if email fails
      }

      console.log(`[confirmPayment] Successfully processed payment for ticket ${soldTicketId}`);

      return {
        success: true,
        soldTicket,
        pickupCode: soldTicket.code,
        alreadyProcessed: false,
      };
    }),

  // Mark ticket as sent and send shipping notification
  markAsSent: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is a backend user (admin)
      const backendUser = await ctx.db.backendUsers.findUnique({
        where: { email: ctx.session.user.email! },
      });

      if (!backendUser) {
        throw new Error("Unauthorized: Backend access required");
      }

      // Get the ticket with buyer information
      const ticket = await ctx.db.soldTickets.findUnique({
        where: { id: input.ticketId },
        include: { buyer: true },
      });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      if (ticket.sent) {
        throw new Error("Ticket already marked as sent");
      }

      // Only paid tickets can be sent
      if (!ticket.paid) {
        throw new Error("Only paid tickets can be marked as sent");
      }

      // Only send notification for shipping delivery methods
      const isShippingDelivery = ticket.delivery.toLowerCase().includes('versand') || 
                                ticket.delivery.toLowerCase().includes('shipping');

      if (!isShippingDelivery) {
        throw new Error("Shipping notification only available for shipping delivery methods");
      }

      // Update ticket as sent
      const updatedTicket = await ctx.db.soldTickets.update({
        where: { id: input.ticketId },
        data: { sent: true },
        include: { buyer: true },
      });

      // Send shipping notification email
      try {
        const shippingData = {
          to: ticket.buyer.email,
          name: ticket.buyer.name,
          code: ticket.code,
          address: {
            street: ticket.buyer.address,
            postal: ticket.buyer.postal,
            city: ticket.buyer.province,
            country: ticket.buyer.country === "AT" ? "Österreich" : "Deutschland",
          },
        };

        console.log(`[markAsSent] Attempting to send shipping notification email to ${ticket.buyer.email} for ticket ${input.ticketId}`);
        console.log(`[markAsSent] Shipping data:`, shippingData);
        
        await sendShippingNotificationEmail(shippingData);
        console.log(`[markAsSent] Shipping notification email sent successfully to ${ticket.buyer.email} for ticket ${input.ticketId}`);
      } catch (emailError) {
        console.error(`[markAsSent] Failed to send shipping notification email for ticket ${input.ticketId}:`, emailError);
        // Don't fail the entire operation if email fails
      }

      return {
        success: true,
        ticket: updatedTicket,
      };
    }),
});
