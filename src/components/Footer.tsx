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
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>© 2027 Ball der HTL Braunau</span>
        <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/impressum" className="site-footer-link">
            Impressum
          </Link>
          <Link href="/dsgvo" className="site-footer-link">
            DSGVO
          </Link>
          <Link href="/anfahrt" className="site-footer-link">
            Anfahrt
          </Link>
          <a
            href="https://www.instagram.com/htlballbraunau/"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-link"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}
