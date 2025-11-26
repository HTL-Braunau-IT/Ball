"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";

export default function ImportAlumniPage() {
  const [csvContent, setCsvContent] = useState("");
  const [results, setResults] = useState<{
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const importAlumni = api.buyers.importAlumni.useMutation();

  // Memoize CSV parsing to avoid recalculating on every render
  const csvLines = useMemo(() => csvContent.split('\n').filter(l => l.trim()), [csvContent]);
  const csvLineCount = useMemo(() => csvLines.length, [csvLines]);
  const csvPreview = useMemo(() => csvLines.slice(0, 10).join('\n'), [csvLines]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvContent.trim()) {
      alert("Bitte laden Sie zuerst eine CSV-Datei hoch.");
      return;
    }

    try {
      const result = await importAlumni.mutateAsync({ csvContent });
      setResults(result);
    } catch (error) {
      alert(`Fehler beim Import: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  const handleClear = () => {
    setCsvContent("");
    setResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white/40 backdrop-filter backdrop-blur-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            CSV-Datei hochladen
          </h2>
          
          <div className="mb-4">
            <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Format: <code className="bg-white/80 px-2 py-1 rounded">email,name</code>
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Beispiel:
            </p>
            <pre className="bg-white/80 p-3 rounded text-sm mb-4">
{`email,name
max.mustermann@example.com,Max Mustermann
anna.schmidt@example.com,Anna Schmidt`}
            </pre>
          </div>

          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="mb-4 block w-full text-sm border rounded-lg cursor-pointer"
            style={{
              borderColor: "var(--color-accent-warm)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
            }}
          />

          {csvContent && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Vorschau ({csvLineCount} Zeilen):
              </h3>
              <pre className="bg-white/80 p-3 rounded text-xs max-h-40 overflow-auto">
                {csvPreview}
                {csvLineCount > 10 && '\n...'}
              </pre>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleImport}
              disabled={!csvContent || importAlumni.isPending}
              className="btn btn-primary"
            >
              {importAlumni.isPending ? "Importiere..." : "Importieren"}
            </button>
            
            {csvContent && (
              <button
                onClick={handleClear}
                disabled={importAlumni.isPending}
                className="btn btn-secondary"
              >
                Zurücksetzen
              </button>
            )}
          </div>
        </div>

        {results && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Import-Ergebnisse
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ background: "var(--color-success)", color: "white" }}>
                <div className="text-2xl font-bold">{results.created}</div>
                <div className="text-sm">Neu erstellt</div>
              </div>
              
              <div className="p-4 rounded-lg" style={{ background: "var(--color-accent-gold)", color: "white" }}>
                <div className="text-2xl font-bold">{results.updated}</div>
                <div className="text-sm">Aktualisiert</div>
              </div>
              
              <div className="p-4 rounded-lg" style={{ background: "var(--color-text-muted)", color: "white" }}>
                <div className="text-2xl font-bold">{results.skipped}</div>
                <div className="text-sm">Übersprungen</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-error)" }}>
                  Fehler ({results.errors.length}):
                </h3>
                <div className="bg-red-50 p-4 rounded-lg max-h-60 overflow-auto">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-sm mb-1" style={{ color: "var(--color-error)" }}>
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.errors.length === 0 && (
              <div className="p-4 rounded-lg" style={{ background: "var(--color-success)", color: "white" }}>
                ✓ Import erfolgreich abgeschlossen!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
