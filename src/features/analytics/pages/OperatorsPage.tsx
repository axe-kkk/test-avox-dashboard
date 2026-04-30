import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Star } from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { AnalyticsShell } from "../components/AnalyticsShell";
import { KpiCard } from "../components/KpiCard";
import {
  SectionCard,
  chartTooltipStyle,
  axisTick,
} from "../components/SectionCard";
import { Select } from "../components/Select";
import { type Period, operators, operatorsDaily } from "../lib/mockData";
import { cn } from "../../../utils";
export function OperatorsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [opFilter, setOpFilter] = useState<string>("all");
  const visibleOps =
    opFilter === "all" ? operators : operators.filter((o) => o.id === opFilter);
  return (
    <AnalyticsShell
      eyebrow="Team"
      title="Operator performance"
      subtitle="Productivity and quality of service per team member."
      period={period}
      onPeriodChange={setPeriod}
      rightSlot={
        <Select
          prefix="Operator"
          value={opFilter}
          align="right"
          width={220}
          options={[
            { value: "all", label: "All operators" },
            ...operators.map((o) => ({ value: o.id, label: o.name })),
          ]}
          onChange={setOpFilter}
        />
      }
    >
      {" "}
      <div className="grid grid-cols-5 gap-3">
        {" "}
        <KpiCard label="Total conversations" value="2,408" delta={9} />{" "}
        <KpiCard label="Active today" value="94" delta={4} />{" "}
        <KpiCard label="Avg per day" value="12.4" delta={6} />{" "}
        <KpiCard
          label="Avg response time"
          value="58s"
          delta={-12}
          invertDelta
          accent
        />{" "}
        <KpiCard label="Avg CSAT" value="4.6" delta={3} />{" "}
      </div>{" "}
      <SectionCard
        title="Conversations by day"
        subtitle="Direct vs escalated from AI · plus average response time"
      >
        {" "}
        <ResponsiveContainer width="100%" height={260}>
          {" "}
          <LineChart
            data={operatorsDaily}
            margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
          >
            {" "}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F4F5F7"
              vertical={false}
            />{" "}
            <XAxis
              dataKey="date"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />{" "}
            <YAxis
              yAxisId="left"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={32}
            />{" "}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={32}
              tickFormatter={(v) => `${v}s`}
            />{" "}
            <Tooltip {...chartTooltipStyle} />{" "}
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#5C6370" }}
              iconSize={8}
              iconType="circle"
            />{" "}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ai"
              name="From AI"
              stroke="#2355A7"
              strokeWidth={2}
              dot={false}
            />{" "}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="direct"
              name="Direct"
              stroke="#0E1013"
              strokeWidth={2}
              dot={false}
            />{" "}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="response"
              name="Avg response (s)"
              stroke="#BED4F6"
              strokeWidth={2.5}
              dot={{ fill: "#BED4F6", r: 3 }}
            />{" "}
          </LineChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <SectionCard title="Operator roster">
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              {[
                "Operator",
                "Status",
                "Handled",
                "Open",
                "Avg response",
                "Avg resolution",
                "CSAT",
              ].map((h, i) => (
                <th
                  key={h}
                  className={`py-2.5 text-[10px] font-semibold text-subtle ${i < 2 ? "text-left" : "text-right"}`}
                >
                  {h}
                </th>
              ))}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {visibleOps.map((o) => (
              <tr key={o.id} className="hover:bg-surface-2 transition-colors">
                {" "}
                <td className="py-2.5">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <Avatar name={o.name} size="sm" />{" "}
                    <span className="text-[12px] text-strong font-medium">
                      {o.name}
                    </span>{" "}
                  </div>{" "}
                </td>{" "}
                <td className="py-2.5">
                  {" "}
                  <div className="inline-flex items-center gap-1.5">
                    {" "}
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        o.status === "online"
                          ? "bg-brand-blue"
                          : "bg-[#C4C8CF]",
                      )}
                    />{" "}
                    <span
                      className={cn(
                        "text-[11px] capitalize",
                        o.status === "online"
                          ? "text-brand-blue font-semibold"
                          : "text-subtle",
                      )}
                    >
                      {" "}
                      {o.status}{" "}
                    </span>{" "}
                  </div>{" "}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong tabular-nums text-right">
                  {o.handled.toLocaleString()}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">
                  {o.open}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">
                  {o.response}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">
                  {o.resolution}
                </td>{" "}
                <td className="py-2.5 text-right">
                  {" "}
                  <span className="inline-flex items-center gap-1 text-[12px] text-strong font-semibold tabular-nums">
                    {" "}
                    <Star className="w-3 h-3 fill-brand-blue text-brand-blue" />{" "}
                    {o.csat}{" "}
                  </span>{" "}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
