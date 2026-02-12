import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StoreLatencyChart({ store }) {
  if (!store.metrics) return null;

  const data = store.metrics.timestamps.map((t, i) => ({
    time: new Date(t).toLocaleTimeString(),
    latency: store.metrics.responseTimes[i],
  }));

  return (
    <div className="chart-card">
      <h4>{store.id} – Response Time (ms)</h4>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, "auto"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
