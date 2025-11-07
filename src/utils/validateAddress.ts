import { z } from "zod";

/**
 * Validation schema for Austrian postal codes (1000-9999)
 */
const austrianPostalCodeSchema = z
  .number()
  .int()
  .min(1000, "Österreichische Postleitzahl muss zwischen 1000 und 9999 liegen")
  .max(9999, "Österreichische Postleitzahl muss zwischen 1000 und 9999 liegen");

/**
 * Validation schema for German postal codes (01000-99999)
 */
const germanPostalCodeSchema = z
  .number()
  .int()
  .min(1000, "Deutsche Postleitzahl muss zwischen 01000 und 99999 liegen")
  .max(99999, "Deutsche Postleitzahl muss zwischen 01000 und 99999 liegen");

/**
 * Validation schema for shipping address
 */
export const shippingAddressSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  phone: z.string().min(8, "Telefonnummer muss mindestens 8 Zeichen lang sein"),
  address: z.string().min(5, "Adresse muss mindestens 5 Zeichen lang sein"),
  postal: z.union([austrianPostalCodeSchema, germanPostalCodeSchema]),
  city: z.string().min(2, "Stadt muss mindestens 2 Zeichen lang sein"),
  country: z.enum(["AT", "DE"], "Nur Österreich (AT) und Deutschland (DE) werden unterstützt"),
});

/**
 * Validation schema for self-pickup contact info
 */
export const selfPickupSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  phone: z.string().min(8, "Telefonnummer muss mindestens 8 Zeichen lang sein"),
});

/**
 * Type definitions for the schemas
 */
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type SelfPickupInfo = z.infer<typeof selfPickupSchema>;

/**
 * Validates if a postal code is Austrian
 */
export function isAustrianPostalCode(postal: number): boolean {
  return postal >= 1000 && postal <= 9999;
}

/**
 * Validates if a postal code is German
 */
export function isGermanPostalCode(postal: number): boolean {
  return postal >= 1000 && postal <= 99999;
}
