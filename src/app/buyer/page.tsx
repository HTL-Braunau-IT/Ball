"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { env } from "~/env";
import PurchaseFlow from "~/components/PurchaseFlow";
import { api } from "~/trpc/react";

// Format date for display
const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Order Card Component
function OrderCard({ orderTickets }: { orderTickets: Array<{
  id: number;
  delivery: string;
  code: string | null;
  paid: boolean | null;
  sent: boolean | null;
  transref: string;
  timestamp: Date;
  soldPrice: number;
  ticketPrice: number;
  shippingSurcharge: number;
}> }) {
  const [showDetails, setShowDetails] = useState(false);
  const firstTicket = orderTickets[0]!;
  const ticketCount = orderTickets.length;
  const ticketPrice = firstTicket.ticketPrice ?? 0;
  const shippingFee = firstTicket.delivery.toLowerCase().includes('versand') 
    ? (firstTicket.shippingSurcharge ?? 0) / 100 
    : 0;
  const totalPaid = (ticketPrice * ticketCount) + shippingFee;

  return (
    <div className="mt-8 card">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              firstTicket.paid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {firstTicket.paid ? 'Bezahlt' : 'Ausstehend'}
            </span>
            <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {ticketCount} {ticketCount === 1 ? 'Ticket' : 'Tickets'}
            </span>
          </div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {firstTicket.delivery}
          </p>
          
          {/* Shipping status for delivery methods that include shipping */}
          {firstTicket.delivery.toLowerCase().includes('versand') && (
            <div className="mt-2 mb-2">
              {firstTicket.sent ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Versendet
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⏳ Wird vorbereitet
                </span>
              )}
            </div>
          )}

          {/* Details Dropdown */}
          <div className="mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--color-gold-light)' }}
            >
              <span>{showDetails ? '▼' : '▶'}</span>
              {showDetails ? 'Weniger anzeigen' : 'Mehr Informationen'}
            </button>
            
            {showDetails && (
              <div className="mt-3 p-4 rounded-lg border" style={{ 
                background: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-accent-warm)'
              }}>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Kaufdatum:
                    </span>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                      {formatDateForDisplay(firstTicket.timestamp.toISOString())}
                    </p>
                  </div>
                  
                  {firstTicket.code && (
                    <div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        Abholcode:
                      </span>
                      <p className="text-sm mt-1 font-mono font-semibold" style={{ color: 'var(--color-gold-light)' }}>
                        {firstTicket.code}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t" style={{ borderColor: 'var(--color-accent-warm)' }}>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Preisaufstellung:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          Ticket × {ticketCount}
                        </span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {ticketPrice.toFixed(2)}€ × {ticketCount}
                        </span>
                      </div>
                      {shippingFee > 0 && (
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            Versandkosten
                          </span>
                          <span style={{ color: 'var(--color-text-primary)' }}>
                            {shippingFee.toFixed(2)}€
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-semibold" style={{ borderColor: 'var(--color-accent-warm)' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          Gesamt
                        </span>
                        <span style={{ color: 'var(--color-gold-light)' }}>
                          {totalPaid.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="w-3 h-3 rounded-full" style={{ 
            background: firstTicket.paid 
              ? (firstTicket.delivery.toLowerCase().includes('versand') 
                  ? (firstTicket.sent ? 'var(--color-success)' : 'var(--color-warning)')
                  : 'var(--color-success)')
              : 'var(--color-warning)' 
          }}></div>
        </div>
      </div>
    </div>
  );
}

export default function BuyerPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);

  // Fetch user's purchased tickets
  const { data: userTickets  } = api.ticket.getUserTickets.useQuery(
    undefined,
    { enabled: !!session }
  );

  // Check if ticket sale has started
  const ticketSaleDate = env.NEXT_PUBLIC_TICKET_SALE_DATE ? new Date(env.NEXT_PUBLIC_TICKET_SALE_DATE) : new Date();
  const now = new Date();
  const hasTicketSaleStarted = now >= ticketSaleDate;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("email", { email, callbackUrl: "/buyer" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      void handleSignIn(e as React.FormEvent);
    }
  };

  // Check for cancelled payment
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const cancelled = searchParams.get('cancelled') === 'true';

  if (status === "loading") {
    return (
      <main className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
        <header className="flex items-center justify-between p-6 border-b" style={{ 
          borderColor: 'var(--color-accent-warm)',
          background: 'var(--color-bg-primary)'
        }}>
          <div className="flex items-center">
            <Image
              src="/logos/HTL-Ball-2026_Logo_Farbe.png"
              alt="HTL Ball 2026 Logo"
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </div>
          <div className="flex items-center">
            <Link
              href="/"
              className="btn btn-secondary"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="card max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Wird geladen...
            </h2>
          </div>
        </div>
      </main>
    );
  }

  if (session) {
    // Show purchase flow if user clicked buy tickets
    if (showPurchaseFlow) {
      return (
        <main className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
          <header className="flex items-center justify-between p-6 border-b" style={{ 
            borderColor: 'var(--color-accent-warm)',
            background: 'var(--color-bg-primary)'
          }}>
            <div className="flex items-center">
              <Image
                src="/logos/HTL-Ball-2026_Logo_Farbe.png"
                alt="HTL Ball 2026 Logo"
                width={200}
                height={80}
                className="h-16 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPurchaseFlow(false)}
                className="btn btn-secondary"
              >
                Zurück zum Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="btn btn-secondary"
              >
                Abmelden
              </button>
            </div>
          </header>

          <section className="max-w-4xl mx-auto px-6 py-12">
            <PurchaseFlow
              onComplete={() => setShowPurchaseFlow(false)}
              onCancel={() => setShowPurchaseFlow(false)}
            />
          </section>
        </main>
      );
    }

    return (
      <main className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
        <header className="flex items-center justify-between p-6 border-b" style={{ 
          borderColor: 'var(--color-accent-warm)',
          background: 'var(--color-bg-primary)'
        }}>
          <div className="flex items-center">
            <Image
              src="/logos/HTL-Ball-2026_Logo_Farbe.png"
              alt="HTL Ball 2026 Logo"
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="btn btn-secondary"
            >
              Zurück zur Startseite
            </Link>
            <button
              onClick={() => signOut()}
              className="btn btn-secondary"
            >
              Abmelden
            </button>
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="card">
            <h1 className="text-4xl font-bold mb-6 gradient-text text-center">
              Ticket Dashboard
            </h1>
            <div className="text-center mb-8">
              <p className="text-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Angemeldet als:
              </p>
              <p className="text-xl font-semibold" style={{ color: 'var(--color-gold-light)' }}>
                {session.user?.email}
              </p>
            </div>
            
            {/* Show cancellation message if payment was cancelled */}
            {cancelled && (
              <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--color-warning)', color: 'white' }}>
                <p className="text-center">
                  Die Zahlung wurde abgebrochen. Sie können jederzeit erneut versuchen, Tickets zu kaufen.
                </p>
              </div>
            )}

            {/* User's Purchased Tickets */}
            {userTickets && userTickets.length > 0 && (() => {
              // Group tickets by code (all tickets in same order share same code)
              const groupedTickets = userTickets.reduce((acc, ticket) => {
                const code = ticket.code || 'unknown';
                if (!acc[code]) {
                  acc[code] = [];
                }
                acc[code]!.push(ticket);
                return acc;
              }, {} as Record<string, typeof userTickets>);

              const orders = Object.values(groupedTickets);

              return (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Ihre Tickets
                  </h2>
                  <div className="space-y-4">
                    {orders.map((orderTickets) => (
                      <OrderCard key={orderTickets[0]!.code || orderTickets[0]!.id} orderTickets={orderTickets} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Show message if no tickets purchased yet */}
            {userTickets?.length === 0 && (
              <div className="mb-8 p-6 rounded-lg text-center" style={{ 
                background: 'var(--color-bg-accent)',
                border: '1px solid var(--color-accent-warm)'
              }}>
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Sie haben noch keine Tickets gekauft.
                </p>
              </div>
            )}
            
            {!(userTickets && userTickets.length > 0) && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border" style={{ 
                borderColor: 'var(--color-accent-warm)',
                background: 'var(--color-bg-accent)'
              }}>
                {hasTicketSaleStarted ? (
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-gold-light)' }}>
                      Ticketverkauf ist gestartet!
                    </h2>
                    <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                      Sichern Sie sich jetzt Ihre Tickets für einen unvergesslichen Abend im DUNE-Stil!
                    </p>
                    <button 
                      onClick={() => setShowPurchaseFlow(true)}
                      className="btn btn-primary"
                    >
                      Jetzt Tickets kaufen
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-gold-light)' }}>
                      Ticketverkauf startet bald
                    </h2>
                    <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      Der Ticketverkauf für den HTL Ball 2026 - Ball der Auserwählten startet am {env.NEXT_PUBLIC_TICKET_SALE_DATE ? formatDateForDisplay(env.NEXT_PUBLIC_TICKET_SALE_DATE) : 'bald'}.
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Sie werden benachrichtigt, sobald der Verkauf beginnt. Bereiten Sie sich auf einen unvergesslichen Abend im DUNE-Stil vor!
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative" style={{ background: 'var(--color-bg-primary)' }}>
      <header className="flex items-center justify-between p-6 border-b" style={{ 
        borderColor: 'var(--color-accent-warm)',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="flex items-center">
          <Image
            src="/logos/HTL-Ball-2026_Logo_Farbe.png"
            alt="HTL Ball 2026 Logo"
            width={200}
            height={80}
            className="h-16 w-auto"
          />
        </div>
        <div className="flex items-center">
          <Link
            href="/"
            className="btn btn-secondary"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </header>

      <section className="max-w-md mx-auto px-6 py-12">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6 gradient-text text-center">
            Anmelden
          </h1>
          <p className="text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Melden Sie sich an, um Tickets für den HTL Ball 2026 zu kaufen
          </p>
          
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--color-accent-warm)',
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-primary)',
                  opacity: isLoading ? 0.6 : 1
                }}
                placeholder="Ihre E-Mail-Adresse eingeben"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? "Wird gesendet..." : "Mit E-Mail anmelden"}
            </button>
          </form>
          
          <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              Wir senden Ihnen einen Magic Link zur Anmeldung. Überprüfen Sie Ihr E-Mail-Postfach.
            </p>
          </div>
        </div>
      </section>

      {/* Loading Overlay */}
      {isLoading && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            background: 'rgba(248, 246, 243, 0.8)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: 'var(--color-accent-warm)' }}>
            <div className="flex flex-col items-center space-y-4">
              {/* Spinner */}
              <div 
                className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                style={{ 
                  borderColor: 'var(--color-accent-warm)',
                  borderTopColor: 'var(--color-gold-light)'
                }}
              ></div>
              
              {/* Loading Text */}
              <div className="text-center">
                <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  E-Mail wird gesendet...
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Bitte warten Sie einen Moment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
