import { useState } from "react";

export default function TeamSetup({ onSubmit }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim() !== "") {
      onSubmit(name);
      setName("");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>What's your team's name?</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter here..."
      />
      <button type="submit">Enter</button>
    </form>
  );
}
