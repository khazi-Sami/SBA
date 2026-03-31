"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Job = {
  id: string;
  title: string;
  department: "Teaching" | "Operations" | "Community";
  type: "Full-time" | "Part-time" | "Weekend";
  location: string;
  experience: string;
  summary: string;
  requirements: string[];
};

const jobs: Job[] = [
  { id: "islamic-studies-teacher", title: "Islamic Studies Teacher", department: "Teaching", type: "Full-time", location: "On-site (Madrasa Campus)", experience: "2+ years", summary: "Teach Aqidah, Fiqh, Seerah, and Islamic manners to middle and senior batches.", requirements: ["Strong grounding in core Islamic subjects", "Good classroom management and communication", "Ability to mentor students with adab and discipline"] },
  { id: "quran-tajweed-instructor", title: "Quran & Tajweed Instructor", department: "Teaching", type: "Part-time", location: "On-site / Hybrid", experience: "1+ years", summary: "Conduct Qaida, Nazra, and Tajweed classes for children and adult learners.", requirements: ["Accurate recitation with Tajweed", "Experience teaching different age groups", "Patient and encouraging teaching style"] },
  { id: "hifz-mentor", title: "Hifz Mentor", department: "Teaching", type: "Full-time", location: "On-site", experience: "3+ years", summary: "Guide Hifz students with daily sabaq, revision plans, and progress tracking.", requirements: ["Hafiz qualification preferred", "Structured memorization and revision methods", "Ability to motivate students consistently"] },
  { id: "student-counsellor", title: "Student Counsellor (Islamic Values)", department: "Community", type: "Weekend", location: "On-site", experience: "2+ years", summary: "Support student wellbeing and parent communication in line with Islamic values.", requirements: ["Counselling or mentoring background", "Good communication with parents", "Compassionate and confidential approach"] },
  { id: "admissions-admin", title: "Admissions & Admin Coordinator", department: "Operations", type: "Full-time", location: "On-site", experience: "1+ years", summary: "Manage admissions, fee records, class schedules, and front-desk coordination.", requirements: ["Basic computer skills and record keeping", "Organized and detail-oriented", "Friendly behavior with parents and visitors"] },
];

const benefits = [
  "Purpose-driven Islamic education environment",
  "Teacher training and curriculum support",
  "Structured student progress system",
  "Respectful and values-based work culture",
];

export default function CareerClient() {
  const [dept, setDept] = useState<"All" | Job["department"]>("All");
  const [type, setType] = useState<"All" | Job["type"]>("All");

  const filteredJobs = useMemo(() => jobs.filter((job) => (dept === "All" || job.department === dept) && (type === "All" || job.type === type)), [dept, type]);

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={centerHeroStyle}>
          <div style={eyebrowStyle}>Career</div>
          <h1 style={titleStyle}>
            Work that serves
            <br />
            <span style={{ color: "#1a6045" }}>students, families, and deen.</span>
          </h1>
          <p style={subtitleStyle}>
            An Apple-like layout, but tailored for a respectful Islamic education institution seeking teachers, mentors,
            and operations staff.
          </p>
        </div>

        <div className="career-hero-grid" style={heroGridStyle}>
          <div style={imageCardStyle}>
            <Image src="/green-dome-minaret.jpg" alt="Green Dome and minaret in Madinah" fill style={{ objectFit: "cover" }} />
          </div>
          <div style={textPanelStyle}>
            <div style={smallLabelStyle}>Why Join SBA</div>
            <h2 style={sectionTitleStyle}>A more meaningful place to teach and serve.</h2>
            <p style={bodyStyle}>
              Join a madrasa environment built around sincerity, professionalism, and long-term community benefit.
            </p>
            <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
              {benefits.map((benefit) => (
                <div key={benefit} style={benefitRowStyle}>{benefit}</div>
              ))}
            </div>
          </div>
        </div>

        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
            <div>
              <div style={smallLabelStyle}>Open Roles</div>
              <h2 style={sectionTitleStyle}>Filter roles with less friction.</h2>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(["All", "Teaching", "Operations", "Community"] as const).map((d) => (
                <button key={d} type="button" onClick={() => setDept(d)} style={chipButtonStyle(dept === d)}>{d}</button>
              ))}
              {(["All", "Full-time", "Part-time", "Weekend"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)} style={chipButtonStyle(type === t)}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 18, marginTop: 24 }}>
            {filteredJobs.map((job) => (
              <article key={job.id} style={jobCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
                  <div>
                    <h3 style={{ fontSize: 30, lineHeight: 1.02, color: "#173127", fontFamily: "var(--font-playfair), Georgia, serif" }}>{job.title}</h3>
                    <p style={{ marginTop: 10, color: "#586a62", lineHeight: 1.72, maxWidth: 740 }}>{job.summary}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={chipStyle}>{job.department}</span>
                    <span style={chipStyle}>{job.type}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 6, marginTop: 14, color: "#586a62", fontSize: 14 }}>
                  <div><strong>Location:</strong> {job.location}</div>
                  <div><strong>Experience:</strong> {job.experience}</div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, color: "#173127", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Requirements</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {job.requirements.map((item) => (
                      <div key={item} style={benefitRowStyle}>{item}</div>
                    ))}
                  </div>
                </div>
                <a href={`mailto:careers@sunnibrothers.org?subject=Application%20for%20${encodeURIComponent(job.title)}`} style={primaryButton}>
                  Apply for This Role
                </a>
              </article>
            ))}

            {!filteredJobs.length ? <div style={emptyStateStyle}>No openings match your selected filters.</div> : null}
          </div>
        </section>
      </section>

      <style>{`
        @media (min-width: 980px) {
          .career-hero-grid {
            grid-template-columns: minmax(420px, 1.05fr) minmax(0, 0.95fr) !important;
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
const benefitRowStyle: React.CSSProperties = { padding: "12px 14px", borderRadius: 18, background: "rgba(245,248,245,0.9)", color: "#556860", lineHeight: 1.65 };
const panelStyle: React.CSSProperties = { borderRadius: 36, padding: "34px 30px", background: "rgba(255,255,255,0.84)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 22px 70px rgba(20,40,30,0.06)" };
const chipStyle: React.CSSProperties = { borderRadius: 999, padding: "7px 10px", background: "rgba(26,96,69,0.08)", color: "#1a6045", fontSize: 12, fontWeight: 800 };
const chipButtonStyle = (active: boolean): React.CSSProperties => ({ borderRadius: 999, border: active ? "1px solid rgba(26,96,69,0.22)" : "1px solid rgba(20,42,31,0.08)", background: active ? "rgba(26,96,69,0.10)" : "rgba(255,255,255,0.9)", color: active ? "#1a6045" : "#173127", padding: "10px 14px", fontWeight: 800, cursor: "pointer" });
const jobCardStyle: React.CSSProperties = { borderRadius: 30, padding: "28px 26px", background: "rgba(255,255,255,0.82)", border: "1px solid rgba(20,42,31,0.08)", boxShadow: "0 18px 50px rgba(20,40,30,0.06)", display: "grid", gap: 0 };
const primaryButton: React.CSSProperties = { marginTop: 18, width: "fit-content", textDecoration: "none", background: "linear-gradient(180deg, #174d37, #123b2c)", color: "white", borderRadius: 999, padding: "14px 20px", fontWeight: 800 };
const emptyStateStyle: React.CSSProperties = { borderRadius: 22, padding: "18px 20px", background: "rgba(255,255,255,0.82)", border: "1px dashed rgba(20,42,31,0.18)", color: "#596b62" };
