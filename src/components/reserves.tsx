"use client";

import { api } from "~/utils/api";
import TicketProgressBar from "./TicketProgressBar";

export default function TicketReserves() {
    const { data, isLoading, isError, error } = api.reserves.all.useQuery();

    if (isLoading) {
        return (
            <div>Lade Kontingente...</div>
        );
    }

    if (isError) {
        return (
            <div>Fehler beim Laden: {error.message}</div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div>Keine Kontingente gefunden.</div>
        );
    }

    return (
        <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Typ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Menge
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Liefermethoden
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Geändert am
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Geändert von
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((reserve, idx) => {
                        const typeValue = reserve.type;
                        const typeLabel = Array.isArray(typeValue)
                            ? typeValue.map((t: { name?: string }) => t?.name ?? "").filter(Boolean).join(", ") || "Unbekannter Typ"
                            : (typeValue as { name?: string })?.name ?? "Unbekannter Typ";

                        const deliveryMethods = Array.isArray(reserve.deliveryMethods)
                            ? reserve.deliveryMethods.map((dm: { name?: string }) => dm?.name ?? "").filter(Boolean).join(", ") || "-"
                            : "-";

                        const soldCount = reserve.soldTickets?.length || 0;
                        const remainingCount = reserve.amount - soldCount;

                        return (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {typeLabel}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reserve.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    €{reserve.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {deliveryMethods}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reserve.updatedAt ? new Date(reserve.updatedAt).toLocaleString() : "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <TicketProgressBar 
                                        total={reserve.amount}
                                        sold={soldCount}
                                        remaining={remainingCount}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reserve.updatedBy ?? "-"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}