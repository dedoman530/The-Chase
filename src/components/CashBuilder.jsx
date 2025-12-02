import { useEffect, useState } from "react";
import PauseModal from "./PauseModal";

const INITIAL_TIME = 60;

export default function CashBuilder({ team, onFinish, onExit }) {
  const [time, setTime] = useState(INITIAL_TIME);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [hitPings, setHitPings] = useState([]);
  const [missPings, setMissPings] = useState([]);

  const cash = correctCount * 100;

  useEffect(() => {
    if (time <= 0 || isPaused) return;
    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [time, isPaused]);

  useEffect(() => {
    if (time <= 0) {
      onFinish({
        correct: correctCount,
        incorrect: incorrectCount,
        score: cash,
      });
    }
  }, [time, correctCount, incorrectCount, cash, onFinish]);

  useEffect(() => {
    if (time <= 0 || isPaused) return;
    function handleKeyPress(e) {
      if (e.key === "=" || e.key === "+") handleCorrect();
      if (e.key === "-") handleIncorrect();
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [time, isPaused]);

  function openPause() {
    if (time <= 0) return;
    setIsPaused(true);
    setShowPauseModal(true);
  }

  function handleResume() {
    setShowPauseModal(false);
    setIsPaused(false);
  }

  function handleRestart() {
    setTime(INITIAL_TIME);
    setCorrectCount(0);
    setIncorrectCount(0);
    setHitPings([]);
    setMissPings([]);
    setShowPauseModal(false);
    setIsPaused(false);
  }

  function handleExit() {
    setShowPauseModal(false);
    setIsPaused(false);
    onExit();
  }

  function handleCorrect() {
    setCorrectCount((c) => c + 1);
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setHitPings((pings) => [...pings, id]);
    setTimeout(() => {
      setHitPings((pings) => pings.filter((pingId) => pingId !== id));
    }, 700);
  }

  function handleIncorrect() {
    setIncorrectCount((i) => i + 1);
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setMissPings((pings) => [...pings, id]);
    setTimeout(() => {
      setMissPings((pings) => pings.filter((pingId) => pingId !== id));
    }, 700);
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "24px",
        background: "#0c1c2e",
        color: "#e8f1ff",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <button
        onClick={openPause}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          background: "rgba(255, 255, 255, 0.08)",
          color: "#e8f1ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 18px rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(8px)",
        }}
        aria-label="Pause cash builder"
      >
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              display: "block",
              width: "6px",
              height: "18px",
              background: "currentColor",
              borderRadius: "2px",
            }}
          />
          <span
            style={{
              display: "block",
              width: "6px",
              height: "18px",
              background: "currentColor",
              borderRadius: "2px",
            }}
          />
        </div>
      </button>

      <h1 style={{ fontSize: "44px", marginBottom: "12px" }}>
        {team.name} — Cash Builder
      </h1>
      <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
        <h2 style={{ fontSize: "28px", margin: 0 }}>
          Time Left: {time.toString().padStart(2, "0")}s
        </h2>
        <h2 style={{ fontSize: "28px", margin: 0 }}>Cash: ${cash}</h2>
        {isPaused && (
          <span
            style={{
              padding: "6px 12px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "10px",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            Paused
          </span>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          top: "84px",
          left: "24px",
          display: "flex",
          gap: "12px",
          pointerEvents: "none",
        }}
      >
        <div>
          {hitPings.map((id) => (
            <span
              key={id}
              style={{
                display: "inline-block",
                color: "#5fe6a8",
                fontSize: "26px",
                fontWeight: 700,
                animation: "scorePop 700ms ease-out forwards",
              }}
            >
              +$100
            </span>
          ))}
        </div>
        <div>
          {missPings.map((id) => (
            <span
              key={id}
              style={{
                display: "inline-block",
                color: "#f05a5a",
                fontSize: "26px",
                fontWeight: 700,
                animation: "scorePop 700ms ease-out forwards",
              }}
            >
              -1
            </span>
          ))}
        </div>
      </div>

      <PauseModal
        open={showPauseModal}
        phase="cash"
        title="Cash Builder Paused"
        message="Pick what you want to do with this run."
        onResume={handleResume}
        onRestart={handleRestart}
        onExit={handleExit}
      />
      <style>
        {`
          @keyframes scorePop {
            0% { opacity: 0; transform: translateY(8px) scale(0.9); }
            20% { opacity: 1; transform: translateY(0) scale(1); }
            70% { opacity: 1; transform: translateY(-10px) scale(1); }
            100% { opacity: 0; transform: translateY(-18px) scale(0.96); }
          }
        `}
      </style>
    </div>
  );
}
