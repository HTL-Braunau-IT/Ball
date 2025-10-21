import Image from "next/image";
import Link from "next/link";

export default function SignIn() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
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
            href="/"
            className="btn btn-secondary"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </header>

      <section className="max-w-md mx-auto px-6 py-12">
        <div className="card text-center">
          <h1 className="text-3xl font-bold mb-6 gradient-text">
            Anmeldung
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Bitte verwenden Sie das Anmeldeformular auf der Käuferseite, um sich zu authentifizieren.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/buyer" 
              className="btn btn-primary w-full"
            >
              Zur Käuferseite
            </Link>
            
            <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Sie werden zur Käuferseite weitergeleitet, wo Sie sich mit Ihrer E-Mail-Adresse anmelden können.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
