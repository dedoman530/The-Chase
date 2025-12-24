import { useEffect, useRef, useState } from "react";
import { QUESTIONS } from "../data/chaseQuestions";
import track01 from "../assets/audio/01 - Sonic Mania.mp3";
import track02 from "../assets/audio/02 - Ace Attorney.mp3";
import track03 from "../assets/audio/03 - Cynthia.mp3";
import track04 from "../assets/audio/04 - FD.mp3";
import track05 from "../assets/audio/05 - Hooktail.mp3";
import track06 from "../assets/audio/06 - N.mp3";
import track07 from "../assets/audio/07 - Gym Leader.mp3";
import track08 from "../assets/audio/08 - SV.mp3";
import track09 from "../assets/audio/09 - Melee.mp3";
import track10 from "../assets/audio/10 - HoMK.mp3";
import correctSound from "../assets/audio/Correct.mp3";
import { playSfx, preloadSounds, stopSource } from "../audio/audioEngine";

function getPositionFromCash(score) {
  const spaces = 11;
  const pos = Math.floor(score / 200);
  return Math.min(spaces, pos);
}

export default function Chase({ teams, onEndGame }) {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selections, setSelections] = useState({});
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [eliminated, setEliminated] = useState({});
  const [chaserPosition, setChaserPosition] = useState(-1);
  const questionAudioRef = useRef(null);
  const QUESTION_TRACKS = [
    track01,
    track02,
    track03,
    track04,
    track05,
    track06,
    track07,
    track08,
    track09,
    track10,
  ];
  const QUESTION_KEYS = QUESTION_TRACKS.map((_, idx) => `chase-track-${idx}`);
  const SUBMIT_KEY = "chase-submit";
  const spaces = 11;
  const boardDocked = started;
  const gridPaddingX = boardDocked ? 40 : 70;
  const gridPaddingY = boardDocked ? 28 : 40;
  const laneSpacing = boardDocked ? 64 : 72;
  const trackWidth = boardDocked ? 360 : 800;
  const chipOffsetX = boardDocked ? 2 : 3;
  const finishWidth = 16;
  const finishLeft = gridPaddingX + trackWidth + 6; // sit just outside the 11th column
  const startWidth = 18;
  const startLeft = gridPaddingX - startWidth - 6; // sit just outside the 1st column
  const cellWidth = trackWidth / spaces;
  const startLabelLeft = gridPaddingX + cellWidth / 2;
  const [positions, setPositions] = useState(() =>
    teams.reduce((acc, team) => {
      acc[team.name] = getPositionFromCash(team.score || 0);
      return acc;
    }, {})
  );

  useEffect(() => {
    setPositions((prev) => {
      const next = { ...prev };
      teams.forEach((team) => {
        if (next[team.name] === undefined) {
          next[team.name] = getPositionFromCash(team.score || 0);
        }
      });
      return next;
    });
  }, [teams]);

  useEffect(() => {
    if (!started) return;
    setShowAnswer(false);
    setShowChoices(true);
    stopQuestionAudio();
    const track = QUESTION_TRACKS[questionIndex % QUESTION_TRACKS.length];
    if (track) {
      const key = QUESTION_KEYS[questionIndex % QUESTION_KEYS.length];
      void playSfx(key, track, { volume: 0.25 }).then((node) => {
        questionAudioRef.current = node?.source || null;
      });
    }
  }, [started, questionIndex]);

  const rowCount = Math.max(teams.length, 2);
  const gridHeight = rowCount * laneSpacing;
  const trackHeight = gridHeight + gridPaddingY * 2;
  const currentQuestion = QUESTIONS[questionIndex % QUESTIONS.length];
  const answers = currentQuestion?.answers || [];
  const letters = ["A", "B", "C", "D"];
  const activeTeams = teams.filter((team) => !eliminated[team.name]);
  const allAnswered =
    activeTeams.length > 0 &&
    activeTeams.every(
      (team) =>
        selections[team.name] !== undefined &&
        selections[team.name] >= 0 &&
        selections[team.name] < answers.length
    ) &&
    selections.chaser !== undefined &&
    selections.chaser >= 0 &&
    selections.chaser < answers.length;

  function handleStart() {
    setStarted(true);
    setQuestionIndex(0);
    setSelections({});
    setShowAnswer(false);
    setWinner(null);
    setEliminated({});
    setChaserPosition(-1);
    setGameOver(false);
  }

  function handleChoose(teamName, answerIndex) {
    if (!showChoices || showAnswer || winner) return;
    if (teamName !== "chaser" && eliminated[teamName]) return;
    setSelections((prev) => ({ ...prev, [teamName]: answerIndex }));
  }

  function advanceQuestion() {
    setSelections({});
    setShowAnswer(false);
    setGameOver(false);
    setQuestionIndex((idx) => (idx + 1) % QUESTIONS.length);
  }

  function buildRankings() {
    return teams
      .map((team, idx) => ({
        name: team.name,
        position: positions[team.name] ?? getPositionFromCash(team.score || 0),
        eliminated: !!eliminated[team.name],
        order: idx,
      }))
      .sort((a, b) => {
        if (b.position !== a.position) return b.position - a.position;
        return a.order - b.order;
      });
  }

  function handleEndGameClick() {
    if (onEndGame) {
      onEndGame(buildRankings());
    }
  }

  function stopQuestionAudio() {
    if (questionAudioRef.current) {
      stopSource(questionAudioRef.current);
      questionAudioRef.current = null;
    }
  }

  function handleSubmit() {
    if (!started || !currentQuestion || showAnswer || winner || gameOver)
      return;
    if (!allAnswered) return;
    stopQuestionAudio();
    void playSfx(SUBMIT_KEY, correctSound, { volume: 0.5 });
    const correctIndex = currentQuestion.correctIndex;
    setShowAnswer(true);
    let nextWinner = null;
    const nextPositions = { ...positions };
    activeTeams.forEach((team) => {
      const base = positions[team.name] ?? getPositionFromCash(team.score || 0);
      const bumped =
        selections[team.name] === correctIndex
          ? Math.min(spaces, base + 1)
          : base;
      nextPositions[team.name] = bumped;
    });

    const chaserCorrect = selections.chaser === correctIndex;
    const chaserNext = chaserCorrect
      ? Math.min(spaces, chaserPosition + 1)
      : chaserPosition;

    const updatedElims = { ...eliminated };
    if (chaserCorrect) {
      activeTeams.forEach((team) => {
        if (nextPositions[team.name] === chaserNext) {
          updatedElims[team.name] = true;
        }
      });
    }

    const survivorWinner = activeTeams.find(
      (team) => !updatedElims[team.name] && nextPositions[team.name] >= spaces
    );
    if (survivorWinner) {
      nextWinner = survivorWinner.name;
    }

    const allEliminatedAfter = teams.every((team) => updatedElims[team.name]);

    setPositions(nextPositions);
    setEliminated(updatedElims);
    setChaserPosition(chaserNext);

    if (nextWinner) {
      setWinner(nextWinner);
      setGameOver(true);
      return;
    }
    if (allEliminatedAfter) {
      setGameOver(true);
      return;
    }
  }

  useEffect(() => {
    void preloadSounds(
      QUESTION_TRACKS.map((track, idx) => ({
        key: QUESTION_KEYS[idx],
        url: track,
      })).concat({ key: SUBMIT_KEY, url: correctSound })
    );
    return () => {
      stopQuestionAudio();
    };
  }, []);

  const boardShellStyle = boardDocked
    ? {
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "min(520px, 60vw)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "12px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        zIndex: 8,
      }
    : {
        marginTop: "24px",
        width: "min(1000px, 95vw)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      };

  const correctIndex = currentQuestion?.correctIndex;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#0c1c2e",
        color: "#e8f1ff",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "32px",
        gap: "16px",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "34px" }}>The Chase</h1>
      {!started && (
        <p style={{ margin: 0, color: "#c7d5e5" }}>
          Each $200 moves a team 1 space. Chaser starts behind the line.
        </p>
      )}

      {!started && (
        <button
          onClick={handleStart}
          style={{
            marginTop: "12px",
            padding: "12px 18px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "#123253",
            color: "#e8f1ff",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          Start
        </button>
      )}

      {started && currentQuestion && (
        <div
          style={{
            width: "min(1000px, 95vw)",
            marginTop: "8px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "18px 20px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}
          >
            {currentQuestion.question}
          </div>
          {showAnswer && correctIndex !== undefined && (
            <div
              style={{
                marginBottom: "10px",
                color: "#5fe6a8",
                fontWeight: 700,
                animation: "revealCorrect 600ms ease-out",
              }}
            >
              Correct: {letters[correctIndex]}) {answers[correctIndex]}
            </div>
          )}
          {showChoices && (
            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              {answers.map((answer, idx) => {
                const letter = letters[idx] || "?";
                const isCorrect = showAnswer && idx === correctIndex;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: `1px solid ${
                        isCorrect
                          ? "rgba(95,230,168,0.7)"
                          : "rgba(255,255,255,0.12)"
                      }`,
                      background: isCorrect
                        ? "rgba(95,230,168,0.12)"
                        : "rgba(255,255,255,0.04)",
                      animation: isCorrect
                        ? "revealCorrect 600ms ease-out"
                        : "none",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.08)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      {letter}
                    </div>
                    <span style={{ fontSize: "16px" }}>{answer}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {winner && (
        <div
          style={{
            marginTop: "8px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "rgba(95,230,168,0.12)",
            color: "#5fe6a8",
            fontWeight: 700,
          }}
        >
          {winner} reached the finish!
        </div>
      )}

      <div style={boardShellStyle}>
        <div
          style={{
            position: "relative",
            height: `${trackHeight}px`,
            width: `${trackWidth + gridPaddingX * 2}px`,
            paddingLeft: `${gridPaddingX}px`,
            paddingRight: `${gridPaddingX}px`,
            paddingTop: `${gridPaddingY}px`,
            paddingBottom: `${gridPaddingY}px`,
          }}
        >
          {/* Start / finish background */}
          <div
            style={{
              position: "absolute",
              inset: "24px",
              borderRadius: "14px",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            }}
          />

          {/* Finish strip */}
          <div
            style={{
              position: "absolute",
              top: `${gridPaddingY}px`,
              bottom: `${gridPaddingY}px`,
              left: `${finishLeft}px`,
              width: `${finishWidth}px`,
              background:
                "repeating-linear-gradient(135deg, #5fe6a8, #5fe6a8 8px, #3ad17c 8px, #3ad17c 16px)",
              borderRadius: "8px",
              boxShadow: "0 0 12px rgba(95,230,168,0.6)",
            }}
          />

          {/* Vertical grid lines */}
          {Array.from({ length: spaces + 1 }).map((_, idx) => {
            const left = gridPaddingX + (idx / spaces) * trackWidth;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  top: `${gridPaddingY}px`,
                  bottom: `${gridPaddingY}px`,
                  left,
                  width: "1px",
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            );
          })}

          {/* Horizontal grid lines */}
          {Array.from({ length: rowCount + 1 }).map((_, idx) => {
            const top = gridPaddingY + idx * laneSpacing;
            return (
              <div
                key={`h-${idx}`}
                style={{
                  position: "absolute",
                  left: `${gridPaddingX}px`,
                  right: `${gridPaddingX}px`,
                  top,
                  height: "1px",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            );
          })}

          {/* Rows for teams */}
          {teams.map((team, row) => {
            if (eliminated[team.name]) return null;
            const teamPos =
              positions[team.name] ?? getPositionFromCash(team.score || 0);
            const maxCellIndex = spaces - 1;
            const cellIndex = Math.min(teamPos, maxCellIndex);
            const cellWidth = trackWidth / spaces;
            const isFinished = teamPos >= spaces;
            const leftPx = isFinished
              ? finishLeft + finishWidth / 2
              : gridPaddingX + (cellIndex + 0.5) * cellWidth + chipOffsetX;
            const chipCenterY = gridPaddingY + laneSpacing * (row + 0.5);
            const chipColor = colorForIndex(row);
            return (
              <div key={team.name}>
                {/* team chip */}
                <div
                  style={{
                    position: "absolute",
                    top: chipCenterY - 14,
                    left: `${leftPx}px`,
                    transform: "translateX(-50%)",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: chipColor,
                    boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
                  }}
                />
              </div>
            );
          })}

          {/* Chaser chip */}
          <div
            style={{
              position: "absolute",
              left:
                chaserPosition < 0
                  ? `${startLeft}px`
                  : `${
                      gridPaddingX +
                      (chaserPosition + 0.5) * cellWidth -
                      startWidth / 2 +
                      chipOffsetX
                    }px`,
              top: `${gridPaddingY}px`,
              bottom: `${gridPaddingY}px`,
              width: `${startWidth}px`,
              background: "#f05a5a",
              borderRadius: "10px",
              boxShadow: "0 8px 20px rgba(240,90,90,0.5)",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: `${startLabelLeft}px`,
              top: "8px",
              color: "#e8f1ff",
              transform: "translateX(-50%)",
            }}
          >
            Start
          </span>
        </div>
      </div>

      {started && (
        <div
          style={{
            position: "fixed",
            left: "24px",
            bottom: "24px",
            width: "min(520px, 75vw)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            padding: "14px",
            boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
            zIndex: 9,
          }}
        >
          <div style={{ display: "grid", gap: "10px" }}>
            {teams.map((team, row) => {
              const chipColor = colorForIndex(row);
              const isEliminated = !!eliminated[team.name];
              return (
                <div
                  key={team.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    opacity: isEliminated ? 0.4 : 1,
                  }}
                >
                  <div
                    style={{
                      minWidth: "90px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: chipColor,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      }}
                    />
                    <span>{team.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {answers.map((_, idx) => {
                      const letter = letters[idx] || "?";
                      const active = selections[team.name] === idx;
                      const disabled = showAnswer || isEliminated;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleChoose(team.name, idx)}
                          disabled={disabled}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: active
                              ? "1px solid rgba(95,230,168,0.8)"
                              : "1px solid rgba(255,255,255,0.15)",
                            background: active
                              ? "rgba(95,230,168,0.18)"
                              : "rgba(255,255,255,0.05)",
                            color: "#e8f1ff",
                            cursor: disabled ? "not-allowed" : "pointer",
                            minWidth: "46px",
                            fontWeight: 700,
                            opacity: disabled ? 0.7 : 1,
                          }}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                opacity: showAnswer ? 0.7 : 1,
              }}
            >
              <div
                style={{
                  minWidth: "90px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "#f05a5a",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                />
                <span>Chaser</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {answers.map((_, idx) => {
                  const letter = letters[idx] || "?";
                  const active = selections.chaser === idx;
                  const disabled = showAnswer;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleChoose("chaser", idx)}
                      disabled={disabled}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: active
                          ? "1px solid rgba(95,230,168,0.8)"
                          : "1px solid rgba(255,255,255,0.15)",
                        background: active
                          ? "rgba(95,230,168,0.18)"
                          : "rgba(255,255,255,0.05)",
                        color: "#e8f1ff",
                        cursor: disabled ? "not-allowed" : "pointer",
                        minWidth: "46px",
                        fontWeight: 700,
                        opacity: disabled ? 0.7 : 1,
                      }}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button
              onClick={handleSubmit}
              disabled={!showChoices || showAnswer || !allAnswered}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#123253",
                color: "#e8f1ff",
                cursor:
                  showChoices && !showAnswer && allAnswered
                    ? "pointer"
                    : "not-allowed",
                fontWeight: 700,
                opacity: showChoices && !showAnswer && allAnswered ? 1 : 0.6,
              }}
            >
              Submit
            </button>
            {!showChoices && (
              <span style={{ opacity: 0.8, fontSize: "14px" }}>
                Choices appear shortly...
              </span>
            )}
            {showAnswer && (gameOver || !winner) && (
              <button
                onClick={gameOver ? handleEndGameClick : advanceQuestion}
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#e8f1ff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {gameOver ? "End game" : "Next question"}
              </button>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes revealCorrect {
            0% { opacity: 0; transform: translateY(-6px); }
            60% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

function colorForIndex(i) {
  const colors = ["#5fe6a8", "#5ecbff", "#f1a34f", "#d76bff", "#ff6b7b"];
  return colors[i % colors.length];
}
