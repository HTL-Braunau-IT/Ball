import Link from "next/link";
import Image from "next/image";

export default function DSGVOPage() {
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


        <h1 className="text-xl md:text-2xl font-bold mb-20 pb-10 text-center px-4 break-words" style={{ color: "var(--color-gold-light)" }}>
          Datenschutzerklärung (DSGVO)
        </h1>

        <div className="content-box space-y-10" style={{ color: "var(--color-text-primary)" }}>
          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              1. Datenschutz auf einen Blick
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-4">Allgemeine Hinweise</h3>
            <p className="leading-relaxed">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
              Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              2. Verantwortliche Stelle
            </h2>
            <p className="leading-relaxed mb-4">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
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
              <br />
              <br />
              <strong>Kontakt:</strong>
              <br />
              Telefon: +43 (0) 7722 83600
              <br />
              E-Mail: office@htl-braunau.at
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              3. Datenerfassung auf dieser Website
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-4">Cookies</h3>
            <p className="leading-relaxed mb-6">
              Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem
              Endgerät gespeichert werden. Sie dienen dazu, die Nutzung der Website zu erleichtern
              und die Funktionalität zu verbessern.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-4">Server-Log-Dateien</h3>
            <p className="leading-relaxed mb-4">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so
              genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies
              sind:
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2 ml-4">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p className="leading-relaxed">
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
              Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              4. Verarbeitete Datenarten
            </h2>
            <p className="leading-relaxed mb-4">Wir verarbeiten folgende Kategorien von personenbezogenen Daten:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kontaktdaten (Name, E-Mail-Adresse, Telefonnummer)</li>
              <li>Bestelldaten (Kartenbestellungen, Lieferadressen)</li>
              <li>Zahlungsdaten (Transaktionsreferenzen, Zahlungsstatus)</li>
              <li>Technische Daten (IP-Adresse, Browser-Informationen)</li>
            </ul>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              5. Zweck der Datenverarbeitung
            </h2>
            <p className="leading-relaxed mb-4">Wir verarbeiten Ihre personenbezogenen Daten zu folgenden Zwecken:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Durchführung des Kartenverkaufs</li>
              <li>Bearbeitung Ihrer Bestellungen</li>
              <li>Kommunikation bezüglich Ihrer Bestellung</li>
              <li>Erfüllung gesetzlicher Verpflichtungen</li>
              <li>Gewährleistung der Sicherheit und Funktionalität der Website</li>
            </ul>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              6. Rechtsgrundlage der Verarbeitung
            </h2>
            <p className="leading-relaxed mb-4">
              Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage der folgenden
              Rechtsgrundlagen gemäß Art. 6 DSGVO:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung (z.B. für Newsletter)
              </li>
              <li>
                <strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung (Kartenbestellung)
              </li>
              <li>
                <strong>Art. 6 Abs. 1 lit. c DSGVO:</strong> Rechtliche Verpflichtung
              </li>
              <li>
                <strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigtes Interesse (z.B.
                Sicherheit der Website)
              </li>
            </ul>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              7. Speicherdauer
            </h2>
            <p className="leading-relaxed mb-4">
              Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die jeweiligen
              Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies erfordern.
            </p>
            <p className="leading-relaxed">
              Bestelldaten werden gemäß den gesetzlichen Aufbewahrungsfristen für Rechnungen
              (üblicherweise 7 Jahre) gespeichert.
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              8. Ihre Rechte
            </h2>
            <p className="leading-relaxed mb-4">Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
            <ul className="list-disc list-inside mb-6 space-y-2 ml-4">
              <li>
                <strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre
                gespeicherten Daten verlangen.
              </li>
              <li>
                <strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können die Berichtigung
                unrichtiger Daten verlangen.
              </li>
              <li>
                <strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer
                Daten verlangen.
              </li>
              <li>
                <strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können die
                Einschränkung der Verarbeitung verlangen.
              </li>
              <li>
                <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der Verarbeitung
                widersprechen.
              </li>
              <li>
                <strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können die Übertragung
                Ihrer Daten verlangen.
              </li>
              <li>
                <strong>Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO):</strong> Sie können Ihre
                Einwilligung jederzeit widerrufen.
              </li>
            </ul>
            <p className="leading-relaxed">
              Um Ihre Rechte auszuüben, wenden Sie sich bitte an:{" "}
              <a
                href="mailto:office@htl-braunau.at"
                className="underline"
                style={{ color: "var(--color-gold-light)" }}
              >
                office@htl-braunau.at
              </a>
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              9. Beschwerderecht
            </h2>
            <p className="leading-relaxed mb-4">
              Sie haben das Recht, eine Beschwerde bei der österreichischen Datenschutzbehörde
              einzureichen, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer
              personenbezogenen Daten gegen die DSGVO verstößt.
            </p>
            <p className="leading-relaxed">
              <strong>Österreichische Datenschutzbehörde:</strong>
              <br />
              Barichgasse 40-42
              <br />
              1030 Wien
              <br />
              Österreich
              <br />
              Website:{" "}
              <a
                href="https://www.dsb.gv.at"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "var(--color-gold-light)" }}
              >
                www.dsb.gv.at
              </a>
            </p>
          </section>

          <section className="pb-6">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-bronze)" }}>
              10. Kontakt für Datenschutzanfragen
            </h2>
            <p className="leading-relaxed mb-4">
              Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:
            </p>
            <p className="leading-relaxed">
              HTL Braunau am Inn
              <br />
              Osternberger Straße 55
              <br />
              5280 Braunau am Inn
              <br />
              Österreich
              <br />
              E-Mail:{" "}
              <a
                href="mailto:office@htl-braunau.at"
                className="underline"
                style={{ color: "var(--color-gold-light)" }}
              >
                office@htl-braunau.at
              </a>
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

