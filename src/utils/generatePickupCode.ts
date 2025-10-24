/**
 * Generates a unique pickup code for self-pickup orders
 * Format: HTL-XXXX-XXXX (e.g., HTL-A1B2-C3D4)
 */
export function generatePickupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'HTL-';
  
  // Generate first 4 characters
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  result += '-';
  
  // Generate last 4 characters
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}
