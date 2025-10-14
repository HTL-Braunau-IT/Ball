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
        <div className="space-y-3">
            {data.map((reserve, idx) => {
                const typeValue: unknown = (reserve as any).type;
                const typeLabel = Array.isArray(typeValue)
                    ? (typeValue as any[]).map((t: any) => t?.name ?? "").filter(Boolean).join(", ") || "Unbekannter Typ"
                    : (typeValue as any)?.name ?? "Unbekannter Typ";

                return (
                    <div key={idx} className="rounded border p-3">
                        <div className="font-semibold">{typeLabel}</div>
                        <div>Menge: {reserve.amount}</div>
                        <div>Preis: {reserve.price}</div>
                        <div>Geändert am: {reserve.updatedAt ? new Date(reserve.updatedAt).toLocaleString() : "-"}</div>
                        <div>Geändert von: {reserve.updatedBy ?? "-"}</div>
                    </div>
                );
            })}
        </div>
    );
}