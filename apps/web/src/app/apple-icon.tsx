import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleTouchIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #0D1F4E, #1A3066)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <div style={{ color: "#F0D89A", fontWeight: 700, fontSize: 80, fontFamily: "serif", lineHeight: 1 }}>
          C
        </div>
        <div style={{ color: "rgba(240,216,154,0.7)", fontSize: 20, fontWeight: 600, letterSpacing: 2 }}>
          CWAY
        </div>
      </div>
    ),
    { ...size }
  );
}
