import { z } from "zod";

export const reservesInput = z.object({
  amount: z.number({
    message: "Anzahl ist erforderlich",
  }).min(1, "Anzahl muss mindestens 1 sein"),
  price: z.number({
    message: "Preis ist erforderlich", 
  }).min(0, "Preis darf nicht minus sein"),
  deliveryMethodIds: z.array(z.number()).min(1, "Mindestens eine Versandmethode muss gewählt werden"),
  typeId: z.number({
    message: "Kartentyp ist erforderlich",
  })
});