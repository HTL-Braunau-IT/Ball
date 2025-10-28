import DeliveryMethods from "~/components/deliveryMethods";

export default function DeliveryMethodsPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Liefermethoden</h1>
        <p className="mt-1 text-sm text-gray-600">
          Übersicht über alle Liefermethoden und deren Zuschläge
        </p>
      </div>
      
      <div className="space-y-6">
        <DeliveryMethods />
      </div>
    </div>
  );
}

