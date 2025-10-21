import Tickets from "~/components/tickets";

export default function TicketsPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verkaufte Karten</h1>
        <p className="mt-1 text-sm text-gray-600">
          Übersicht über alle verkauften Karten
        </p>
      </div>
      
      <div className="space-y-6">
        <Tickets />
      </div>
    </div>
  );
}
