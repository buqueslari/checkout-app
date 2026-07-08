// Utilidades de UI para o cartão do checkout.
//
// Importante: isso é só cosmético (formatação/bandeira pra desenhar o
// cartão virtual) e geração de dados fictícios pra teste local. Nada aqui
// valida se um cartão é "de verdade" nem faz qualquer chamada externa — ver
// checkout-app/DEPLOY.md pra como conectar um gateway real no futuro.

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

export function maskedName(name: string): string {
  return name.trim() || "NOME DO TITULAR";
}

function randomDigits(count: number) {
  let out = "";
  for (let i = 0; i < count; i++) out += Math.floor(Math.random() * 10);
  return out;
}

const TEST_PREFIXES = ["4", "51", "55"]; // visa, mastercard, mastercard

export function generateTestCard() {
  const prefix = TEST_PREFIXES[Math.floor(Math.random() * TEST_PREFIXES.length)];
  const number = (prefix + randomDigits(16 - prefix.length)).slice(0, 16);

  const now = new Date();
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const year = String((now.getFullYear() + 1 + Math.floor(Math.random() * 4)) % 100).padStart(2, "0");

  const firstNames = ["Joao", "Maria", "Pedro", "Ana", "Lucas", "Carla"];
  const lastNames = ["Silva", "Souza", "Oliveira", "Santos", "Pereira"];
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`;

  return {
    number: formatCardNumber(number),
    name,
    expiry: `${month}/${year}`,
    cvv: randomDigits(3),
  };
}
