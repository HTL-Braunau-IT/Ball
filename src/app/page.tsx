import Link from "next/link";
import Image from "next/image";
import { HydrateClient, api } from "~/trpc/server";
import Countdown from "~/components/Countdown";
import CollapsibleSection from "~/components/CollapsibleSection";
import { env } from "~/env";

// Get ticket sale date from environment variable
const TICKET_SALE_DATE = env.NEXT_PUBLIC_TICKET_SALE_DATE;

export default async function Home() {
  // Check kill switch from backend
  const salesEnabled = await api.systemSettings.getSalesEnabled();
  
  // Check if ticket sale has started
  const ticketSaleDate = TICKET_SALE_DATE ? new Date(TICKET_SALE_DATE) : new Date();
  const now = new Date();
  const hasTicketSaleStarted = salesEnabled && now >= ticketSaleDate;

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
              title="Zu Ihrem Konto"
            >
              Mein Konto
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center px-6 relative overflow-hidden" style={{ 
          background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-accent))',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* DUNE-themed background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Sand dunes */}
            <div className="absolute top-1/4 left-0 w-96 h-32 rounded-full opacity-5" style={{ 
              background: 'var(--color-gold-light)',
              animation: 'dune-drift 20s linear infinite',
              clipPath: 'polygon(0% 100%, 20% 60%, 40% 80%, 60% 40%, 80% 70%, 100% 50%, 100% 100%)'
            }}></div>
            <div className="absolute top-1/2 right-0 w-80 h-24 rounded-full opacity-5" style={{ 
              background: 'var(--color-bronze)',
              animation: 'dune-drift 25s linear infinite reverse',
              clipPath: 'polygon(0% 100%, 15% 70%, 35% 50%, 55% 80%, 75% 60%, 100% 40%, 100% 100%)'
            }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-64 h-20 rounded-full opacity-5" style={{ 
              background: 'var(--color-gold-dark)',
              animation: 'dune-drift 30s linear infinite',
              clipPath: 'polygon(0% 100%, 25% 50%, 50% 70%, 75% 40%, 100% 60%, 100% 100%)'
            }}></div>
            
            {/* Spice particles */}
            <div className="absolute top-1/3 left-1/3 w-2 h-2 rounded-full opacity-20" style={{ 
              background: 'var(--color-accent-gold)',
              animation: 'sand-particle 4s ease-in-out infinite'
            }}></div>
            <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full opacity-20" style={{ 
              background: 'var(--color-accent-bronze)',
              animation: 'sand-particle 5s ease-in-out infinite',
              animationDelay: '1s'
            }}></div>
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full opacity-20" style={{ 
              background: 'var(--color-gold-light)',
              animation: 'sand-particle 3s ease-in-out infinite',
              animationDelay: '2s'
            }}></div>
            <div className="absolute bottom-1/3 left-1/5 w-1 h-1 rounded-full opacity-20" style={{ 
              background: 'var(--color-bronze)',
              animation: 'sand-particle 6s ease-in-out infinite',
              animationDelay: '3s'
            }}></div>
            
            {/* Spice glow orbs */}
            <div className="absolute top-1/4 right-1/4 w-16 h-16 rounded-full opacity-10" style={{ 
              background: 'radial-gradient(circle, var(--color-accent-gold), transparent)',
              animation: 'spice-glow 8s ease-in-out infinite'
            }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-12 h-12 rounded-full opacity-10" style={{ 
              background: 'radial-gradient(circle, var(--color-accent-bronze), transparent)',
              animation: 'spice-glow 10s ease-in-out infinite',
              animationDelay: '2s'
            }}></div>
            <div className="absolute top-3/4 right-1/3 w-8 h-8 rounded-full opacity-10" style={{ 
              background: 'radial-gradient(circle, var(--color-gold-light), transparent)',
              animation: 'spice-glow 12s ease-in-out infinite',
              animationDelay: '4s'
            }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center w-full">
            <div className="mb-12">
              <h1 className="text-7xl font-bold mb-6 gradient-text">
                DUNE - Ball der HTL BRAUNAU
              </h1>
              <p className="text-2xl mb-16" style={{ color: 'var(--color-text-secondary)' }}>
                Ein eleganter Abend im Zeichen von DUNE
              </p>
            </div>
            
            {/* Countdown or Sale Active */}
            {salesEnabled && (
              <div className="w-full max-w-2xl">
                {hasTicketSaleStarted ? (
                  <div className="countdown-box text-center">
                    <h3 className="countdown-title" style={{ color: 'var(--color-gold-light)' }}>
                      Ticketverkauf ist gestartet!
                    </h3>
                    <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                      Sichern Sie sich jetzt Ihre Tickets für den HTL Ball 2026
                    </p>
                    <Link href="/buyer" className="btn btn-primary text-lg px-8 py-4">
                      Jetzt Tickets kaufen
                    </Link>
                  </div>
                ) : (
                  <Countdown 
                    targetDate={TICKET_SALE_DATE ?? new Date().toISOString()}
                  />
                )}
              </div>
            )}
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
                    <h5 className="font-semibold">Einlass</h5>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>20:30</div>
                  <div>
                    <h5 className="font-semibold">Eröffnungstanz</h5>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>21:00</div>
                  <div>
                    <h5 className="font-semibold">Beginn Live Musik</h5>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>00:00</div>
                  <div>
                    <h5 className="font-semibold">Mitternachtseinlage</h5>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-light)' }}>03:00</div>
                  <div>
                    <h5 className="font-semibold">Ende der Veranstaltung</h5>
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
                    <li>• Lange, schicke Cocktailkleider</li>
                    <li>• Hohe Schuhe (auch Wechselschuhe erlaubt)</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-bronze)' }}>
                    Für Herren
                  </h5>
                  <ul className="space-y-2">
                    <li>• Anzug oder Smoking</li>
                    <li>• Elegante Schuhe (auch sauber geputzte Sneaker erlaubt)</li>
                  </ul>
                </div>
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
                  <p>Der Ticketverkauf startet am 19.12.2025 um 12 Uhr. Der Countdown oben zeigt die verbleibende Zeit an. </p>
                </div>
                
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                    Gibt es Altersbeschränkungen?
                  </h5>
                  <p>
                    Der Ball ist grundsätzlich ab 18 Jahren. Minderjährige können jedoch mit einer 
                    Einverständniserklärung der Eltern und in Begleitung einer volljährigen Person 
                    teilnehmen. Die Einverständniserklärung finden Sie hier:&nbsp;  
                    <Link href="/einverstaendniserklaerung" className="text-gold-light hover:underline" style={{ color: 'var(--color-gold-light)' }}>
                       Einverständniserklärung herunterladen
                    </Link>
                  </p>
                </div>
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                  Wie kommt man am besten hin? 
                  </h5>
                  <p>
                    Wir bieten einen Shuttle-Service von einem großen Parkplatz an. 
                    Weitere Informationen finden Sie hier:&nbsp; 
                    <Link href="/anfahrt" className="text-gold-light hover:underline" style={{ color: 'var(--color-gold-light)' }}>
                      Anfahrt & Shuttle-Service
                    </Link>
                  </p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                  Gibt es eine Gaderobe? 
                  </h5>
                  <p>Ja, wir bieten eine bewachte Gaderobe an. </p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bronze)' }}>
                  Ist der Eintritt nur mit Ticket möglich? 
                  </h5>
                  <p>Zugang nur mit im Vorfeld gekauftem Ticket möglich. Es gibt keine Abendkasse</p>
                </div>
          </div>
        </div>
          </CollapsibleSection>
        </section>
      </main>
    </HydrateClient>
  );
}
