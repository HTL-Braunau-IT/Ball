"use client";

import { api } from "~/trpc/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useFilteredData } from "~/contexts/FilteredDataContext";

type SortColumn = 'id' | 'name' | 'email' | 'address' | 'postal' | 'province' | 'country' | 'verified' | 'group' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function Buyers() {
    const { data, isLoading, isError, error } = api.buyers.all.useQuery();
    const { setFilteredBuyers } = useFilteredData();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Search and filter states
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [filterCountry, setFilterCountry] = useState("");
    const [filterVerified, setFilterVerified] = useState("");
    const [filterGroup, setFilterGroup] = useState("");
    const [showAddressDetails, setShowAddressDetails] = useState(false);

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
    }, [debouncedSearchText, filterCountry, filterVerified, filterGroup, itemsPerPage, sortColumn, sortDirection]);

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
            
            // Country filter
            const matchesCountry = filterCountry === "" || 
                buyer.country.toLowerCase().includes(filterCountry.toLowerCase());
            
            // Verified filter
            const matchesVerified = filterVerified === "" || 
                (filterVerified === "ja" && buyer.verified) ||
                (filterVerified === "nein" && !buyer.verified);
            
            // Group filter
            const matchesGroup = filterGroup === "" || 
                (buyer.group?.name ?? "").toLowerCase().includes(filterGroup.toLowerCase());
            
            return matchesBuyerId && matchesSearch && matchesCountry && matchesVerified && matchesGroup;
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
    }, [data, debouncedSearchText, filterCountry, filterVerified, filterGroup, filterBuyerId, sortColumn, sortDirection]);

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

    // Get unique values for filters
    const uniqueCountries = useMemo(() => {
        if (!data) return [];
        return Array.from(new Set(data.map(b => b.country)));
    }, [data]);

    const uniqueGroups = useMemo(() => {
        if (!data) return [];
        return Array.from(new Set(data.map(b => b.group?.name).filter(Boolean))).sort();
    }, [data]);

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
    const hasActiveFilters = debouncedSearchText !== "" || filterCountry !== "" || filterVerified !== "" || filterGroup !== "" || filterBuyerId !== null;

    return (
        <div className="space-y-4">
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
                        
                        {/* Land filter */}
                        <div className="flex items-center justify-center border-r border-gray-200">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Land
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterCountry === "", () => {
                                    setFilterCountry("");
                                    setFilterBuyerId(null);
                                })}
                                {uniqueCountries.map(c => 
                                    renderFilterButton(c, filterCountry === c, () => {
                                        setFilterCountry(c);
                                        setFilterBuyerId(null);
                                    }, c)
                                )}
                            </div>
                        </div>
                        
                        {/* Verifiziert filter */}
                        <div className="flex items-center justify-center border-r border-gray-200">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Verifiziert
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterVerified === "", () => {
                                    setFilterVerified("");
                                    setFilterBuyerId(null);
                                })}
                                {renderFilterButton("Ja", filterVerified === "ja", () => {
                                    setFilterVerified("ja");
                                    setFilterBuyerId(null);
                                })}
                                {renderFilterButton("Nein", filterVerified === "nein", () => {
                                    setFilterVerified("nein");
                                    setFilterBuyerId(null);
                                })}
                            </div>
                        </div>
                        
                        {/* Gruppe filter */}
                        <div className="flex items-center justify-center">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gruppe
                            </div>
                            <div className="flex flex-wrap gap-2 px-3 py-2 justify-center">
                                {renderFilterButton("Alle", filterGroup === "", () => {
                                    setFilterGroup("");
                                    setFilterBuyerId(null);
                                })}
                                {uniqueGroups.map(g => 
                                    renderFilterButton(g, filterGroup === g, () => {
                                        setFilterGroup(g);
                                        setFilterBuyerId(null);
                                    }, g)
                                )}
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

            <div className="-mt-7.5 px-4 overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg shadow-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead className="">
                    <tr>
                        <th 
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: showAddressDetails ? '6%' : '6%' }}
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
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: showAddressDetails ? '10%' : '20%' }}
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
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider select-none"
                            style={{ width: showAddressDetails ? '10%' : '12%' }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Karten
                            </div>
                        </th>
                        <th 
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap"
                            style={{ width: showAddressDetails ? '10%' : '26%' }}
                            onClick={() => handleSort('email')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                E-Mail
                                {sortColumn === 'email' && (
                                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                )}
                            </div>
                        </th>
                        {showAddressDetails ? (
                            <>
                                <th 
                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none relative"
                                    style={{ width: '15%' }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span onClick={() => handleSort('address')}>
                                            Adresse
                                            {sortColumn === 'address' && (
                                                <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                            )}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAddressDetails(false);
                                            }}
                                            className="text-red-600 hover:text-red-800 transition-colors ml-1"
                                            title="Adressdetails ausblenden"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    style={{ width: '8%' }}
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
                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    style={{ width: '12%' }}
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
                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    style={{ width: '8%' }}
                                    onClick={() => handleSort('country')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Land
                                        {sortColumn === 'country' && (
                                            <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                                        )}
                                    </div>
                                </th>
                            </>
                        ) : (
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider select-none" style={{ width: '10%' }}>
                                <div className="flex items-center justify-center gap-2">
                                    <span>Adresse</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowAddressDetails(true);
                                        }}
                                        className="text-green-600 hover:text-green-800 transition-colors"
                                        title="Adressdetails anzeigen"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </th>
                        )}
                        <th 
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: showAddressDetails ? '8%' : '8%' }}
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
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            style={{ width: showAddressDetails ? '10%' : '10%' }}
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
                <tbody className="divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={showAddressDetails ? 10 : 7} className="px-6 py-8 text-center text-sm text-gray-500">
                                {hasActiveFilters ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-gray-400">Nichts gefunden mit eingegebenen Filtern</span>
                                        <button
                                            onClick={() => {
                                                setSearchText("");
                                                setFilterCountry("");
                                                setFilterVerified("");
                                                setFilterGroup("");
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
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {buyer.id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {buyer.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                {showAddressDetails ? '...' : (buyer.tickets && buyer.tickets.length > 0 
                                    ? buyer.tickets.map((t, idx) => (
                                        <span key={t.id}>
                                            <Link 
                                                href={`/backend/tickets#ticket-${t.id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {t.id}
                                            </Link>
                                            {idx < buyer.tickets.length - 1 && ', '}
                                        </span>
                                    ))
                                    : '-')}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {showAddressDetails ? '...' : buyer.email}
                            </td>
                            {showAddressDetails ? (
                                <>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {buyer.address}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {buyer.postal}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {buyer.province}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {buyer.country}
                                    </td>
                                </>
                            ) : (
                                <td className="px-4 py-4 text-sm text-gray-500 text-center whitespace-nowrap">
                                    ...
                                </td>
                            )}
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {showAddressDetails ? '...' : (buyer.verified ? "Ja" : "Nein")}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {showAddressDetails ? '...' : (buyer.group?.name ?? "-")}
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
            
            {/* Pagination controls */}
            <div className="-mt-6 px-4">
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
