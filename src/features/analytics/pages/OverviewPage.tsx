import { useState } from "react";
import {
  AreaChart,
  Area,
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
import { Download } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { useApp } from "../../../app/AppContext";
import { formatCurrency } from "../../../utils";
import { AnalyticsShell } from "../components/AnalyticsShell";
import { KpiCard } from "../components/KpiCard";
import {
  SectionCard,
  chartTooltipStyle,
  axisTick,
} from "../components/SectionCard";
import {
  type Period,
  overviewActions,
  overviewByEngine,
  overviewSplit,
  overviewTopActions,
} from "../lib/mockData";
export function OverviewPage() {
  const { addToast } = useApp();
  const [period, setPeriod] = useState<Period>("30d");
  const totalSplit = overviewSplit.reduce((s, x) => s + x.value, 0);
  return (
    <AnalyticsShell
      eyebrow="General dashboard"
      title="Overview"
      subtitle="A single read-out across every AI Engine, channel, and team."
      period={period}
      onPeriodChange={setPeriod}
      rightSlot={
        <Button
          size="sm"
          variant="outline"
          className="h-10"
          onClick={() =>
            addToast({
              type: "info",
              title: "Export started",
              message: "PDF report will be ready shortly",
            })
          }
        >
          {" "}
          <Download className="w-3.5 h-3.5" /> Export{" "}
        </Button>
      }
    >
      {" "}
      {/* ── 6 KPI cards ───────────────────────────────────────── */}{" "}
      <div className="grid grid-cols-6 gap-3">
        {" "}
        <KpiCard
          label="Direct revenue"
          value={formatCurrency(284600)}
          delta={18}
        />{" "}
        <KpiCard label="Reservations" value="1,284" delta={12} />{" "}
        <KpiCard
          label="Conversations"
          value="6,708"
          delta={9}
          hint="89% resolved"
        />{" "}
        <KpiCard label="Follow-ups" value="1,142" delta={4} />{" "}
        <KpiCard label="AI check-in / out" value="724" delta={22} />{" "}
        <KpiCard label="Reviews" value="312" delta={8} hint="avg 4.6" />{" "}
      </div>{" "}
      {/* ── 3 Connects cards ──────────────────────────────────── */}{" "}
      <div className="grid grid-cols-3 gap-3">
        {" "}
        <KpiCard
          label="Connects spent (period)"
          value="29,865"
          delta={11}
          accent
        />{" "}
        <KpiCard
          label="Connects remaining"
          value="42,135"
          progress={42135 / 72000}
          hint="58% of 72,000 plan"
          accent
        />{" "}
        <KpiCard
          label="Forecast — runs out"
          value="May 14, 2026"
          hint="22 days at current pace"
          accent
        />{" "}
      </div>{" "}
      {/* ── Chart 1 — actions over time (full width) ─────────── */}{" "}
      <SectionCard
        title="Actions over time"
        subtitle="Total · AI autonomous · Escalated to operator"
      >
        {" "}
        <ResponsiveContainer width="100%" height={240}>
          {" "}
          <AreaChart
            data={overviewActions}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            {" "}
            <defs>
              {" "}
              <linearGradient id="ovTotal" x1="0" y1="0" x2="0" y2="1">
                {" "}
                <stop offset="5%" stopColor="#2355A7" stopOpacity={0.18} />{" "}
                <stop offset="95%" stopColor="#2355A7" stopOpacity={0} />{" "}
              </linearGradient>{" "}
              <linearGradient id="ovAi" x1="0" y1="0" x2="0" y2="1">
                {" "}
                <stop offset="5%" stopColor="#BED4F6" stopOpacity={0.5} />{" "}
                <stop offset="95%" stopColor="#BED4F6" stopOpacity={0} />{" "}
              </linearGradient>{" "}
            </defs>{" "}
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
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={32}
            />{" "}
            <Tooltip {...chartTooltipStyle} />{" "}
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#2355A7"
              fill="url(#ovTotal)"
              strokeWidth={2}
              dot={false}
            />{" "}
            <Area
              type="monotone"
              dataKey="ai"
              name="AI autonomous"
              stroke="#BED4F6"
              fill="url(#ovAi)"
              strokeWidth={2}
              dot={false}
            />{" "}
            <Area
              type="monotone"
              dataKey="escalated"
              name="Escalated"
              stroke="#0E1013"
              fill="transparent"
              strokeWidth={1.5}
              dot={false}
            />{" "}
          </AreaChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      {/* ── Chart 2 + 3 (½ width each) ────────────────────────── */}{" "}
      <div className="grid grid-cols-2 gap-5">
        {" "}
        <SectionCard
          title="Actions by Engine"
          subtitle="With Connects spent on each"
        >
          {" "}
          <ResponsiveContainer width="100%" height={240}>
            {" "}
            <BarChart
              data={overviewByEngine}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              {" "}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F4F5F7"
                vertical={false}
              />{" "}
              <XAxis
                dataKey="engine"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />{" "}
              <YAxis
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={32}
              />{" "}
              <Tooltip
                {...chartTooltipStyle}
                formatter={(v, name) =>
                  name === "connects"
                    ? [`${Number(v).toLocaleString()} Conn.`, "Connects"]
                    : [Number(v).toLocaleString(), "Actions"]
                }
              />{" "}
              <Bar
                dataKey="actions"
                fill="#2355A7"
                radius={[6, 6, 0, 0]}
              />{" "}
            </BarChart>{" "}
          </ResponsiveContainer>{" "}
          <div className="grid grid-cols-7 gap-1 mt-2 text-center">
            {" "}
            {overviewByEngine.map((e) => (
              <div
                key={e.engine}
                className="text-[10px] text-subtle tabular-nums"
              >
                {" "}
                {e.connects.toLocaleString()}{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </SectionCard>{" "}
        <SectionCard
          title="AI autonomous vs Escalated"
          subtitle="Across all engines"
        >
          {" "}
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            {" "}
            <ResponsiveContainer width="100%" height={220}>
              {" "}
              <PieChart>
                {" "}
                <Pie
                  data={overviewSplit}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {" "}
                  {overviewSplit.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}{" "}
                </Pie>{" "}
                <Tooltip {...chartTooltipStyle} />{" "}
              </PieChart>{" "}
            </ResponsiveContainer>{" "}
            <div className="space-y-3">
              {" "}
              {overviewSplit.map((s) => {
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
                    <p className="text-[18px] font-semibold text-strong tabular-nums leading-none">
                      {" "}
                      {pct}
                      <span className="text-[12px] text-subtle">%</span>{" "}
                    </p>{" "}
                    <p className="text-[10px] text-subtle mt-1 tabular-nums">
                      {" "}
                      {s.value.toLocaleString()} actions{" "}
                    </p>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </SectionCard>{" "}
      </div>{" "}
      {/* ── Top-10 actions table ──────────────────────────────── */}{" "}
      <SectionCard
        title="Top-10 action types by Connects spend"
        subtitle="Where the budget is going"
      >
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              <th className="text-left py-2.5 text-[10px] font-semibold text-subtle ">
                Action
              </th>{" "}
              <th className="text-left py-2.5 text-[10px] font-semibold text-subtle ">
                Engine
              </th>{" "}
              <th className="text-right py-2.5 text-[10px] font-semibold text-subtle ">
                Count
              </th>{" "}
              <th className="text-right py-2.5 text-[10px] font-semibold text-subtle ">
                Connects
              </th>{" "}
              <th className="text-right py-2.5 text-[10px] font-semibold text-subtle ">
                Share
              </th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {overviewTopActions.map((a) => (
              <tr key={a.type} className="hover:bg-surface-2 transition-colors">
                {" "}
                <td className="py-2.5 text-[12px] font-medium text-strong">
                  {a.type}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{a.engine}</td>{" "}
                <td className="py-2.5 text-[12px] text-strong tabular-nums text-right">
                  {a.count.toLocaleString()}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                  {a.connects.toLocaleString()}
                </td>{" "}
                <td className="py-2.5 text-right">
                  {" "}
                  <div className="inline-flex items-center gap-2">
                    {" "}
                    <div className="w-16 h-1 bg-surface-3 rounded-full overflow-hidden">
                      {" "}
                      <div
                        className="h-full bg-brand-blue"
                        style={{ width: `${(a.share / 15) * 100}%` }}
                      />{" "}
                    </div>{" "}
                    <span className="text-[11px] text-muted tabular-nums w-10 text-right">
                      {a.share}%
                    </span>{" "}
                  </div>{" "}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
