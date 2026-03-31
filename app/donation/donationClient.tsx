"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Cause = {
  id: string;
  title: string;
  desc: string;
  suggested: number | null;
};

type RazorpayOrderResponse = {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  error?: string;
};

type RazorpayVerifyResponse = { error?: string };
type RazorpayHandlerResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void };
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: { causeId: string; causeTitle: string };
  theme: { color: string };
  handler: (response: RazorpayHandlerResponse) => Promise<void>;
};

const causes: Cause[] = [
  { id: "student-education", title: "Sponsor Student Education", desc: "Cover monthly tuition fees, study materials, and uniform support.", suggested: 2500 },
  { id: "quran-class", title: "Sponsor Quran Class", desc: "Support teachers and classroom maintenance for children’s education.", suggested: 1200 },
  { id: "food-packs", title: "Donate Food Packs", desc: "Provide a monthly dry ration kit for a family in need.", suggested: 3500 },
  { id: "blankets", title: "Winter Blankets", desc: "Provide warm blankets for vulnerable families during winter.", suggested: 500 },
  { id: "general-fund", title: "General Welfare Fund", desc: "Emergency aid and operational expenses for community support programs.", suggested: null },
  { id: "zakat", title: "Zakat-al-Mal", desc: "Your zakat distributed to eligible beneficiaries as per Shariah.", suggested: 2500 },
];

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function DonationClient() {
  const [selectedCause, setSelectedCause] = useState<Cause>(causes[0]);
  const [amount, setAmount] = useState<number>(causes[0].suggested ?? 500);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const minAmount = 1;

  const quickAmounts = useMemo(() => {
    const base = selectedCause.suggested ?? 500;
    return [base, base * 2, 500, 1000, 2500].filter((v, i, arr) => arr.indexOf(v) === i);
  }, [selectedCause]);

  async function loadRazorpayScript() {
    if (window.Razorpay) return true;
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePay() {
    if (!amount || amount < minAmount) return alert("Please enter a valid amount.");
    setLoading(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) return alert("Failed to load Razorpay. Please try again.");

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, causeId: selectedCause.id, causeTitle: selectedCause.title, name, email, phone }),
      });

      const data = (await res.json()) as RazorpayOrderResponse;
      if (!res.ok) return alert(data?.error ?? "Unable to create order");

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Sunni Brothers Association",
        description: selectedCause.title,
        order_id: data.orderId,
        prefill: { name, email, contact: phone },
        notes: { causeId: selectedCause.id, causeTitle: selectedCause.title },
        theme: { color: "#174d37" },
        handler: async function (response: RazorpayHandlerResponse) {
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature }),
          });
          const vd = (await v.json()) as RazorpayVerifyResponse;
          if (!v.ok) return alert(vd?.error ?? "Payment verification failed");
          alert("Payment successful. JazakAllahu Khairan.");
        },
      };

      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) return alert("Razorpay failed to initialize. Please refresh and try again.");
      new RazorpayCheckout(options).open();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={centerHeroStyle}>
          <div style={eyebrowStyle}>Donation</div>
          <h1 style={titleStyle}>
            Give with more trust,
            <br />
            <span style={{ color: "#1a6045" }}>clarity, and calm.</span>
          </h1>
          <p style={subtitleStyle}>A cleaner donation experience for education, welfare, and zakat support.</p>
        </div>

        <div className="donation-hero-grid" style={heroGridStyle}>
          <div style={textPanelStyle}>
            <div style={smallLabelStyle}>Why This Design</div>
            <h2 style={sectionTitleStyle}>Less noise. More confidence at the moment of giving.</h2>
            <p style={bodyStyle}>
              The donation page now feels more premium and easier to scan while keeping the full Razorpay payment flow.
            </p>
          </div>
          <div style={imageCardStyle}>
            <Image src="/kaaba.jpg" alt="Kaaba in Makkah" fill style={{ objectFit: "cover" }} />
          </div>
        </div>

        <div className="donation-main-grid" style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <div style={smallLabelStyle}>Choose a Cause</div>
            <h2 style={sectionTitleStyle}>Support what matters most.</h2>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 24 }}>
              {causes.map((c) => {
                const active = c.id === selectedCause.id;
                return (
                  <button key={c.id} onClick={() => { setSelectedCause(c); setAmount(c.suggested ?? 500); }} style={causeCardStyle(active)}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                      <div style={{ fontWeight: 800, color: "#173127", textAlign: "left" }}>{c.title}</div>
                      <span style={amountChipStyle}>{c.suggested ? formatINR(c.suggested) : "Any"}</span>
                    </div>
                    <p style={{ marginTop: 12, color: "#5b6c64", lineHeight: 1.68, textAlign: "left" }}>{c.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={smallLabelStyle}>Checkout</div>
            <h2 style={sectionTitleStyle}>Complete your contribution.</h2>
            <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Donor name" style={inputStyle} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" style={inputStyle} />
              <input type="number" min={minAmount} value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={inputStyle} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {quickAmounts.map((a) => (
                  <button key={a} type="button" onClick={() => setAmount(a)} style={quickButtonStyle}>{formatINR(a)}</button>
                ))}
              </div>
              <button onClick={handlePay} disabled={loading} style={primaryButton}>{loading ? "Processing..." : "Secure Payment Gateway"}</button>
              <div style={noteStyle}>Funds are used for the selected cause. A receipt can be generated after payment.</div>
            </div>
          </section>
        </div>
      </section>

      <style>{`
        @media (min-width: 980px) {
          .donation-hero-grid {
            grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr) !important;
          }
          .donation-main-grid {
            grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr) !important;
            align-items: start;
          }
        }
      `}</style>
    </main>
  );
}

const pageStyle: React.CSSProperties = { minHeight: "100vh", padding: "24px 16px 84px", background: "linear-gradient(180deg, #f5f7f4 0%, #eef2ef 100%)" };
const shellStyle: React.CSSProperties = { maxWidth: 1280, margin: "0 auto", display: "grid", gap: 28 };
const centerHeroStyle: React.CSSProperties = { textAlign: "center", padding: "38px 0 6px" };
const eyebrowStyle: React.CSSProperties = { display: "inline-flex", padding: "8px 14px", borderRadius: 999, background: "rgba(26,96,69,0.08)", color: "#1a6045", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" };
const titleStyle: React.CSSProperties = { margin: "18px auto 0", maxWidth: 980, fontSize: "clamp(2.8rem, 7vw, 5.2rem)", lineHeight: 0.96, letterSpacing: "-0.05em", color: "#142a1f", fontFamily: "var(--font-playfair), Georgia, serif" };
const subtitleStyle: React.CSSProperties = { margin: "20px auto 0", maxWidth: 800, fontSize: 18, lineHeight: 1.75, color: "#53665d" };
const heroGridStyle: React.CSSProperties = { display: "grid", gap: 22, alignItems: "center" };
const imageCardStyle: React.CSSProperties = { position: "relative", minHeight: 460, borderRadius: 36, overflow: "hidden", background: "#dfe7e1", boxShadow: "0 26px 80px rgba(20,40,30,0.12)" };
const textPanelStyle: React.CSSProperties = { borderRadius: 34, padding: "42px 34px", background: "rgba(255,255,255,0.84)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 18px 50px rgba(20,40,30,0.06)" };
const smallLabelStyle: React.CSSProperties = { color: "#1a6045", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" };
const sectionTitleStyle: React.CSSProperties = { marginTop: 14, fontSize: "clamp(2rem, 4vw, 3.4rem)", lineHeight: 1.02, color: "#142a1f", fontFamily: "var(--font-playfair), Georgia, serif" };
const bodyStyle: React.CSSProperties = { marginTop: 18, color: "#556860", fontSize: 17, lineHeight: 1.8 };
const panelStyle: React.CSSProperties = { borderRadius: 36, padding: "34px 30px", background: "rgba(255,255,255,0.84)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 22px 70px rgba(20,40,30,0.06)" };
const causeCardStyle = (active: boolean): React.CSSProperties => ({ textAlign: "left", background: active ? "rgba(26,96,69,0.08)" : "rgba(255,255,255,0.82)", border: active ? "1px solid rgba(26,96,69,0.18)" : "1px solid rgba(20,42,31,0.08)", borderRadius: 26, padding: 20, cursor: "pointer" });
const amountChipStyle: React.CSSProperties = { borderRadius: 999, padding: "7px 10px", background: "rgba(26,96,69,0.08)", color: "#1a6045", fontSize: 12, fontWeight: 800, height: "fit-content" };
const inputStyle: React.CSSProperties = { padding: "14px 16px", borderRadius: 18, border: "1px solid rgba(20,42,31,0.10)", background: "rgba(255,255,255,0.94)", fontSize: 16 };
const quickButtonStyle: React.CSSProperties = { borderRadius: 999, border: "1px solid rgba(20,42,31,0.08)", background: "rgba(255,255,255,0.92)", color: "#173127", padding: "10px 14px", fontWeight: 800, cursor: "pointer" };
const primaryButton: React.CSSProperties = { border: "none", cursor: "pointer", textDecoration: "none", background: "linear-gradient(180deg, #174d37, #123b2c)", color: "white", borderRadius: 999, padding: "15px 20px", fontWeight: 800, fontSize: 16 };
const noteStyle: React.CSSProperties = { padding: "14px 16px", borderRadius: 18, background: "rgba(196,172,110,0.14)", border: "1px solid rgba(196,172,110,0.18)", color: "#7b642c", lineHeight: 1.6, fontSize: 13 };
