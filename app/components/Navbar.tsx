"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/activities", label: "Activities" },
  { href: "/education", label: "Education" },
  { href: "/career", label: "Career" },
  { href: "/donation", label: "Donation" },
  { href: "/zakat", label: "Zakat" },
  { href: "/quran", label: "Quran" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, padding: "12px 14px 0" }}>
      <nav
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "14px 18px",
          borderRadius: 24,
          background: "rgba(13, 54, 38, 0.78)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 22px 70px rgba(9, 31, 23, 0.18)",
          backdropFilter: "blur(18px)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              color: "white",
              minWidth: 0,
            }}
          >
            <Image
              src="/sba-logo.jpg"
              alt="Sunni Brothers Association logo"
              width={42}
              height={42}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            />
            <span style={{ display: "grid", lineHeight: 1.02 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.72, fontWeight: 800 }}>
                Sunni Brothers Association
              </span>
              <span style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Community Madrasa
              </span>
            </span>
          </Link>

          <div className="nav-links" style={{ display: "none", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 999,
                    color: "white",
                    textDecoration: "none",
                    opacity: active ? 1 : 0.84,
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="nav-actions" style={{ display: "none", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ textDecoration: "none", color: "white", fontWeight: 700, fontSize: 14 }}>
              Login
            </Link>
            <Link
              href="/donation"
              style={{
                textDecoration: "none",
                color: "#0c2e22",
                background: "linear-gradient(180deg, #f3f8f4, #dcebe0)",
                borderRadius: 999,
                padding: "11px 16px",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Donate
            </Link>
          </div>

          <button
            className="nav-toggle"
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              borderRadius: 14,
              padding: "10px 12px",
              display: "inline-flex",
              cursor: "pointer",
            }}
          >
            Menu
          </button>
        </div>

        {open && (
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  textDecoration: "none",
                  color: "white",
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: pathname === link.href ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                  fontWeight: 700,
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} style={{ textDecoration: "none", color: "white", padding: "12px 14px", borderRadius: 16, background: "rgba(255,255,255,0.06)", fontWeight: 700 }}>
              Login
            </Link>
            <Link href="/donation" onClick={() => setOpen(false)} style={{ textDecoration: "none", color: "#0c2e22", padding: "12px 14px", borderRadius: 16, background: "linear-gradient(180deg, #f3f8f4, #dcebe0)", fontWeight: 800 }}>
              Donate
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (min-width: 1100px) {
          .nav-links, .nav-actions { display: flex !important; }
          .nav-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
