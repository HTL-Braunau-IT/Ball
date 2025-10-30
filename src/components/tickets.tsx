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
    
    // Filter by ticket ID for hash navigation
    const [filterTicketId, setFilterTicketId] = useState<string | null>(null);

    // Hash navigation effect for tickets
    useEffect(() => {
        // Check for hash in URL
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash?.startsWith('#ticket-')) {
                const ticketId = hash.replace('#ticket-', '');
                
                // Find the ticket in the data
                const ticket = data?.find(t => t.id.toString() === ticketId);
                
                if (ticket) {
                    // Set items per page to "All" to show all tickets
                    setItemsPerPage(10000);
                    
                    // Set the ticket ID filter to show only this ticket
                    setFilterTicketId(ticketId);
                    
                    // Use setTimeout to wait for the DOM to update with the filtered results
                    const timer = setTimeout(() => {
                        const element = document.getElementById(`ticket-${ticketId}`);
                        
                        if (element) {
                            // Scroll to the element
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                            // Clear the hash from URL without scrolling
                            window.history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                    }, 500);
                    
                    return () => clearTimeout(timer);
                }
            } else {
                // Clear the filter when there's no hash
                setFilterTicketId(null);
            }
        }
    }, [data]);
    
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
    }, [debouncedSearchText, filterDelivery, filterPaid, filterSent, filterTicketId, sortColumn, sortDirection, itemsPerPage]);
    
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
            
            // Ticket ID filter (for hash navigation)
            const matchesTicketId = filterTicketId === null || 
                ticket.id.toString() === filterTicketId;
            
            return matchesSearch && matchesDelivery && matchesPaid && matchesSent && matchesTicketId;
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
    }, [data, debouncedSearchText, filterDelivery, filterPaid, filterSent, filterTicketId, sortColumn, sortDirection]);

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
            <div className="text-center py-8">
                <div className="text-gray-500 text-sm">Keine Karten gefunden.</div>
            </div>
        );
    }

    // Check if any filters are active
    const hasActiveFilters = debouncedSearchText !== "" || filterDelivery !== "" || filterPaid !== "" || filterSent !== "";

    return (
        <div className="space-y-4">
            {/* Filter panel - always visible */}
            <div className="px-4">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center">
                        {/* Search bar */}
                        <div className="flex items-center border-r border-gray-200 px-3 py-2 flex-1 relative">
                            <input
                                type="text"
                                placeholder="Name oder Code..."
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setFilterTicketId(null); // Clear ticket ID filter when user starts typing
                                }}
                                className="w-full border-0 outline-none focus:outline-none focus:ring-0 text-sm px-3 py-1.5 pr-8 text-gray-700 placeholder-gray-400 bg-gray-50 rounded"
                                style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
                            />
                            {searchText && (
                                <button
                                    onClick={() => setSearchText("")}
                                    className="absolute right-5 text-gray-400 hover:text-gray-600 transition-colors"
                                    type="button"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        
                        {/* Lieferung filter */}
                        <div className="flex items-center justify-center border-r border-gray-200">
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
                        <div className="flex items-center justify-center border-r border-gray-200">
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
                        <div className="flex items-center justify-center">
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

            {/* Results counter */}
            <div className="-mt-2 px-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                        {filteredAndSortedData.length === 0 && hasActiveFilters ? (
                            <>
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-red-600 font-medium">
                                    Nichts gefunden mit eingegebenen Filtern
                                </p>
                            </>
                        ) : filteredAndSortedData.length === data.length && !hasActiveFilters ? (
                            <>
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm text-gray-700">
                                    <span className="font-bold text-gray-900">{data.length}</span> <span className="text-gray-600">Karten insgesamt</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <p className="text-sm text-gray-700">
                                    <span className="font-bold text-gray-900">{filteredAndSortedData.length}</span> von <span className="font-semibold text-gray-700">{data.length}</span> <span className="text-gray-600">Karten{hasActiveFilters ? "" : ""}</span>
                                </p>
                                {hasActiveFilters && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                        Gefiltert
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="-mt-5.5 px-4 overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg shadow-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead className="">
                    <tr>
                        <th 
                            className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: '8%' }}
                            onClick={() => handleSort('id')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                ID
                                {sortColumn === 'id' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: '20%' }}
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Käufer
                                {sortColumn === 'name' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: '15%' }}
                            onClick={() => handleSort('delivery')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Lieferung
                                {sortColumn === 'delivery' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: '10%' }}
                            onClick={() => handleSort('code')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Code
                                {sortColumn === 'code' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: '8%' }}
                            onClick={() => handleSort('paid')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Bezahlt
                                {sortColumn === 'paid' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: '10%' }}
                            onClick={() => handleSort('sent')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Gesendet
                                {sortColumn === 'sent' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: '15%' }}
                            onClick={() => handleSort('timestamp')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Letzte Aktivität
                                {sortColumn === 'timestamp' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '14%' }}>
                            Aktionen
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                                {hasActiveFilters ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-gray-400">Nichts gefunden mit eingegebenen Filtern</span>
                                        <button
                                            onClick={() => {
                                                setSearchText("");
                                                setFilterDelivery("");
                                                setFilterPaid("");
                                                setFilterSent("");
                                            }}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Filter zurücksetzen
                                        </button>
                                    </div>
                                ) : (
                                    "Keine Karten zum Anzeigen"
                                )}
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((ticket) => (
                            <tr key={ticket.id} id={`ticket-${ticket.id}`} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900" style={{ height: '45px', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ticket.id}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" style={{ height: '45px', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <Link 
                                    href={`/backend/buyers#buyer-${ticket.buyer.id}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {ticket.buyer.name}
                                </Link>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" style={{ height: '45px', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ticket.delivery}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" style={{ height: '45px', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ticket.delivery.toLowerCase().includes('abholung') ? ticket.code : '-'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" style={{ height: '45px', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ticket.paid ? "Ja" : "Nein"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" style={{ height: '45px', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ticket.sent ? "Ja" : "Nein"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" style={{ height: '45px', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ticket.timestamp ? new Date(ticket.timestamp).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" style={{ height: '45px', verticalAlign: 'middle' }}>
                                {ticket.paid && 
                                 !ticket.sent && 
                                 (ticket.delivery.toLowerCase().includes('versand') || 
                                  ticket.delivery.toLowerCase().includes('shipping')) ? (
                                    <button
                                        onClick={() => handleMarkAsSent(ticket.id)}
                                        disabled={processingTicket === ticket.id}
                                        className="inline-flex items-center justify-center px-2 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ minWidth: '70px', height: '22px' }}
                                    >
                                        {processingTicket === ticket.id ? "..." : "Versendet"}
                                    </button>
                                ) : ticket.sent && (
                                    <span className="inline-flex items-center justify-center px-2 rounded-full text-xs font-medium bg-green-100 text-green-800" style={{ minWidth: '70px', height: '22px' }}>
                                        ✓ Versendet
                                    </span>
                                )}
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
            
            {/* Pagination controls */}
            <div className="-mt-6 px-4">
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
        </div>
    );
}
