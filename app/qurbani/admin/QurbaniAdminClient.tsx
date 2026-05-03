"use client";

import { useState } from "react";

type Submission = {
  id: string;
  participantName: string;
  fatherName: string;
  niyyahName: string;
  contactNumber: string;
  shares: number;
  totalAmount: number;
  paymentStatus: "PAID" | "PENDING";
  meatPreference: "RECEIVE_MEAT" | "DONATE";
  createdAt: string;
};

type Summary = {
  totalParticipants: number;
  totalShares: number;
  totalExpectedAmount: number;
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function QurbaniAdminClient() {
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function loadAdminData(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/qurbani/admin?key=${encodeURIComponent(accessKey)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to load admin data");
      }

      setSummary(data.summary as Summary);
      setSubmissions((data.submissions ?? []) as Submission[]);
    } catch (loadError) {
      setSummary(null);
      setSubmissions([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={heroStyle}>
          <div style={eyebrowStyle}>Qurbani Admin</div>
          <h1 style={titleStyle}>Review submissions and totals</h1>
          <p style={subtitleStyle}>
            Use the admin access key to view participants, shares, total expected amount,
            and the full Qurbani registration list.
          </p>
        </div>

        <section style={panelStyle}>
          <form onSubmit={loadAdminData} style={accessFormStyle}>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Admin Access Key</label>
              <input
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                type="password"
                placeholder="Enter admin access key"
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Loading..." : "View Submissions"}
            </button>
          </form>

          {error ? <div style={{ ...errorStyle, marginTop: 18 }}>{error}</div> : null}
        </section>

        {summary ? (
          <>
            <div style={statsGridStyle}>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Total Participants</div>
                <div style={statValueStyle}>{summary.totalParticipants}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Total Shares</div>
                <div style={statValueStyle}>{summary.totalShares}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Total Expected Amount</div>
                <div style={statValueStyle}>{formatINR(summary.totalExpectedAmount)}</div>
              </div>
            </div>

            <section style={panelStyle}>
              <div style={tableHeaderStyle}>
                <div>
                  <div style={eyebrowStyle}>Submission Table</div>
                  <h2 style={sectionTitleStyle}>All registered users</h2>
                </div>
              </div>

              <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Participant Name</th>
                      <th style={thStyle}>Father Name</th>
                      <th style={thStyle}>Niyyah Name</th>
                      <th style={thStyle}>Contact Number</th>
                      <th style={thStyle}>Shares</th>
                      <th style={thStyle}>Total Amount</th>
                      <th style={thStyle}>Payment Status</th>
                      <th style={thStyle}>Meat Preference</th>
                      <th style={thStyle}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td style={tdStyle}>{submission.participantName}</td>
                        <td style={tdStyle}>{submission.fatherName}</td>
                        <td style={tdStyle}>{submission.niyyahName}</td>
                        <td style={tdStyle}>{submission.contactNumber}</td>
                        <td style={tdStyle}>{submission.shares}</td>
                        <td style={tdStyle}>{formatINR(submission.totalAmount)}</td>
                        <td style={tdStyle}>{submission.paymentStatus === "PAID" ? "Paid" : "Pending"}</td>
                        <td style={tdStyle}>
                          {submission.meatPreference === "DONATE" ? "Donate (Khairat)" : "Receive meat"}
                        </td>
                        <td style={tdStyle}>{new Date(submission.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
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
  gap: 24,
};

const heroStyle: React.CSSProperties = {
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
  fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
  lineHeight: 0.96,
  letterSpacing: "-0.05em",
  color: "#142a1f",
  fontFamily: "var(--font-playfair), Georgia, serif",
};

const subtitleStyle: React.CSSProperties = {
  margin: "18px 0 0",
  maxWidth: 820,
  fontSize: 18,
  lineHeight: 1.75,
  color: "#53665d",
};

const panelStyle: React.CSSProperties = {
  borderRadius: 34,
  padding: "28px 24px",
  background: "rgba(255,255,255,0.84)",
  border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 18px 50px rgba(20,40,30,0.06)",
};

const accessFormStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
  alignItems: "end",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#173127",
  fontSize: 14,
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(20,42,31,0.10)",
  background: "rgba(255,255,255,0.94)",
  fontSize: 16,
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(180deg, #174d37, #123b2c)",
  color: "white",
  borderRadius: 999,
  padding: "14px 20px",
  fontWeight: 800,
  fontSize: 15,
};

const errorStyle: React.CSSProperties = {
  color: "#b42318",
  background: "rgba(244,67,54,0.08)",
  border: "1px solid rgba(244,67,54,0.16)",
  borderRadius: 16,
  padding: "12px 14px",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const statCardStyle: React.CSSProperties = {
  borderRadius: 28,
  padding: "22px 20px",
  background: "rgba(255,255,255,0.84)",
  border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 18px 50px rgba(20,40,30,0.06)",
};

const statLabelStyle: React.CSSProperties = {
  color: "#6a7b74",
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: 800,
};

const statValueStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#174d37",
  fontSize: 30,
  fontWeight: 900,
};

const tableHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "end",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
  lineHeight: 1.06,
  color: "#142a1f",
  fontFamily: "var(--font-playfair), Georgia, serif",
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
  marginTop: 22,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 980,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 12px",
  color: "#173127",
  fontSize: 13,
  borderBottom: "1px solid rgba(20,42,31,0.10)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 12px",
  color: "#5b6c64",
  fontSize: 14,
  borderBottom: "1px solid rgba(20,42,31,0.08)",
  verticalAlign: "top",
};
