"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
};

type AyahRow = { numberInSurah: number; arabic: string; translation: string };
type EditionAyah = { numberInSurah: number; text: string };
type EditionData = { edition?: { language?: string }; ayahs?: EditionAyah[] };
type SurahListResponse = { data?: SurahMeta[] };
type AyahEditionsResponse = { data?: EditionData[] };

const fallbackSurahList: SurahMeta[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "The Opening", revelationType: "Meccan", numberOfAyahs: 7 },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", revelationType: "Medinan", numberOfAyahs: 286 },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", englishNameTranslation: "Family of Imran", revelationType: "Medinan", numberOfAyahs: 200 },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishNameTranslation: "Ya Sin", revelationType: "Meccan", numberOfAyahs: 83 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishNameTranslation: "The Most Compassionate", revelationType: "Medinan", numberOfAyahs: 78 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", revelationType: "Meccan", numberOfAyahs: 30 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishNameTranslation: "Sincerity", revelationType: "Meccan", numberOfAyahs: 4 },
];

function formatSurahBadge(surah: SurahMeta) {
  return `${surah.number}. ${surah.englishName}`;
}

export default function QuranClient() {
  const [surahs, setSurahs] = useState<SurahMeta[]>(fallbackSurahList);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [query, setQuery] = useState("");
  const [mobileView, setMobileView] = useState<"reader" | "list">("reader");
  const readerRef = useRef<HTMLElement | null>(null);
  const [ayahs, setAyahs] = useState<AyahRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [ayahLoading, setAyahLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [ayahError, setAyahError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadSurahs() {
      setListLoading(true);
      setListError("");
      try {
        const res = await fetch("https://api.alquran.cloud/v1/surah", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json: SurahListResponse = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];
        if (!items.length) throw new Error("Empty");
        if (!cancelled) setSurahs(items);
      } catch {
        if (!cancelled) setListError("Unable to load the full Quran index right now. A useful fallback list is shown.");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }
    loadSurahs();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAyahs() {
      setAyahLoading(true);
      setAyahError("");
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/editions/quran-uthmani,en.asad`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json: AyahEditionsResponse = await res.json();
        const payload = Array.isArray(json?.data) ? json.data : [];
        const arabicEdition = payload.find((p) => p?.edition?.language === "ar");
        const englishEdition = payload.find((p) => p?.edition?.language === "en");
        const arabicAyahs = Array.isArray(arabicEdition?.ayahs) ? arabicEdition.ayahs : [];
        const englishAyahs = Array.isArray(englishEdition?.ayahs) ? englishEdition.ayahs : [];
        const englishMap = new Map<number, string>();
        for (const a of englishAyahs) englishMap.set(a.numberInSurah, a.text);
        const merged: AyahRow[] = arabicAyahs.map((a) => ({ numberInSurah: a.numberInSurah, arabic: a.text, translation: englishMap.get(a.numberInSurah) ?? "" }));
        if (!merged.length) throw new Error("Empty");
        if (!cancelled) setAyahs(merged);
      } catch {
        if (!cancelled) {
          setAyahs([]);
          setAyahError("Unable to load ayahs at the moment. Please try another Surah or refresh.");
        }
      } finally {
        if (!cancelled) setAyahLoading(false);
      }
    }
    loadAyahs();
    return () => { cancelled = true; };
  }, [selectedSurah]);

  const filteredSurahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter((s) => s.englishName.toLowerCase().includes(q) || s.englishNameTranslation.toLowerCase().includes(q) || s.name.includes(query) || s.number.toString() === q);
  }, [query, surahs]);

  const activeSurah = useMemo(() => surahs.find((s) => s.number === selectedSurah) ?? fallbackSurahList[0], [surahs, selectedSurah]);

  function openSurah(surahNumber: number) {
    setSelectedSurah(surahNumber);
    setMobileView("reader");
    setTimeout(() => readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={centerHeroStyle}>
          <div style={eyebrowStyle}>Quran</div>
          <h1 style={titleStyle}>
            A calmer way to read
            <br />
            <span style={{ color: "#1a6045" }}>the Holy Quran.</span>
          </h1>
          <p style={subtitleStyle}>Browse surahs, read Arabic, and view translation in a cleaner reading environment.</p>
        </div>

        <div className="quran-hero-grid" style={heroGridStyle}>
          <div style={imageCardStyle}>
            <Image src="/open-quran.jpg" alt="Open Quran for recitation" fill style={{ objectFit: "cover" }} />
          </div>
          <div style={textPanelStyle}>
            <div style={smallLabelStyle}>Reading Experience</div>
            <h2 style={sectionTitleStyle}>Simpler navigation. More focus on the ayat.</h2>
            <p style={bodyStyle}>The page now gives more visual breathing room so the list and reading area feel less cramped and more reverent.</p>
          </div>
        </div>

        <div className="quran-main-grid" style={{ display: "grid", gap: 20 }}>
          <aside style={panelStyle} className={mobileView === "reader" ? "quran-list-hide-mobile" : ""}>
            <div style={smallLabelStyle}>Surah List</div>
            <h2 style={sectionTitleStyle}>Find a surah quickly.</h2>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or number" style={{ ...inputStyle, marginTop: 20 }} />
            {listError ? <div style={{ ...noteStyle, marginTop: 14 }}>{listError}</div> : null}
            <div style={{ display: "grid", gap: 12, marginTop: 18, maxHeight: "74vh", overflow: "auto" }}>
              {listLoading && surahs.length === 0 ? <div style={{ color: "#64756d" }}>Loading surahs...</div> : null}
              {filteredSurahs.map((surah) => {
                const active = selectedSurah === surah.number;
                return (
                  <button key={surah.number} onClick={() => openSurah(surah.number)} style={surahCardStyle(active)}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#173127" }}>{formatSurahBadge(surah)}</div>
                    <div style={{ marginTop: 6, color: "#173127", fontSize: 20, fontFamily: "var(--font-playfair), Georgia, serif" }}>{surah.name}</div>
                    <div style={{ marginTop: 6, color: "#64756d", fontSize: 13 }}>{surah.englishNameTranslation} • {surah.numberOfAyahs} ayahs • {surah.revelationType}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section ref={readerRef} style={panelStyle} className={mobileView === "list" ? "quran-reader-hide-mobile" : ""}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start", flexWrap: "wrap" }}>
              <div>
                <div style={smallLabelStyle}>Reading</div>
                <h2 style={{ ...sectionTitleStyle, marginTop: 10 }}>{activeSurah.englishName}</h2>
                <div style={{ marginTop: 6, color: "#64756d" }}>{activeSurah.name} • {activeSurah.englishNameTranslation}</div>
              </div>
              <span style={chipStyle}>{activeSurah.numberOfAyahs} Ayahs</span>
            </div>

            <div className="quran-mobile-switch" style={{ display: "none", gap: 10, marginTop: 18 }}>
              <button type="button" onClick={() => setMobileView("list")} style={switchButtonStyle(mobileView === "list")}>Surah List</button>
              <button type="button" onClick={() => setMobileView("reader")} style={switchButtonStyle(mobileView === "reader")}>Read Surah</button>
            </div>

            {ayahError ? <div style={{ ...noteStyle, marginTop: 16 }}>{ayahError}</div> : null}

            {ayahLoading ? (
              <div style={{ marginTop: 18, color: "#64756d" }}>Loading ayahs...</div>
            ) : (
              <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
                {ayahs.map((a) => (
                  <article key={a.numberInSurah} style={ayahCardStyle}>
                    <div style={chipStyle}>Ayah {a.numberInSurah}</div>
                    <p dir="rtl" style={{ margin: "16px 0 0", fontSize: 32, lineHeight: 1.9, color: "#0f2119", textAlign: "right" }}>{a.arabic}</p>
                    <p style={{ margin: "16px 0 0", color: "#566860", lineHeight: 1.78, fontSize: 16 }}>{a.translation || "Translation unavailable for this ayah."}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <style>{`
        @media (min-width: 980px) {
          .quran-hero-grid {
            grid-template-columns: minmax(420px, 1.05fr) minmax(0, 0.95fr) !important;
          }
          .quran-main-grid {
            grid-template-columns: minmax(320px, 0.72fr) minmax(0, 1.28fr) !important;
            align-items: start;
          }
        }
        @media (max-width: 979px) {
          .quran-mobile-switch { display: flex !important; }
          .quran-list-hide-mobile { display: none !important; }
          .quran-reader-hide-mobile { display: none !important; }
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
const inputStyle: React.CSSProperties = { padding: "14px 16px", borderRadius: 18, border: "1px solid rgba(20,42,31,0.10)", background: "rgba(255,255,255,0.94)", fontSize: 16, width: "100%" };
const surahCardStyle = (active: boolean): React.CSSProperties => ({ textAlign: "left", borderRadius: 24, border: active ? "1px solid rgba(26,96,69,0.18)" : "1px solid rgba(20,42,31,0.08)", background: active ? "rgba(26,96,69,0.08)" : "rgba(255,255,255,0.78)", padding: 18, cursor: "pointer" });
const noteStyle: React.CSSProperties = { padding: "14px 16px", borderRadius: 18, background: "rgba(196,172,110,0.14)", border: "1px solid rgba(196,172,110,0.18)", color: "#7b642c", lineHeight: 1.6, fontSize: 13 };
const chipStyle: React.CSSProperties = { borderRadius: 999, padding: "7px 10px", background: "rgba(26,96,69,0.08)", color: "#1a6045", fontSize: 12, fontWeight: 800, height: "fit-content" };
const switchButtonStyle = (active: boolean): React.CSSProperties => ({ borderRadius: 999, border: active ? "1px solid rgba(26,96,69,0.22)" : "1px solid rgba(20,42,31,0.08)", background: active ? "rgba(26,96,69,0.10)" : "rgba(255,255,255,0.9)", color: active ? "#1a6045" : "#173127", padding: "10px 14px", fontWeight: 800, cursor: "pointer" });
const ayahCardStyle: React.CSSProperties = { borderRadius: 26, padding: "22px 20px", background: "rgba(255,255,255,0.78)", border: "1px solid rgba(20,42,31,0.08)" };
