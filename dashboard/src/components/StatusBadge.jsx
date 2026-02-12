export default function StatusBadge({ status }) {
  const color =
    status === "Ready"
      ? "green"
      : status === "Failed"
      ? "red"
      : "orange";

  return (
    <span style={{
      padding: "4px 10px",
      borderRadius: 12,
      background: color,
      color: "white",
      fontSize: 12
    }}>
      {status}
    </span>
  );
}
