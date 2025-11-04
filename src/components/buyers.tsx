"use client";

import { api } from "~/trpc/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useFilteredData } from "~/contexts/FilteredDataContext";

type SortColumn = 'id' | 'name' | 'email' | 'address' | 'postal' | 'province' | 'country' | 'verified' | 'group' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function Buyers() {
    const { data, isLoading, isError, error } = api.buyers.all.useQuery();
    const markAsSentMutation = api.buyers.markBuyerTicketsAsSent.useMutation();
    const utils = api.useUtils();
    const { setFilteredBuyers } = useFilteredData();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Search and filter states
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [filterDeliveryMethod, setFilterDeliveryMethod] = useState("all");
    const [filterSentStatus, setFilterSentStatus] = useState("all");

    // Filter by buyer ID for hash navigation
    const [filterBuyerId, setFilterBuyerId] = useState<string | null>(null);

    useEffect(() => {
        // Check for hash in URL
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash?.startsWith('#buyer-')) {
                const buyerId = hash.replace('#buyer-', '');
                
                // Find the buyer in the data
                const buyer = data?.find(b => b.id.toString() === buyerId);
                
                if (buyer) {
                    // Set items per page to "All" to show all buyers
                    setItemsPerPage(10000);
                    
                    // Set the buyer ID filter to show only this buyer
                    setFilterBuyerId(buyerId);
                    
                    // Use setTimeout to wait for the DOM to update with the filtered results
                    const timer = setTimeout(() => {
                        const element = document.getElementById(`buyer-${buyerId}`);
                        
                        if (element) {
                            // Scroll to the element
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                                // Clear the hash and filter from URL without scrolling
                            window.history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                    }, 500);
                    
                    return () => clearTimeout(timer);
                }
            } else {
                // Clear the filter when there's no hash
                setFilterBuyerId(null);
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
    }, [debouncedSearchText, filterDeliveryMethod, filterSentStatus, itemsPerPage, sortColumn, sortDirection]);

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
        let filtered = data.filter((buyer) => {
            // Buyer ID filter (for hash navigation)
            const matchesBuyerId = filterBuyerId === null || 
                buyer.id.toString() === filterBuyerId;
            
            // Search filter (name, email, address, province, postal) - use debounced search
            const matchesSearch = debouncedSearchText === "" || 
                buyer.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                buyer.email.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                buyer.address.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                buyer.province.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                buyer.postal.toString().includes(debouncedSearchText);
            
            // Delivery method filter
            const firstTicket = buyer.tickets[0];
            const deliveryMethodLower = (firstTicket?.delivery ?? "").toLowerCase();
            const isPostversand = deliveryMethodLower.includes('postversand');
            const isAbholung = deliveryMethodLower.includes('abholung');
            const matchesDeliveryMethod = filterDeliveryMethod === "all" 
                ? true
                : filterDeliveryMethod === "Abholung" 
                    ? isAbholung 
                    : filterDeliveryMethod === "Postversand" 
                        ? isPostversand 
                        : true;
            
            // Sent status filter
            const isSent = firstTicket?.sent === true;
            const matchesSentStatus = filterSentStatus === "all" || 
                (filterSentStatus === "1" && isSent) ||
                (filterSentStatus === "0" && !isSent);
            
            return matchesBuyerId && matchesSearch && matchesDeliveryMethod && matchesSentStatus;
        });

    // Sort data
        if (sortColumn && sortDirection) {
            filtered = [...filtered].sort((a, b) => {
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
        }

        return filtered;
    }, [data, debouncedSearchText, filterDeliveryMethod, filterSentStatus, filterBuyerId, sortColumn, sortDirection]);

    // Update context with filtered data
    useEffect(() => {
        setFilteredBuyers(filteredAndSortedData.length > 0 ? filteredAndSortedData : null);
    }, [filteredAndSortedData, setFilteredBuyers]);

    // Clear context when component unmounts or path changes
    useEffect(() => {
        return () => {
            setFilteredBuyers(null);
        };
    }, [setFilteredBuyers]);

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

    const dataLength = filteredAndSortedData.length;
    const totalPages = itemsPerPage >= dataLength 
        ? 1 
        : Math.ceil(dataLength / itemsPerPage);


    // Helper function to render filter button
    const renderFilterButton = (label: string, isActive: boolean, onClick: () => void, key?: string) => (
        <button
            key={key}
            onClick={onClick}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                isActive
                    ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                    : 'bg-white/80 text-gray-700 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );

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

    // Check if any filters are active
    const hasActiveFilters = debouncedSearchText !== "" || filterDeliveryMethod !== "all" || filterSentStatus !== "all" || filterBuyerId !== null;

    return (
        <div className="space-y-4 w-full mx-auto">
            {/* Filter panel - always visible */}
            <div className="px-1">
                <div>
                    <div className="flex items-center">
                        {/* Search bar */}
                        <div className="flex items-center border-r border-gray-200 px-3 py-2 flex-1 relative">
                            <input
                                type="text"
                                placeholder="Name, E-Mail, Adresse, PLZ oder Bundesland..."
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setFilterBuyerId(null); // Clear buyer ID filter when user starts typing
                                }}
                                className="bg-white/80 w-full border-0 outline-none focus:outline-none focus:ring-0 text-sm px-3 py-1.5 pr-8 text-gray-700 placeholder-gray-400 rounded"
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
                        
                        {/* Liefermethode filter */}
                        <div className="flex items-center justify-center border-r border-gray-200">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Liefermethode
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterDeliveryMethod === "all", () => {
                                    setFilterDeliveryMethod("all");
                                    setFilterBuyerId(null);
                                })}
                                {renderFilterButton("Abholung", filterDeliveryMethod === "Abholung", () => {
                                    setFilterDeliveryMethod("Abholung");
                                    setFilterBuyerId(null);
                                })}
                                {renderFilterButton("Postversand", filterDeliveryMethod === "Postversand", () => {
                                    setFilterDeliveryMethod("Postversand");
                                    setFilterBuyerId(null);
                                })}
                            </div>
                        </div>
                        
                        {/* Status filter */}
                        <div className="flex items-center justify-center">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterSentStatus === "all", () => {
                                    setFilterSentStatus("all");
                                    setFilterBuyerId(null);
                                })}
                                {renderFilterButton("Erledigt", filterSentStatus === "1", () => {
                                    setFilterSentStatus("1");
                                    setFilterBuyerId(null);
                                })}
                                {renderFilterButton("Nicht erledigt", filterSentStatus === "0", () => {
                                    setFilterSentStatus("0");
                                    setFilterBuyerId(null);
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results counter */}
            <div className="-mt-6 px-1">
                <div className="px-4 py-2.5">
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
                                    <span className="font-bold text-gray-900">{data.length}</span> <span className="text-gray-600">Käufer insgesamt</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <p className="text-sm text-gray-700">
                                    <span className="font-bold text-gray-900">{filteredAndSortedData.length}</span> von <span className="font-semibold text-gray-700">{data.length}</span> <span className="text-gray-600">Käufern{hasActiveFilters ? "" : ""}</span>
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

            <div className="-mt-3.5 px-4">
                <table className="w-full border border-gray-200 rounded-lg shadow-sm">
                <thead className="">
                    <tr>
                        <th 
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
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
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider select-none whitespace-nowrap"
                        >
                            <div className="flex items-center justify-center gap-2">
                                Karten
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider select-none whitespace-nowrap"
                        >
                            <div className="flex items-center justify-center gap-2">
                                Abholcode
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider select-none whitespace-nowrap"
                        >
                            <div className="flex items-center justify-center gap-2">
                                Liefermethode
                            </div>
                        </th>
                        <th 
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
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
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
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
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
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
                            className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider select-none whitespace-nowrap"
                        >
                            <div className="flex items-center justify-center gap-2">
                                Status
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                                {hasActiveFilters ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-gray-400">Nichts gefunden mit eingegebenen Filtern</span>
                                        <button
                                            onClick={() => {
                                                setSearchText("");
                                                setFilterDeliveryMethod("all");
                                                setFilterSentStatus("all");
                                                setFilterBuyerId(null);
                                            }}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Filter zurücksetzen
                                        </button>
                                    </div>
                                ) : (
                                    "Keine Käufer zum Anzeigen"
                                )}
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((buyer) => (
                        <tr key={buyer.id} id={`buyer-${buyer.id}`} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 h-10">
                                {buyer.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center h-10">
                                        <div>{buyer.tickets?.length ?? 0}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center h-10">
                                        <div>
                                            {buyer.tickets[0]?.code ?? '-'}
                                        </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center h-10">
                                        <div>
                                            {buyer.tickets[0]?.delivery ?? '-'}
                                        </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 h-10">
                                {buyer.address}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 h-10">
                                {buyer.postal}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 h-10">
                                {buyer.province}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center h-10">
                                        <div className="flex items-center justify-center h-full">
                                        {(() => {
                                            const firstTicket = buyer.tickets[0];
                                            if (!firstTicket) return <span>-</span>;
                                            
                                            const isSent = firstTicket.sent === true;
                                            const delivery = firstTicket.delivery?.toLowerCase() ?? '';
                                            const isShipping = delivery.includes('versand') || delivery.includes('shipping');
                                            const isPickup = delivery.includes('abholung') || delivery.includes('pickup');
                                            
                                            if (isSent) {
                                                return (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {isShipping ? 'Versendet' : isPickup ? 'Abgeholt' : 'Erledigt'}
                                                        </span>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await markAsSentMutation.mutateAsync({ buyerId: buyer.id });
                                                                await utils.buyers.all.invalidate();
                                                            } catch (error) {
                                                                console.error('Failed to mark tickets as sent:', error);
                                                            }
                                                        }}
                                                        disabled={markAsSentMutation.isPending}
                                                        className="px-2 py-0.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {markAsSentMutation.isPending ? '...' : 'Erledigt'}
                                                    </button>
                                                );
                                            }
                                        })()}
                                        </div>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
            
            {/* Pagination controls */}
            <div className="-mt-3 px-4">
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Anzeigen:</span>
                        <div className="flex gap-1">
                            {[20, 50, 100, 500].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setItemsPerPage(num)}
                                className={`px-2 py-0.5 text-xs rounded-md ${
                                        itemsPerPage === num
                                            ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                                            : 'bg-white/80 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={() => setItemsPerPage(10000)}
                                className={`px-2 py-0.5 text-xs rounded-md ${
                                    itemsPerPage >= dataLength
                                        ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                                        : 'bg-white/80 text-gray-700 hover:bg-gray-100'
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
                                    className="px-2 py-0.5 text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 text-gray-700 hover:bg-gray-100"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-0.5 text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 text-gray-700 hover:bg-gray-100"
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
