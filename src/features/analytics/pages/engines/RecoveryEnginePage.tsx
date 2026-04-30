import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AnalyticsShell } from "../../components/AnalyticsShell";
import { KpiCard } from "../../components/KpiCard";
import {
  SectionCard,
  chartTooltipStyle,
  axisTick,
} from "../../components/SectionCard";
import {
  type Period,
  recoveryCategories,
  recoverySplit,
  recoveryLog,
} from "../../lib/mockData";
import { formatCurrency, cn } from "../../../../utils";
const SEVERITY_BADGE: Record<string, string> = {
  Low: "bg-surface-3 text-muted border-brand-border",
  Medium: "bg-note-bg text-note-text border-note-border",
  High: "bg-[#0E1013] text-white border-[#0E1013]",
};
const STATUS_BADGE: Record<string, string> = {
  Resolved: "bg-brand-blue-50 text-brand-blue border-brand-blue-light",
  Escalated: "bg-[#0E1013] text-white border-[#0E1013]",
  "In review": "bg-surface-3 text-muted border-brand-border",
};
export function RecoveryEnginePage() {
  const [period, setPeriod] = useState<Period>("30d");
  const totalSplit = recoverySplit.reduce((s, x) => s + x.value, 0);
  return (
    <AnalyticsShell
      eyebrow="AI Engine"
      title="Recovery"
      subtitle="Complaint detection, classification, and resolution."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-7 gap-3">
        {" "}
        <KpiCard
          label="Total actions"
          value="189"
          delta={-6}
          invertDelta
        />{" "}
        <KpiCard label="Complaints" value="95" delta={-9} invertDelta />{" "}
        <KpiCard label="AI replies" value="74" delta={-4} invertDelta />{" "}
        <KpiCard label="Compensations" value="32" delta={2} />{" "}
        <KpiCard label="Escalations" value="55" delta={-12} invertDelta />{" "}
        <KpiCard
          label="Avg resolution"
          value="6m 42s"
          delta={-18}
          invertDelta
          accent
        />{" "}
        <KpiCard
          label="Connects spent"
          value="1,890"
          delta={-3}
          invertDelta
        />{" "}
      </div>{" "}
      <div className="grid grid-cols-2 gap-5">
        {" "}
        <SectionCard
          title="Complaints by category"
          subtitle="Where guest pain comes from"
        >
          {" "}
          <ResponsiveContainer width="100%" height={260}>
            {" "}
            <BarChart
              data={recoveryCategories}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              {" "}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F4F5F7"
                horizontal={false}
              />{" "}
              <XAxis
                type="number"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
              />{" "}
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fontSize: 11, fill: "#5C6370" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />{" "}
              <Tooltip {...chartTooltipStyle} />{" "}
              <Bar
                dataKey="count"
                fill="#2355A7"
                radius={[0, 6, 6, 0]}
                barSize={18}
              />{" "}
            </BarChart>{" "}
          </ResponsiveContainer>{" "}
        </SectionCard>{" "}
        <SectionCard
          title="AI resolved vs Escalated"
          subtitle="Recovery handoff ratio"
        >
          {" "}
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            {" "}
            <ResponsiveContainer width="100%" height={220}>
              {" "}
              <PieChart>
                {" "}
                <Pie
                  data={recoverySplit}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {" "}
                  {recoverySplit.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}{" "}
                </Pie>{" "}
                <Tooltip {...chartTooltipStyle} />{" "}
              </PieChart>{" "}
            </ResponsiveContainer>{" "}
            <div className="space-y-3">
              {" "}
              {recoverySplit.map((s) => {
                const pct = ((s.value / totalSplit) * 100).toFixed(1);
                return (
                  <div key={s.label}>
                    {" "}
                    <div className="flex items-center gap-2 mb-1">
                      {" "}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />{" "}
                      <span className="text-[11px] text-muted">
                        {s.label}
                      </span>{" "}
                    </div>{" "}
                    <p className="text-[16px] font-semibold text-strong tabular-nums leading-none">
                      {" "}
                      {pct}
                      <span className="text-[11px] text-subtle">%</span>{" "}
                    </p>{" "}
                    <p className="text-[10px] text-subtle mt-1 tabular-nums">
                      {s.value} cases
                    </p>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </SectionCard>{" "}
      </div>{" "}
      <SectionCard title="Complaint log">
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              {[
                "Date",
                "Guest",
                "Category",
                "Severity",
                "Status",
                "Compensation",
                "Conn.",
              ].map((h, i) => (
                <th
                  key={h}
                  className={`py-2.5 text-[10px] font-semibold text-subtle ${i >= 5 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {recoveryLog.map((r, i) => (
              <tr key={i} className="hover:bg-surface-2 transition-colors">
                {" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums">
                  {r.date}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong font-medium">
                  {r.guest}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{r.category}</td>{" "}
                <td className="py-2.5">
                  {" "}
                  <span
                    className={cn(
                      "inline-flex h-5 px-2 items-center rounded-full text-[10px] font-semibold border",
                      SEVERITY_BADGE[r.severity],
                    )}
                  >
                    {" "}
                    {r.severity}{" "}
                  </span>{" "}
                </td>{" "}
                <td className="py-2.5">
                  {" "}
                  <span
                    className={cn(
                      "inline-flex h-5 px-2 items-center rounded-full text-[10px] font-semibold border",
                      STATUS_BADGE[r.status],
                    )}
                  >
                    {" "}
                    {r.status}{" "}
                  </span>{" "}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                  {" "}
                  {r.compensation > 0 ? (
                    formatCurrency(r.compensation)
                  ) : (
                    <span className="text-faint">—</span>
                  )}{" "}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                  {r.connects}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
