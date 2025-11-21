"use client";

import { api } from "~/trpc/react";

export default function SalesKillSwitch() {
  const { data: salesEnabled, isLoading } = api.systemSettings.getSalesEnabled.useQuery();
  const utils = api.useUtils();
  const setSalesEnabled = api.systemSettings.setSalesEnabled.useMutation({
    onSuccess: () => {
      // Invalidate and refetch to update UI
      void utils.systemSettings.getSalesEnabled.invalidate();
    },
  });

  const handleToggle = () => {
    if (salesEnabled !== undefined) {
      setSalesEnabled.mutate({ enabled: !salesEnabled });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/40 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ticketverkauf Status
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            Aktueller Status:{" "}
            <span
              className={`font-semibold ${
                salesEnabled ? "text-green-600" : "text-red-600"
              }`}
            >
              {salesEnabled ? "Aktiviert" : "Deaktiviert"}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            {salesEnabled
              ? "Tickets können derzeit gekauft werden."
              : "Der Ticketverkauf ist derzeit deaktiviert. Keine neuen Käufe möglich."}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={setSalesEnabled.isPending}
          className={`ml-4 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
            salesEnabled
              ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              : "bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {setSalesEnabled.isPending
            ? "Wird aktualisiert..."
            : salesEnabled
            ? "Verkauf deaktivieren"
            : "Verkauf aktivieren"}
        </button>
      </div>
    </div>
  );
}

