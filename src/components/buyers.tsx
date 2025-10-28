"use client";

import { api } from "~/trpc/react";
import { useEffect, useState, useMemo } from "react";

type SortColumn = 'id' | 'name' | 'email' | 'address' | 'postal' | 'province' | 'country' | 'verified' | 'maxTickets' | 'group' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function Buyers() {
    const { data, isLoading, isError, error } = api.buyers.all.useQuery();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    useEffect(() => {
        // Check for hash in URL
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash?.startsWith('#buyer-')) {
                const buyerId = hash.replace('#buyer-', '');
                const element = document.getElementById(`buyer-${buyerId}`);
                
                if (element) {
                    // Scroll to the element
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight the row
                    element.classList.add('highlighted-row');
                    
                    // Remove highlight after 3 seconds
                    const timer = setTimeout(() => {
                        element.classList.remove('highlighted-row');
                        // Clear the hash from URL without scrolling
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    }, 3000);
                    
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [data]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, sortColumn, sortDirection]);

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

    // Sort data
    const sortedData = useMemo(() => {
        if (!data || !sortColumn || !sortDirection) return data;
        
        return [...data].sort((a, b) => {
            let aValue: string | number | boolean;
            let bValue: string | number | boolean;

            switch (sortColumn) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'email':
                    aValue = a.email;
                    bValue = b.email;
                    break;
                case 'address':
                    aValue = a.address;
                    bValue = b.address;
                    break;
                case 'postal':
                    aValue = a.postal;
                    bValue = b.postal;
                    break;
                case 'province':
                    aValue = a.province;
                    bValue = b.province;
                    break;
                case 'country':
                    aValue = a.country;
                    bValue = b.country;
                    break;
                case 'verified':
                    aValue = a.verified ? 1 : 0;
                    bValue = b.verified ? 1 : 0;
                    break;
                case 'maxTickets':
                    aValue = a.maxTickets;
                    bValue = b.maxTickets;
                    break;
                case 'group':
                    aValue = a.group?.name ?? "";
                    bValue = b.group?.name ?? "";
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
    }, [data, sortColumn, sortDirection]);

    // Pagination logic
    const paginatedData = useMemo(() => {
        if (!sortedData) return [];
        // If showing all items, return everything
        if (itemsPerPage >= sortedData.length) {
            return sortedData;
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, itemsPerPage]);

    const dataLength = sortedData?.length ?? 0;
    const totalPages = itemsPerPage >= dataLength 
        ? 1 
        : Math.ceil(dataLength / itemsPerPage);

    if (isLoading) {
        return (
            <div>Lade Käufer...</div>
        );
    }

    if (isError) {
        return (
            <div>Fehler beim Laden: {error.message}</div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div>Keine Käufer gefunden.</div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
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
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Name
                                {sortColumn === 'name' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('email')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                E-Mail
                                {sortColumn === 'email' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('address')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Adresse
                                {sortColumn === 'address' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('postal')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                PLZ
                                {sortColumn === 'postal' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('province')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Bundesland
                                {sortColumn === 'province' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('country')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Land
                                {sortColumn === 'country' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('verified')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Verifiziert
                                {sortColumn === 'verified' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('maxTickets')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Max. Karten
                                {sortColumn === 'maxTickets' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('group')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Gruppe
                                {sortColumn === 'group' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((buyer) => (
                        <tr key={buyer.id} id={`buyer-${buyer.id}`} className="hover:bg-gray-50 transition-all duration-1000">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {buyer.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.postal}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.province}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.country}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.verified ? "Ja" : "Nein"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.maxTickets}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.group?.name ?? "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            
            {/* Pagination controls */}
            <div className="px-4">
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
                                    itemsPerPage >= dataLength
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
                                <>{dataLength} Ergebnisse</>
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
