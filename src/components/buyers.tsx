"use client";

import { api } from "~/trpc/react";
import { useEffect } from "react";

export default function Buyers() {
    const { data, isLoading, isError, error } = api.buyers.all.useQuery();

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
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            E-Mail
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Adresse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PLZ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bundesland
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Land
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verifiziert
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Max. Karten
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gruppe
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((buyer) => (
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
    );
}
