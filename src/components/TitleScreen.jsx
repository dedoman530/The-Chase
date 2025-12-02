export default function TitleScreen({ onPlay }) {
  return (
    <div>
      <h1>The Chase</h1>
      <button onClick={onPlay}>Play</button>
    </div>
  );
}
