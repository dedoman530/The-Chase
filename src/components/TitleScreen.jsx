export default function TitleScreen({ onPlay }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0c1c2e",
        color: "#e8f1ff",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          padding: "32px 36px",
          textAlign: "center",
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35)",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "48px", margin: "0 0 16px" }}>The Chase</h1>
        <button
          onClick={onPlay}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "#123253",
            color: "#e8f1ff",
            cursor: "pointer",
            fontSize: "18px",
            width: "100%",
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
