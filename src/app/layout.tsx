import type { Metadata } from "next"

import "./globals.css";

export const metadata: Metadata = {
  title: "Kenya Mangrove Portal",
  description: "Kenya National Mangrove Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "Arial, sans-serif" }}>
        <nav style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "#085041",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}>
          <div>
            <p style={{ color: "#9FE1CB", fontSize: "10px", margin: 0 }}>
              Welcome to
            </p>
            <p style={{ color: "white", fontSize: "14px", fontWeight: "700", margin: 0 }}>
              Kenya Mangrove Portal
            </p>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "13px", padding: "6px 12px", borderRadius: "6px" }}>Map</a>
            <a href="/dashboard/mangrove-plan" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "13px", padding: "6px 12px", borderRadius: "6px" }}>National Plan</a>
            <a href="/dashboard/mangrove-plan/county" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "13px", padding: "6px 12px", borderRadius: "6px" }}>Counties</a>
            <a href="/dashboard/mangrove-plan/carbon" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "13px", padding: "6px 12px", borderRadius: "6px" }}>Blue Carbon</a>
            <a href="/dashboard/mangrove-plan/threats" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "13px", padding: "6px 12px", borderRadius: "6px" }}>Threats</a>
          </div>
          <a href="/contact" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "13px", padding: "6px 12px", borderRadius: "6px" }}>
            Contact Us
          </a>
        </nav>
        <div style={{ paddingTop: "52px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}