import Link from "next/link";
import Image from "next/image";
import { HydrateClient } from "~/trpc/server";
import Countdown from "~/components/Countdown";
import CollapsibleSection from "~/components/CollapsibleSection";

// Configurable countdown target date
const TICKET_SALE_DATE = "2025-10-21T12:00:00";

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

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
        {/* Header */}
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
              href="/buyer"
              className="btn btn-primary"
              id="ticket-button"
              style={{ 
                opacity: 0.4, 
                cursor: 'not-allowed',
                pointerEvents: 'none'
              }}
              title={`Ticketverkauf startet am ${formatDateForDisplay(TICKET_SALE_DATE)}`}
            >
              Ticketverkauf
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-16 px-6" style={{ background: 'var(--color-bg-secondary)' }}>
          <h1 className="text-6xl font-bold mb-4 gradient-text">
            HTL BRAUNAU
          </h1>
          <h2 className="text-4xl font-semibold mb-8" style={{ color: 'var(--color-text-primary)' }}>
            BALL DER AUSERWÄHLTEN
          </h2>
          <p className="text-xl mb-12" style={{ color: 'var(--color-text-secondary)' }}>
            Ein eleganter Abend im Zeichen von DUNE
          </p>
          
          {/* Countdown */}
          <div className="mb-16">
            <Countdown 
              targetDate={TICKET_SALE_DATE}
            />
          </div>
        </section>

        {/* Event Information Sections */}
        <section className="max-w-6xl mx-auto px-6 pb-16 pt-12" style={{ background: 'var(--color-bg-primary)' }}>
          <CollapsibleSection title="Lageplan & Bars" defaultOpen={true}>
            <div className="space-y-6">
              <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-gold-light)' }}>
                Veranstaltungsort
              </h4>
              <p className="text-lg mb-4">
                Der Ball findet in den eleganten Räumlichkeiten der HTL Braunau statt. 
                Unser Hauptsaal bietet Platz für 300 Gäste und wird in ein atemberaubendes 
                DUNE-Universum verwandelt.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-bronze)' }}>
                    Bar-Standorte
                  </h5>
                  <ul className="space-y-2">
                    <li>• Hauptbar - Zentrale Position im Hauptsaal</li>
                    <li>• Cocktail-Bar - Elegante Drinks im Foyer</li>
                    <li>• Wein-Bar - Ausgewählte Weine im Nebenraum</li>
                    <li>• Softdrink-Station - Für alle Altersgruppen</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-bronze)' }}>
                    Besondere Bereiche
                  </h5>
                  <ul className="space-y-2">
                    <li>• Tanzfläche - Professionelle Tanzfläche</li>
                    <li>• Lounge-Bereich - Entspannung und Gespräche</li>
                    <li>• Fotoecke - Erinnerungen für die Ewigkeit</li>
                    <li>• Garderobe - Sichere Aufbewahrung</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Zeitplan" defaultOpen={true}>
            <div className="space-y-6">
              <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-gold-light)' }}>
                Ablauf des Abends
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>18:00</div>
                  <div>
                    <h5 className="font-semibold">Einlass & Begrüßung</h5>
                    <p style={{ color: 'var(--color-text-muted)' }}>Empfang der Gäste mit Willkommensgetränk</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>19:00</div>
                  <div>
                    <h5 className="font-semibold">Eröffnung & Grußworte</h5>
                    <p style={{ color: 'var(--color-text-muted)' }}>Offizielle Eröffnung durch die Schulleitung</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>19:30</div>
                  <div>
                    <h5 className="font-semibold">Dinner & Buffet</h5>
                    <p style={{ color: 'var(--color-text-muted)' }}>Kulinarische Köstlichkeiten im DUNE-Stil</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>21:00</div>
                  <div>
                    <h5 className="font-semibold">Tanz & Unterhaltung</h5>
                    <p style={{ color: 'var(--color-text-muted)' }}>Live-Musik und Tanz bis in die Nacht</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>24:00</div>
                  <div>
                    <h5 className="font-semibold">Mitternachts-Snack</h5>
                    <p style={{ color: 'var(--color-text-muted)' }}>Kleine Köstlichkeiten für die späten Stunden</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>02:00</div>
                  <div>
                    <h5 className="font-semibold">Ende der Veranstaltung</h5>
                    <p style={{ color: 'var(--color-text-muted)' }}>Abschied und Heimreise</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Dresscode" defaultOpen={true}>
            <div className="space-y-6">
              <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-gold-light)' }}>
                Elegante Kleidung erwünscht
              </h4>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-bronze)' }}>
                    Für Damen
                  </h5>
                  <ul className="space-y-2">
                    <li>• Elegante Abendkleider</li>
                    <li>• Cocktailkleider</li>
                    <li>• Hochhackige Schuhe</li>
                    <li>• Schmuck und Accessoires</li>
                    <li>• DUNE-inspirierte Farben (Gold, Bronze, Sand)</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-bronze)' }}>
                    Für Herren
                  </h5>
                  <ul className="space-y-2">
                    <li>• Anzug oder Smoking</li>
                    <li>• Hemd mit Krawatte oder Fliege</li>
                    <li>• Elegante Schuhe</li>
                    <li>• Einstecktuch</li>
                    <li>• DUNE-inspirierte Accessoires</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <strong>Hinweis:</strong> Der Dresscode ist nicht zwingend, aber elegant gekleidete Gäste 
                  tragen zur besonderen Atmosphäre des Abends bei. DUNE-inspirierte Elemente sind sehr willkommen!
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="FAQ" defaultOpen={true}>
            <div className="space-y-6">
              <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-gold-light)' }}>
                Häufig gestellte Fragen
              </h4>
              
              <div className="space-y-6">
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                    Wann startet der Ticketverkauf?
                  </h5>
                  <p>Der Ticketverkauf startet am 15. März 2026 um 18:00 Uhr. Der Countdown oben zeigt die verbleibende Zeit an.</p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                    Wie viel kosten die Tickets?
                  </h5>
                  <p>Die genauen Preise werden beim Start des Ticketverkaufs bekannt gegeben. Es wird verschiedene Kategorien geben.</p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                    Gibt es Altersbeschränkungen?
                  </h5>
                  <p>Der Ball ist für alle Altersgruppen ab 16 Jahren geeignet. Unter 18-Jährige benötigen eine Einverständniserklärung der Eltern.</p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                    Ist das Dressing optional?
                  </h5>
                  <p>Ja, der Dresscode ist nicht zwingend, aber elegant gekleidete Gäste tragen zur besonderen Atmosphäre bei.</p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                    Gibt es Parkplätze?
                  </h5>
                  <p>Ja, ausreichend Parkplätze sind auf dem Schulgelände verfügbar. Die genaue Anfahrtsbeschreibung folgt mit den Tickets.</p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                    Können Tickets storniert werden?
                  </h5>
                  <p>Stornierungen sind bis 7 Tage vor der Veranstaltung möglich. Details finden Sie in den AGB.</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </section>
      </main>
    </HydrateClient>
  );
}
