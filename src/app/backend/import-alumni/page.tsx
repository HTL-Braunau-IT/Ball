"use client";

import { useState, useMemo, useRef } from "react";
import { api } from "~/trpc/react";

export default function ImportAlumniPage() {
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    setFileName(file.name);

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
    setFileName(null);
    setResults(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

          <div className="mb-4 flex items-center gap-4">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="px-4 py-2 bg-white/80 text-gray-700 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"
              style={{
                borderColor: "var(--color-accent-warm)",
              }}
            >
              Datei auswählen
            </label>
            <div className="flex-1 px-4 py-2 bg-white/60 rounded-lg border min-h-[40px] flex items-center" style={{ 
              borderColor: "var(--color-accent-warm)",
              color: fileName ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            }}>
              <span className={fileName ? "font-medium" : ""}>
                {fileName || "Keine Datei ausgewählt"}
              </span>
            </div>
          </div>

          {csvContent && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Vorschau ({csvLineCount} Zeilen):
              </h3>
              <div className="mb-4"></div>
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
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {importAlumni.isPending ? "Importiere..." : "Importieren"}
            </button>
            
            {csvContent && (
              <button
                onClick={handleClear}
                disabled={importAlumni.isPending}
                className="px-4 py-2 bg-white/80 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Zurücksetzen
              </button>
            )}
          </div>
        </div>

        {results && (
          <div className="bg-white/40 backdrop-filter backdrop-blur-sm rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Import-Ergebnisse
            </h2>
            <div className="mb-6"></div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                <div className="text-2xl font-bold">{results.created}</div>
                <div className="text-sm">Neu erstellt</div>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                <div className="text-2xl font-bold">{results.updated}</div>
                <div className="text-sm">Aktualisiert</div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-100 text-gray-600 ring-1 ring-gray-200">
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
