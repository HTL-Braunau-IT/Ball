"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { shippingAddressSchema, selfPickupSchema } from "~/utils/validateAddress";
import type { ShippingAddress, SelfPickupInfo } from "~/utils/validateAddress";

type DeliveryMethod = "shipping" | "self-pickup";

interface PurchaseFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function PurchaseFlow({ onComplete, onCancel }: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [contactInfo, setContactInfo] = useState<ShippingAddress | SelfPickupInfo | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API calls
  const { data: availableTickets, isLoading: ticketsLoading } = api.ticket.getAvailableTickets.useQuery();
  const { data: deliveryMethods, isLoading: deliveryLoading } = api.ticket.getDeliveryMethods.useQuery();
  const createPurchase = api.ticket.createPurchase.useMutation();

  const totalSteps = 4;

  const handleTicketSelect = (ticketTypeId: number) => {
    setSelectedTicketType(ticketTypeId);
    setCurrentStep(2);
  };

  const handleDeliveryMethodSelect = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    setCurrentStep(3);
  };

  const handleContactInfoSubmit = (data: ShippingAddress | SelfPickupInfo) => {
    setContactInfo(data);
    setCurrentStep(4);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxAllowed = selectedTicket ? Math.min(selectedTicket.maxTickets, selectedTicket.amount) : 10;
    setQuantity(Math.min(Math.max(1, newQuantity), maxAllowed));
  };

  const handlePurchase = async () => {
    if (!deliveryMethod || !contactInfo || !selectedTicketType) {
      return;
    }

    try {
      const result = await createPurchase.mutateAsync({
        deliveryMethod,
        contactInfo,
        ticketTypeId: selectedTicketType,
        quantity,
      });

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setErrors({ general: "Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es erneut." });
    }
  };

  const selectedTicket = availableTickets?.find(t => t.id === selectedTicketType);
  const selectedDeliveryMethod = deliveryMethods?.find(dm => 
    dm.name.toLowerCase().includes(deliveryMethod === "shipping" ? "versand" : "abholung")
  );

  const maxQuantity = selectedTicket ? Math.min(selectedTicket.maxTickets, selectedTicket.amount) : 10;
  const totalPrice = selectedTicket ? 
    (selectedTicket.price * quantity) + (deliveryMethod === "shipping" ? (selectedDeliveryMethod?.surcharge ?? 0) : 0) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i + 1}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i + 1 <= currentStep
                  ? "bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold-dark)] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold-dark)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Ticket Selection */}
      {currentStep === 1 && (
        <TicketSelection
          availableTickets={availableTickets}
          isLoading={ticketsLoading}
          selectedTicketType={selectedTicketType}
          quantity={quantity}
          maxQuantity={maxQuantity}
          onTicketSelect={handleTicketSelect}
          onQuantityChange={handleQuantityChange}
          onBack={() => setCurrentStep(0)}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {/* No Tickets Available Message */}
      {currentStep === 1 && !ticketsLoading && availableTickets?.length === 0 && (
        <div className="card text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--color-error)" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Keine Tickets verfügbar
            </h2>
            <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
              Alle Tickets sind bereits ausverkauft.
            </p>
          </div>
          <button
            onClick={() => setCurrentStep(0)}
            className="btn btn-primary"
          >
            Zurück zur Übersicht
          </button>
        </div>
      )}

      {/* Step 2: Delivery Method Selection */}
      {currentStep === 2 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 gradient-text text-center">
            Versandart wählen
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={() => handleDeliveryMethodSelect("shipping")}
              className="w-full p-6 border-2 rounded-lg text-left hover:border-[var(--color-bronze)] transition-colors"
              style={{ borderColor: "var(--color-accent-warm)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Versand
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Tickets werden an Ihre Adresse versendet
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-gold-light)" }}>
                    +{selectedDeliveryMethod?.surcharge ?? 0}€
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleDeliveryMethodSelect("self-pickup")}
              className="w-full p-6 border-2 rounded-lg text-left hover:border-[var(--color-bronze)] transition-colors"
              style={{ borderColor: "var(--color-accent-warm)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Selbstabholung
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Tickets werden vor Ort abgeholt
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>
                    Kostenlos
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {currentStep === 3 && deliveryMethod && (
        <ContactForm
          deliveryMethod={deliveryMethod}
          onSubmit={handleContactInfoSubmit}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* Step 4: Payment Summary */}
      {currentStep === 4 && selectedTicket && (
        <PaymentSummary
          selectedTicket={selectedTicket}
          quantity={quantity}
          deliveryMethod={deliveryMethod!}
          shippingFee={selectedDeliveryMethod?.surcharge ?? 0}
          totalPrice={totalPrice}
          onPurchase={handlePurchase}
          onBack={() => setCurrentStep(3)}
          isLoading={createPurchase.isPending}
        />
      )}

      {/* Error Display */}
      {errors.general && (
        <div className="mt-4 p-4 rounded-lg" style={{ background: "var(--color-error)", color: "white" }}>
          {errors.general}
        </div>
      )}
    </div>
  );
}

// Contact Form Component
function ContactForm({
  deliveryMethod,
  onSubmit,
  onBack,
}: {
  deliveryMethod: DeliveryMethod;
  onSubmit: (data: ShippingAddress | SelfPickupInfo) => void;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ShippingAddress & SelfPickupInfo>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const schema = deliveryMethod === "shipping" ? shippingAddressSchema : selfPickupSchema;
      const validatedData = schema.parse(formData);
      onSubmit(validatedData);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6 gradient-text text-center">
        Kontaktdaten
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
            Name *
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-accent-warm)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
            }}
            placeholder="Ihr vollständiger Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
            Telefonnummer *
          </label>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-accent-warm)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
            }}
            placeholder="+43 123 456 789"
          />
        </div>

        {deliveryMethod === "shipping" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Adresse *
              </label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-accent-warm)",
                  background: "var(--color-bg-card)",
                  color: "var(--color-text-primary)",
                }}
                placeholder="Straße und Hausnummer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                  Postleitzahl *
                </label>
                <input
                  type="number"
                  value={formData.postal || ""}
                  onChange={(e) => handleInputChange("postal", parseInt(e.target.value))}
                  required
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--color-accent-warm)",
                    background: "var(--color-bg-card)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                  Stadt *
                </label>
                <input
                  type="text"
                  value={formData.province || ""}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--color-accent-warm)",
                    background: "var(--color-bg-card)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="Braunau"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Land *
              </label>
              <select
                value={formData.country || ""}
                onChange={(e) => handleInputChange("country", e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-accent-warm)",
                  background: "var(--color-bg-card)",
                  color: "var(--color-text-primary)",
                }}
              >
                <option value="">Land wählen</option>
                <option value="AT">Österreich</option>
                <option value="DE">Deutschland</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary flex-1"
          >
            Zurück
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
          >
            Weiter
          </button>
        </div>
      </form>
    </div>
  );
}

