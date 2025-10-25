"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { api } from "~/utils/api";

export default function FloatingCSVExport() {
  const pathname = usePathname();

  // Get data based on current page
  const { data: reservesData } = api.reserves.all.useQuery(undefined, {
    enabled: pathname === "/backend/reserves"
  });
  
  const { data: ticketsData } = api.ticket.all.useQuery(undefined, {
    enabled: pathname === "/backend/tickets"
  });
  
  const { data: buyersData } = api.buyers.all.useQuery(undefined, {
    enabled: pathname === "/backend/buyers"
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
    else if (pathname === "/backend/tickets" && ticketsData) {
      csvHeaders = [
        'ID',
        'Lieferung',
        'Code',
        'Bezahlt',
        'Versendet',
        'Zeitstempel',
        'Aktionen'
      ];

      csvData = ticketsData.map((ticket) => [
        ticket.id,
        ticket.delivery,
        ticket.code,
        ticket.paid ? "Ja" : "Nein",
        ticket.sent ? "Ja" : "Nein",
        ticket.timestamp ? new Date(ticket.timestamp).toLocaleString() : "-",
        ticket.paid && !ticket.sent ? "Versendbar" : "-"
      ]);

      filename = `tickets_export_${new Date().toISOString().split('T')[0]}.csv`;
    } 
    else if (pathname === "/backend/buyers" && buyersData) {
      csvHeaders = [
        'ID',
        'Name',
        'E-Mail',
        'Adresse',
        'PLZ',
        'Bundesland',
        'Land',
        'Verifiziert',
        'Max Tickets',
        'Gruppe'
      ];

      csvData = buyersData.map((buyer) => [
        buyer.id,
        buyer.name,
        buyer.email,
        buyer.address,
        buyer.postal,
        buyer.province,
        buyer.country,
        buyer.verified ? "Ja" : "Nein",
        buyer.maxTickets,
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
  }, [pathname, reservesData, ticketsData, buyersData]);

  // Only show on data pages
  const showExport = pathname === "/backend/reserves" || 
                    pathname === "/backend/tickets" || 
                    pathname === "/backend/buyers";

  if (!showExport) return null;

  // Check if we have data to export
  const hasData = (pathname === "/backend/reserves" && reservesData && reservesData.length > 0) ||
                 (pathname === "/backend/tickets" && ticketsData && ticketsData.length > 0) ||
                 (pathname === "/backend/buyers" && buyersData && buyersData.length > 0);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={exportToCSV}
        disabled={!hasData}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
        title="Export to CSV"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    </div>
  );
}
