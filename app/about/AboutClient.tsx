import Image from "next/image";
import Link from "next/link";

const values = [
  {
    title: "Authentic Learning",
    desc: "Quran, Tajweed, Islamic studies, and tarbiyah delivered with clarity, discipline, and respect.",
  },
  {
    title: "Family Partnership",
    desc: "Parents are part of the journey through communication, guidance, and value-based support.",
  },
  {
    title: "Community Benefit",
    desc: "Education, welfare, and service are treated as one connected responsibility.",
  },
];

const timeline = [
  { year: "2014", event: "Started with weekend Quran classes and a small student batch." },
  { year: "2017", event: "Expanded into Tajweed, Islamic studies, and wider youth learning." },
  { year: "2020", event: "Introduced online classes and digital progress workflows." },
  { year: "2023", event: "Added zakat, donation, and welfare systems for broader support." },
];

export default function AboutClient() {
  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={centerHeroStyle}>
          <div style={eyebrowStyle}>About Sunni Brothers Association</div>
          <h1 style={titleStyle}>
            A modern madrasa platform
            <br />
            <span style={{ color: "#1a6045" }}>with a sacred sense of purpose.</span>
          </h1>
          <p style={subtitleStyle}>
            We exist to make Islamic education, character development, and community support feel more accessible,
            beautiful, and trustworthy for students and families.
          </p>
        </div>

        <div className="about-hero-grid" style={heroGridStyle}>
          <div style={imageCardStyle}>
            <Image src="/medina-domes.jpg" alt="Madinah mosque domes" fill style={{ objectFit: "cover" }} />
          </div>
          <div style={textPanelStyle}>
            <div style={smallLabelStyle}>Our Mission</div>
            <h2 style={sectionTitleStyle}>To nurture confident Muslims through knowledge, adab, and service.</h2>
            <p style={bodyStyle}>
              Sunni Brothers Association combines the warmth of a trusted community madrasa with a cleaner, more
              intuitive digital experience so that learning and community care feel easier to access.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              <Link href="/education" style={primaryButton}>Explore Education</Link>
              <Link href="/donation" style={secondaryButton}>Support the Mission</Link>
            </div>
          </div>
        </div>

        <div style={threeColGridStyle}>
          {values.map((item) => (
            <article key={item.title} style={cardStyle}>
              <h3 style={cardTitleStyle}>{item.title}</h3>
              <p style={cardBodyStyle}>{item.desc}</p>
            </article>
          ))}
        </div>

        <section style={panelStyle}>
          <div style={smallLabelStyle}>Our Journey</div>
          <h2 style={sectionTitleStyle}>Steady growth, guided by what the community truly needs.</h2>
          <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
            {timeline.map((item) => (
              <div key={item.year} style={timelineItemStyle}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1a6045", letterSpacing: "0.08em" }}>{item.year}</div>
                <div style={{ marginTop: 6, color: "#51635b", lineHeight: 1.7 }}>{item.event}</div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <style>{`
        @media (min-width: 980px) {
          .about-hero-grid {
            grid-template-columns: minmax(420px, 1.05fr) minmax(0, 0.95fr) !important;
          }
        }
      `}</style>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 16px 84px",
  background: "linear-gradient(180deg, #f5f7f4 0%, #eef2ef 100%)",
};
const shellStyle: React.CSSProperties = { maxWidth: 1280, margin: "0 auto", display: "grid", gap: 28 };
const centerHeroStyle: React.CSSProperties = { textAlign: "center", padding: "38px 0 6px" };
const eyebrowStyle: React.CSSProperties = {
  display: "inline-flex", padding: "8px 14px", borderRadius: 999, background: "rgba(26,96,69,0.08)",
  color: "#1a6045", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
};
const titleStyle: React.CSSProperties = {
  margin: "18px auto 0", maxWidth: 980, fontSize: "clamp(2.8rem, 7vw, 5.2rem)", lineHeight: 0.96,
  letterSpacing: "-0.05em", color: "#142a1f", fontFamily: "var(--font-playfair), Georgia, serif",
};
const subtitleStyle: React.CSSProperties = {
  margin: "20px auto 0", maxWidth: 800, fontSize: 18, lineHeight: 1.75, color: "#53665d",
};
const heroGridStyle: React.CSSProperties = { display: "grid", gap: 22, alignItems: "center" };
const imageCardStyle: React.CSSProperties = {
  position: "relative", minHeight: 520, borderRadius: 36, overflow: "hidden", background: "#dfe7e1",
  boxShadow: "0 26px 80px rgba(20,40,30,0.12)",
};
const textPanelStyle: React.CSSProperties = {
  borderRadius: 34, padding: "42px 34px", background: "rgba(255,255,255,0.84)", border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 18px 50px rgba(20,40,30,0.06)",
};
const smallLabelStyle: React.CSSProperties = { color: "#1a6045", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" };
const sectionTitleStyle: React.CSSProperties = {
  marginTop: 14, fontSize: "clamp(2rem, 4vw, 3.6rem)", lineHeight: 1.02, color: "#142a1f", fontFamily: "var(--font-playfair), Georgia, serif",
};
const bodyStyle: React.CSSProperties = { marginTop: 18, color: "#556860", fontSize: 17, lineHeight: 1.8 };
const primaryButton: React.CSSProperties = {
  textDecoration: "none", background: "linear-gradient(180deg, #174d37, #123b2c)", color: "white",
  borderRadius: 999, padding: "14px 20px", fontWeight: 800,
};
const secondaryButton: React.CSSProperties = {
  textDecoration: "none", background: "rgba(255,255,255,0.92)", color: "#163829", border: "1px solid rgba(20,42,31,0.08)",
  borderRadius: 999, padding: "14px 20px", fontWeight: 800,
};
const threeColGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 };
const cardStyle: React.CSSProperties = {
  borderRadius: 30, padding: "28px 26px", background: "rgba(255,255,255,0.82)", border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 18px 50px rgba(20,40,30,0.06)",
};
const cardTitleStyle: React.CSSProperties = { fontSize: 28, lineHeight: 1.05, color: "#173127", fontFamily: "var(--font-playfair), Georgia, serif" };
const cardBodyStyle: React.CSSProperties = { marginTop: 14, color: "#596b62", lineHeight: 1.72, fontSize: 16 };
const panelStyle: React.CSSProperties = {
  borderRadius: 36, padding: "34px 30px", background: "rgba(255,255,255,0.84)", border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 22px 70px rgba(20,40,30,0.06)",
};
const timelineItemStyle: React.CSSProperties = {
  padding: "18px 18px 18px 22px", borderLeft: "4px solid #1a6045", background: "rgba(245,248,245,0.9)", borderRadius: 18,
};
