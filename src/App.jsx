import { useEffect, useState } from "react";
import { createTeam } from "./utils/createTeam";
import CashBuilder from "./components/CashBuilder";
import Results from "./components/Results";
import TeamSetup from "./components/TeamSetup";
import TitleScreen from "./components/TitleScreen";
import Intermission from "./components/Intermission";
import Chase from "./components/Chase";
import { unlockAudio } from "./audio/audioEngine";

export default function App() {
  const [teams, setTeams] = useState([]);
  const [finalRankings, setFinalRankings] = useState(null);
  const [screen, setScreen] = useState("title"); // "title, "setup", "cash", "results", "intermission", "chase"

  useEffect(() => {
    function handleUserGesture() {
      void unlockAudio();
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    }

    window.addEventListener("pointerdown", handleUserGesture);
    window.addEventListener("keydown", handleUserGesture);
    return () => {
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
  }, []);

  function startGame() {
    setScreen("setup");
  }

  function handleCreateTeam(name) {
    setFinalRankings(null);
    setTeams((prev) => [...prev, createTeam(name)]);
    setScreen("cash");
  }

  function handleEndCashBuilder(result) {
    setTeams((prev) => {
      const lastIndex = prev.length - 1;
      const updated = [...prev];
      updated[lastIndex] = {
        ...updated[lastIndex],
        score: result.score,
        correct: result.correct,
        incorrect: result.incorrect,
      };
      return updated;
    });

    setScreen("results");
  }

  function handleAddAnotherTeam() {
    setFinalRankings(null);
    setScreen("setup");
  }

  function handleExitCashBuilder() {
    setTeams((prev) => prev.slice(0, -1));
    setScreen("setup");
  }

  function handleEndGame() {
    setScreen("intermission");
  }

  function handleIntermissionNext() {
    setScreen("chase");
  }

  function handleChaseEnd(rankings) {
    setFinalRankings(rankings);
    setScreen("results");
  }

  const currentTeam = teams[teams.length - 1] || null;

  return (
    <div>
      {screen === "title" && <TitleScreen onPlay={startGame} />}

      {screen === "setup" && (
        <TeamSetup
          teams={teams}
          onSubmit={handleCreateTeam}
          onEnd={handleEndGame}
        />
      )}

      {screen === "cash" && currentTeam && (
        <CashBuilder
          team={currentTeam}
          onFinish={handleEndCashBuilder}
          onExit={handleExitCashBuilder}
        />
      )}

      {screen === "results" && (currentTeam || finalRankings) && (
        <Results
          team={currentTeam}
          result={currentTeam}
          rankings={finalRankings}
          onAddAnotherTeam={handleAddAnotherTeam}
        />
      )}

      {screen === "intermission" && (
        <Intermission onNext={handleIntermissionNext} />
      )}

      {screen === "chase" && <Chase teams={teams} onEndGame={handleChaseEnd} />}
    </div>
  );
}
