import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #0D1F4E, #1A3066)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F0D89A",
          fontWeight: 700,
          fontSize: 18,
          fontFamily: "serif",
          letterSpacing: -1,
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
