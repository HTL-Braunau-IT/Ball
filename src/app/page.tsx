import Link from "next/link";
import Image from "next/image";
import { HydrateClient, api } from "~/trpc/server";
import BrandMark from "~/components/BrandMark";
import Countdown from "~/components/Countdown";
import ScheduleTimeline from "~/components/ScheduleTimeline";
import { env } from "~/env";

// Get ticket sale date from environment variable
const TICKET_SALE_DATE = env.NEXT_PUBLIC_TICKET_SALE_DATE;
const ALUMNI_TICKET_SALE_DATE = env.NEXT_PUBLIC_ALUMNI_TICKET_SALE_DATE;

const SCHEDULE = [
  { time: "19:00", label: "Einlass" },
  { time: "20:30", label: "Eröffnungstanz" },
  { time: "21:00", label: "Beginn Live-Musik" },
  { time: "00:00", label: "Mitternachtseinlage" },
  { time: "03:00", label: "Ende der Veranstaltung" },
];

const FLOORS = [
  { name: "Keller", bars: "Rockbar und Bierbar", src: "/lageplaene/keller/rockbar_bierbar.png" },
  { name: "Erdgeschoss", bars: "Aulabar und Bottle-Bar", src: "/lageplaene/erdgeschoss/aulabar_bottlebar.png" },
  { name: "1. Stock", bars: "Wein & Sekt, Laborbar und Absolventenbar", src: "/lageplaene/1_stock/weinsekt_laborbar_absolventenbar.png" },
  { name: "2. Stock", bars: "CuBar und Bluesbar", src: "/lageplaene/2_stock/cubar_bluesbar.png" },
  { name: "3. Stock", bars: "Mottobar 1, Mottobar 2 und Mottobar 3", src: "/lageplaene/3_stock/mottobar1_2_3.png" },
];

// Floating dust in the searchlights: [left %, duration s, delay s]
const MOTES = [
  [18, 9, 0], [27, 13, 3], [34, 11, 6], [41, 15, 1.5], [47, 10, 8], [53, 14, 4.5], [58, 12, 2],
  [64, 16, 7], [70, 11, 5], [76, 13, 9], [23, 17, 10], [61, 9, 11], [44, 18, 12], [81, 15, 6.5],
] as const;

const TIME_ZONE = "Europe/Vienna";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TIME_ZONE });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });

function PickupDate({ date, start, end }: { date?: string; start?: string; end?: string }) {
  if (!date) return null;
  return (
    <>
      am <b>{formatDate(date)}</b>
      {start && end && (
        <>
          {" "}von <b>{start}</b> bis <b>{end}</b> Uhr
        </>
      )}
    </>
  );
}

