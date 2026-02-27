export default function StatusBadge({ status }) {
  const STATUS_COLORS = {
    Ready: "#008000",        // green
    Failed: "#dc2626",       // red
    Provisioning: "#3b82f6", // blue
    Bootstrapping: "#6366f1", // indigo
    Finalizing: "#0ea5e9",   // cyan
    Orphaned: "#7f1d1d",     // dark red
    Deleting: "#7c3aed",     // purple
  };

  const color = STATUS_COLORS[status] || "#f59e0b"; // default orange

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 12,
        background: color,
        color: "white",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}


