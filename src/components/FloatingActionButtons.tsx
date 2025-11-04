"use client";

import { useCallback, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { api } from "~/utils/api";
import { useFilteredData } from "~/contexts/FilteredDataContext";

const ScrollToTopButton = ({ isVisible }: { isVisible: boolean }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleScrollToTop}
      className="bg-violet-100 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-200 p-3 rounded-full shadow-sm transition-all duration-200"
      title="Scroll to top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

const ScrollToBottomButton = ({ isVisible }: { isVisible: boolean }) => {
  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleScrollToBottom}
      className="bg-violet-100 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-200 p-3 rounded-full shadow-sm transition-all duration-200"
      title="Scroll to bottom"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export default function FloatingActionButtons() {
  const pathname = usePathname();
  const { buyers: filteredBuyers, tickets: filteredTickets } = useFilteredData();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [hasScrollable, setHasScrollable] = useState(false);
  const [theme, setTheme] = useState<'violet' | 'blue' | 'gold'>(() => {
    if (typeof window === 'undefined') return 'violet';
    return (localStorage.getItem('accentTheme') as 'violet' | 'blue' | 'gold') || 'violet';
  });

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
      const scrollHeight = Math.max(doc.scrollHeight, body.scrollHeight);
      const clientHeight = doc.clientHeight;
      const threshold = 4; // tolerance
      const scrollable = scrollHeight - clientHeight > threshold;
      const isNearTop = scrollTop <= 100;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      setHasScrollable(scrollable);
      setIsAtTop(isNearTop || !scrollable);
      setIsAtBottom(isNearBottom || !scrollable);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Re-evaluate on route changes
  useEffect(() => {
    const evt = new Event('resize');
    window.dispatchEvent(evt);
  }, [pathname]);

  // Apply theme class to body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    body.classList.remove('theme-violet', 'theme-blue', 'theme-gold');
    body.classList.add(`theme-${theme}`);
    try {
      localStorage.setItem('accentTheme', theme);
    } catch {}
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'violet' ? 'blue' : prev === 'blue' ? 'gold' : 'violet'));
  }, []);

  // Get data based on current page (only for reserves, tickets and buyers use filtered data from context)
  const { data: reservesData } = api.reserves.all.useQuery(undefined, {
    enabled: pathname === "/backend/reserves"
  });

  const exportToCSV = useCallback(() => {
    let csvHeaders: string[] = [];
    let csvData: unknown[][] = [];
    let filename = "";

    // Determine data and headers based on current page
    if (pathname === "/backend/reserves" && reservesData) {
      csvHeaders = [
        'Typ',
        'Menge',
        'Preis (€)',
        'Liefermethoden',
        'Verkaufte Tickets',
        'Verbleibende Tickets',
        'Geändert am',
        'Geändert von'
      ];

      csvData = reservesData.map((reserve) => {
        const typeValue = reserve.type;
        const typeLabel = Array.isArray(typeValue)
          ? typeValue.map((t: { name?: string }) => t?.name ?? "").filter(Boolean).join(", ") || "Unbekannter Typ"
          : (typeValue as { name?: string })?.name ?? "Unbekannter Typ";

        const deliveryMethodsText = Array.isArray(reserve.deliveryMethods)
          ? reserve.deliveryMethods.map((dm: { name?: string }) => dm?.name ?? "").filter(Boolean).join(", ") || "-"
          : "-";

        const soldCount = reserve.soldTickets?.length || 0;
        const remainingCount = reserve.amount - soldCount;

        return [
          typeLabel,
          reserve.amount,
          reserve.price,
          deliveryMethodsText,
          soldCount,
          remainingCount,
          reserve.updatedAt ? new Date(reserve.updatedAt).toLocaleString() : "-",
          reserve.updatedBy ?? "-"
        ];
      });

      filename = `reserves_export_${new Date().toISOString().split('T')[0]}.csv`;
    } 
    else if (pathname === "/backend/tickets" && filteredTickets) {
      csvHeaders = [
        'ID',
        'Käufer',
        'E-Mail',
        'Lieferung',
        'Code',
        'Bezahlt',
        'Versendet',
        'Zeitstempel',
        'Aktionen'
      ];

      csvData = filteredTickets.map((ticket) => [
        ticket.id,
        ticket.buyer.name ?? "-",
        ticket.buyer.email ?? "-",
        ticket.delivery,
        ticket.code,
        ticket.paid ? "Ja" : "Nein",
        ticket.sent ? "Ja" : "Nein",
        ticket.timestamp ? new Date(ticket.timestamp).toLocaleString() : "-",
        ticket.paid && !ticket.sent ? "Versendbar" : "-"
      ]);

      filename = `tickets_export_${new Date().toISOString().split('T')[0]}.csv`;
    } 
    else if (pathname === "/backend/buyers" && filteredBuyers) {
      csvHeaders = [
        'ID',
        'Name',
        'E-Mail',
        'Adresse',
        'PLZ',
        'Bundesland',
        'Land',
        'Verifiziert',
        'Gruppe'
      ];

      csvData = filteredBuyers.map((buyer) => [
        buyer.id,
        buyer.name,
        buyer.email,
        buyer.address,
        buyer.postal,
        buyer.province,
        buyer.country,
        buyer.verified ? "Ja" : "Nein",
        buyer.group?.name ?? "-"
      ]);

      filename = `buyers_export_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (csvData.length === 0) return;

    // Generate CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pathname, reservesData, filteredTickets, filteredBuyers]);

  // Export button only on data pages
  const showExport = pathname === "/backend/reserves" || 
                    pathname === "/backend/tickets" || 
                    pathname === "/backend/buyers";

  // Check if we have data to export
  const hasData = (pathname === "/backend/reserves" && reservesData && reservesData.length > 0) ||
                 (pathname === "/backend/tickets" && filteredTickets && filteredTickets.length > 0) ||
                 (pathname === "/backend/buyers" && filteredBuyers && filteredBuyers.length > 0);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <ScrollToTopButton isVisible={hasScrollable && !isAtTop} />
      <ScrollToBottomButton isVisible={hasScrollable && !isAtBottom} />
      {/* Theme switcher */}
      <button
        onClick={cycleTheme}
        className="bg-violet-100 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-200 p-3 rounded-full shadow-sm transition-all duration-200"
        title={`Theme: ${theme === 'violet' ? 'Violet' : theme === 'blue' ? 'Blue' : 'Gold'}`}
      >
        <span
          aria-hidden
          className="block w-6 h-6 bg-current"
          style={{
            WebkitMaskImage: 'url(/icons/paint-brush.png)',
            maskImage: 'url(/icons/paint-brush.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </button>
      {showExport && (
        <button
          onClick={exportToCSV}
          disabled={!hasData}
          className="bg-violet-100 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-200 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-full shadow-sm transition-all duration-200"
          title="Export to CSV"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}

