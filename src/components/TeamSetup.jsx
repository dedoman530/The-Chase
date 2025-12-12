import { useState } from "react";

export default function TeamSetup({ teams = [], onSubmit, onEnd }) {
  const [name, setName] = useState("");
  const hasTeams = teams && teams.length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim() !== "") {
      onSubmit(name);
      setName("");
    }
  }

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
        paddingBottom: "140px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          padding: "28px 32px",
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35)",
          width: "min(520px, 100%)",
          display: "grid",
          gap: "14px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "28px" }}>
          What's your team's name?
        </h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter here..."
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.08)",
            color: "#e8f1ff",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "#123253",
            color: "#e8f1ff",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Play
        </button>
      </form>

      <button
        type="button"
        onClick={onEnd}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "110px",
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          background: "#5f1b1b",
          color: "#e8f1ff",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 700,
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.4)",
          zIndex: 2,
        }}
      >
        End
      </button>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(6, 14, 24, 0.85)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.45)",
          padding: "14px 24px",
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          backdropFilter: "blur(10px)",
          minHeight: "120px",
          alignItems: "center",
        }}
      >
        {hasTeams &&
          teams.map((team) => (
            <div
              key={team.name}
              style={{
                minWidth: "180px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  marginBottom: "6px",
                  letterSpacing: "0.02em",
                }}
              >
                {team.name}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>
                ${team.score ?? 0}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
