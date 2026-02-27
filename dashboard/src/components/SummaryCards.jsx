export default function SummaryCards({ stores }) {
  const total = stores.length;
  const ready = stores.filter(s => s.status === "Ready").length;
  const provisioning = stores.filter(s => s.status === "Provisioning").length;
  const failed = stores.filter(s => s.status === "Failed").length;

  const health =
    total === 0 ? 100 : Math.round((ready / total) * 100);

  const Card = ({ label, value, color, className = "" }) => (
    <div className={`card ${className}`}>
      <span className="card-label">{label}</span>
      <h2 style={{ color }}>{value}</h2>
    </div>
  );

  return (
    <div className="card-grid">
      <Card label="Total Stores" value={total} color="#111" />
      <Card label="Ready" value={ready} color="#16a34a" />
      <Card label="Provisioning" value={provisioning} color="#f59e0b" />
      <Card label="Failed" value={failed} color="#dc2626" />
      <Card label="Orphaned" value={stores.filter(s => s.status === "Orphaned").length} color="#4d0b0b" />
      <Card label="Platform Health" value={`${health}%`} color="#2563eb" />
    </div>
  );
}
