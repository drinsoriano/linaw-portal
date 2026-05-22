import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend,
} from "recharts";

interface RadarDataPoint {
  category: string;
  score: number;
  benchmark: number;
}

interface CategoryRadarChartProps {
  data: RadarDataPoint[];
  height?: number;
}

export function CategoryRadarChart({ data, height = 300 }: CategoryRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          tickCount={6}
        />
        <Radar
          name="Benchmark (4.21)"
          dataKey="benchmark"
          stroke="#16a34a"
          fill="#16a34a"
          fillOpacity={0.08}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <Radar
          name="Compliance Score"
          dataKey="score"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
