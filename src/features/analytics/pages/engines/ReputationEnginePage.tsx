import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Star } from "lucide-react";
import { AnalyticsShell } from "../../components/AnalyticsShell";
import { KpiCard } from "../../components/KpiCard";
import {
  SectionCard,
  chartTooltipStyle,
  axisTick,
} from "../../components/SectionCard";
import {
  type Period,
  reputationDaily,
  reputationActionsByType,
  reputationLog,
} from "../../lib/mockData";
import { cn } from "../../../../utils";
import { Badge } from "../../../../components/ui/Badge";

type BadgeVariant = "blueSoft" | "blue" | "blueDeep";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  auto: "blue",
  pending: "blueDeep",
  done: "blueSoft",
};
export function ReputationEnginePage() {
  const [period, setPeriod] = useState<Period>("30d");
  return (
    <AnalyticsShell
      eyebrow="AI Engine"
      title="Reputation"
      subtitle="Post-stay surveys, review platform routing, and review reply automation."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-7 gap-3">
        {" "}
        <KpiCard label="Total actions" value="412" delta={9} />{" "}
        <KpiCard label="Surveys sent" value="312" delta={4} />{" "}
        <KpiCard label="Responses" value="186" delta={11} />{" "}
        <KpiCard label="Routed to platforms" value="98" delta={14} />{" "}
        <KpiCard label="Negative replies" value="42" delta={-9} invertDelta />{" "}
        <KpiCard label="Avg score" value="4.6" delta={3} accent />{" "}
        <KpiCard label="Connects spent" value="1,648" delta={4} />{" "}
      </div>{" "}
      <SectionCard title="Average score" subtitle="Daily moving average">
        {" "}
        <ResponsiveContainer width="100%" height={220}>
          {" "}
          <LineChart
            data={reputationDaily}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
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
              domain={[3.5, 5]}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={32}
            />{" "}
            <Tooltip {...chartTooltipStyle} />{" "}
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2355A7"
              strokeWidth={2.5}
              dot={{ fill: "#2355A7", r: 3 }}
            />{" "}
          </LineChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <SectionCard title="Actions by type">
        {" "}
        <ResponsiveContainer width="100%" height={220}>
          {" "}
          <BarChart
            data={reputationActionsByType}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            {" "}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F4F5F7"
              vertical={false}
            />{" "}
            <XAxis
              dataKey="type"
              tick={{ fontSize: 11, fill: "#5C6370" }}
              axisLine={false}
              tickLine={false}
            />{" "}
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={32}
            />{" "}
            <Tooltip {...chartTooltipStyle} />{" "}
            <Bar dataKey="count" fill="#2355A7" radius={[6, 6, 0, 0]} />{" "}
          </BarChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <SectionCard title="Reviews">
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              {["Date", "Guest", "Score", "Channel", "Platform", "Reply"].map(
                (h) => (
                  <th
                    key={h}
                    className="py-2.5 text-left text-[10px] font-semibold text-subtle "
                  >
                    {h}
                  </th>
                ),
              )}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {reputationLog.map((r, i) => (
              <tr key={i} className="hover:bg-surface-2 transition-colors">
                {" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums">
                  {r.date}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong font-medium">
                  {r.guest}
                </td>{" "}
                <td className="py-2.5">
                  {" "}
                  <span className="inline-flex items-center gap-0.5">
                    {" "}
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        className={cn(
                          "w-3 h-3",
                          k < r.score
                            ? "fill-brand-blue text-brand-blue"
                            : "text-faint",
                        )}
                      />
                    ))}{" "}
                  </span>{" "}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{r.channel}</td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{r.platform}</td>{" "}
                <td className="py-2.5">
                  <Badge
                    variant={STATUS_VARIANT[r.status]}
                    className="capitalize"
                  >
                    {r.status}
                  </Badge>
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
