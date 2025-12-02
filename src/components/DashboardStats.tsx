"use client";

import { api } from "~/trpc/react";

export default function DashboardStats() {
    const { data, isLoading, isError, error } = api.reserves.all.useQuery();

    if (isLoading) {
        return (
            <div className="bg-gray-50 py-1 px-4 rounded-lg">
                <div className="text-center text-gray-600">Lade Übersicht...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-50 py-1 px-4 rounded-lg">
                <div className="text-center text-red-600">Fehler beim Laden: {error.message}</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-50 py-1 px-4 rounded-lg">
                <div className="text-center text-gray-600">Keine Daten gefunden.</div>
            </div>
        );
    }

    // Calculate summary statistics
    // Count unique buyers from all sold tickets who have paid
    const allBuyers = new Set<number>();
    data.forEach(reserve => {
        reserve.soldTickets?.forEach(ticket => {
            if (ticket.buyerId && ticket.paid === true) {
                allBuyers.add(ticket.buyerId);
            }
        });
    });
    const totalBuyers = allBuyers.size;

    const totalAvailable = data.reduce((sum, reserve) => sum + reserve.amount, 0);
    const totalSold = data.reduce((sum, reserve) => sum + (reserve.soldTickets?.filter(t => t.paid === true).length || 0), 0);
    const totalPotentialRevenue = data.reduce((sum, reserve) => sum + (reserve.amount * reserve.price), 0);
    const totalActualRevenue = data.reduce((sum, reserve) => {
        const soldRevenue = reserve.soldTickets?.filter(t => t.paid === true).reduce((ticketSum, ticket) => {
            return ticketSum + (ticket.soldPrice || reserve.price);
        }, 0) || 0;
        return sum + soldRevenue;
    }, 0);

    return (
        <div className="rounded-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full backend-layout table">
                    <thead>
                        <tr>
                            <th colSpan={2} className="px-4 py-3 min-w-80 text-center text-base font-semibold text-gray-800 border-r border-gray-300 !bg-white/50">Karten</th>
                            <th className="px-4 py-3 text-center text-base font-semibold text-gray-800 border-l border-r border-gray-300 !bg-white/50">Käufer</th>
                            <th colSpan={2} className="px-4 py-3 text-center text-base font-semibold text-gray-800 border-l border-gray-300 !bg-white/50">Umsatz</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-2 text-center border-r border-gray-300">
                                <div className="text-xl font-bold text-blue-600">{totalAvailable}</div>
                                <div className="text-sm text-gray-600">Verfügbar</div>
                            </td>
                            <td className="px-4 py-2 text-center border-l border-r border-gray-300">
                                <div className="text-xl font-bold text-orange-600">{totalSold}</div>
                                <div className="text-sm text-gray-600">Verkauft</div>
                            </td>
                            
                            {/* Verbleibend deprecated */}
                            <td className="px-4 py-2 text-center border-l border-r border-gray-300">
                                <div className="text-xl font-bold text-purple-600">{totalBuyers}</div>
                                <div className="text-sm text-gray-600">Anzahl</div>
                            </td>
                            <td className="px-4 py-2 text-center border-l border-r border-gray-300">
                                <div className="text-xl font-bold text-emerald-600">€{totalActualRevenue}</div>
                                <div className="text-sm text-gray-600">Aktuell</div>
                            </td>
                            <td className="px-4 py-2 text-center border-l border-gray-300">
                                <div className="text-xl font-bold text-emerald-600">€{totalPotentialRevenue}</div>
                                <div className="text-sm text-gray-600">Potentiell</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
