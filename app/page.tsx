import Image from "next/image";
import Link from "next/link";

const metrics = [
  { value: "1,200+", label: "Students served" },
  { value: "35+", label: "Teachers and mentors" },
  { value: "12", label: "Years of service" },
];

const pillars = [
  {
    title: "Quran Education",
    body: "Structured recitation, Tajweed, Hifz support, and disciplined teacher feedback in one calm learning flow.",
  },
  {
    title: "Family Guidance",
    body: "Parent support, values-based mentoring, and community care designed to strengthen the home as well as the classroom.",
  },
  {
    title: "Meaningful Giving",
    body: "Donation, zakat, and welfare efforts presented with clarity, trust, and transparent action points.",
  },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 84px",
        background:
          "radial-gradient(circle at top left, rgba(165, 196, 172, 0.20), transparent 20%), linear-gradient(180deg, #f5f7f4 0%, #f4f6f2 40%, #eef3ef 100%)",
      }}
    >
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gap: 28,
            alignItems: "center",
            gridTemplateColumns: "1fr",
            padding: "54px 0 24px",
          }}
          className="apple-hero"
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(18, 82, 57, 0.08)",
                color: "#1b5c42",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Modern Islamic Community Platform
            </div>

            <h1
              style={{
                margin: "18px auto 0",
                maxWidth: 980,
                fontSize: "clamp(3rem, 8vw, 6.2rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.05em",
                color: "#142a1f",
              }}
            >
              Built for learning.
              <br />
              Grounded in faith.
            </h1>

            <p
              style={{
                margin: "22px auto 0",
                maxWidth: 780,
                fontSize: "clamp(1.05rem, 2vw, 1.42rem)",
                lineHeight: 1.7,
                color: "#53665d",
              }}
            >
              Sunni Brothers Association is a cleaner, more intuitive digital home for Quran education, Islamic
              studies, family support, donations, and community care.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
              <Link href="/education" style={primaryButton}>
                Explore Education
              </Link>
              <Link href="/donation" style={secondaryButton}>
                Donate Now
              </Link>
              <Link href="/signup" style={secondaryButton}>
                Sign Up
              </Link>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 36,
              minHeight: 560,
              background: "#dfe9e2",
              boxShadow: "0 30px 90px rgba(22, 39, 31, 0.14)",
            }}
          >
            <Image
              src="/green-dome.jpg"
              alt="Green Dome of Masjid an-Nabawi in Madinah"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(9,31,23,0.04) 0%, rgba(9,31,23,0.28) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: 24,
                display: "grid",
                gap: 10,
                padding: 20,
                borderRadius: 28,
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1b5c42" }}>
                Inspired by Madinah
              </div>
              <div style={{ fontSize: "clamp(1.4rem, 2.4vw, 2.2rem)", lineHeight: 1.05, color: "#162b21", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                A more peaceful interface for sacred learning and trusted community support.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
            marginTop: 26,
          }}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 28,
                padding: "26px 24px",
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(20,42,31,0.08)",
                boxShadow: "0 18px 50px rgba(21, 41, 33, 0.06)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 42, fontWeight: 900, color: "#154d37" }}>{metric.value}</div>
              <div style={{ marginTop: 6, color: "#5a6a63", fontSize: 14 }}>{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "54px auto 0" }}>
        <div
          style={{
            borderRadius: 40,
            overflow: "hidden",
            background: "#ffffff",
            boxShadow: "0 28px 90px rgba(20, 40, 30, 0.08)",
          }}
        >
          <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "1fr", alignItems: "stretch" }}>
            <div style={{ padding: "56px 34px" }}>
              <div style={{ color: "#1b5c42", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Sacred Design Language
              </div>
              <h2 style={{ marginTop: 14, fontSize: "clamp(2.2rem, 4vw, 4rem)", lineHeight: 1, color: "#12261d" }}>
                Calm like Apple.
                <br />
                Rooted in Islamic beauty.
              </h2>
              <p style={{ marginTop: 18, maxWidth: 520, color: "#566861", fontSize: 18, lineHeight: 1.72 }}>
                The new direction keeps the layout minimal and premium while using respectful green tones, soft
                surfaces, rounded geometry, and sacred-site imagery to create a more spiritual and trustworthy feel.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
                <Link href="/about" style={secondaryButton}>
                  About Us
                </Link>
                <Link href="/quran" style={secondaryButton}>
                  Read Quran
                </Link>
              </div>
            </div>

            <div style={{ position: "relative", minHeight: 460, background: "#d8e1da" }}>
              <Image
                src="/kaaba.jpg"
                alt="Kaaba and Masjid al-Haram in Makkah"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "54px auto 0" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ color: "#1b5c42", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Key Areas
          </div>
          <h2 style={{ marginTop: 12, fontSize: "clamp(2.1rem, 4vw, 4rem)", color: "#12261d", lineHeight: 1.02 }}>
            Everything important, presented more clearly.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              style={{
                borderRadius: 32,
                padding: "30px 28px",
                background: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(20,42,31,0.08)",
                boxShadow: "0 18px 50px rgba(21, 41, 33, 0.06)",
              }}
            >
              <h3 style={{ fontSize: 28, lineHeight: 1.05, color: "#173127" }}>{pillar.title}</h3>
              <p style={{ marginTop: 14, color: "#596b62", lineHeight: 1.72, fontSize: 16 }}>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "54px auto 0" }}>
        <div
          style={{
            textAlign: "center",
            borderRadius: 38,
            padding: "52px 24px",
            background: "linear-gradient(180deg, #123b2c 0%, #184f3a 100%)",
            color: "white",
            boxShadow: "0 28px 90px rgba(20, 40, 30, 0.16)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.7 }}>
            Join the Platform
          </div>
          <h2 style={{ marginTop: 14, color: "white", fontSize: "clamp(2rem, 4vw, 4rem)", lineHeight: 1.02 }}>
            Learn, support, and stay connected.
          </h2>
          <p style={{ margin: "18px auto 0", maxWidth: 720, color: "rgba(255,255,255,0.82)", fontSize: 18, lineHeight: 1.75 }}>
            Access classes, read Quran, calculate zakat, support charitable work, and be part of a more refined Sunni
            Brothers Association experience.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <Link href="/login" style={whiteButton}>
              Login
            </Link>
            <Link href="/signup" style={outlineWhiteButton}>
              Signup
            </Link>
            <Link href="/donation" style={outlineWhiteButton}>
              Donate
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (min-width: 1024px) {
          .apple-hero {
            grid-template-columns: minmax(0, 0.94fr) minmax(520px, 1.06fr) !important;
          }
          .feature-grid {
            grid-template-columns: minmax(0, 0.9fr) minmax(520px, 1.1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}

const primaryButton: { [key: string]: string | number } = {
  textDecoration: "none",
  background: "linear-gradient(180deg, #174d37, #123b2c)",
  color: "white",
  borderRadius: 999,
  padding: "14px 20px",
  fontWeight: 800,
  boxShadow: "0 14px 30px rgba(18, 59, 44, 0.18)",
};

const secondaryButton: { [key: string]: string | number } = {
  textDecoration: "none",
  background: "rgba(255,255,255,0.84)",
  color: "#163829",
  border: "1px solid rgba(20,42,31,0.08)",
  borderRadius: 999,
  padding: "14px 20px",
  fontWeight: 800,
};

const whiteButton: { [key: string]: string | number } = {
  textDecoration: "none",
  background: "white",
  color: "#123b2c",
  borderRadius: 999,
  padding: "14px 20px",
  fontWeight: 800,
};

const outlineWhiteButton: { [key: string]: string | number } = {
  textDecoration: "none",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 999,
  padding: "14px 20px",
  fontWeight: 800,
};
