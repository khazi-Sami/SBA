export const QURBANI_SHARE_COST = 2800;

export const qurbaniShareOptions = [1, 2, 3, 4, 5, 6, 7] as const;

export const qurbaniPaymentOptions = [
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
] as const;

export const qurbaniMeatOptions = [
  { value: "RECEIVE_MEAT", label: "Receive meat" },
  { value: "DONATE", label: "Donate (Khairat)" },
] as const;

export type QurbaniPaymentValue = (typeof qurbaniPaymentOptions)[number]["value"];
export type QurbaniMeatValue = (typeof qurbaniMeatOptions)[number]["value"];

export function calculateQurbaniTotal(shares: number) {
  return shares * QURBANI_SHARE_COST;
}

export function getQurbaniAdminKey() {
  return process.env.QURBANI_ADMIN_KEY ?? "";
}
