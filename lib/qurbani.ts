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

const namePattern = /^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s.'-]{1,79}$/;
const indianPhonePattern = /^(?:\+91|91)?[6-9]\d{9}$/;

export type QurbaniPaymentValue = (typeof qurbaniPaymentOptions)[number]["value"];
export type QurbaniMeatValue = (typeof qurbaniMeatOptions)[number]["value"];

export type QurbaniSubmissionRecord = {
  id: string;
  participantName: string;
  fatherName: string;
  niyyahName: string;
  contactNumber: string;
  addressLocation: string;
  shares: number;
  totalAmount: number;
  paymentStatus: QurbaniPaymentValue;
  meatPreference: QurbaniMeatValue;
  createdAt: string;
};

export function calculateQurbaniTotal(shares: number) {
  return shares * QURBANI_SHARE_COST;
}

export function getQurbaniAdminKey() {
  return process.env.QURBANI_ADMIN_KEY ?? "";
}

export function normalizeIndianPhoneNumber(input: string) {
  return input.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

export function isValidQurbaniName(value: string) {
  return namePattern.test(value.trim());
}

export function isValidIndianPhoneNumber(value: string) {
  const normalized = normalizeIndianPhoneNumber(value).replace(/^\+/, "");
  return indianPhonePattern.test(normalized);
}

export function isValidQurbaniAddress(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 10 && trimmed.length <= 240;
}

export function validateQurbaniSubmissionFields(input: {
  participantName: string;
  fatherName: string;
  niyyahName: string;
  contactNumber: string;
  addressLocation: string;
}) {
  if (!input.participantName || !input.fatherName || !input.niyyahName || !input.contactNumber || !input.addressLocation) {
    return "All required fields must be filled";
  }

  if (!isValidQurbaniName(input.participantName)) {
    return "Participant name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens";
  }

  if (!isValidQurbaniName(input.fatherName)) {
    return "Father name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens";
  }

  if (!isValidQurbaniName(input.niyyahName)) {
    return "Niyyah name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens";
  }

  if (!isValidIndianPhoneNumber(input.contactNumber)) {
    return "Enter a valid Indian mobile number starting with 6, 7, 8, or 9";
  }

  if (!isValidQurbaniAddress(input.addressLocation)) {
    return "Address / location should be at least 10 characters with enough detail for coordination";
  }

  return null;
}
