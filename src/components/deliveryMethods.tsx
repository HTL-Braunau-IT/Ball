"use client";

import { useState, useCallback } from "react";
import { api } from "~/utils/api";

interface EditableDeliveryMethod {
  id: number;
  surcharge: number | null;
}

export default function DeliveryMethods() {
    const { data, isLoading, isError, error, refetch } = api.deliveryMethods.all.useQuery();
    const updateMutation = api.deliveryMethods.update.useMutation({
        onSuccess: () => {
            setEditingId(null);
            setEditData(null);
            void refetch();
        },
        onError: (error) => {
            console.error("Update failed:", error);
            setEditData(null);
        }
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<EditableDeliveryMethod | null>(null);

    const handleEdit = useCallback((method: any) => {
        setEditData({
            id: method.id,
            surcharge: method.surcharge
        });
        setEditingId(method.id);
    }, []);

    const handleSave = useCallback(() => {
        if (!editData) return;
        
        updateMutation.mutate({
            id: editData.id,
            surcharge: editData.surcharge || 0,
        });
    }, [editData, updateMutation]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setEditData(null);
    }, []);

    const handleFieldChange = useCallback((field: keyof EditableDeliveryMethod, value: any) => {
        if (!editData) return;
        
        setEditData(prev => prev ? { ...prev, [field]: value } : null);
    }, [editData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Lade Liefermethoden...</div>
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
                <div className="text-gray-600">Keine Liefermethoden gefunden.</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                            Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                            Zuschlag
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                            Aktionen
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((method) => {
                        const isEditing = editingId === method.id;

                        return (
                            <tr key={method.id} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                                {/* Name */}
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    <div className="truncate" title={method.name}>
                                        {method.name}
                                    </div>
                                </td>

                                {/* Surcharge */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {isEditing ? (
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-1 text-xs">€</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={editData?.surcharge !== null ? (editData.surcharge / 100).toFixed(2) : ''}
                                                onChange={(e) => handleFieldChange('surcharge', Math.round(parseFloat(e.target.value) * 100) || 0)}
                                                className="w-24 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    ) : (
                                        method.surcharge !== null ? `€${(method.surcharge / 100).toFixed(2)}` : '-'
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {isEditing ? (
                                        <div className="flex space-x-1">
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
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(method)}
                                            className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                            title="Bearbeiten"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
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

