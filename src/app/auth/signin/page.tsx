import Link from "next/link";
import BrandMark from "~/components/BrandMark";

export default function SignIn() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <header className="site-header site-header-full">
        <BrandMark />
        <div className="flex items-center gap-4">
          <Link
            href="/buyer"
            className="btn btn-primary"
          >
            Mein Konto
          </Link>
          <div className="hidden md:block">
            <Link
              href="/"
              className="btn btn-secondary"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-md mx-auto px-6 py-12">
        <div className="card text-center">
          <h1 className="font-bold mb-6 gradient-text">
            Anmelden
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
