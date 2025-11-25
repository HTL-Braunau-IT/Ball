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
  buyerAddress?: string;
  buyerPostal?: number;
  buyerCity?: string;
  buyerCountry?: string;
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
    <div className="mt-6 card overflow-hidden" style={{ 
      border: '1px solid var(--color-accent-warm)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div className="p-6">
        {/* Header Section */}
        <div className="pb-5 mb-5 border-b" style={{ borderColor: 'var(--color-accent-warm)' }}>
          <div className="flex items-start justify-between gap-4">
            {/* Ticket Count Display */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-3">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl flex-shrink-0" style={{ 
                  background: 'linear-gradient(135deg, var(--color-gold-light), var(--color-bronze))',
                  boxShadow: '0 4px 12px rgba(193, 122, 58, 0.25)'
                }}>
                  <span className="text-2xl font-bold text-white">{ticketCount}</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-widest font-medium leading-tight" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>
                    {ticketCount === 1 ? 'Karte' : 'Karten'}
                  </p>
                  <p className="text-lg font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                    {ticketCount === 1 ? 'Gekauft' : 'Gekauft'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex-shrink-0">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                firstTicket.paid 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`} style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <span className="text-sm">{firstTicket.paid ? '✓' : '⏳'}</span>
                <span>{firstTicket.paid ? 'Bezahlt' : 'Ausstehend'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Section */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--color-accent-warm)' }}>
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm" style={{ color: 'var(--color-gold-light)' }}>📦</span>
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {firstTicket.delivery}
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {firstTicket.delivery.toLowerCase().includes('versand') 
                ? (firstTicket.sent 
                    ? 'Ihre Tickets wurden per Post versendet und sind auf dem Weg zu Ihnen.'
                    : 'Ihre Tickets werden bald per Post an die angegebene Adresse versendet.')
                : (firstTicket.sent
                    ? 'Ihre Tickets sind bereit zur Abholung am Veranstaltungsort mit dem Abholcode.'
                    : 'Ihre Tickets werden vorbereitet und können am Veranstaltungsort mit dem Abholcode abgeholt werden.')}
            </p>
          </div>
          {/* Status badge for delivery methods */}
          <div className="flex-shrink-0">
            {firstTicket.delivery.toLowerCase().includes('versand') ? (
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                firstTicket.sent 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`} style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <span className="text-sm">{firstTicket.sent ? '✓' : '⏳'}</span>
                <span>{firstTicket.sent ? 'Versendet' : 'Wird vorbereitet'}</span>
              </div>
            ) : (
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                firstTicket.sent 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`} style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <span className="text-sm">{firstTicket.sent ? '✓' : '⏳'}</span>
                <span>{firstTicket.sent ? 'Bereit zur Abholung' : 'Wird vorbereitet'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details Dropdown */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-80 w-full text-left"
            style={{ color: 'var(--color-gold-light)' }}
          >
            <span className="transition-transform" style={{ transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              ▶
            </span>
            <span>{showDetails ? 'Weniger anzeigen' : 'Mehr Informationen'}</span>
          </button>
          
          {showDetails && (
            <div className="mt-4 p-4 rounded-lg border transition-all" style={{ 
              background: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-accent-warm)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}>
              <div className="space-y-4">
                <div className={firstTicket.code && !firstTicket.delivery.toLowerCase().includes('versand') ? "grid grid-cols-2 gap-3" : ""}>
                  <div className="p-3 rounded-lg border" style={{ 
                    background: 'var(--color-bg-card)',
                    borderColor: 'var(--color-accent-warm)'
                  }}>
                    <span className="text-xs uppercase tracking-wider font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      Kaufdatum
                    </span>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {formatDateForDisplay(firstTicket.timestamp.toISOString())}
                    </p>
                  </div>
                  
                  {firstTicket.code && !firstTicket.delivery.toLowerCase().includes('versand') && (
                    <div className="p-3 rounded-lg border" style={{ 
                      background: 'var(--color-bg-card)',
                      borderColor: 'var(--color-accent-warm)'
                    }}>
                      <span className="text-xs uppercase tracking-wider font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                        Abholcode
                      </span>
                      <p className="text-sm font-mono font-bold" style={{ color: 'var(--color-gold-light)', letterSpacing: '0.1em' }}>
                        {firstTicket.code}
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Address - only show for versand delivery */}
                {firstTicket.delivery.toLowerCase().includes('versand') && firstTicket.buyerAddress && (
                  <div className="pt-4 border-t" style={{ borderColor: 'var(--color-accent-warm)' }}>
                    <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      Versandadresse
                    </p>
                    <div className="p-3 rounded-lg border" style={{ 
                      background: 'var(--color-bg-card)',
                      borderColor: 'var(--color-accent-warm)'
                    }}>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                        {firstTicket.buyerAddress}<br />
                        {firstTicket.buyerPostal} {firstTicket.buyerCity}<br />
                        {firstTicket.buyerCountry === 'AT' ? 'Österreich' : firstTicket.buyerCountry === 'DE' ? 'Deutschland' : firstTicket.buyerCountry}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-accent-warm)' }}>
                  <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    Preisaufstellung
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg border" style={{ 
                      background: 'var(--color-bg-card)',
                      borderColor: 'var(--color-accent-warm)'
                    }}>
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Ticket × {ticketCount}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {ticketPrice.toFixed(2)}€ × {ticketCount}
                      </span>
                    </div>
                    {shippingFee > 0 && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg border" style={{ 
                        background: 'var(--color-bg-card)',
                        borderColor: 'var(--color-accent-warm)'
                      }}>
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Versandkosten
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {shippingFee.toFixed(2)}€
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2.5 px-3 rounded-lg border-2 mt-3" style={{ 
                      background: 'var(--color-bg-card)',
                      borderColor: 'var(--color-gold-light)'
                    }}>
                      <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
                        Gesamt
                      </span>
                      <span className="text-base font-bold" style={{ color: 'var(--color-gold-light)' }}>
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

  // Get current user's buyer information including group
  const { data: currentUser } = api.buyers.getCurrentUser.useQuery(
    undefined,
    { enabled: !!session }
  );

  // Retry payment mutation
  const retryPayment = api.ticket.retryPayment.useMutation();

  // Check kill switch from backend
  const { data: salesEnabled } = api.systemSettings.getSalesEnabled.useQuery();

  // Determine which sale date to use based on user's group
  const isAlumni = currentUser?.group?.name === "Absolventen";
  const applicableSaleDate = isAlumni && env.NEXT_PUBLIC_ALUMNI_TICKET_SALE_DATE 
    ? env.NEXT_PUBLIC_ALUMNI_TICKET_SALE_DATE 
    : env.NEXT_PUBLIC_TICKET_SALE_DATE;

  // Check if ticket sale has started for the applicable group
  const ticketSaleDate = applicableSaleDate ? new Date(applicableSaleDate) : new Date();
  const now = new Date();
  const hasTicketSaleStarted = (salesEnabled ?? true) && now >= ticketSaleDate;

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
            <Link href="/">
              <Image
                src="/logos/HTL-Ball-2026_Logo_Farbe.png"
                alt="HTL Ball 2026 Logo"
                width={200}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
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
              <Link href="/">
                <Image
                  src="/logos/HTL-Ball-2026_Logo_Farbe.png"
                  alt="HTL Ball 2026 Logo"
                  width={200}
                  height={80}
                  className="h-16 w-auto"
                />
              </Link>
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
            <Link href="/">
              <Image
                src="/logos/HTL-Ball-2026_Logo_Farbe.png"
                alt="HTL Ball 2026 Logo"
                width={200}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
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

            {/* Show retry payment button if user has unpaid tickets */}
            {userTickets && userTickets.some(t => !t.paid) && (
              <div className="mb-6 p-4 rounded-lg border-2" style={{ 
                borderColor: 'var(--color-warning)',
                background: 'var(--color-bg-accent)'
              }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Ausstehende Zahlung
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Sie haben unbezahlte Tickets. Klicken Sie auf den Button, um die Zahlung erneut zu versuchen.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      retryPayment.mutate(undefined, {
                        onSuccess: (data) => {
                          if (data.checkoutUrl) {
                            window.location.href = data.checkoutUrl;
                          }
                        },
                        onError: (error) => {
                          console.error("Retry payment error:", error);
                          alert("Fehler beim Erstellen der Zahlungsseite: " + error.message);
                        },
                      });
                    }}
                    disabled={retryPayment.isPending}
                    className="btn btn-primary flex-shrink-0"
                    style={{ opacity: retryPayment.isPending ? 0.6 : 1 }}
                  >
                    {retryPayment.isPending ? "Wird vorbereitet..." : "Zahlung erneut versuchen"}
                  </button>
                </div>
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
                acc[code].push(ticket);
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
            
            {!(userTickets && userTickets.length > 0) && salesEnabled && (
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
                    {currentUser?.group?.name === "Absolventen" ? (
                      <p className="text-base px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Der Absolventen Ticketverkauf für den HTL Ball 2026 startet am {env.NEXT_PUBLIC_ALUMNI_TICKET_SALE_DATE ? formatDateForDisplay(env.NEXT_PUBLIC_ALUMNI_TICKET_SALE_DATE) : 'bald'}.
                      </p>
                    ) : (
                      <p className="text-base px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Der öffentliche Ticketverkauf für den HTL Ball 2026 startet am {env.NEXT_PUBLIC_TICKET_SALE_DATE ? formatDateForDisplay(env.NEXT_PUBLIC_TICKET_SALE_DATE) : 'bald'}.
                      </p>
                    )}
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
          <Link href="/">
            <Image
              src="/logos/HTL-Ball-2026_Logo_Farbe.png"
              alt="HTL Ball 2026 Logo"
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </Link>
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
          <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Melden Sie sich an, um Ihre Tickets zu sehen oder neue zu kaufen.
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
