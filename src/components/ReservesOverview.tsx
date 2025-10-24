"use client";

import { api } from "~/utils/api";

export default function ReservesOverview() {
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
                <div className="text-center text-gray-600">Keine Kontingente gefunden.</div>
            </div>
        );
    }

    // Calculate summary statistics
    const totalReserves = data.length;
    const totalAvailable = data.reduce((sum, reserve) => sum + reserve.amount, 0);
    const totalSold = data.reduce((sum, reserve) => sum + (reserve.soldTickets?.length || 0), 0);
    const totalRemaining = totalAvailable - totalSold;
    const totalPotentialRevenue = data.reduce((sum, reserve) => sum + (reserve.amount * reserve.price), 0);
    const totalActualRevenue = data.reduce((sum, reserve) => {
        const soldRevenue = reserve.soldTickets?.reduce((ticketSum, ticket) => ticketSum + ticket.soldPrice, 0) || 0;
        return sum + soldRevenue;
    }, 0);

    return (
        <div className="bg-gray-50 py-1 px-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                <div>
                    <div className="text-xl font-bold text-blue-600">{totalReserves}</div>
                    <div className="text-sm text-gray-600">Kontingente</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-green-600">{totalAvailable}</div>
                    <div className="text-sm text-gray-600">Verfügbar</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-orange-600">{totalSold}</div>
                    <div className="text-sm text-gray-600">Verkauft</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-purple-600">{totalRemaining}</div>
                    <div className="text-sm text-gray-600">Verbleibend</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-indigo-600">€{totalActualRevenue}</div>
                    <div className="text-sm text-gray-600">Umsatz</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-indigo-600">€{totalPotentialRevenue}</div>
                    <div className="text-sm text-gray-600">Potentieller Umsatz</div>
                </div>
            </div>
        </div>
    );
}