export default async function Home() {
  // Check kill switch from backend
  const salesEnabled = await api.systemSettings.getSalesEnabled();

  // Check if ticket sale has started
  const ticketSaleDate = TICKET_SALE_DATE ? new Date(TICKET_SALE_DATE) : new Date();
  const alumniTicketSaleDate = ALUMNI_TICKET_SALE_DATE ? new Date(ALUMNI_TICKET_SALE_DATE) : new Date();
  const now = new Date();
  const hasTicketSaleStarted = salesEnabled && now >= ticketSaleDate;
  const hasAlumniTicketSaleStarted = salesEnabled && now >= alumniTicketSaleDate;

  const hasPickupDates = !!(env.NEXT_PUBLIC_PICKUP_DATE_1 ?? env.NEXT_PUBLIC_PICKUP_DATE_2);

  return (
    <HydrateClient>
      <main>
        {/* Hero */}
        <section className="hero" aria-label="Ball der HTL Braunau 2027">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-beam hero-beam-l" aria-hidden="true" />
          <div className="hero-beam hero-beam-r" aria-hidden="true" />
          {MOTES.map(([left, duration, delay], i) => (
            <span
              key={i}
              className="hero-mote"
              aria-hidden="true"
              style={{
                left: `${left}%`,
                bottom: `${18 + (i % 4) * 9}%`,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
          <div className="hero-chart hero-chart-l" aria-hidden="true">
            <span>15’</span>
            <span>01’</span>
            <span>27’</span>
          </div>
          <div className="hero-chart hero-chart-r" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-bars hero-bars-l" aria-hidden="true">
            <span style={{ top: "14%" }} />
            <span style={{ bottom: "14%" }} />
          </div>
          <div className="hero-bars hero-bars-r" aria-hidden="true">
            <span style={{ top: "14%" }} />
            <span style={{ bottom: "14%" }} />
          </div>
          <div className="hero-fade" aria-hidden="true" />

          <header className="site-header">
            <BrandMark />
            <nav aria-label="Hauptnavigation" className="site-nav">
              <a href="#zeitplan" className="site-nav-link">Zeitplan</a>
              <a href="#lageplan" className="site-nav-link">Lageplan</a>
              <a href="#dresscode" className="site-nav-link">Dresscode</a>
              <a href="#faq" className="site-nav-link">FAQ</a>
              <Link href="/buyer" className="btn btn-secondary" id="ticket-button" title="Zu Ihrem Konto">
                Mein Konto
              </Link>
            </nav>
          </header>

          <div className="hero-content">
            <h1 className="sr-only">Ball der HTL Braunau 2027 – Prison Break – Raus in die Freiheit</h1>
            <Image
              src="/logos/Ball-2027_Logo_white.png"
              alt=""
              width={733}
              height={309}
              className="hero-logo"
              priority
              unoptimized
            />
            <div className="hero-date">
              <span className="hero-date-main">Freitag, 15. Jänner 2027</span>
              <span className="hero-date-rule" aria-hidden="true" />
              <span className="hero-date-sub">Einlass 19:00 · HTL Braunau</span>
            </div>

            {/* Countdown or Sale Active */}
            {salesEnabled && (
              <div className="hero-sale">
                {hasTicketSaleStarted ? (
                  <div className="cd-live">
                    <span className="n-eyebrow">Kartenverkauf ist gestartet</span>
                    <p className="cd-live-text">Sichern Sie sich jetzt Ihre Karten für den Ball 2027.</p>
                    <Link href="/buyer" className="btn btn-primary mt-2">
                      Jetzt Karten kaufen
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Alumni Ticket Sale Countdown */}
                    {ALUMNI_TICKET_SALE_DATE && (
                      hasAlumniTicketSaleStarted ? (
                        <div className="cd-live">
                          <span className="n-eyebrow">Vorverkauf ist gestartet</span>
                          <p className="cd-live-text">Sichern Sie sich jetzt Ihre Karten für den Ball 2027.</p>
                          <Link href="/buyer" className="btn btn-primary mt-2">
                            Jetzt Karten kaufen
                          </Link>
                        </div>
                      ) : (
                        <Countdown
                          targetDate={ALUMNI_TICKET_SALE_DATE}
                          title="Absolventen-Vorverkauf"
                          completedTitle="Vorverkauf gestartet!"
                          completedMessage=""
                        />
                      )
                    )}

                    {/* Regular Ticket Sale Countdown */}
                    <Countdown
                      targetDate={TICKET_SALE_DATE ?? new Date().toISOString()}
                      title="Regulärer Kartenverkauf"
                      completedTitle="Kartenverkauf gestartet!"
                      completedMessage="Jetzt können Sie Ihre Karten kaufen"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <a href="#zeitplan" className="hero-cue" aria-label="Weiter nach unten scrollen">
            Scrollen
            <span className="hero-cue-line" aria-hidden="true" />
          </a>
        </section>

        {/* Key facts */}
        <section className="facts" aria-label="Auf einen Blick">
          <div className="facts-grid">
            <div className="facts-item">
              <span className="n-eyebrow">Eintritt</span>
              <span>Nur mit Karte aus dem Vorverkauf. Es gibt keine Abendkasse.</span>
            </div>
            <div className="facts-item">
              <span className="n-eyebrow">Alter</span>
              <span>
                Ab 18 Jahren, ab 16 mit{" "}
                <a href="#faq" className="n-link">Einverständniserklärung</a>.
              </span>
            </div>
            <div className="facts-item">
              <span className="n-eyebrow">Anfahrt</span>
              <span>
                Shuttle-Service vom großen Parkplatz.{" "}
                <Link href="/anfahrt" className="n-link">Anfahrt &amp; Shuttle →</Link>
              </span>
            </div>
          </div>
        </section>

        <ScheduleTimeline items={SCHEDULE} />

        {/* Floor plans & bars */}
        <section id="lageplan" className="n-section" aria-labelledby="lageplan-title">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
            <div>
              <span className="n-eyebrow">02 · Lageplan &amp; Bars</span>
              <h2 id="lageplan-title" className="n-title">Fünf Stockwerke, zwölf Bars</h2>
            </div>
            <a href="/lageplaene/Lageplaene.pdf" download="Lageplan.pdf" className="btn btn-secondary gap-2.5">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              Lageplan (PDF)
            </a>
          </div>
          <div className="floor-grid">
            {FLOORS.map((floor) => (
              <article key={floor.name} className="floor-card">
                <div className="floor-plan">
                  <Image src={floor.src} alt={`Lageplan ${floor.name}`} width={800} height={600} />
                </div>
                <div className="floor-body">
                  <h3 className="floor-name">{floor.name}</h3>
                  <p className="mt-1.5" style={{ color: "var(--n-muted)" }}>{floor.bars}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Dress code */}
        <section id="dresscode" className="n-section" aria-labelledby="dresscode-title">
          <div className="grid gap-12 items-start md:grid-cols-2">
            <div>
              <span className="n-eyebrow">03 · Dresscode</span>
              <h2 id="dresscode-title" className="n-title">Elegante Kleidung erwünscht</h2>
              <p className="mt-4 max-w-[42ch]" style={{ color: "var(--n-muted)" }}>
                Raus aus der Zelle, rein in die Abendgarderobe.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="card">
                <h3 className="n-label" style={{ color: "var(--n-amber)", fontSize: "1.125rem", marginBottom: "0.875rem" }}>Damen</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Elegante Abendkleider</li>
                  <li>Lange, schicke Cocktailkleider</li>
                  <li>Hohe Schuhe (auch Wechselschuhe erlaubt)</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="n-label" style={{ color: "var(--n-amber)", fontSize: "1.125rem", marginBottom: "0.875rem" }}>Herren</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Anzug oder Smoking</li>
                  <li>Elegante Schuhe (auch sauber geputzte Sneaker erlaubt)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="n-section" style={{ maxWidth: 900 }} aria-labelledby="faq-title">
          <span className="n-eyebrow">04 · FAQ</span>
          <h2 id="faq-title" className="n-title" style={{ marginBottom: "2rem" }}>Häufig gestellte Fragen</h2>
          <div style={{ borderTop: "1px solid var(--n-line)" }}>
            <details className="faq-item" open>
              <summary>
                Wann startet der Kartenverkauf?
                <span className="faq-plus" aria-hidden="true">+</span>
              </summary>
              <p>
                {TICKET_SALE_DATE
                  ? <>Der Kartenverkauf startet am {formatDate(TICKET_SALE_DATE)} um {formatTime(TICKET_SALE_DATE)} Uhr. Der Countdown oben zeigt die verbleibende Zeit an.</>
                  : <>Der Termin für den Kartenverkauf wird in Kürze bekanntgegeben.</>}
              </p>
            </details>
            <details className="faq-item">
              <summary>
                Gibt es Altersbeschränkungen?
                <span className="faq-plus" aria-hidden="true">+</span>
              </summary>
              <p>
                Der Ball ist grundsätzlich ab 18 Jahren. Ab 16 darf man an dem Ball jedoch mit einer
                Einverständniserklärung der Eltern und in Begleitung einer volljährigen Person teilnehmen.{" "}
                <a
                  href="/einverstaendniserklaerung/einverstaendniserklaerung_muttizettel.pdf"
                  download="Einverständniserklärung_Muttizettel.pdf"
                  className="n-link"
                >
                  Einverständniserklärung herunterladen
                </a>
              </p>
            </details>
            <details className="faq-item">
              <summary>
                Wie kommt man am besten hin?
                <span className="faq-plus" aria-hidden="true">+</span>
              </summary>
              <p>
                Wir bieten einen Shuttle-Service von einem großen Parkplatz an. Weitere Informationen finden Sie hier:{" "}
                <Link href="/anfahrt" className="n-link">Anfahrt &amp; Shuttle-Service</Link>
              </p>
            </details>
            <details className="faq-item">
              <summary>
                Gibt es eine Garderobe?
                <span className="faq-plus" aria-hidden="true">+</span>
              </summary>
              <p>Ja, wir bieten eine bewachte Garderobe an.</p>
            </details>
            <details className="faq-item">
              <summary>
                Ist der Eintritt nur mit Karte möglich?
                <span className="faq-plus" aria-hidden="true">+</span>
              </summary>
              <p>Zugang nur mit im Vorfeld gekaufter Karte möglich. Es gibt keine Abendkasse.</p>
            </details>
            <details className="faq-item">
              <summary>
                Welche Abholtermine für Karten gibt es?
                <span className="faq-plus" aria-hidden="true">+</span>
              </summary>
              <p>
                {hasPickupDates ? (
                  <>
                    Abholung{" "}
                    <PickupDate
                      date={env.NEXT_PUBLIC_PICKUP_DATE_1}
                      start={env.NEXT_PUBLIC_PICKUP_DATE_1_START_TIME}
                      end={env.NEXT_PUBLIC_PICKUP_DATE_1_END_TIME}
                    />
                    {env.NEXT_PUBLIC_PICKUP_DATE_1 && env.NEXT_PUBLIC_PICKUP_DATE_2 && " oder "}
                    <PickupDate
                      date={env.NEXT_PUBLIC_PICKUP_DATE_2}
                      start={env.NEXT_PUBLIC_PICKUP_DATE_2_START_TIME}
                      end={env.NEXT_PUBLIC_PICKUP_DATE_2_END_TIME}
                    />
                    .
                  </>
                ) : (
                  <>Die Abholtermine werden in Kürze bekanntgegeben.</>
                )}
                <br />
                Abholung am <Link href="/anfahrt" className="n-link">Veranstaltungsort</Link> in der Aula.
              </p>
            </details>
          </div>
        </section>

        {/* Sponsors */}
        <section className="n-section text-center pb-28" aria-labelledby="sponsoren-title">
          <h2 id="sponsoren-title" className="n-eyebrow" style={{ color: "var(--n-muted)" }}>
            Unsere Hauptsponsoren
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-5">
            <div className="sponsor-tile">
              <Image src="/sponsors/bur.png" alt="B&R" width={300} height={150} />
            </div>
            <div className="sponsor-tile">
              <Image src="/sponsors/ginzinger.png" alt="Ginzinger" width={300} height={150} />
            </div>
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
