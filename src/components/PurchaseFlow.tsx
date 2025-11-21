"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { shippingAddressSchema, selfPickupSchema } from "~/utils/validateAddress";
import type { ShippingAddress, SelfPickupInfo } from "~/utils/validateAddress";
import { env } from "~/env";

type DeliveryMethod = "shipping" | "self-pickup";

interface PurchaseFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function PurchaseFlow({ onComplete: _onComplete, onCancel }: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [contactInfo, setContactInfo] = useState<ShippingAddress | SelfPickupInfo | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API calls - now returns single ticket object instead of array
  const { data: availableTicket, isLoading: ticketsLoading } = api.ticket.getAvailableTickets.useQuery();
  const createPurchase = api.ticket.createPurchase.useMutation();

  const totalSteps = 4;

  // Auto-select ticket type when availableTicket loads
  const selectedTicketType = availableTicket?.id ?? null;

  const handleQuantitySelect = (selectedQuantity: number) => {
    setQuantity(selectedQuantity);
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

  const handlePurchase = async () => {
    if (!deliveryMethod || !contactInfo || !selectedTicketType || !quantity) {
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

  // Find shipping delivery method from available ticket's delivery methods
  const shippingDeliveryMethod = availableTicket?.deliveryMethods?.find(dm => 
    dm.name.toLowerCase().includes("versand")
  );

  const maxQuantity = availableTicket?.maxTickets ?? 2;
  const availableAmount = availableTicket?.amount ?? 0;
  const totalPrice = availableTicket && quantity ? 
    (availableTicket.price * quantity) + (deliveryMethod === "shipping" ? ((shippingDeliveryMethod?.surcharge ?? 0) / 100) : 0) : 0;

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

      {/* Step 1: Quantity Selection */}
      {currentStep === 1 && (
        <QuantitySelection
          availableTicket={availableTicket}
          isLoading={ticketsLoading}
          selectedQuantity={quantity}
          maxQuantity={maxQuantity}
          availableAmount={availableAmount}
          onQuantitySelect={handleQuantitySelect}
          onBack={onCancel}
        />
      )}

      {/* Step 2: Delivery Method Selection */}
      {currentStep === 2 && (
        <div className="card">
          <h2 className="text-2xl font-semibold gradient-text text-center" style={{ marginBottom: '2rem' }}>
            Versandart wählen
          </h2>
          
          {!availableTicket?.deliveryMethods || availableTicket.deliveryMethods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">
                Keine Liefermethoden verfügbar.
              </p>
              <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                Zurück
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* Only show shipping button if shipping method is available */}
                {shippingDeliveryMethod && (
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
                          +{((shippingDeliveryMethod.surcharge ?? 0) / 100).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Only show self-pickup button if pickup method is available */}
                {availableTicket.deliveryMethods.some(dm => 
                  dm.name.toLowerCase().includes("abholung") || dm.name.toLowerCase().includes("pickup")
                ) && (
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
                        {env.NEXT_PUBLIC_PICKUP_DATE_1 && env.NEXT_PUBLIC_PICKUP_DATE_2 && (
                          <div className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-secondary)" }}>
                              Mögliche Abholzeiten:
                            </p>
                            {(() => {
                              const formatPickupDate = (dateStr: string, startTime?: string, endTime?: string) => {
                                try {
                                  const date = new Date(dateStr);
                                  const formattedDate = date.toLocaleDateString('de-DE', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  });
                                  if (startTime && endTime) {
                                    return `${formattedDate}, ${startTime} - ${endTime} Uhr`;
                                  } else if (startTime) {
                                    return `${formattedDate}, ab ${startTime} Uhr`;
                                  }
                                  return formattedDate;
                                } catch {
                                  return dateStr;
                                }
                              };
                              
                              const date1 = formatPickupDate(
                                env.NEXT_PUBLIC_PICKUP_DATE_1,
                                env.NEXT_PUBLIC_PICKUP_DATE_1_START_TIME,
                                env.NEXT_PUBLIC_PICKUP_DATE_1_END_TIME
                              );
                              const date2 = formatPickupDate(
                                env.NEXT_PUBLIC_PICKUP_DATE_2,
                                env.NEXT_PUBLIC_PICKUP_DATE_2_START_TIME,
                                env.NEXT_PUBLIC_PICKUP_DATE_2_END_TIME
                              );
                              
                              return (
                                <div className="space-y-0.5">
                                  <p>{date1}</p>
                                  <p>{date2}</p>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>
                          Kostenlos
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setCurrentStep(1)} className="btn btn-secondary flex-1">
                  Zurück
                </button>
              </div>
            </>
          )}
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
      {currentStep === 4 && availableTicket && quantity && (
        <PaymentSummary
          selectedTicket={availableTicket}
          quantity={quantity}
          deliveryMethod={deliveryMethod!}
          shippingFee={(shippingDeliveryMethod?.surcharge ?? 0) / 100}
          totalPrice={totalPrice}
          contactInfo={contactInfo}
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
      <h2 className="text-2xl font-semibold gradient-text text-center" style={{ marginBottom: '2rem' }}>
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
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
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

// Quantity Selection Component
function QuantitySelection({
  availableTicket,
  isLoading,
  selectedQuantity,
  maxQuantity,
  availableAmount,
  onQuantitySelect,
  onBack,
}: {
  availableTicket?: { id: number; price: number; type: string; amount: number; maxTickets: number } | null;
  isLoading: boolean;
  selectedQuantity: number | null;
  maxQuantity: number;
  availableAmount: number;
  onQuantitySelect: (quantity: number) => void;
  onBack: () => void;
}) {
  if (isLoading) {
    return (
      <div className="card text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4" style={{ borderColor: "var(--color-accent-warm)", borderTopColor: "var(--color-gold-light)" }} />
        <p style={{ color: "var(--color-text-secondary)" }}>Tickets werden geladen...</p>
      </div>
    );
  }

  if (!availableTicket) {
    return (
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
            Derzeit sind keine Tickets zum Verkauf verfügbar.
          </p>
        </div>
        <button onClick={onBack} className="btn btn-secondary mt-4">
          Zurück
        </button>
      </div>
    );
  }

  // Generate quantity options based on maxTickets
  const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => i + 1);
  const ticketPrice = availableTicket.price;

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold gradient-text text-center" style={{ marginBottom: '2rem' }}>
        Anzahl der Tickets wählen
      </h2>
    

      {/* Quantity selection cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
        {quantityOptions.map((qty) => {
          const totalPrice = ticketPrice * qty;
          const isDisabled = qty > availableAmount;
          const isSelected = selectedQuantity === qty;
          
          return (
            <button
              key={qty}
              onClick={() => !isDisabled && onQuantitySelect(qty)}
              disabled={isDisabled}
              className={`p-6 border-2 rounded-lg transition-all ${
                isSelected
                  ? "border-[var(--color-gold-light)] bg-[var(--color-bg-accent)]"
                  : isDisabled
                  ? "opacity-50 cursor-not-allowed border-gray-300"
                  : "border-[var(--color-accent-warm)] hover:border-[var(--color-bronze)] hover:shadow-lg hover:scale-[1.02]"
              }`}
              style={{
                boxShadow: isSelected ? '0 4px 12px rgba(193, 122, 58, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div className="flex flex-col">
                {/* Icon, Label, and Price - horizontal layout */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Icon display similar to OrderCard */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl flex-shrink-0" style={{ 
                      background: isDisabled 
                        ? 'linear-gradient(135deg, #e5e7eb, #9ca3af)'
                        : 'linear-gradient(135deg, var(--color-gold-light), var(--color-bronze))',
                      boxShadow: isDisabled 
                        ? '0 2px 6px rgba(0, 0, 0, 0.1)'
                        : '0 4px 12px rgba(193, 122, 58, 0.25)'
                    }}>
                      <span className="text-2xl font-bold text-white">{qty}</span>
                    </div>
                    
                    {/* Label */}
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-semibold uppercase leading-tight" style={{ 
                        color: 'var(--color-text-secondary)', 
                        letterSpacing: '0.05em' 
                      }}>
                        {qty === 1 ? 'KARTE' : 'KARTEN'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="flex-shrink-0">
                    <p className="text-xl font-bold" style={{ color: "var(--color-gold-light)" }}>
                      €{totalPrice}
                    </p>
                  </div>
                </div>
                
                {/* Disabled message */}
                {isDisabled && (
                  <div className="mt-3 text-center">
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      Nicht verfügbar
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {availableAmount < maxQuantity && (
        <p className="text-sm text-center mb-4" style={{ color: "var(--color-text-muted)" }}>
          Nur {availableAmount} {availableAmount === 1 ? "Ticket" : "Tickets"} verfügbar
        </p>
      )}

      <div className="flex gap-4">
        <button onClick={onBack} className="btn btn-secondary flex-1">
          Zurück
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
  contactInfo,
  onPurchase,
  onBack,
  isLoading,
}: {
  selectedTicket: any;
  quantity: number;
  deliveryMethod: DeliveryMethod;
  shippingFee: number;
  totalPrice: number;
  contactInfo: ShippingAddress | SelfPickupInfo | null;
  onPurchase: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const shippingAddress = deliveryMethod === "shipping" && contactInfo && "address" in contactInfo 
    ? contactInfo 
    : null;

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold gradient-text text-center" style={{ marginBottom: '2rem' }}>
        Bestellübersicht
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span style={{ color: "var(--color-text-primary)" }}>Ticket × {quantity}</span>
          <span style={{ color: "var(--color-text-primary)" }}>{selectedTicket.price}€ × {quantity}</span>
        </div>
        
        {deliveryMethod === "shipping" && shippingFee > 0 && (
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-primary)" }}>Versandkosten</span>
            <span style={{ color: "var(--color-text-primary)" }}>{shippingFee.toFixed(2)}€</span>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span style={{ color: "var(--color-text-primary)" }}>Gesamt</span>
            <span style={{ color: "var(--color-gold-light)" }}>{totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {deliveryMethod === "shipping" && shippingAddress && (
        <div className="mb-6 p-4 rounded-lg border" style={{ 
          borderColor: "var(--color-accent-warm)",
          background: "var(--color-bg-accent)"
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
            Lieferadresse
          </h3>
          <div className="space-y-1" style={{ color: "var(--color-text-secondary)" }}>
            <p>{shippingAddress.name}</p>
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.postal} {shippingAddress.city}</p>
            <p>{shippingAddress.country === "AT" ? "Österreich" : "Deutschland"}</p>
            <p className="mt-2 pt-2 border-t" style={{ borderColor: "var(--color-accent-warm)" }}>
              Tel: {shippingAddress.phone}
            </p>
          </div>
        </div>
      )}

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
