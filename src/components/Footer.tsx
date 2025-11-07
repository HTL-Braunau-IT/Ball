"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  // Don't display footer in backend routes
  if (pathname?.startsWith("/backend")) {
    return null;
  }

  return (
    <footer
      className="sticky bottom-0 left-0 right-0 z-40 border-t"
      style={{
        borderColor: "var(--color-accent-warm)",
        background: "rgba(254, 254, 254, 0.85)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/impressum"
            className="text-sm hover:underline transition-all"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Impressum
          </Link>
          <span
            className="hidden sm:inline text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            |
          </span>
          <Link
            href="/dsgvo"
            className="text-sm hover:underline transition-all"
            style={{ color: "var(--color-text-secondary)" }}
          >
            DSGVO
          </Link>
          <span
            className="hidden sm:inline text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            |
          </span>
          <Link
            href="/anfahrt"
            className="text-sm hover:underline transition-all"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Anfahrt
          </Link>
        </div>
      </div>
    </footer>
  );
}

