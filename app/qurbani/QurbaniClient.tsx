"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateQurbaniTotal,
  isValidIndianPhoneNumber,
  isValidQurbaniAddress,
  isValidQurbaniName,
  normalizeIndianPhoneNumber,
  qurbaniMeatOptions,
  qurbaniPaymentOptions,
  qurbaniShareOptions,
  QURBANI_SHARE_COST,
  type QurbaniMeatValue,
  type QurbaniPaymentValue,
} from "@/lib/qurbani";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function QurbaniClient() {
  const [participantName, setParticipantName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [niyyahName, setNiyyahName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [addressLocation, setAddressLocation] = useState("");
  const [shares, setShares] = useState<number>(1);
  const [paymentStatus, setPaymentStatus] = useState<QurbaniPaymentValue>("PENDING");
  const [meatPreference, setMeatPreference] = useState<QurbaniMeatValue>("RECEIVE_MEAT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalAmount = useMemo(() => calculateQurbaniTotal(shares), [shares]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedContactNumber = normalizeIndianPhoneNumber(contactNumber);

    if (!isValidQurbaniName(participantName)) {
      setError("Participant name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidQurbaniName(fatherName)) {
      setError("Father name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidQurbaniName(niyyahName)) {
      setError("Niyyah name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidIndianPhoneNumber(normalizedContactNumber)) {
      setError("Enter a valid Indian mobile number starting with 6, 7, 8, or 9");
      return;
    }

    if (!isValidQurbaniAddress(addressLocation)) {
      setError("Address / location should be at least 10 characters with enough detail for coordination");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/qurbani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName,
          fatherName,
          niyyahName,
          contactNumber: normalizedContactNumber,
          addressLocation,
          shares,
          paymentStatus,
          meatPreference,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to submit Qurbani request");
      }

      setParticipantName("");
      setFatherName("");
      setNiyyahName("");
      setContactNumber("");
      setAddressLocation("");
      setShares(1);
      setPaymentStatus("PENDING");
      setMeatPreference("RECEIVE_MEAT");
      setSuccessMessage(
        data?.count && data.count > 1
          ? `${data.count} Qurbani share rows submitted successfully`
          : "Your Qurbani request has been submitted successfully"
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit Qurbani request"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>Qurbani Registration</div>
            <h1 style={titleStyle}>
              Qurbani Registration
              <br />
              <span style={{ color: "#1a6045" }}>(سہولت قربانی)</span>
            </h1>
            <p style={subtitleStyle}>
              Register Qurbani shares easily, choose your meat preference clearly, and
              submit your request without creating an account.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={summaryChipStyle}>
              <strong>₹2800</strong> per share
            </div>
            <Link href="/qurbani/admin" style={secondaryButtonStyle}>
              Admin Access
            </Link>
          </div>
        </div>

        <div className="qurbani-grid" style={gridStyle}>
          <section style={formCardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <div style={smallLabelStyle}>Guest Registration</div>
                <h2 style={sectionTitleStyle}>Fill in the Qurbani form</h2>
              </div>
              <div style={helperTextStyle}>All starred fields are required</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 22 }}>
              <FormField
                label="Share lenay walay ka naam"
                subtitle="Participant’s Name"
                required
              >
                <input
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Participant name"
                  style={inputStyle}
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  required
                />
              </FormField>

              <FormField
                label="Walid ka naam"
                subtitle="Father’s Name"
                required
              >
                <input
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father name"
                  style={inputStyle}
                  minLength={2}
                  maxLength={80}
                  required
                />
              </FormField>

              <FormField
                label="Kiske naam pe Qurbani ho rahi hai"
                subtitle="Name for Niyyah"
                helper="If the niyyah is for someone else, mention that name here."
                required
              >
                <input
                  value={niyyahName}
                  onChange={(e) => setNiyyahName(e.target.value)}
                  placeholder="Niyyah name"
                  style={inputStyle}
                  minLength={2}
                  maxLength={80}
                  required
                />
              </FormField>

              <FormField
                label="Rabta number / WhatsApp"
                subtitle="Contact Number"
                helper="Use the best number for follow-up or delivery coordination."
                required
              >
                <input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(normalizeIndianPhoneNumber(e.target.value))}
                  placeholder="+91 9876543210"
                  style={inputStyle}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={13}
                  required
                />
              </FormField>

              <FormField
                label="Pata / Location"
                subtitle="Address / Location"
                helper="Add mohalla, area, landmark, or delivery location for easy coordination."
                required
              >
                <textarea
                  value={addressLocation}
                  onChange={(e) => setAddressLocation(e.target.value)}
                  placeholder="House / street / area / landmark / city"
                  style={{ ...inputStyle, minHeight: 108, resize: "vertical" }}
                  minLength={10}
                  maxLength={240}
                  required
                />
              </FormField>

              <div style={twoColGridStyle}>
                <FormField
                  label="Kitne hissay chahiye?"
                  subtitle="Number of Shares"
                  required
                >
                  <select
                    value={shares}
                    onChange={(e) => setShares(Number(e.target.value))}
                    style={inputStyle}
                    required
                  >
                    {qurbaniShareOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Per hissa cost (fixed)"
                  subtitle="Cost Per Share"
                  helper="This amount is fixed."
                >
                  <div style={readonlyBoxStyle}>{formatINR(QURBANI_SHARE_COST)} per share</div>
                </FormField>
              </div>

              <div style={twoColGridStyle}>
                <FormField
                  label="Paisa ada ho gaya?"
                  subtitle="Payment Status"
                  required
                >
                  <div style={radioGroupStyle}>
                    {qurbaniPaymentOptions.map((option) => (
                      <label key={option.value} style={radioLabelStyle}>
                        <input
                          type="radio"
                          name="payment-status"
                          checked={paymentStatus === option.value}
                          onChange={() => setPaymentStatus(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FormField>

                <FormField
                  label="Gosht preference"
                  subtitle="Meat Preference"
                  required
                >
                  <div style={radioGroupStyle}>
                    {qurbaniMeatOptions.map((option) => (
                      <label key={option.value} style={radioLabelStyle}>
                        <input
                          type="radio"
                          name="meat-preference"
                          checked={meatPreference === option.value}
                          onChange={() => setMeatPreference(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>

              <div style={totalCardStyle}>
                <div>
                  <div style={smallLabelStyle}>Auto Calculated Total</div>
                  <div style={{ marginTop: 6, color: "#5b6c64", lineHeight: 1.6 }}>
                    {shares} share{shares > 1 ? "s" : ""} × {formatINR(QURBANI_SHARE_COST)}
                  </div>
                </div>
                <div style={totalAmountStyle}>{formatINR(totalAmount)}</div>
              </div>

              {error ? <div style={errorStyle}>{error}</div> : null}
              {successMessage ? (
                <div style={successStyle}>
                  {successMessage}
                </div>
              ) : null}

              <button type="submit" disabled={submitting} style={primaryButtonStyle}>
                {submitting ? "Submitting..." : "Submit Qurbani Request"}
              </button>
            </form>
          </section>

          <aside style={infoCardStyle}>
            <div style={smallLabelStyle}>Helpful Notes</div>
            <h2 style={sectionTitleStyle}>Before you submit</h2>
            <div style={infoListStyle}>
              <div style={infoItemStyle}>
                Enter the correct participant and father’s name for clear records.
              </div>
              <div style={infoItemStyle}>
                If the Qurbani niyyah is for another person, mention that name properly.
              </div>
              <div style={infoItemStyle}>
                Choose “Donate (Khairat)” if you do not want to receive meat.
              </div>
              <div style={infoItemStyle}>
                Admin can review all submissions, shares, and totals from the admin page.
              </div>
            </div>
          </aside>
        </div>

        <style>{`
          @media (min-width: 980px) {
            .qurbani-grid {
              grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr) !important;
              align-items: start;
            }
          }
        `}</style>
      </section>
    </main>
  );
}

function FormField({
  label,
  subtitle,
  helper,
  required,
  children,
}: {
  label: string;
  subtitle: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </label>
      <div style={englishLabelStyle}>{subtitle}</div>
      {children}
      {helper ? <div style={helperTextStyle}>{helper}</div> : null}
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 16px 84px",
  background: "linear-gradient(180deg, #f5f7f4 0%, #eef2ef 100%)",
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  display: "grid",
  gap: 28,
};

const heroStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  alignItems: "end",
  padding: "38px 0 6px",
};

const eyebrowStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(26,96,69,0.08)",
  color: "#1a6045",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  margin: "18px 0 0",
  maxWidth: 820,
  fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
  lineHeight: 0.96,
  letterSpacing: "-0.05em",
  color: "#142a1f",
  fontFamily: "var(--font-playfair), Georgia, serif",
};

const subtitleStyle: React.CSSProperties = {
  margin: "18px 0 0",
  maxWidth: 780,
  fontSize: 18,
  lineHeight: 1.75,
  color: "#53665d",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: 20,
};

const formCardStyle: React.CSSProperties = {
  borderRadius: 34,
  padding: "32px 28px",
  background: "rgba(255,255,255,0.84)",
  border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 18px 50px rgba(20,40,30,0.06)",
};

const infoCardStyle: React.CSSProperties = {
  borderRadius: 34,
  padding: "32px 28px",
  background: "linear-gradient(180deg, #123b2c 0%, #184f3a 100%)",
  boxShadow: "0 28px 90px rgba(20,40,30,0.16)",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "end",
  flexWrap: "wrap",
};

const smallLabelStyle: React.CSSProperties = {
  color: "#1a6045",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
  lineHeight: 1.06,
  color: "#142a1f",
  fontFamily: "var(--font-playfair), Georgia, serif",
};

const labelStyle: React.CSSProperties = {
  color: "#173127",
  fontSize: 14,
  fontWeight: 800,
};

const englishLabelStyle: React.CSSProperties = {
  color: "#6a7b74",
  fontSize: 12,
  lineHeight: 1.4,
};

const helperTextStyle: React.CSSProperties = {
  color: "#6a7b74",
  fontSize: 12,
  lineHeight: 1.5,
};

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(20,42,31,0.10)",
  background: "rgba(255,255,255,0.94)",
  fontSize: 16,
  width: "100%",
};

const readonlyBoxStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 18,
  background: "rgba(245,248,245,0.9)",
  color: "#173127",
  border: "1px solid rgba(20,42,31,0.08)",
  fontWeight: 700,
};

const radioGroupStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 18,
  background: "rgba(245,248,245,0.9)",
  border: "1px solid rgba(20,42,31,0.06)",
};

const radioLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#566860",
  fontSize: 15,
};

const twoColGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

const totalCardStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  padding: "18px 18px",
  borderRadius: 24,
  background: "rgba(26,96,69,0.08)",
  border: "1px solid rgba(26,96,69,0.10)",
};

const totalAmountStyle: React.CSSProperties = {
  color: "#174d37",
  fontSize: 30,
  fontWeight: 900,
};

const errorStyle: React.CSSProperties = {
  color: "#b42318",
  background: "rgba(244,67,54,0.08)",
  border: "1px solid rgba(244,67,54,0.16)",
  borderRadius: 16,
  padding: "12px 14px",
};

const successStyle: React.CSSProperties = {
  color: "#166534",
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.18)",
  borderRadius: 16,
  padding: "12px 14px",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  background: "linear-gradient(180deg, #174d37, #123b2c)",
  color: "white",
  borderRadius: 999,
  padding: "15px 20px",
  fontWeight: 800,
  fontSize: 16,
};

const secondaryButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "rgba(255,255,255,0.92)",
  color: "#163829",
  border: "1px solid rgba(20,42,31,0.08)",
  borderRadius: 999,
  padding: "12px 16px",
  fontWeight: 800,
};

const summaryChipStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: "12px 16px",
  background: "rgba(26,96,69,0.08)",
  color: "#173127",
};

const infoListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 24,
};

const infoItemStyle: React.CSSProperties = {
  padding: "14px 15px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.86)",
  lineHeight: 1.65,
};
