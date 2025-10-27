"use client";

import { api } from "~/trpc/react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

type SortColumn = 'id' | 'name' | 'delivery' | 'code' | 'paid' | 'sent' | 'timestamp' | null;
type SortDirection = 'asc' | 'desc' | null;

type TicketData = {
  id: number;
  delivery: string;
  code: string;
  paid: boolean | null;
  sent: boolean | null;
  timestamp: Date;
  buyer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    postal: number;
    province: string;
    country: string;
    verified: boolean;
    maxTickets: number;
    groupId: number;
  };
};

type TicketsProps = {
  initialData?: TicketData[];
};

export default function Tickets({ initialData }: TicketsProps = {}) {
    const { data, isLoading, isError, error, refetch } = api.ticket.all.useQuery(undefined, {
        ...(initialData && { initialData }),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    });
    const [processingTicket, setProcessingTicket] = useState<number | null>(null);
    
    // Search and filter states
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [filterDelivery, setFilterDelivery] = useState("");
    const [filterPaid, setFilterPaid] = useState("");
    const [filterSent, setFilterSent] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    
    // Debounce search input to improve performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchText]);
    
    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchText, filterDelivery, filterPaid, filterSent, sortColumn, sortDirection, itemsPerPage]);
    
    const markAsSentMutation = api.ticket.markAsSent.useMutation({
        onSuccess: () => {
            void refetch();
            setProcessingTicket(null);
        },
        onError: (error) => {
            console.error("Error marking ticket as sent:", error);
            setProcessingTicket(null);
        },
    });

    const handleMarkAsSent = (ticketId: number) => {
        setProcessingTicket(ticketId);
        markAsSentMutation.mutate({ ticketId });
    };

    // Handle column sorting
    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Filter and sort data
    const filteredAndSortedData = useMemo(() => {
        if (!data) return [];

        // Filter data
        let filtered = data.filter((ticket) => {
            // Search filter (name and code) - use debounced search
            const matchesSearch = debouncedSearchText === "" || 
                ticket.buyer.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                ticket.code.toLowerCase().includes(debouncedSearchText.toLowerCase());
            
            // Delivery filter
            const matchesDelivery = filterDelivery === "" || 
                ticket.delivery.toLowerCase().includes(filterDelivery.toLowerCase());
            
            // Paid filter
            const matchesPaid = filterPaid === "" || 
                (filterPaid === "ja" && ticket.paid) ||
                (filterPaid === "nein" && !ticket.paid);
            
            // Sent filter
            const matchesSent = filterSent === "" || 
                (filterSent === "ja" && ticket.sent) ||
                (filterSent === "nein" && !ticket.sent);
            
            return matchesSearch && matchesDelivery && matchesPaid && matchesSent;
        });

        // Sort data
        if (sortColumn && sortDirection) {
            filtered = [...filtered].sort((a, b) => {
                let aValue: string | number | Date;
                let bValue: string | number | Date;

                switch (sortColumn) {
                    case 'id':
                        aValue = a.id;
                        bValue = b.id;
                        break;
                    case 'name':
                        aValue = a.buyer.name;
                        bValue = b.buyer.name;
                        break;
                    case 'delivery':
                        aValue = a.delivery;
                        bValue = b.delivery;
                        break;
                    case 'code':
                        aValue = a.code;
                        bValue = b.code;
                        break;
                    case 'paid':
                        aValue = a.paid ? 1 : 0;
                        bValue = b.paid ? 1 : 0;
                        break;
                    case 'sent':
                        aValue = a.sent ? 1 : 0;
                        bValue = b.sent ? 1 : 0;
                        break;
                    case 'timestamp':
                        aValue = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                        bValue = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                        break;
                    default:
                        return 0;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortDirection === 'asc' 
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else {
                    return sortDirection === 'asc' 
                        ? Number(aValue) - Number(bValue)
                        : Number(bValue) - Number(aValue);
                }
            });
        }

        return filtered;
    }, [data, debouncedSearchText, filterDelivery, filterPaid, filterSent, sortColumn, sortDirection]);

    // Pagination logic
    const paginatedData = useMemo(() => {
        // If showing all items, return everything
        if (itemsPerPage >= filteredAndSortedData.length) {
            return filteredAndSortedData;
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedData.slice(startIndex, endIndex);
    }, [filteredAndSortedData, currentPage, itemsPerPage]);

    const totalPages = itemsPerPage >= filteredAndSortedData.length 
        ? 1 
        : Math.ceil(filteredAndSortedData.length / itemsPerPage);

    // Get unique delivery options for filter
    const uniqueDeliveries = useMemo(() => {
        if (!data) return [];
        return Array.from(new Set(data.map(t => t.delivery)));
    }, [data]);

    // Helper function to render filter button
    const renderFilterButton = (label: string, isActive: boolean, onClick: () => void, key?: string) => (
        <button
            key={key}
            onClick={onClick}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    if (isLoading) {
        return (
            <div>Lade Karten...</div>
        );
    }

    if (isError) {
        return (
            <div>Fehler beim Laden: {error.message}</div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div>Keine Karten gefunden.</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="mb-3 px-4">
                <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden">
                    {/* Search bar - full width */}
                    <div className="flex-1 flex items-center">
                        <input
                            type="text"
                            placeholder="Name oder Code..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="flex-1 border-0 outline-none focus:outline-none focus:ring-0 text-sm px-4 py-2.5 text-gray-700 placeholder-gray-400"
                            style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
                        />
                    </div>
                    {/* Results counter */}
                    <p className="text-sm text-gray-600 px-4">
                        <span className="font-semibold text-gray-900">{filteredAndSortedData.length}</span> von <span className="font-semibold">{data.length}</span> Karten
                    </p>
                </div>
            </div>

            {/* Filter panel - always visible */}
            <div className="mb-2 px-4">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center">
                        {/* Lieferung filter */}
                        <div className="flex items-center justify-center border-r border-gray-200 flex-1">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lieferung
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterDelivery === "", () => setFilterDelivery(""))}
                                {uniqueDeliveries.map(d => 
                                    renderFilterButton(d, filterDelivery === d, () => setFilterDelivery(d), d)
                                )}
                            </div>
                        </div>
                        
                        {/* Bezahlt filter */}
                        <div className="flex items-center justify-center border-r border-gray-200 flex-1">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bezahlt
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterPaid === "", () => setFilterPaid(""))}
                                {renderFilterButton("Ja", filterPaid === "ja", () => setFilterPaid("ja"))}
                                {renderFilterButton("Nein", filterPaid === "nein", () => setFilterPaid("nein"))}
                            </div>
                        </div>
                        
                        {/* Gesendet filter */}
                        <div className="flex items-center justify-center flex-1">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gesendet
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterSent === "", () => setFilterSent(""))}
                                {renderFilterButton("Ja", filterSent === "ja", () => setFilterSent("ja"))}
                                {renderFilterButton("Nein", filterSent === "nein", () => setFilterSent("nein"))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact pagination control under filters */}
            <div className="mb-2 px-4">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Anzeigen:</span>
                            <div className="flex gap-1">
                                {[20, 50, 100, 500].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setItemsPerPage(num)}
                                        className={`px-2 py-0.5 text-xs rounded-md border ${
                                            itemsPerPage === num
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setItemsPerPage(10000)}
                                    className={`px-2 py-0.5 text-xs rounded-md border ${
                                        itemsPerPage >= filteredAndSortedData.length
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-200'
                                    }`}
                                >
                                    Alle
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-600">
                                {totalPages > 1 ? (
                                    <>Seite {currentPage} von {totalPages}</>
                                ) : (
                                    <>{filteredAndSortedData.length} Ergebnisse</>
                                )}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-2 py-0.5 text-xs border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-2 py-0.5 text-xs border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center gap-2">
                                Käufer
                                {sortColumn === 'name' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('delivery')}
                        >
                            <div className="flex items-center gap-2">
                                Lieferung
                                {sortColumn === 'delivery' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('code')}
                        >
                            <div className="flex items-center gap-2">
                                Code
                                {sortColumn === 'code' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('paid')}
                        >
                            <div className="flex items-center gap-2">
                                Bezahlt
                                {sortColumn === 'paid' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('sent')}
                        >
                            <div className="flex items-center gap-2">
                                Gesendet
                                {sortColumn === 'sent' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('timestamp')}
                        >
                            <div className="flex items-center gap-2">
                                Letzte Aktivität
                                {sortColumn === 'timestamp' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aktionen
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {ticket.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Link 
                                    href={`/backend/buyers#buyer-${ticket.buyer.id}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {ticket.buyer.name}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.delivery}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.delivery.toLowerCase().includes('abholung') ? ticket.code : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.paid ? "Ja" : "Nein"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.sent ? "Ja" : "Nein"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.timestamp ? new Date(ticket.timestamp).toLocaleString() : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.paid && 
                                 !ticket.sent && 
                                 (ticket.delivery.toLowerCase().includes('versand') || 
                                  ticket.delivery.toLowerCase().includes('shipping')) && (
                                    <button
                                        onClick={() => handleMarkAsSent(ticket.id)}
                                        disabled={processingTicket === ticket.id}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processingTicket === ticket.id ? "Wird verarbeitet..." : "Als versendet markieren"}
                                    </button>
                                )}
                                {ticket.sent && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Versendet
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Anzeigen:</span>
                    <div className="flex gap-1">
                        {[20, 50, 100, 500].map((num) => (
                            <button
                                key={num}
                                onClick={() => setItemsPerPage(num)}
                                className={`px-2 py-0.5 text-xs rounded-md border ${
                                    itemsPerPage === num
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => setItemsPerPage(10000)}
                            className={`px-2 py-0.5 text-xs rounded-md border ${
                                itemsPerPage >= filteredAndSortedData.length
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Alle
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-600">
                        {totalPages > 1 ? (
                            <>Seite {currentPage} von {totalPages}</>
                        ) : (
                            <>{filteredAndSortedData.length} Ergebnisse</>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-2 py-0.5 text-xs border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                            >
                                ‹
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-2 py-0.5 text-xs border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
