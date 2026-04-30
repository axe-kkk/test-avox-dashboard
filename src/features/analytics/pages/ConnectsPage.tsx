import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Filter } from "lucide-react";
import { cn } from "../../../utils";
import { AnalyticsShell } from "../components/AnalyticsShell";
import { KpiCard } from "../components/KpiCard";
import {
  SectionCard,
  chartTooltipStyle,
  axisTick,
} from "../components/SectionCard";
import { Select } from "../components/Select";
import {
  type Period,
  ENGINES,
  ENGINE_ACTION_TYPES,
  connectsDaily,
  connectsByChannel,
  connectsLog,
} from "../lib/mockData";
import type { EngineName } from "../../../types";
const PER_PAGE = 12;
export function ConnectsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [engineFilter, setEngineFilter] = useState<EngineName | "all">("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const dailyAvg = Math.round(
    connectsDaily.reduce((s, x) => s + x.connects, 0) / connectsDaily.length,
  );
  const filteredLog = useMemo(
    () =>
      connectsLog.filter(
        (l) =>
          (engineFilter === "all" || l.engine === engineFilter) &&
          (channelFilter === "all" || l.channel === channelFilter),
      ),
    [engineFilter, channelFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filteredLog.length / PER_PAGE));
  const pageRows = filteredLog.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const sortedChannels = [...connectsByChannel].sort(
    (a, b) => b.value - a.value,
  );
  return (
    <AnalyticsShell
      eyebrow="Connects"
      title="Budget & spend"
      subtitle="See where every CONNECT goes — by engine, action type, and channel."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      {/* ── 6 KPI cards ───────────────────────────────────────── */}{" "}
      <div className="grid grid-cols-6 gap-3">
        {" "}
        <KpiCard label="Spent (period)" value="29,865" delta={11} />{" "}
        <KpiCard label="Remaining" value="42,135" hint="58% of plan" />{" "}
        <KpiCard
          label="Avg cost / action"
          value="4.2"
          delta={-3}
          invertDelta
          hint="Connects"
        />{" "}
        <KpiCard
          label="Most expensive engine"
          value="Concierge"
          hint="6,312 conn."
        />{" "}
        <KpiCard
          label="Cheapest engine"
          value="Reputation"
          hint="1,648 conn."
        />{" "}
        <KpiCard
          label="Forecast for month"
          value="38,400"
          hint="vs 36k cap"
        />{" "}
      </div>{" "}
      {/* ── Chart 1: daily spend with avg reference line ─────── */}{" "}
      <SectionCard
        title="Connects spent — daily"
        subtitle="Spot peaks and anomalies. Dashed line is the period average."
      >
        {" "}
        <ResponsiveContainer width="100%" height={240}>
          {" "}
          <LineChart
            data={connectsDaily}
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
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={40}
            />{" "}
            <Tooltip
              {...chartTooltipStyle}
              formatter={(v) => [
                `${Number(v).toLocaleString()} Conn.`,
                "Spent",
              ]}
            />{" "}
            <ReferenceLine
              y={dailyAvg}
              stroke="#8B9299"
              strokeDasharray="4 4"
              label={{
                value: `avg ${dailyAvg}`,
                position: "right",
                fill: "#8B9299",
                fontSize: 10,
              }}
            />{" "}
            <Line
              type="monotone"
              dataKey="connects"
              stroke="#2355A7"
              strokeWidth={2.5}
              dot={{ fill: "#2355A7", r: 3 }}
            />{" "}
          </LineChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      {/* ── Charts 2-8: per engine action breakdowns ─────────── */}{" "}
      {ENGINES.map(({ name }) => {
        const data = ENGINE_ACTION_TYPES[name];
        const total = data.reduce((s, x) => s + x.connects, 0);
        return (
          <SectionCard
            key={name}
            title={`${name} Engine — Connects by action type`}
            subtitle={`${total.toLocaleString()} Connects spent on this engine`}
          >
            {" "}
            <ResponsiveContainer
              width="100%"
              height={Math.max(180, data.length * 28)}
            >
              {" "}
              <BarChart
                data={data}
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
                  dataKey="type"
                  type="category"
                  tick={{ fontSize: 11, fill: "#5C6370" }}
                  axisLine={false}
                  tickLine={false}
                  width={210}
                />{" "}
                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(v) => [
                    `${Number(v).toLocaleString()} Conn.`,
                    "Spent",
                  ]}
                />{" "}
                <Bar
                  dataKey="connects"
                  fill="#2355A7"
                  radius={[0, 6, 6, 0]}
                  barSize={14}
                />{" "}
              </BarChart>{" "}
            </ResponsiveContainer>{" "}
          </SectionCard>
        );
      })}{" "}
      {/* ── Chart 9: by channel — distinct visual treatment ──── */}{" "}
      <SectionCard
        title="Connects by delivery channel"
        subtitle="Sorted descending"
        className="bg-[#0E1013] text-white border-[#0E1013]"
      >
        {" "}
        <ResponsiveContainer width="100%" height={260}>
          {" "}
          <BarChart
            data={sortedChannels}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            {" "}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />{" "}
            <XAxis
              dataKey="channel"
              tick={{ fontSize: 10, fill: "#C4C8CF" }}
              axisLine={false}
              tickLine={false}
            />{" "}
            <YAxis
              tick={{ fontSize: 10, fill: "#C4C8CF" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />{" "}
            <Tooltip
              contentStyle={{
                background: "#0E1013",
                border: "1px solid #2A2D33",
                borderRadius: 12,
                fontSize: 11,
                color: "#fff",
              }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(v) => [
                `${Number(v).toLocaleString()} Conn.`,
                "Spent",
              ]}
            />{" "}
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {" "}
              {sortedChannels.map((c, i) => (
                <Cell
                  key={c.channel}
                  fill={
                    i === 0
                      ? "#BED4F6"
                      : i < 3
                        ? "#FFFFFF"
                        : "rgba(255,255,255,0.36)"
                  }
                />
              ))}{" "}
            </Bar>{" "}
          </BarChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      {/* ── Detailed log table ────────────────────────────────── */}{" "}
      <SectionCard
        title="Connects log"
        subtitle={`${filteredLog.length} entries`}
        action={
          <div className="flex items-center gap-2">
            {" "}
            <Select
              prefix="Engine"
              icon={<Filter className="w-3.5 h-3.5" />}
              value={engineFilter}
              align="right"
              options={[
                { value: "all", label: "All engines" },
                ...ENGINES.map((e) => ({ value: e.name, label: e.name })),
              ]}
              onChange={(v) => {
                setEngineFilter(v as EngineName | "all");
                setPage(1);
              }}
            />{" "}
            <Select
              prefix="Channel"
              value={channelFilter}
              align="right"
              options={[
                { value: "all", label: "All channels" },
                ...connectsByChannel.map((c) => ({
                  value: c.channel,
                  label: c.channel,
                })),
              ]}
              onChange={(v) => {
                setChannelFilter(v);
                setPage(1);
              }}
            />{" "}
          </div>
        }
      >
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              {[
                "Date",
                "Engine",
                "Action type",
                "Channel",
                "Guest ID",
                "Connects",
              ].map((h) => (
                <th
                  key={h}
                  className={cn(
                    "py-2.5 text-[10px] font-semibold text-subtle",
                    h === "Connects" ? "text-right" : "text-left",
                  )}
                >
                  {h}
                </th>
              ))}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {pageRows.map((row) => (
              <tr key={row.id} className="hover:bg-surface-2 transition-colors">
                {" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums">
                  {row.date}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong font-medium">
                  {row.engine}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{row.type}</td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{row.channel}</td>{" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums">
                  {row.guestId}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong font-semibold tabular-nums text-right">
                  {row.connects}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
        {/* Pagination */}{" "}
        <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
          {" "}
          <p className="text-[10px] text-subtle font-semibold">
            {" "}
            Page <span className="text-strong tabular-nums">
              {page}
            </span> of <span className="tabular-nums">{totalPages}</span>{" "}
          </p>{" "}
          <div className="flex items-center gap-1">
            {" "}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-3 rounded-lg border border-brand-border text-[12px] text-muted hover:bg-surface-3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>{" "}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 px-3 rounded-lg border border-brand-border text-[12px] text-muted hover:bg-surface-3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