// Ticket Selection Component
function TicketSelection({
  availableTickets,
  isLoading,
  selectedTicketType,
  quantity,
  maxQuantity,
  onTicketSelect,
  onQuantityChange,
  onBack,
  onNext,
}: {
  availableTickets?: any[];
  isLoading: boolean;
  selectedTicketType: number | null;
  quantity: number;
  maxQuantity: number;
  onTicketSelect: (id: number) => void;
  onQuantityChange: (quantity: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  if (isLoading) {
    return (
      <div className="card text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4" style={{ borderColor: "var(--color-accent-warm)", borderTopColor: "var(--color-gold-light)" }} />
        <p style={{ color: "var(--color-text-secondary)" }}>Tickets werden geladen...</p>
      </div>
    );
  }

  if (!availableTickets || availableTickets.length === 0) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--color-error)" }}>
          Keine Tickets verfügbar
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Derzeit sind keine Tickets zum Verkauf verfügbar.
        </p>
        <button onClick={onBack} className="btn btn-secondary mt-4">
          Zurück
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6 gradient-text text-center">
        Ticket auswählen
      </h2>

      <div className="space-y-4 mb-6">
        {availableTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedTicketType === ticket.id
                ? "border-[var(--color-gold-light)] bg-[var(--color-bg-accent)]"
                : "border-[var(--color-accent-warm)] hover:border-[var(--color-bronze)]"
            } ${ticket.amount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => ticket.amount > 0 && onTicketSelect(ticket.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {ticket.type}
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {ticket.amount > 0 ? `${ticket.amount} verfügbar` : "Ausverkauft"}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Max. {ticket.maxTickets} pro Person
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: "var(--color-gold-light)" }}>
                  {ticket.price}€
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTicketType && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
            Anzahl
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: "var(--color-accent-warm)" }}
            >
              -
            </button>
            <span className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--color-accent-warm)" }}
            >
              +
            </button>
          </div>
          {quantity >= maxQuantity && (
            <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
              Maximum erreicht ({maxQuantity} Tickets)
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={onBack} className="btn btn-secondary flex-1">
          Zurück
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTicketType}
          className="btn btn-primary flex-1"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}

// Payment Summary Component
function PaymentSummary({
  selectedTicket,
  quantity,
  deliveryMethod,
  shippingFee,
  totalPrice,
  onPurchase,
  onBack,
  isLoading,
}: {
  selectedTicket: any;
  quantity: number;
  deliveryMethod: DeliveryMethod;
  shippingFee: number;
  totalPrice: number;
  onPurchase: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6 gradient-text text-center">
        Bestellübersicht
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span style={{ color: "var(--color-text-primary)" }}>Ticket: {selectedTicket.type}</span>
          <span style={{ color: "var(--color-text-primary)" }}>{selectedTicket.price}€ × {quantity}</span>
        </div>
        
        {deliveryMethod === "shipping" && shippingFee > 0 && (
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-primary)" }}>Versandkosten</span>
            <span style={{ color: "var(--color-text-primary)" }}>{shippingFee}€</span>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span style={{ color: "var(--color-text-primary)" }}>Gesamt</span>
            <span style={{ color: "var(--color-gold-light)" }}>{totalPrice}€</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="btn btn-secondary flex-1">
          Zurück
        </button>
        <button
          onClick={onPurchase}
          disabled={isLoading}
          className="btn btn-primary flex-1"
        >
          {isLoading ? "Wird verarbeitet..." : "Zur Zahlung"}
        </button>
      </div>
    </div>
  );
}
