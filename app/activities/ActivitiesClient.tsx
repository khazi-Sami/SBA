"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Activity = {
  id: string;
  title: string;
  category: "Education" | "Welfare" | "Community" | "Youth";
  schedule: string;
  audience: string;
  description: string;
};

const activities: Activity[] = [
  { id: "daily-quran-classes", title: "Daily Quran & Tajweed Classes", category: "Education", schedule: "Mon-Sat", audience: "Children & Youth", description: "Structured recitation, Tajweed correction, and memorization planning with teacher feedback." },
  { id: "islamic-studies-batch", title: "Islamic Studies Batch", category: "Education", schedule: "Weekdays + Weekend Revision", audience: "Teens & Adults", description: "Aqidah, Fiqh, Seerah, and essential Islamic life skills in a practical curriculum format." },
  { id: "hifz-circle", title: "Hifz Support Circle", category: "Education", schedule: "Daily Morning Session", audience: "Hifz Students", description: "Focused sabaq and revision circles with monitoring to improve retention and consistency." },
  { id: "family-counselling", title: "Family Guidance & Counselling", category: "Community", schedule: "Every Sunday", audience: "Parents & Guardians", description: "Workshops on parenting, Islamic tarbiyah, and student behavior support at home." },
  { id: "monthly-food-drive", title: "Monthly Food & Essentials Drive", category: "Welfare", schedule: "1st Week Of Month", audience: "Needy Families", description: "Distribution of ration kits, clothing support, and emergency aid through verified cases." },
  { id: "youth-leadership", title: "Youth Leadership Program", category: "Youth", schedule: "Saturday Evening", audience: "Ages 14-22", description: "Public speaking, Islamic identity confidence, and service projects led by youth mentors." },
];

export default function ActivitiesClient() {
  const [filter, setFilter] = useState<"All" | Activity["category"]>("All");
  const filtered = useMemo(() => (filter === "All" ? activities : activities.filter((a) => a.category === filter)), [filter]);

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={centerHeroStyle}>
          <div style={eyebrowStyle}>Activities</div>
          <h1 style={titleStyle}>
            A calmer way to explore
            <br />
            <span style={{ color: "#1a6045" }}>programs and community work.</span>
          </h1>
          <p style={subtitleStyle}>
            Education, welfare, youth, and family support are now presented in a simpler, cleaner, more premium layout.
          </p>
        </div>

        <div className="activities-hero-grid" style={heroGridStyle}>
          <div style={textPanelStyle}>
            <div style={smallLabelStyle}>Designed for Clarity</div>
            <h2 style={sectionTitleStyle}>Find what matters faster, with less clutter.</h2>
            <p style={bodyStyle}>
              This page focuses on discoverability first, so students, families, and supporters can quickly understand
              what the madrasa offers and how to get involved.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              {(["All", "Education", "Welfare", "Community", "Youth"] as const).map((c) => {
                const active = filter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    style={{
                      borderRadius: 999,
                      border: active ? "1px solid rgba(26,96,69,0.22)" : "1px solid rgba(20,42,31,0.08)",
                      background: active ? "rgba(26,96,69,0.10)" : "rgba(255,255,255,0.9)",
                      color: active ? "#1a6045" : "#173127",
                      padding: "10px 14px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={imageCardStyle}>
            <Image src="/green-dome-minaret.jpg" alt="Green Dome and minaret in Madinah" fill style={{ objectFit: "cover" }} />
          </div>
        </div>

        <div style={threeColGridStyle}>
          {filtered.map((activity) => (
            <article key={activity.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "start" }}>
                <h3 style={cardTitleStyle}>{activity.title}</h3>
                <span style={chipStyle}>{activity.category}</span>
              </div>
              <p style={cardBodyStyle}>{activity.description}</p>
              <div style={{ marginTop: 14, color: "#596b62", lineHeight: 1.7, fontSize: 14 }}>
                <div><strong>Schedule:</strong> {activity.schedule}</div>
                <div><strong>Audience:</strong> {activity.audience}</div>
              </div>
            </article>
          ))}
        </div>

        <section style={ctaPanelStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...smallLabelStyle, color: "rgba(255,255,255,0.72)" }}>Get Involved</div>
            <h2 style={{ ...sectionTitleStyle, color: "white", marginTop: 12 }}>Support a more active, connected community.</h2>
            <p style={{ margin: "18px auto 0", maxWidth: 720, color: "rgba(255,255,255,0.82)", lineHeight: 1.75, fontSize: 18 }}>
              Volunteer, teach, mentor, or contribute financially to strengthen Islamic education and welfare outreach.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
              <Link href="/career" style={outlineWhiteButton}>Become a Teacher</Link>
              <Link href="/donation" style={outlineWhiteButton}>Support Activities</Link>
            </div>
          </div>
        </section>
      </section>

      <style>{`
        @media (min-width: 980px) {
          .activities-hero-grid {
            grid-template-columns: minmax(0, 0.95fr) minmax(420px, 1.05fr) !important;
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
const imageCardStyle: React.CSSProperties = { position: "relative", minHeight: 520, borderRadius: 36, overflow: "hidden", background: "#dfe7e1", boxShadow: "0 26px 80px rgba(20,40,30,0.12)" };
const textPanelStyle: React.CSSProperties = { borderRadius: 34, padding: "42px 34px", background: "rgba(255,255,255,0.84)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 18px 50px rgba(20,40,30,0.06)" };
const smallLabelStyle: React.CSSProperties = { color: "#1a6045", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" };
const sectionTitleStyle: React.CSSProperties = { marginTop: 14, fontSize: "clamp(2rem, 4vw, 3.6rem)", lineHeight: 1.02, color: "#142a1f", fontFamily: "var(--font-playfair), Georgia, serif" };
const bodyStyle: React.CSSProperties = { marginTop: 18, color: "#556860", fontSize: 17, lineHeight: 1.8 };
const threeColGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 };
const cardStyle: React.CSSProperties = { borderRadius: 30, padding: "28px 26px", background: "rgba(255,255,255,0.82)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 18px 50px rgba(20,40,30,0.06)" };
const cardTitleStyle: React.CSSProperties = { fontSize: 28, lineHeight: 1.05, color: "#173127", fontFamily: "var(--font-playfair), Georgia, serif", maxWidth: 250 };
const cardBodyStyle: React.CSSProperties = { marginTop: 14, color: "#596b62", lineHeight: 1.72, fontSize: 16 };
const chipStyle: React.CSSProperties = { borderRadius: 999, padding: "7px 10px", background: "rgba(26,96,69,0.08)", color: "#1a6045", fontSize: 12, fontWeight: 800, height: "fit-content" };
const ctaPanelStyle: React.CSSProperties = { borderRadius: 38, padding: "50px 24px", background: "linear-gradient(180deg, #123b2c 0%, #184f3a 100%)", boxShadow: "0 28px 90px rgba(20,40,30,0.16)" };
const outlineWhiteButton: React.CSSProperties = { textDecoration: "none", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "14px 20px", fontWeight: 800 };
