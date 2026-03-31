"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type MoneyFields = {
  cash: number;
  bank: number;
  gold: number;
  silver: number;
  investments: number;
  businessAssets: number;
  receivables: number;
  otherAssets: number;
  debtsDue: number;
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function ZakatClient() {
  const [nisab, setNisab] = useState<number>(50000);
  const [useSilverNisabHint, setUseSilverNisabHint] = useState(true);
  const [f, setF] = useState<MoneyFields>({ cash: 0, bank: 0, gold: 0, silver: 0, investments: 0, businessAssets: 0, receivables: 0, otherAssets: 0, debtsDue: 0 });

  const totals = useMemo(() => {
    const assets = f.cash + f.bank + f.gold + f.silver + f.investments + f.businessAssets + f.receivables + f.otherAssets;
    const net = Math.max(0, assets - f.debtsDue);
    const zakatable = net >= nisab;
    const zakatDue = zakatable ? net * 0.025 : 0;
    return { assets, net, zakatable, zakatDue };
  }, [f, nisab]);

  function Field({ label, value, onCommit, hint }: { label: string; value: number; onCommit: (v: number) => void; hint?: string }) {
    const [displayValue, setDisplayValue] = useState<string>(() => (value === 0 ? "" : value.toString()));
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <label style={labelStyle}>{label}</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={(e) => setDisplayValue(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() => {
            const num = displayValue === "" ? 0 : Number(displayValue);
            onCommit(num);
            setDisplayValue(num === 0 ? "" : num.toString());
          }}
          onFocus={(e) => e.target.select()}
          style={inputStyle}
          placeholder="0"
        />
        {hint ? <div style={{ color: "#64756d", fontSize: 12, lineHeight: 1.5 }}>{hint}</div> : null}
      </div>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={centerHeroStyle}>
          <div style={eyebrowStyle}>Zakat Calculator</div>
          <h1 style={titleStyle}>
            Calculate zakat
            <br />
            <span style={{ color: "#1a6045" }}>with more clarity.</span>
          </h1>
          <p style={subtitleStyle}>A cleaner interface for one of the most important obligations of wealth.</p>
        </div>

        <div className="zakat-hero-grid" style={heroGridStyle}>
          <div style={textPanelStyle}>
            <div style={smallLabelStyle}>Simple Guidance</div>
            <h2 style={sectionTitleStyle}>Enter assets, debts, and nisab in one calm flow.</h2>
            <p style={bodyStyle}>
              The calculator has been redesigned to feel less technical, while still keeping the same underlying logic.
            </p>
          </div>
          <div style={imageCardStyle}>
            <Image src="/medina-ceiling.jpg" alt="Islamic architecture details in Madinah" fill style={{ objectFit: "cover" }} />
          </div>
        </div>

        <div className="zakat-main-grid" style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <div style={smallLabelStyle}>Your Assets</div>
            <h2 style={sectionTitleStyle}>Enter zakatable wealth.</h2>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 22 }}>
              <Field label="Cash in hand" value={f.cash} onCommit={(v) => setF((prev) => ({ ...prev, cash: v }))} />
              <Field label="Bank balance" value={f.bank} onCommit={(v) => setF((prev) => ({ ...prev, bank: v }))} />
              <Field label="Gold value" value={f.gold} onCommit={(v) => setF((prev) => ({ ...prev, gold: v }))} hint="Current market value of gold you own." />
              <Field label="Silver value" value={f.silver} onCommit={(v) => setF((prev) => ({ ...prev, silver: v }))} hint="Current market value of silver you own." />
              <Field label="Investments" value={f.investments} onCommit={(v) => setF((prev) => ({ ...prev, investments: v }))} />
              <Field label="Business assets" value={f.businessAssets} onCommit={(v) => setF((prev) => ({ ...prev, businessAssets: v }))} />
              <Field label="Receivables" value={f.receivables} onCommit={(v) => setF((prev) => ({ ...prev, receivables: v }))} />
              <Field label="Other assets" value={f.otherAssets} onCommit={(v) => setF((prev) => ({ ...prev, otherAssets: v }))} />
              <Field label="Debts due now" value={f.debtsDue} onCommit={(v) => setF((prev) => ({ ...prev, debtsDue: v }))} hint="Only short-term obligations due immediately." />
            </div>

            <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid rgba(20,42,31,0.08)", display: "grid", gap: 12 }}>
              <label style={labelStyle}>Nisab Threshold (INR)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={nisab === 0 ? "" : nisab.toString()}
                onChange={(e) => setNisab(e.target.value.replace(/[^0-9]/g, "") === "" ? 0 : Number(e.target.value.replace(/[^0-9]/g, "")))}
                onBlur={() => { if (nisab === 0) setNisab(50000); }}
                style={{ ...inputStyle, maxWidth: 280 }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#586a62", fontSize: 14 }}>
                <input type="checkbox" checked={useSilverNisabHint} onChange={(e) => setUseSilverNisabHint(e.target.checked)} />
                Show silver-nisab hint
              </label>
              {useSilverNisabHint ? <div style={noteStyle}>Many scholars recommend using the silver nisab as a more cautious threshold. You can enter your preferred nisab value here.</div> : null}
            </div>
          </section>

          <section style={summaryPanelStyle}>
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>Summary</div>
            <h2 style={{ color: "white", marginTop: 12, fontSize: "clamp(2rem, 3vw, 3rem)", lineHeight: 1.04, fontFamily: "var(--font-playfair), Georgia, serif" }}>Your zakat result.</h2>
            <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
              <Row label="Total assets" value={formatINR(totals.assets)} />
              <Row label="Debts due now" value={`- ${formatINR(f.debtsDue)}`} />
              <Row label="Net wealth" value={formatINR(totals.net)} />
              <Row label="Nisab" value={formatINR(nisab)} />
            </div>

            <div style={{ marginTop: 24, padding: "22px 20px", borderRadius: 28, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.84)" }}>
                {totals.zakatable ? "Zakat is due" : "No zakat due yet"}
              </div>
              <div style={{ marginTop: 10, fontSize: 42, fontWeight: 900, color: "white" }}>{formatINR(totals.zakatDue)}</div>
              <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>Calculated at 2.5% of net zakatable wealth.</div>
            </div>

            <div style={{ marginTop: 18, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, fontSize: 14 }}>
              This is general guidance only. Complex personal situations should still be reviewed with a qualified scholar.
            </div>
          </section>
        </div>
      </section>

      <style>{`
        @media (min-width: 980px) {
          .zakat-hero-grid {
            grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr) !important;
          }
          .zakat-main-grid {
            grid-template-columns: minmax(0, 1.28fr) minmax(340px, 0.72fr) !important;
            align-items: start;
          }
        }
      `}</style>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, color: "white", fontSize: 15 }}>
      <div style={{ color: "rgba(255,255,255,0.72)" }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
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
const sectionTitleStyle: React.CSSProperties = { marginTop: 14, fontSize: "clamp(2rem, 4vw, 3.6rem)", lineHeight: 1.02, color: "#142a1f", fontFamily: "var(--font-playfair), Georgia, serif" };
const bodyStyle: React.CSSProperties = { marginTop: 18, color: "#556860", fontSize: 17, lineHeight: 1.8 };
const panelStyle: React.CSSProperties = { borderRadius: 36, padding: "34px 30px", background: "rgba(255,255,255,0.84)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 22px 70px rgba(20,40,30,0.06)" };
const summaryPanelStyle: React.CSSProperties = { borderRadius: 36, padding: "34px 30px", background: "linear-gradient(180deg, #123b2c 0%, #184f3a 100%)", boxShadow: "0 28px 90px rgba(20,40,30,0.16)" };
const labelStyle: React.CSSProperties = { color: "#173127", fontSize: 12, fontWeight: 800, letterSpacing: "0.10em", textTransform: "uppercase" };
const inputStyle: React.CSSProperties = { padding: "14px 16px", borderRadius: 18, border: "1px solid rgba(20,42,31,0.10)", background: "rgba(255,255,255,0.94)", fontSize: 16 };
const noteStyle: React.CSSProperties = { padding: "14px 16px", borderRadius: 18, background: "rgba(196,172,110,0.14)", border: "1px solid rgba(196,172,110,0.18)", color: "#7b642c", lineHeight: 1.6, fontSize: 13 };
