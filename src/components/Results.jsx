export default function Results({ team, result, onAddAnotherTeam, onEndGame }) {
  return (
    <div>
      <h1>{team.name} — Results</h1>

      <h2>Correct Answers: {result.correct}</h2>
      <h2>Incorrect Answers: {result.incorrect}</h2>
      <h2>Total Cash: ${result.score}</h2>

      <button onClick={onAddAnotherTeam}>Add Another Team</button>
      <button onClick={onEndGame}>End Game</button>
    </div>
  );
}
