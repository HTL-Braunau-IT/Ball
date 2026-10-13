"use client";

import Link from "next/link";
import BrandMark from "~/components/BrandMark";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("~/components/MapComponent"), {
  ssr: false,
});

export default function AnfahrtPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      {/* Header */}
      <header className="site-header site-header-full">
        <BrandMark />
        <div className="flex items-center">
          <Link
            href="/buyer"
            className="btn btn-primary"
          >
            Mein Konto
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
            <div className="w-full h-96 rounded-lg overflow-hidden border shadow-lg mt-8" style={{ borderColor: "var(--color-accent-warm)" }}>
              <MapComponent />
            </div>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              Anreise mit dem Auto - Parkplätze und Schutteldienst bei Interspar Braunau 
            </h2><br />
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Shuttle-Service:</h3>
                <p className="leading-relaxed mt-4">
                  Unser kostenloser Shuttle-Service bringt Sie bequem vom Interspar-Parkplatz zur HTL Braunau und wieder zurück. Der Shuttle verkehrt in zwei Zeitfenstern: von <strong>18:00 bis 21:00 Uhr</strong> für die Anreise und von <strong>00:30 bis 03:30 Uhr</strong> für die Rückfahrt, er fährt im <strong>15min Takt</strong>.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Parkplätze:</h3>
                <p className="leading-relaxed mt-4">
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

