import { useEffect, useRef } from "react";
import applause from "../assets/audio/applause.mp3";
import { playSfx, preloadSounds, stopSource } from "../audio/audioEngine";

export default function Results({ team, result, rankings = [], onAddAnotherTeam }) {
  const applauseRef = useRef(null);
  const showRankings = rankings && rankings.length > 0;
  const APPLAUSE_KEY = "results-applause";

  useEffect(() => {
    void preloadSounds([{ key: APPLAUSE_KEY, url: applause }]);
    void playSfx(APPLAUSE_KEY, applause, { volume: 0.5 }).then((node) => {
      applauseRef.current = node?.source || null;
    });
    return () => {
      if (applauseRef.current) {
        stopSource(applauseRef.current);
        applauseRef.current = null;
      }
    };
  }, []);

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
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35)",
          width: "min(540px, 100%)",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 16px", fontSize: "32px" }}>
          {showRankings ? "Final Results" : `Results - ${team?.name || ""}`}
        </h1>

        {showRankings ? (
          <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
            {rankings.map((entry, idx) => (
              <div
                key={`${entry.name}-${idx}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  background: "rgba(255, 255, 255, 0.04)",
                  fontSize: "18px",
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  #{idx + 1} {entry.name}
                </span>
                <span style={{ opacity: 0.8 }}>
                  {entry.position >= 11 ? "Reached finish" : `Space: ${entry.position}`}
                  {entry.eliminated ? " (eliminated)" : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "8px",
              marginBottom: "20px",
              fontSize: "20px",
            }}
          >
            <span>Correct Answers: {result?.correct ?? 0}</span>
            <span>Incorrect Answers: {result?.incorrect ?? 0}</span>
            <span>Cash Earned: ${result?.score ?? 0}</span>
          </div>
        )}

        {!showRankings && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={onAddAnotherTeam}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "#123253",
                color: "#e8f1ff",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Add Another Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
