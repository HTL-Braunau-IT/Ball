"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const confirmationInitiated = useRef(false);

  const confirmPayment = api.ticket.confirmPayment.useMutation();

  useEffect(() => {
    if (sessionId && !paymentConfirmed && !confirmPayment.isPending && !confirmationInitiated.current) {
      confirmationInitiated.current = true;
      confirmPayment.mutate(
        { sessionId },
        {
          onSuccess: (data) => {
            setPaymentConfirmed(true);
            setOrderData(data);
          },
          onError: (error) => {
            console.error("Payment confirmation error:", error);
            confirmationInitiated.current = false; // Reset on error to allow retry
          },
        }
      );
    }
  }, [sessionId, paymentConfirmed, confirmPayment]);

  if (!sessionId) {
    return (
      <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
        <header className="flex items-center justify-between p-6 border-b" style={{ 
          borderColor: "var(--color-accent-warm)",
          background: "var(--color-bg-primary)"
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
        </header>

        <section className="max-w-2xl mx-auto px-6 py-12">
          <div className="card text-center">
            <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--color-error)" }}>
              Fehler
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Keine gültige Sitzungs-ID gefunden.
            </p>
            <Link href="/buyer" className="btn btn-primary">
              Zurück zum Ticketverkauf
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (confirmPayment.isPending) {
    return (
      <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
        <header className="flex items-center justify-between p-6 border-b" style={{ 
          borderColor: "var(--color-accent-warm)",
          background: "var(--color-bg-primary)"
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
        </header>

        <section className="max-w-2xl mx-auto px-6 py-12">
          <div className="card text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4" 
                 style={{ borderColor: "var(--color-accent-warm)", borderTopColor: "var(--color-gold-light)" }} />
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Zahlung wird bestätigt...
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Bitte warten Sie einen Moment.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (confirmPayment.error) {
    return (
      <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
        <header className="flex items-center justify-between p-6 border-b" style={{ 
          borderColor: "var(--color-accent-warm)",
          background: "var(--color-bg-primary)"
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
        </header>

        <section className="max-w-2xl mx-auto px-6 py-12">
          <div className="card text-center">
            <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--color-error)" }}>
              Fehler bei der Zahlungsbestätigung
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--color-text-secondary)" }}>
              {confirmPayment.error.message}
            </p>
            <Link href="/buyer" className="btn btn-primary">
              Zurück zum Ticketverkauf
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!paymentConfirmed || !orderData) {
    return null;
  }

  const { soldTicket } = orderData;
  const isSelfPickup = soldTicket.delivery.toLowerCase().includes("abholung");

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <header className="flex items-center justify-between p-6 border-b" style={{ 
        borderColor: "var(--color-accent-warm)",
        background: "var(--color-bg-primary)"
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
          <Link href="/buyer" className="btn btn-secondary">
            Zurück zum Dashboard
          </Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="card text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" 
               style={{ background: "var(--color-success)" }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-6 gradient-text">
            Bestellung erfolgreich!
          </h1>
          
          <p className="text-lg mb-2 py-4" style={{ color: "var(--color-text-secondary)" }}>
            Vielen Dank für Ihre Bestellung. Sie erhalten eine Bestätigungs-E-Mail mit allen Details.
          </p>

          {/* Order Details */}
          <div className="bg-[var(--color-bg-accent)] p-6 rounded-lg mb-8" style={{ border: "1px solid var(--color-accent-warm)" }}>
            <h2 className="text-xl font-semibold mb-8" style={{ color: "var(--color-text-primary)" }}>
              Bestelldetails
            </h2>
            
            <div className="space-y-4 text-left pt-4">
              <div>
                <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Name:</div>
                <div style={{ color: "var(--color-text-primary)", fontWeight: "500" }}>{soldTicket.buyer.name}</div>
              </div>
              
              <div>
                <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>E-Mail:</div>
                <div style={{ color: "var(--color-text-primary)", fontWeight: "500" }}>{soldTicket.buyer.email}</div>
              </div>
              
              <div>
                <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Telefon:</div>
                <div style={{ color: "var(--color-text-primary)", fontWeight: "500" }}>{soldTicket.buyer.phone}</div>
              </div>
              
              <div>
                <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Versandart:</div>
                <div style={{ color: "var(--color-text-primary)", fontWeight: "500" }}>{soldTicket.delivery}</div>
              </div>

              {isSelfPickup && soldTicket.code && (
                <div className="mt-6 p-4 rounded-lg" style={{ background: "var(--color-bg-card)", border: "2px solid var(--color-gold-light)" }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-gold-light)" }}>
                    Abholcode
                  </h3>
                  <div className="text-2xl font-mono font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {soldTicket.code}
                  </div>
                  <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
                    Zeigen Sie diesen Code bei der Abholung vor.
                  </p>
                </div>
              )}

              {!isSelfPickup && (
                <div className="mt-4">
                  <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Lieferadresse:</div>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "500" }}>
                    <div>{soldTicket.buyer.address}</div>
                    <div>{soldTicket.buyer.postal} {soldTicket.buyer.city}</div>
                    <div>{soldTicket.buyer.country}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="text-left space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Wichtige Hinweise:
            </h3>
            
            <div className="pt-4">
            {isSelfPickup ? (
              <ul className="space-y-2" style={{ color: "var(--color-text-secondary)" }}>
                <li>• Bewahren Sie Ihren Abholcode sicher auf</li>
                <li>• Bringen Sie einen gültigen Ausweis zur Abholung mit</li>
                <li>• Bei Fragen wenden Sie sich an: ball@htl-braunau.at</li>
              </ul>
            ) : (
              <ul className="space-y-2" style={{ color: "var(--color-text-secondary)" }}>
                <li>• Ihre Tickets werden in den nächsten Tagen versendet</li>
                <li>• Sie erhalten eine Versandbestätigung per E-Mail</li>
                <li>• Bei Fragen wenden Sie sich an: ball@htl-braunau.at</li>
              </ul>
            )}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/buyer" className="btn btn-secondary flex-1">
              Zurück zum Dashboard
            </Link>
            <Link href="/" className="btn btn-primary flex-1">
              Zur Startseite
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
        <header className="flex items-center justify-between p-6 border-b" style={{ 
          borderColor: "var(--color-accent-warm)",
          background: "var(--color-bg-primary)"
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
        </header>
        <section className="max-w-2xl mx-auto px-6 py-12">
          <div className="card text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4" 
                 style={{ borderColor: "var(--color-accent-warm)", borderTopColor: "var(--color-gold-light)" }} />
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Wird geladen...
            </h2>
          </div>
        </section>
      </main>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
