"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "~/trpc/react";
import TicketProgressBar from "./TicketProgressBar";

interface EditableReserve {
  id: number;
  amount: number;
  price: number;
  deliveryMethodIds: number[];
}

export default function TicketReserves() {
    const { data, isLoading, isError, error, refetch } = api.reserves.all.useQuery();
    const { data: deliveryMethods } = api.reserves.getDeliveryMethods.useQuery();
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<EditableReserve | null>(null);
    const [originalTypeId, setOriginalTypeId] = useState<number | null>(null);
    const originalDataRef = useRef<EditableReserve | null>(null);

    const updateMutation = api.reserves.update.useMutation({
        onSuccess: () => {
            setEditingId(null);
            setEditData(null);
            originalDataRef.current = null;
            void refetch();
        },
        onError: (error) => {
            console.error("Update failed:", error);
            // Restore original data on error
            if (originalDataRef.current) {
                setEditData(originalDataRef.current);
            }
            // Display error message to user
            const message = error.message || "Fehler beim Speichern";
            window.alert(message);
        }
    });

    const handleEdit = useCallback((reserve: any) => {
        const deliveryMethodIds = Array.isArray(reserve.deliveryMethods) 
            ? reserve.deliveryMethods.map((dm: any) => dm.id as number)
            : [];
        const typeId = Array.isArray(reserve.type) ? reserve.type[0]?.id : reserve.type?.id;

        const initialData = {
            id: reserve.id,
            amount: reserve.amount,
            price: reserve.price,
            deliveryMethodIds
        };

        setEditData(initialData);
        originalDataRef.current = initialData; // Store original for error recovery
        setOriginalTypeId(typeId || 1);
        setEditingId(reserve.id);
    }, []);

    const handleSave = useCallback(() => {
        if (!editData || !data) return;
        
        // Find the current reserve to get sold tickets count
        const currentReserve = data.find(r => r.id === editData.id);
        if (!currentReserve) return;

        const soldCount = currentReserve.soldTickets?.length || 0;

        // Client-side validation
        if (editData.amount < soldCount) {
            window.alert(
                `Die Anzahl kann nicht kleiner sein als die bereits verkauften Tickets (${soldCount}).`
            );
            return;
        }

        if (editData.deliveryMethodIds.length === 0) {
            window.alert("Mindestens eine Versandmethode muss gewählt werden.");
            return;
        }
        
        updateMutation.mutate({
            id: editData.id,
            amount: editData.amount,
            price: editData.price,
            typeId: originalTypeId || 1, // Keep existing type, don't allow editing
            deliveryMethodIds: editData.deliveryMethodIds
        });
    }, [editData, originalTypeId, updateMutation, data]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setEditData(null);
        originalDataRef.current = null;
        setOriginalTypeId(null);
    }, []);

    const handleFieldChange = useCallback((field: keyof EditableReserve, value: any) => {
        if (!editData) return;
        
        setEditData(prev => prev ? { ...prev, [field]: value } : null);
    }, [editData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Lade Kontingente...</div>
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
                <div className="text-gray-600">Keine Kontingente gefunden.</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
                <table className="">
                <thead className="">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-32">
                            Typ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-20">
                            Menge
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">
                            Preis
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-32">
                            Liefermethoden
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
                    {data.map((reserve, idx) => {
                        const typeValue = reserve.type;
                        const typeLabel = Array.isArray(typeValue)
                            ? typeValue.map((t: { name?: string }) => t?.name ?? "").filter(Boolean).join(", ") || "Unbekannter Typ"
                            : (typeValue as { name?: string })?.name ?? "Unbekannter Typ";

                        const deliveryMethodsText = Array.isArray(reserve.deliveryMethods)
                            ? reserve.deliveryMethods.map((dm: { name?: string }) => dm?.name ?? "").filter(Boolean).join(", ") || "-"
                            : "-";

                        const soldCount = reserve.soldTickets?.length || 0;
                        const remainingCount = reserve.amount - soldCount;
                        const isEditing = editingId === reserve.id;

                        return (
                            <tr key={idx} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                                {/* Typ */}
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    <div className="truncate" title={typeLabel}>
                                        {typeLabel}
                                    </div>
                                </td>

                                {/* Menge */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min={soldCount}
                                            value={editData?.amount || 0}
                                            onChange={(e) => handleFieldChange('amount', parseInt(e.target.value) || 0)}
                                            className="w-18 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    ) : (
                                        reserve.amount
                                    )}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <TicketProgressBar 
                                        total={reserve.amount}
                                        sold={soldCount}
                                        remaining={remainingCount}
                                    />
                                </td>

                                {/* Preis */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {isEditing ? (
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-1 text-xs">€</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={editData?.price || 0}
                                                onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                                                className="w-20 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-1 text-xs opacity-0">€</span>
                                            €{reserve.price}
                                        </div>
                                    )}
                                </td>

                                {/* Liefermethoden */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {isEditing ? (
                                        <div className="space-y-1 max-h-20 overflow-y-auto">
                                            {deliveryMethods?.map((method: any) => (
                                                <label key={method.id} className="flex items-center text-xs">
                                                    <input
                                                        type="checkbox"
                                                        checked={editData?.deliveryMethodIds.includes(method.id) || false}
                                                        onChange={(e) => {
                                                            const currentIds = editData?.deliveryMethodIds || [];
                                                            const newIds = e.target.checked
                                                                ? [...currentIds, method.id]
                                                                : currentIds.filter(id => id !== method.id);
                                                            handleFieldChange('deliveryMethodIds', newIds);
                                                        }}
                                                        className="mr-1"
                                                    />
                                                    <span className="truncate">{method.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="truncate" title={deliveryMethodsText}>
                                            {deliveryMethodsText}
                                        </div>
                                    )}
                                </td>

                                {/* Geändert am */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <div className="truncate" title={reserve.updatedAt ? new Date(reserve.updatedAt).toLocaleString() : "-"}>
                                        {reserve.updatedAt ? new Date(reserve.updatedAt).toLocaleDateString() : "-"}
                                    </div>
                                </td>

                                {/* Geändert von */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reserve.updatedBy ?? "-"}
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
                                                onClick={() => handleEdit(reserve)}
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
    );
}