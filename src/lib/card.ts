

export type CardBrand = "visa" | "mastercard" | "amex" | "elo" | "unknown";

export function detectBrand(digitsOnly: string): CardBrand {
  if (/^4/.test(digitsOnly)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digitsOnly)) return "mastercard";
  if (/^3[47]/.test(digitsOnly)) return "amex";
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(digitsOnly)) return "elo";
  return "unknown";
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
