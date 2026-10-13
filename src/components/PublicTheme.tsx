"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Applies the "Elegant Noir" theme to every public page; the backend keeps its own look.
export default function PublicTheme({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/backend")) {
    return <>{children}</>;
  }

  return <div className="noir">{children}</div>;
}
