import TicketReserves from "~/components/reserves";
import BuyerGroups from "~/components/buyerGroups";

export default function TicketReservesPage() {
  return (
      <div className="space-y-6">
        <TicketReserves />
        <BuyerGroups />
      </div>
  );
}
