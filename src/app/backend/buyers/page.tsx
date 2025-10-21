import Buyers from "~/components/buyers";

export default function BuyersPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Käufer</h1>
        <p className="mt-1 text-sm text-gray-600">
          Übersicht über alle registrierten Käufer
        </p>
      </div>
      
      <div className="space-y-6">
        <Buyers />
      </div>
    </div>
  );
}
