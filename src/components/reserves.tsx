"use client";

import { api } from "~/utils/api";

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
                            Geändert von
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((reserve, idx) => {
                        const typeValue: unknown = (reserve as any).type;
                        const typeLabel = Array.isArray(typeValue)
                            ? (typeValue as any[]).map((t: any) => t?.name ?? "").filter(Boolean).join(", ") || "Unbekannter Typ"
                            : (typeValue as any)?.name ?? "Unbekannter Typ";

                        const deliveryMethods = Array.isArray(reserve.deliveryMethods)
                            ? reserve.deliveryMethods.map((dm: any) => dm?.name ?? "").filter(Boolean).join(", ") || "-"
                            : "-";

                        return (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {typeLabel}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reserve.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reserve.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {deliveryMethods}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reserve.updatedAt ? new Date(reserve.updatedAt).toLocaleString() : "-"}
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