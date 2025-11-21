import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { env } from "~/env";
import { generatePickupCode } from "~/utils/generatePickupCode";
import { shippingAddressSchema, selfPickupSchema, type ShippingAddress } from "~/utils/validateAddress";
import { sendConfirmationEmail, sendShippingNotificationEmail } from "~/utils/email";

// Lazy initialization of Stripe client to avoid build-time errors
const getStripe = () => {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please set the STRIPE_SECRET_KEY environment variable.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
};

export const ticketRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const tickets = await ctx.db.soldTickets.findMany({
      include: { buyer: true },
    });
    return tickets.map(({ id, delivery, code, paid, sent, timestamp, buyer }) => ({ 
      id, 
      delivery, 
      code, 
      paid, 
      sent, 
      timestamp, 
      buyer: {
        id: buyer.id,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address,
        postal: buyer.postal,
        city: buyer.city,
        country: buyer.country,
        verified: buyer.verified,
        groupId: buyer.groupId,
      }
    }));
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
    
    // Get maxTickets from buyer's group or fetch default group
    let maxTickets = 2; // Default
    if (buyer?.group) {
      const groupWithMaxTickets = buyer.group as { name: string; id: number; maxTickets: number };
      maxTickets = groupWithMaxTickets.maxTickets ?? 2;
    } else {
      // Fetch Öffentlich group for default
      const publicGroup = await ctx.db.buyerGroups.findFirst({
        where: { name: "Öffentlich" }
      });
      if (publicGroup) {
        maxTickets = (publicGroup as unknown as { maxTickets: number }).maxTickets;
      }
    }

    // Get all ticket reserves with their groups
    const reserves = await ctx.db.ticketReserves.findMany({
      include: {
        type: true,
        deliveryMethods: true,
      },
    });

    // Filter tickets to return ONLY the ticket type matching buyer's group
    const filteredReserves = reserves.filter(({ type }) => {
      const ticketGroupName = type[0]?.name || "";
      
      // Return only tickets matching the buyer's group
      return ticketGroupName === userGroupName;
    });

    // Return the first matching reserve (should be only one)
    let matchingReserve = filteredReserves[0];

    // Alumni fallback: use public reserve if alumni reserve is empty
    if (userGroupName === "Absolventen" && matchingReserve) {
      const soldCount = await ctx.db.soldTickets.count({
        where: { reserveId: matchingReserve.id, paid: true },
      });
      if (matchingReserve.amount - soldCount === 0) {
        const publicReserve = reserves.find(({ type }) => type[0]?.name === "Öffentlich");
        if (publicReserve) {
          matchingReserve = publicReserve;
          const publicGroup = await ctx.db.buyerGroups.findFirst({ where: { name: "Öffentlich" } });
          if (publicGroup) {
            maxTickets = (publicGroup as unknown as { maxTickets: number }).maxTickets ?? 2;
          }
        }
      }
    }

    if (!matchingReserve) {
      return null;
    }

    // Count paid sold tickets for the selected reserve
    const soldTicketsCount = await ctx.db.soldTickets.count({
      where: { reserveId: matchingReserve.id, paid: true },
    });

    // Calculate available tickets: reserve amount minus sold tickets
    const availableAmount = Math.max(0, matchingReserve.amount - soldTicketsCount);

    return {
      id: matchingReserve.id,
      amount: availableAmount,
      price: matchingReserve.price,
      type: matchingReserve.type[0]?.name || "Unknown",
      groupId: matchingReserve.type[0]?.id || 0,
      maxTickets: maxTickets,
      deliveryMethods: matchingReserve.deliveryMethods.map(({ id, name, surcharge }) => ({
        id,
        name,
        surcharge: surcharge ?? 0,
      })),
    };
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
      include: {
        reserve: {
          include: {
            deliveryMethods: true,
          },
        },
        buyer: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return tickets.map(({ id, delivery, code, paid, sent, transref, timestamp, soldPrice, reserve, buyer }) => {
      const isShipping = delivery.toLowerCase().includes('versand');
      const matchingDeliveryMethod = reserve.deliveryMethods.find(dm => 
        isShipping 
          ? dm.name.toLowerCase().includes('versand')
          : dm.name.toLowerCase().includes('abholung')
      );
      
      return {
        id,
        delivery,
        code,
        paid,
        sent,
        transref,
        timestamp,
        soldPrice,
        ticketPrice: reserve.price,
        shippingSurcharge: matchingDeliveryMethod?.surcharge ?? 0,
        buyerAddress: buyer.address,
        buyerPostal: buyer.postal,
        buyerCity: buyer.city,
        buyerCountry: buyer.country,
        canRetryPayment: !paid,
      };
    });
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
        quantity: z.number().min(1).max(4),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { deliveryMethod, contactInfo, ticketTypeId, quantity } = input;

      // Get buyer's group first to check maxTickets
      let buyer = await ctx.db.buyers.findUnique({
        where: { email: ctx.session.user.email! },
        include: { group: true },
      });

      // Get buyer's group maxTickets
      let maxTickets = 2; // Default to 2 for Öffentlich
      if (buyer?.group) {
        const groupWithMaxTickets = buyer.group as { name: string; id: number; maxTickets: number };
        maxTickets = groupWithMaxTickets.maxTickets ?? 2;
      } else {
        // If buyer doesn't exist yet, get Öffentlich group
        const publicGroup = await ctx.db.buyerGroups.findFirst({
          where: { name: "Öffentlich" }
        });
        if (publicGroup) {
          maxTickets = (publicGroup as unknown as { maxTickets: number }).maxTickets;
        }
      }

      // Validate quantity against buyer's group maxTickets
      if (quantity > maxTickets) {
        throw new Error(`Sie können maximal ${maxTickets} Tickets kaufen.`);
      }

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

      // Calculate shipping fee (in cents - database stores surcharge in cents)
      const shippingFeeInCents = deliveryMethod === "shipping" ? (deliveryMethodInfo.surcharge ?? 0) : 0;

      // Check if buyer already has paid tickets (prevent multiple purchases)
      const existingBuyer = await ctx.db.buyers.findUnique({
        where: { email: ctx.session.user.email! },
        include: { tickets: { where: { paid: true } } },
      });

      if (existingBuyer && existingBuyer.tickets.length > 0) {
        throw new Error("Sie haben bereits Tickets gekauft. Jede E-Mail-Adresse kann nur einmal Tickets kaufen.");
      }

      // Create or update buyer record
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
            city: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).city : "",
            country: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).country : "",
            verified: true,
            groupId: publicGroup.id,
          },
          include: { group: true },
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
            city: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).city : buyer.city,
            country: deliveryMethod === "shipping" ? (contactInfo as ShippingAddress).country : buyer.country,
          },
          include: { group: true },
        });
      }

      // Ensure buyer exists at this point
      if (!buyer) {
        throw new Error("Failed to create or update buyer");
      }

      // Generate pickup code for all tickets in this purchase
      // All tickets in the same purchase share the same code
      const pickupCode = generatePickupCode();

      // Create sold tickets records (one per quantity)
      await ctx.db.soldTickets.createMany({
        data: Array.from({ length: quantity }, () => ({
          delivery: deliveryMethodInfo.name,
          code: pickupCode,
          paid: false,
          sent: false,
          transref: "", // Will be updated after payment
          buyerId: buyer.id,
          reserveId: ticketReserve.id,
          soldPrice: ticketReserve.price + shippingFeeInCents,
        })),
      });

      // Get the first ticket ID for metadata (all tickets share the same code)
      const firstTicket = await ctx.db.soldTickets.findFirst({
        where: {
          buyerId: buyer.id,
          code: pickupCode,
          paid: false,
        },
        orderBy: { timestamp: 'desc' },
      });

      if (!firstTicket) {
        throw new Error("Failed to create tickets");
      }

      // Create Stripe checkout session
      const stripe = getStripe();
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
          ...(shippingFeeInCents > 0
            ? [
                {
                  price_data: {
                    currency: "eur",
                    product_data: {
                      name: "Versandkosten",
                      description: "Versand der Tickets",
                    },
                    unit_amount: shippingFeeInCents, // Already in cents, no conversion needed
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
          soldTicketId: firstTicket.id.toString(),
          pickupCode: pickupCode,
          buyerId: buyer.id.toString(),
          deliveryMethod,
          quantity: quantity.toString(),
          ticketType: ticketReserve.type[0]?.name || "Unknown",
        },
      });

      // Store Stripe session ID in transref for unpaid tickets
      await ctx.db.soldTickets.updateMany({
        where: {
          buyerId: buyer.id,
          code: pickupCode,
          paid: false,
        },
        data: {
          transref: session.id,
        },
      });

      return {
        checkoutUrl: session.url,
        soldTicketId: firstTicket.id,
      };
    }),

  // Handle successful payment (called from webhook or success page)
  confirmPayment: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(`[confirmPayment] Processing session: ${input.sessionId}`);
      
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      const soldTicketId = parseInt(session.metadata?.soldTicketId ?? "0");
      const buyerId = parseInt(session.metadata?.buyerId ?? "0");
      const pickupCode = session.metadata?.pickupCode;

      console.log(`[confirmPayment] Ticket ID: ${soldTicketId}, Buyer ID: ${buyerId}, Pickup Code: ${pickupCode}`);

      // Find all tickets for this purchase (by pickup code or first ticket ID)
      const existingTickets = await ctx.db.soldTickets.findMany({
        where: pickupCode 
          ? { code: pickupCode, buyerId: buyerId }
          : { id: soldTicketId },
        include: { buyer: true },
      });

      if (existingTickets.length === 0) {
        throw new Error("Tickets not found");
      }

      // Check if payment has already been processed (check first ticket)
      const firstTicket = existingTickets[0]!;
      if (firstTicket.paid) {
        console.log(`[confirmPayment] Payment already processed for pickup code ${pickupCode || firstTicket.code}`);
        return {
          success: true,
          soldTicket: firstTicket,
          pickupCode: firstTicket.code,
          alreadyProcessed: true,
        };
      }

      // Update all sold ticket records for this purchase
      await ctx.db.soldTickets.updateMany({
        where: pickupCode 
          ? { code: pickupCode, buyerId: buyerId, paid: false }
          : { id: { in: existingTickets.map(t => t.id) }, paid: false },
        data: {
          paid: true,
          transref: session.payment_intent as string,
        },
      });

      // Get updated ticket for response
      const soldTicket = await ctx.db.soldTickets.findFirst({
        where: { id: existingTickets[0]!.id },
        include: { buyer: true },
      });

      if (!soldTicket) {
        throw new Error("Failed to retrieve updated ticket");
      }

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
            city: soldTicket.buyer.city,
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

  // Retry payment for unpaid tickets
  retryPayment: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Find buyer with unpaid tickets
      const buyer = await ctx.db.buyers.findUnique({
        where: { email: ctx.session.user.email! },
        include: {
          tickets: {
            where: { 
              paid: false,
              transref: { not: "" },
            },
            include: { 
              reserve: { 
                include: { 
                  type: true, 
                  deliveryMethods: true 
                } 
              } 
            },
          },
        },
      });

      if (!buyer || buyer.tickets.length === 0) {
        throw new Error("Keine unbezahlten Tickets gefunden.");
      }

      // Get the first unpaid ticket to extract order details
      const firstTicket = buyer.tickets[0]!;
      const pickupCode = firstTicket.code;
      
      // Group tickets by pickup code (all tickets in same order share same code)
      const orderTickets = buyer.tickets.filter(t => t.code === pickupCode);
      const quantity = orderTickets.length;

      // Get ticket reserve info
      const ticketReserve = firstTicket.reserve;
      if (!ticketReserve) {
        throw new Error("Ticket reserve not found");
      }

      // Get delivery method info
      const deliveryMethodInfo = ticketReserve.deliveryMethods.find(
        (dm) => dm.name === firstTicket.delivery
      );
      if (!deliveryMethodInfo) {
        throw new Error("Delivery method not found");
      }

      // Determine delivery method type
      const isShipping = firstTicket.delivery.toLowerCase().includes("versand");
      const deliveryMethod = isShipping ? "shipping" : "self-pickup";

      // Calculate shipping fee
      const shippingFeeInCents = isShipping ? (deliveryMethodInfo.surcharge ?? 0) : 0;

      // Create new Stripe checkout session
      const stripe = getStripe();
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
              unit_amount: ticketReserve.price * 100,
            },
            quantity: quantity,
          },
          ...(shippingFeeInCents > 0
            ? [
                {
                  price_data: {
                    currency: "eur",
                    product_data: {
                      name: "Versandkosten",
                      description: "Versand der Tickets",
                    },
                    unit_amount: shippingFeeInCents,
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
          soldTicketId: firstTicket.id.toString(),
          pickupCode: pickupCode,
          buyerId: buyer.id.toString(),
          deliveryMethod,
          quantity: quantity.toString(),
          ticketType: ticketReserve.type[0]?.name || "Unknown",
        },
      });

      // Update tickets with new session ID in transref field
      await ctx.db.soldTickets.updateMany({
        where: {
          id: { in: orderTickets.map(t => t.id) },
        },
        data: {
          transref: session.id,
        },
      });

      return {
        checkoutUrl: session.url,
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
            city: ticket.buyer.city,
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
