import Link from "next/link";
import Image from "next/image";

export default function ImpressumPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b" style={{ 
        borderColor: 'var(--color-accent-warm)',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="flex items-center gap-8">
          <Link href="/">
            <Image
              src="/logos/HTL-Ball-2026_Logo_Farbe_notext.png"
              alt="HTL Ball 2026 Logo"
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </Link>
          <Image
            src="/logos/HTL_Braunau_Logo.png"
            alt="HTL Braunau Logo"
            width={200}
            height={80}
            className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex items-center">
          <Link
            href="/buyer"
            className="btn btn-primary"
          >
            Mein Konto
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">


        <h1 className="text-2xl font-bold mb-20 pb-10 text-center" style={{ color: "var(--color-gold-light)" }}>
          Impressum
        </h1>

        <div className="content-box space-y-10" style={{ color: "var(--color-text-primary)" }}>
          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              Medieninhaber und Herausgeber
            </h2>
            <p className="leading-relaxed">
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
              Kontakt
            </h2>
            <p className="leading-relaxed">
              <strong>Telefon:</strong> +43 (0) 7722 83600
              <br />
              <strong>E-Mail:</strong> office@htl-braunau.at
              <br />
              <strong>Website:</strong> www.htl-braunau.at
            </p>
          </section>


          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              Verantwortlich für den Inhalt
            </h2>
            <p className="leading-relaxed">
              Ballkomitee der HTL Braunau am Inn
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
              Haftungsausschluss
            </h2>
            <p className="leading-relaxed mb-4">
              Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich.
            </p>
            <p className="leading-relaxed">
              Die HTL Braunau am Inn übernimmt keine Haftung für die Inhalte externer Links. Für
              den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              Urheberrecht
            </h2>
            <p className="leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung,
              Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
              bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section className="pt-8 mt-8 border-t" style={{ borderColor: "var(--color-accent-warm)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Stand: {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

