import { api } from "~/trpc/server";
import Tickets from "~/components/tickets";

export default async function TicketsPage() {
  // Prefetch all tickets on the server side for faster initial load
  const initialData = await api.ticket.all();
  
  return (
    <div className="space-y-6">
      <Tickets initialData={initialData} />
    </div>
  );
}
