"use client";

import { useState, useCallback } from "react";
import { api } from "~/trpc/react";

interface EditableBuyerGroup {
  id: number;
  maxTickets: number;
}

export default function BuyerGroups() {
    const { data, isLoading, isError, error, refetch } = api.buyerGroups.all.useQuery();
    const updateMutation = api.buyerGroups.update.useMutation({
        onSuccess: () => {
            setEditingId(null);
            setEditData(null);
            void refetch();
        },
        onError: (error) => {
            console.error("Update failed:", error);
            // Reset to original data on error
            setEditData(null);
        }
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<EditableBuyerGroup | null>(null);

    const handleEdit = useCallback((buyerGroup: any) => {
        setEditData({
            id: buyerGroup.id,
            maxTickets: buyerGroup.maxTickets,
        });
        setEditingId(buyerGroup.id);
    }, []);

    const handleSave = useCallback(() => {
        if (!editData) return;
        
        updateMutation.mutate({
            id: editData.id,
            maxTickets: editData.maxTickets,
        });
    }, [editData, updateMutation]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setEditData(null);
    }, []);

    const handleFieldChange = useCallback((field: keyof EditableBuyerGroup, value: any) => {
        if (!editData) return;
        
        setEditData(prev => prev ? { ...prev, [field]: value } : null);
    }, [editData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Lade Käufergruppen...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-red-600">Fehler beim Laden: {error.message}</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Keine Käufergruppen gefunden.</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Gruppen</h2>
            <div className="overflow-x-auto">
            <table className="">
                <thead className="">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-48">
                            Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-32">
                            Max. Tickets
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verknüpfte Kontingente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-28">
                            Geändert am
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-28">
                            Geändert von
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">
                            Aktionen
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((buyerGroup, idx) => {
                        const isEditing = editingId === buyerGroup.id;
                        const reservesText = Array.isArray(buyerGroup.ticketReserves) && buyerGroup.ticketReserves.length > 0
                            ? buyerGroup.ticketReserves.map((reserve: { id: number; amount: number; price: number; type: Array<{ name: string }> }) => {
                                const typeNames = Array.isArray(reserve.type) 
                                    ? reserve.type.map((t: { name: string }) => t.name).filter(Boolean).join(", ") || "Unbekannter Typ"
                                    : "Unbekannter Typ";
                                return `${typeNames} (${reserve.amount} Stk., €${reserve.price})`;
                              }).join(", ")
                            : "-";

                        return (
                            <tr key={idx} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                                {/* Name */}
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    <div className="truncate" title={buyerGroup.name}>
                                        {buyerGroup.name}
                                    </div>
                                </td>

                                {/* Max Tickets */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            value={editData?.maxTickets || 0}
                                            onChange={(e) => handleFieldChange('maxTickets', parseInt(e.target.value) || 0)}
                                            className="w-20 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    ) : (
                                        buyerGroup.maxTickets
                                    )}
                                </td>

                                {/* Linked Reserves */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <div className="truncate" title={reservesText}>
                                        {reservesText}
                                    </div>
                                </td>

                                {/* Geändert am */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <div className="truncate" title={buyerGroup.updatedAt ? new Date(buyerGroup.updatedAt).toLocaleString() : "-"}>
                                        {buyerGroup.updatedAt ? new Date(buyerGroup.updatedAt).toLocaleDateString() : "-"}
                                    </div>
                                </td>

                                {/* Geändert von */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {buyerGroup.updatedBy ?? "-"}
                                </td>

                                {/* Aktionen */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {isEditing ? (
                                        <div className="flex space-x-1 justify-center">
                                            <button
                                                onClick={handleCancel}
                                                disabled={updateMutation.isPending}
                                                className="p-1.5 text-white bg-gray-600 hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Abbrechen"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={updateMutation.isPending}
                                                className="p-1.5 text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Speichern"
                                            >
                                                {updateMutation.isPending ? (
                                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex space-x-1 justify-center">
                                            <button
                                                onClick={() => handleEdit(buyerGroup)}
                                                className="p-1.5 bg-violet-50 text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100 rounded-md"
                                                title="Bearbeiten"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <div className="w-[35px]"></div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            </div>
        </div>
    );
}

