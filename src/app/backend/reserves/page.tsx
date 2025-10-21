import TicketReserves from "~/components/reserves";
import CreateReserve from "~/components/createReserve";

export default function TicketReservesPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Kontingente</h1>
        <p className="mt-1 text-sm text-gray-600">
          Verwalten Sie verfügbare Ticket-Kontingente und Preise
        </p>
      </div>
      
      <div className="space-y-6">
        <TicketReserves />
        <CreateReserve />
      </div>
    </div>
  );
}
