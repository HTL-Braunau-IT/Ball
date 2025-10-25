import TicketReserves from "~/components/reserves";

export default function TicketReservesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Kontingente</h1>
        <p className="mt-1 text-sm text-gray-600">
          Übersicht über alle Ticket Kontingente
        </p>
      </div>
        <TicketReserves />
    </div>
  );
}
