import { useEffect, useRef, useState } from "react";
import chaserTheme from "../assets/audio/Chaser_Theme.mp3";
import { playSfx, preloadSounds, stopSource } from "../audio/audioEngine";

export default function Intermission({ onNext }) {
  const [shocked, setShocked] = useState(false);
  const audioRef = useRef(null);
  const CHASER_KEY = "intermission-chaser";

  useEffect(() => {
    if (!shocked) return undefined;

    void preloadSounds([{ key: CHASER_KEY, url: chaserTheme }]);
    void playSfx(CHASER_KEY, chaserTheme, { volume: 0.5 }).then((node) => {
      audioRef.current = node?.source || null;
    });

    return () => {
      if (audioRef.current) {
        stopSource(audioRef.current);
        audioRef.current = null;
      }
    };
  }, [shocked]);

  function stopAudio() {
    if (!audioRef.current) return;
    stopSource(audioRef.current);
    audioRef.current = null;
  }

  function handleClick() {
    if (!shocked) {
      setShocked(true);
      return;
    }
    stopAudio();
    onNext();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0c1c2e",
        color: "#e8f1ff",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          padding: "36px 40px",
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35)",
          width: "min(600px, 100%)",
          textAlign: "center",
          fontSize: shocked ? "64px" : "28px",
          lineHeight: 1.4,
        }}
      >
        {shocked ? "😱😱😱" : "End of Cash Builder phase!"}
      </div>

      <button
        onClick={handleClick}
        style={{
          position: "absolute",
          bottom: "24px",
          right: "24px",
          padding: "12px 18px",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          background: "#123253",
          color: "#e8f1ff",
          cursor: "pointer",
          fontSize: "16px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
        }}
      >
        Next
      </button>
    </div>
  );
}
