// src/components/Footer.tsx
// Place this file in frontend/src/components/Footer.tsx

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Privacy Policy", href: "/legal.html" },
    { label: "Terms of Use", href: "/legal.html?doc=terms" },
    { label: "Cookie Policy", href: "/legal.html?doc=cookies" },
    { label: "GitHub", href: "https://github.com/zyloxweeb/NullTrace", external: true },
    { label: "zylox.space", href: "https://zylox.space", external: true },
  ];

  return (
    <footer
      style={{
        marginTop: 40,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "24px 0 8px",
      }}
    >
      {/* beta notice */}
      <div
        style={{
          background: "rgba(251,191,36,0.05)",
          border: "1px solid rgba(251,191,36,0.14)",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "#c49b0a",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M7 1.5L1 12h12L7 1.5z" stroke="#fbbf24" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M7 5.5v3M7 10v.5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>
          <strong style={{ color: "#fbbf24", fontWeight: 600 }}>Public Beta</strong>
          {" "}— NullTrace is experimental. Analysis results are heuristic estimates, not definitive security verdicts. Do not rely solely on this tool for security decisions.
        </span>
      </div>

      {/* bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* left: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "#52505f",
              letterSpacing: "-0.01em",
            }}
          >
            Null<span style={{ color: "#a78bfa" }}>Trace</span>
          </span>
          <span style={{ color: "#2a2835", fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: "#2a2835" }}>
            © {year} Giuseppe Fattor
          </span>
        </div>

        {/* right: links */}
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "4px 2px", alignItems: "center" }}>
          {links.map((link, i) => (
            <span key={link.label} style={{ display: "flex", alignItems: "center" }}>
              <a
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                rel={link.external ? "noreferrer" : undefined}
                style={{
                  fontSize: 12,
                  color: "#52505f",
                  textDecoration: "none",
                  padding: "4px 8px",
                  borderRadius: 4,
                  transition: "color 0.18s",
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#9d9baf"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#52505f"; }}
              >
                {link.label}
              </a>
              {i < links.length - 1 && (
                <span style={{ color: "#2a2835", fontSize: 10, userSelect: "none" }}>·</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
