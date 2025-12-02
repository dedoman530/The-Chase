import { useState } from "react";
import { createTeam } from "./utils/createTeam";
import CashBuilder from "./components/CashBuilder";
import Results from "./components/Results";
import TeamSetup from "./components/TeamSetup";
import TitleScreen from "./components/TitleScreen";

export default function App() {
  const [teams, setTeams] = useState([]);
  const [screen, setScreen] = useState("title"); // "title, "setup", "cash", "results", "end"

  function startGame() {
    setScreen("setup");
  }

  function handleCreateTeam(name) {
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
    setScreen("setup");
  }

  function handleExitCashBuilder() {
    setTeams((prev) => prev.slice(0, -1));
    setScreen("setup");
  }

  function handleEndGame() {
    setScreen("end");
  }

  const currentTeam = teams[teams.length - 1] || null;

  return (
    <div>
      {screen === "title" && <TitleScreen onPlay={startGame} />}

      {screen === "setup" && <TeamSetup onSubmit={handleCreateTeam} />}

      {screen === "cash" && currentTeam && (
        <CashBuilder
          team={currentTeam}
          onFinish={handleEndCashBuilder}
          onExit={handleExitCashBuilder}
        />
      )}

      {screen === "results" && currentTeam && (
        <Results
          team={currentTeam}
          result={currentTeam}
          onAddAnotherTeam={handleAddAnotherTeam}
          onEndGame={handleEndGame}
        />
      )}

      {screen === "end" && (
        <div>
          <h1>End of Cash Builder phase!</h1>
          {teams.map((t, i) => (
            <p key={i}>
              {t.name}: {t.score}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
