import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { ChangeRecord } from "@/models/types";

interface Props {
  history: ChangeRecord[];
  loading: boolean;
}

const HistoryChart = ({ history, loading }: Props) => {
  if (loading) return <p className="loading">Loading history…</p>;
  if (!history.length) return null;

  // Show last 60 months by default for readability
  const data = history.slice(-60);

  return (
    <section aria-label="Historical changes over time">
      <h2>Amendments Over Time</h2>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11 }}
            interval={Math.floor(data.length / 8)}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="amendmentCount"
            name="Amendments"
            stroke="#1a56db"
            fill="#dbeafe"
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
};

export default HistoryChart;
