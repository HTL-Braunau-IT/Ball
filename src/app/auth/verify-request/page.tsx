import Image from "next/image";
import Link from "next/link";

export default function VerifyRequest() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <header className="flex items-center justify-between p-6 border-b" style={{ 
        borderColor: 'var(--color-accent-warm)',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logos/HTL-Ball-2026_Logo_Farbe_notext.png"
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

      <section className="max-w-lg mx-auto px-6 py-12">
        <div className="card text-center p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">
            E-Mail prüfen
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Wir haben Ihnen einen Magic Link zur Anmeldung gesendet. Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Link.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-accent)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Falls Sie die E-Mail nicht sehen, überprüfen Sie bitte auch Ihren Spam-Ordner.
              </p>
            </div>
            
            <Link 
              href="/buyer" 
              className="btn btn-secondary w-full"
            >
              Zurück zur Käuferseite
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
