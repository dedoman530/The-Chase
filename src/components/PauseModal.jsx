export default function PauseModal({
  open,
  phase = "cash",
  title = "PAUSED",
  onResume,
  onRestart,
  onExit,
  actions,
}) {
  if (!open) return null;

  const phaseActions =
    actions ||
    [
      { label: "Restart", onClick: onRestart, variant: "primary" },
      { label: "Exit", onClick: onExit, variant: "danger" },
      { label: "Resume", onClick: onResume, variant: "ghost" },
    ].filter((a) => a.onClick);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "min(480px, 90vw)",
          background: "#0e2238",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
          padding: "24px",
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          color: "#e8f1ff",
        }}
      >
        <h2
          style={{ fontSize: "26px", margin: "0 0 12px", textAlign: "center" }}
        >
          {title || `${phase} paused`}
        </h2>
        <div
          style={{
            display: "grid",
            gap: "10px",
          }}
        >
          {phaseActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: buttonBorder(action.variant),
                background: buttonBg(action.variant),
                color: buttonColor(action.variant),
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: action.variant === "danger" ? 600 : 500,
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function buttonBg(variant) {
  if (variant === "danger") return "#f05a5a";
  if (variant === "ghost") return "rgba(255, 255, 255, 0.12)";
  return "#123253";
}

function buttonBorder(variant) {
  if (variant === "danger") return "1px solid rgba(255, 255, 255, 0.25)";
  return "1px solid rgba(255, 255, 255, 0.2)";
}

function buttonColor(variant) {
  if (variant === "danger") return "#fff";
  return "#e8f1ff";
}
