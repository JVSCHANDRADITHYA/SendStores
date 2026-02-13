import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer
} from "recharts";

const fetchMetrics = async (storeId) => {
  const res = await fetch(`http://localhost:4000/stores/${storeId}/metrics`);
  return res.json();
};

const bucketize = (timestamps, windowMs = 5 * 60 * 1000) => {
  const buckets = {};
  timestamps.forEach(ts => {
    const bucket = Math.floor(ts / windowMs) * windowMs;
    buckets[bucket] = (buckets[bucket] || 0) + 1;
  });

  return Object.entries(buckets).map(([time, value]) => ({
    time: new Date(Number(time)).toLocaleTimeString(),
    value,
  }));
};

export default function StoreMetrics({ storeId }) {
  const { data } = useQuery({
    queryKey: ["metrics", storeId],
    queryFn: () => fetchMetrics(storeId),
    refetchInterval: 5000,
  });

  if (!data) return null;

  const requestData = bucketize(data.requests);
  const errorData = bucketize(data.errors);

  return (
    <div className="chart-grid">
      <div className="chart-card">
        <h4>Requests / 5 min</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={requestData}>
            <Line dataKey="value" stroke="#4f46e5" />
            <XAxis dataKey="time" />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h4>Error Rate</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={errorData}>
            <Line dataKey="value" stroke="#dc2626" />
            <XAxis dataKey="time" />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
