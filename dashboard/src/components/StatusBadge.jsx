export default function StatusBadge({ status }) {
  const STATUS_COLORS = {
    Ready: "#008000",        // green
    Failed: "#dc2626",       // red
    Provisioning: "#3b82f6", // light blue
    Orphaned: "#4d0b0b",     // danger / dark red
    Deleting: "#7c3aed",     // optional
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