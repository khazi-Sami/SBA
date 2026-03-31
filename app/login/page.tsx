"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div className="auth-apple-grid" style={gridStyle}>
          <div style={imageCardStyle}>
            <Image src="/medina-ceiling.jpg" alt="Architectural ceiling details in Madinah" fill style={{ objectFit: "cover" }} />
            <div style={imageOverlayStyle}>
              <div style={overlayLabelStyle}>Welcome Back</div>
              <div style={overlayTitleStyle}>A more peaceful login experience for your madrasa account.</div>
            </div>
          </div>

          <article style={formCardStyle}>
            <div style={eyebrowStyle}>Login</div>
            <h1 style={titleStyle}>Access your account.</h1>
            <p style={subtitleStyle}>Dashboard, classes, and community tools in one place.</p>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 28 }}>
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              <button type="submit" disabled={loading} style={primaryButton}>{loading ? "Logging in..." : "Login"}</button>
            </form>

            {error ? <div style={errorStyle}>{error}</div> : null}

            <p style={footerTextStyle}>
              New here?{" "}
              <Link href="/signup" style={linkStyle}>
                Create an account
              </Link>
            </p>
          </article>
        </div>
      </section>

      <style>{`
        @media (min-width: 980px) {
          .auth-apple-grid {
            grid-template-columns: minmax(420px, 1.08fr) minmax(0, 0.92fr) !important;
          }
        }
      `}</style>
    </main>
  );
}

const pageStyle: React.CSSProperties = { minHeight: "100vh", padding: "24px 16px 84px", background: "linear-gradient(180deg, #f5f7f4 0%, #eef2ef 100%)" };
const shellStyle: React.CSSProperties = { maxWidth: 1280, margin: "0 auto" };
const gridStyle: React.CSSProperties = { display: "grid", gap: 24, alignItems: "stretch" };
const imageCardStyle: React.CSSProperties = { position: "relative", minHeight: 640, borderRadius: 36, overflow: "hidden", background: "#dfe7e1", boxShadow: "0 26px 80px rgba(20,40,30,0.12)" };
const imageOverlayStyle: React.CSSProperties = { position: "absolute", left: 24, right: 24, bottom: 24, padding: 22, borderRadius: 28, background: "rgba(255,255,255,0.74)", backdropFilter: "blur(14px)" };
const overlayLabelStyle: React.CSSProperties = { color: "#1a6045", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" };
const overlayTitleStyle: React.CSSProperties = { marginTop: 10, color: "#13291f", fontSize: "clamp(1.4rem, 2vw, 2rem)", lineHeight: 1.08, fontFamily: "var(--font-playfair), Georgia, serif" };
const formCardStyle: React.CSSProperties = { borderRadius: 36, padding: "44px 34px", background: "rgba(255,255,255,0.86)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 18px 50px rgba(20,40,30,0.06)", alignSelf: "center" };
const eyebrowStyle: React.CSSProperties = { display: "inline-flex", padding: "8px 14px", borderRadius: 999, background: "rgba(26,96,69,0.08)", color: "#1a6045", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" };
const titleStyle: React.CSSProperties = { margin: "18px 0 0", fontSize: "clamp(2.6rem, 6vw, 4.6rem)", lineHeight: 0.98, color: "#142a1f", letterSpacing: "-0.05em", fontFamily: "var(--font-playfair), Georgia, serif" };
const subtitleStyle: React.CSSProperties = { margin: "18px 0 0", color: "#566860", fontSize: 18, lineHeight: 1.75 };
const inputStyle: React.CSSProperties = { padding: "15px 16px", borderRadius: 18, border: "1px solid rgba(20,42,31,0.10)", background: "rgba(255,255,255,0.92)", fontSize: 16 };
const primaryButton: React.CSSProperties = { border: "none", cursor: "pointer", textDecoration: "none", background: "linear-gradient(180deg, #174d37, #123b2c)", color: "white", borderRadius: 999, padding: "15px 20px", fontWeight: 800, fontSize: 16, marginTop: 4 };
const errorStyle: React.CSSProperties = { marginTop: 18, color: "#b42318", background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.16)", borderRadius: 16, padding: "12px 14px" };
const footerTextStyle: React.CSSProperties = { marginTop: 20, color: "#566860", fontSize: 15 };
const linkStyle: React.CSSProperties = { color: "#174d37", fontWeight: 800, textDecoration: "none" };
