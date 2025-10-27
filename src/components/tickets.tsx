"use client";

import { api } from "~/trpc/react";
import { useState, useMemo } from "react";
import Link from "next/link";

type SortColumn = 'id' | 'name' | 'delivery' | 'code' | 'paid' | 'sent' | 'timestamp' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function Tickets() {
    const { data, isLoading, isError, error, refetch } = api.ticket.all.useQuery();
    const [processingTicket, setProcessingTicket] = useState<number | null>(null);
    
    // Search and filter states
    const [searchText, setSearchText] = useState("");
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [filterDelivery, setFilterDelivery] = useState("");
    const [filterPaid, setFilterPaid] = useState("");
    const [filterSent, setFilterSent] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    
    // Check if any filters are applied
    const hasActiveFilters = filterDelivery !== "" || filterPaid !== "" || filterSent !== "";
    
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
            // Search filter (name and code)
            const matchesSearch = searchText === "" || 
                ticket.buyer.name.toLowerCase().includes(searchText.toLowerCase()) ||
                ticket.code.toLowerCase().includes(searchText.toLowerCase());
            
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
    }, [data, searchText, filterDelivery, filterPaid, filterSent, sortColumn, sortDirection]);

    // Get unique delivery options for filter
    const uniqueDeliveries = useMemo(() => {
        if (!data) return [];
        return Array.from(new Set(data.map(t => t.delivery)));
    }, [data]);

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
            {/* Elegant unified filter bar */}
            <div className={`mb-4 ${showFilters ? 'p-4' : 'px-4 pt-4 pb-0'}`}>
                {/* Search bar and filter button - unified */}
                <div className={`flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden ${showFilters ? 'mb-3' : 'mb-0'}`}>
                    {/* Filter button */}
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`relative px-4 py-2.5 border-r transition-all ${
                            hasActiveFilters 
                                ? 'border-gray-300 bg-blue-50 text-blue-600' 
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-base flex items-center">
                            ⚙️
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    !
                                </span>
                            )}
                        </span>
                    </button>
                    
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
                    <p className="text-sm text-gray-600 ml-4 px-4">
                        <span className="font-semibold text-gray-900">{filteredAndSortedData.length}</span> von <span className="font-semibold">{data.length}</span> Karten
                    </p>
                </div>
                

                
                {/* Filter panel - collapsible */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Lieferung filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lieferung
                                </label>
                                <select
                                    value={filterDelivery}
                                    onChange={(e) => setFilterDelivery(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value="">Alle Lieferungen</option>
                                    {uniqueDeliveries.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Bezahlt filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bezahlt
                                </label>
                                <div className="flex gap-2">
                                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            value=""
                                            checked={filterPaid === ""}
                                            onChange={(e) => setFilterPaid(e.target.value)}
                                            className="w-3 h-3"
                                        />
                                        Alle
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            value="ja"
                                            checked={filterPaid === "ja"}
                                            onChange={(e) => setFilterPaid(e.target.value)}
                                            className="w-3 h-3"
                                        />
                                        Ja
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            value="nein"
                                            checked={filterPaid === "nein"}
                                            onChange={(e) => setFilterPaid(e.target.value)}
                                            className="w-3 h-3"
                                        />
                                        Nein
                                    </label>
                                </div>
                            </div>
                            
                            {/* Gesendet filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gesendet
                                </label>
                                <div className="flex gap-2">
                                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            value=""
                                            checked={filterSent === ""}
                                            onChange={(e) => setFilterSent(e.target.value)}
                                            className="w-3 h-3"
                                        />
                                        Alle
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            value="ja"
                                            checked={filterSent === "ja"}
                                            onChange={(e) => setFilterSent(e.target.value)}
                                            className="w-3 h-3"
                                        />
                                        Ja
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            value="nein"
                                            checked={filterSent === "nein"}
                                            onChange={(e) => setFilterSent(e.target.value)}
                                            className="w-3 h-3"
                                        />
                                        Nein
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                    {filteredAndSortedData.map((ticket) => (
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
        </div>
    );
}
