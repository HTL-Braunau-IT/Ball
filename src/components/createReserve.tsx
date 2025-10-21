"use client";

import { useState } from "react";
import { api } from "~/utils/api";

export default function CreateReserve() {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [typeId, setTypeId] = useState("");
  const [deliveryMethodIds, setDeliveryMethodIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available types and delivery methods
  const { data: types } = api.reserves.getTypes.useQuery();
  const { data: deliveryMethods } = api.reserves.getDeliveryMethods.useQuery();

  const createReserve = api.reserves.create.useMutation({
    onSuccess: () => {
      // Reset form
      setAmount("");
      setPrice("");
      setTypeId("");
      setDeliveryMethodIds([]);
      // Optionally refetch the reserves list
    },
    onError: (error) => {
      console.error("Error creating reserve:", error);
    }
  });

  const handleDeliveryMethodChange = (methodId: number, checked: boolean) => {
    if (checked) {
      setDeliveryMethodIds(prev => [...prev, methodId]);
    } else {
      setDeliveryMethodIds(prev => prev.filter(id => id !== methodId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createReserve.mutateAsync({
        amount: parseInt(amount),
        price: parseInt(price),
        typeId: parseInt(typeId),
        deliveryMethodIds: deliveryMethodIds
      });
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Neues Kontingent erstellen</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Anzahl</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preis</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kartentyp</label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Typ auswählen</option>
            {types?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Liefermethoden</label>
          <div className="space-y-2">
            {deliveryMethods?.map((method) => (
              <label key={method.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={deliveryMethodIds.includes(method.id)}
                  onChange={(e) => handleDeliveryMethodChange(method.id, e.target.checked)}
                  className="mr-2"
                />
                <span>{method.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || deliveryMethodIds.length === 0}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "Erstelle..." : "Kontingent erstellen"}
        </button>
      </form>
    </div>
  );
}