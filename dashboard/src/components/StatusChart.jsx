import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StatusChart({ stores }) {
  const data = [
    { name: "Ready", count: stores.filter(s => s.status === "Ready").length },
    { name: "Provisioning", count: stores.filter(s => s.status === "Provisioning").length },
    { name: "Failed", count: stores.filter(s => s.status === "Failed").length },
  ];

  return (
    <div className="chart-card">
      <h3>Store Status Overview</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
