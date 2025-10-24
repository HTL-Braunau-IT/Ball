"use client";

import { api } from "~/trpc/react";
import { useState } from "react";

export default function Tickets() {
    const { data, isLoading, isError, error, refetch } = api.ticket.all.useQuery();
    const [processingTicket, setProcessingTicket] = useState<number | null>(null);
    
    const markAsSentMutation = api.ticket.markAsSent.useMutation({
        onSuccess: () => {
            void refetch();
            setProcessingTicket(null);
        },
        onError: (error) => {
            console.error("Error marking ticket as sent:", error);
            setProcessingTicket(null);
        },
    });

    const handleMarkAsSent = (ticketId: number) => {
        setProcessingTicket(ticketId);
        markAsSentMutation.mutate({ ticketId });
    };

    if (isLoading) {
        return (
            <div>Lade Karten...</div>
        );
    }

    if (isError) {
        return (
            <div>Fehler beim Laden: {error.message}</div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div>Keine Karten gefunden.</div>
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
                            Lieferung
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bezahlt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gesendet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Zeitstempel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aktionen
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {ticket.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.delivery}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.paid ? "Ja" : "Nein"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.sent ? "Ja" : "Nein"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.timestamp ? new Date(ticket.timestamp).toLocaleString() : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ticket.paid && 
                                 !ticket.sent && 
                                 (ticket.delivery.toLowerCase().includes('versand') || 
                                  ticket.delivery.toLowerCase().includes('shipping')) && (
                                    <button
                                        onClick={() => handleMarkAsSent(ticket.id)}
                                        disabled={processingTicket === ticket.id}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processingTicket === ticket.id ? "Wird verarbeitet..." : "Als versendet markieren"}
                                    </button>
                                )}
                                {ticket.sent && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Versendet
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
