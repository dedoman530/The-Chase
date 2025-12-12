import { useEffect, useRef, useState } from "react";
import PauseModal from "./PauseModal";
import music from "../assets/audio/cashBuilderTheme.mp3";
import finishSound from "../assets/audio/Finish.mp3";
import countdownSound from "../assets/audio/Countdown.mp3";
import correctSound from "../assets/audio/Points.mp3";
import oofSound from "../assets/audio/oof.mp3";

const INITIAL_TIME_MS = 60000;

export default function CashBuilder({ team, onFinish, onExit }) {
  const [timeMs, setTimeMs] = useState(INITIAL_TIME_MS);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [hitPings, setHitPings] = useState([]);
  const [missPings, setMissPings] = useState([]);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [countdownValue, setCountdownValue] = useState(3);
  const [showFinishOverlay, setShowFinishOverlay] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const audioRef = useRef(null);
  const countdownAudioRef = useRef(null);
  const finishAudioRef = useRef(null);
  const finishTimeoutRef = useRef(null);
  const correctAudioRef = useRef(null);
  const incorrectAudioRef = useRef(null);

  const cash = correctCount * 100;
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  useEffect(() => {
    const audio = new Audio(music);
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPaused || timeMs <= 0 || isCountingDown) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [isPaused, timeMs, isCountingDown]);

  useEffect(() => {
    if (!isCountingDown) return;
    setCountdownValue(3);
    const countdownAudio = new Audio(countdownSound);
    countdownAudioRef.current = countdownAudio;
    countdownAudio.volume = 0.2;
    countdownAudio.play().catch(() => {});

    const interval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [isCountingDown]);

  useEffect(() => {
    if (timeMs <= 0 || isPaused || isCountingDown) return;
    const timer = setInterval(() => {
      setTimeMs((t) => Math.max(0, t - 100));
    }, 100);
    return () => clearInterval(timer);
  }, [timeMs, isPaused, isCountingDown]);

  useEffect(() => {
    if (timeMs > 0 || hasFinished) return;
    setHasFinished(true);
    setShowFinishOverlay(true);
    if (audioRef.current) audioRef.current.pause();
    const finishAudio = new Audio(finishSound);
    finishAudio.volume = 0.5;
    finishAudioRef.current = finishAudio;
    finishAudio.play().catch(() => {});
    finishTimeoutRef.current = setTimeout(() => {
      setShowFinishOverlay(false);
      onFinish({
        correct: correctCount,
        incorrect: incorrectCount,
        score: cash,
      });
    }, 2000);
  }, [timeMs, hasFinished, correctCount, incorrectCount, cash, onFinish]);

  useEffect(() => {
    if (timeMs <= 0 || isPaused || isCountingDown) return;
    function handleKeyPress(e) {
      if (e.key === "=" || e.key === "+") handleCorrect();
      if (e.key === "-") handleIncorrect();
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [timeMs, isPaused, isCountingDown]);

  function openPause() {
    if (timeMs <= 0 || isCountingDown) return;
    setIsPaused(true);
    setShowPauseModal(true);
  }

  function handleResume() {
    setShowPauseModal(false);
    setIsPaused(false);
  }

  function handleRestart() {
    clearFinishEffects();
    setTimeMs(INITIAL_TIME_MS);
    setCorrectCount(0);
    setIncorrectCount(0);
    setHitPings([]);
    setMissPings([]);
    setShowPauseModal(false);
    setIsPaused(false);
    setCountdownValue(3);
    setIsCountingDown(true);
    resetAudio(true);
  }

  function handleExit() {
    setShowPauseModal(false);
    setIsPaused(true);
    clearFinishEffects();
    resetAudio(false);
    onExit();
  }

  function handleSkipRound() {
    setShowPauseModal(false);
    setIsPaused(false);
    setTimeMs(0);
  }

  function handleCorrect() {
    setCorrectCount((c) => c + 1);
    if (!correctAudioRef.current) {
      correctAudioRef.current = new Audio(correctSound);
      correctAudioRef.current.volume = 0.5;
    }
    correctAudioRef.current.currentTime = 0;
    correctAudioRef.current.play().catch(() => {});
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    setHitPings((pings) => [...pings, id]);
    setTimeout(() => {
      setHitPings((pings) => pings.filter((pingId) => pingId !== id));
    }, 700);
  }

  function handleIncorrect() {
    setIncorrectCount((i) => i + 1);
    playIncorrectSound();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    setMissPings((pings) => [...pings, id]);
    setTimeout(() => {
      setMissPings((pings) => pings.filter((pingId) => pingId !== id));
    }, 700);
  }

  function resetAudio(shouldPlay) {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    if (shouldPlay && !isCountingDown) {
      audioRef.current.play().catch(() => {});
    }
  }

  function playIncorrectSound() {
    if (!incorrectAudioRef.current) {
      incorrectAudioRef.current = new Audio(oofSound);
      incorrectAudioRef.current.volume = 0.5;
    }
    const base = incorrectAudioRef.current;
    base.currentTime = 0;
    base.play().catch(() => {});
    const extra = new Audio(oofSound);
    extra.volume = 0.5;
    extra.play().catch(() => {});
  }

  function clearFinishEffects() {
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    finishTimeoutRef.current = null;
    if (finishAudioRef.current) finishAudioRef.current.pause();
    finishAudioRef.current = null;
    setShowFinishOverlay(false);
    setHasFinished(false);
  }

  useEffect(() => {
    return () => {
      clearFinishEffects();
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const showMain = !isCountingDown && !showFinishOverlay;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "24px",
        background: "#0c1c2e",
        color: "#e8f1ff",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <button
        onClick={openPause}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
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

      {showMain && (
        <>
          <div
            style={{
              width: "min(960px, 100%)",
              textAlign: "center",
              paddingTop: "4px",
            }}
          >
            <h1
              style={{
                fontSize: "18px",
                marginBottom: "12px",
                letterSpacing: "0.5px",
              }}
            >
              {team.name} — Cash Builder
            </h1>
          </div>

          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "min(960px, 100%)",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "18px 32px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(8px)",
                  width: "min(90vw, 560px)",
                  position: "relative",
                  overflow: "hidden",
                  animation: isShaking ? "pillShake 500ms ease-in-out" : "none",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "63px",
                      margin: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formattedTime}
                  </h2>
                </div>
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "2px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.35)",
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "63px",
                      margin: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    ${cash}
                  </h2>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "-48px",
                  left: "50%",
                  transform: "translateX(-50%)",
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
            </div>
          </div>
        </>
      )}

      <PauseModal
        open={showPauseModal}
        phase="cash"
        title="PAUSED"
        actions={[
          { label: "Restart", onClick: handleRestart, variant: "primary" },
          { label: "Skip", onClick: handleSkipRound, variant: "danger" },
          { label: "Exit", onClick: handleExit, variant: "danger" },
          { label: "Resume", onClick: handleResume, variant: "ghost" },
        ]}
      />

      {isCountingDown && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 15,
          }}
        >
          <span
            style={{
              fontSize: "96px",
              fontWeight: 800,
              letterSpacing: "2px",
              color: "#e8f1ff",
              textShadow: "0 12px 35px rgba(0,0,0,0.45)",
            }}
          >
            {countdownValue}
          </span>
        </div>
      )}

      {showFinishOverlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            zIndex: 16,
          }}
        >
          <span
            style={{
              fontSize: "88px",
              fontWeight: 800,
              letterSpacing: "3px",
              background: "linear-gradient(135deg, #f9d65c, #f28a2e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "2px #4338ca",
              textShadow: "0 16px 40px rgba(0,0,0,0.6)",
            }}
          >
            FINISH!
          </span>
        </div>
      )}
      <style>
        {`
          @keyframes scorePop {
            0% { opacity: 0; transform: translateY(8px) scale(0.9); }
            20% { opacity: 1; transform: translateY(0) scale(1); }
            70% { opacity: 1; transform: translateY(-10px) scale(1); }
            100% { opacity: 0; transform: translateY(-18px) scale(0.96); }
          }
          @keyframes pillShake {
            0% { transform: translateX(0); }
            15% { transform: translateX(-6px); }
            30% { transform: translateX(6px); }
            45% { transform: translateX(-5px); }
            60% { transform: translateX(4px); }
            75% { transform: translateX(-3px); }
            90% { transform: translateX(2px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}
