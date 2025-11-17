"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("~/components/MapComponent"), {
  ssr: false,
});

export default function AnfahrtPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      {/* Header */}
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
            href="/buyer"
            className="btn btn-primary"
          >
            Jetzt Tickets kaufen
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">


        <h1 className="text-2xl font-bold mb-20 pb-10 text-center" style={{ color: "var(--color-gold-light)" }}>
          Anfahrt
        </h1>

        <div className="content-box space-y-10" style={{ color: "var(--color-text-primary)" }}>
          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              Veranstaltungsort
            </h2><br />
            <p className="text-lg leading-relaxed">
              HTL Braunau am Inn
              <br />
              Höhere Technische Lehranstalt
              <br />
              Osternberger Straße 55
              <br />
              5280 Braunau am Inn
              <br />
              Österreich
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              Karte
            </h2>
            <div className="w-full h-96 rounded-lg overflow-hidden border shadow-lg" style={{ borderColor: "var(--color-accent-warm)" }}>
              <MapComponent />
            </div>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              Anreise mit dem Auto - Parkplätze und Schutteldienst bei Interspaar Braunau 
            </h2><br />
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Shuttle-Service:</h3>
                <p className="leading-relaxed">
                  Unser kostenloser Shuttle-Service bringt Sie bequem vom Interspar-Parkplatz 
                  zur HTL Braunau und wieder zurück. Der Shuttle verkehrt in zwei Zeitfenstern: 
                  von 18:00 bis 21:00 Uhr für die Anreise und von 00:30 bis 03:30 Uhr für die Rückfahrt.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Parkplätze:</h3>
                <p className="leading-relaxed">
                  Sie können Ihr Fahrzeug kostenlos auf dem gesamten Interspar-Parkplatz abstellen. 
                  Von dort aus bringt Sie der Shuttle-Service direkt zur Veranstaltung.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

