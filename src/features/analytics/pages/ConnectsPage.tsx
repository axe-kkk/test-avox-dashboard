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
const STEP = 12;
export function ConnectsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [engineFilter, setEngineFilter] = useState<EngineName | "all">("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(STEP);
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
  const pageRows = filteredLog.slice(0, visibleCount);
  const hasMore = visibleCount < filteredLog.length;
  const remaining = filteredLog.length - visibleCount;
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
      {/* ── Chart 9: by channel ──────────────────────────────── */}
      <SectionCard
        title="Connects by delivery channel"
        subtitle="Sorted descending"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={sortedChannels}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" vertical={false} />
            <XAxis dataKey="channel" tick={{ fontSize: 11, fill: "#5C6370" }} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(v) => [
                `${Number(v).toLocaleString()} Conn.`,
                "Spent",
              ]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {sortedChannels.map((c, i) => {
                // Step from deep navy → primary blue → light blue across rank.
                const palette = ["#163B6E", "#2355A7", "#3F6FC2", "#5B7FBF", "#7E9CD0", "#9DB5DD", "#BED4F6", "#CFDDF1", "#DCE6F8"];
                return <Cell key={c.channel} fill={palette[i] ?? "#DCE6F8"} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

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
                setVisibleCount(STEP);
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
                setVisibleCount(STEP);
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
        {/* Show-more footer */}
        {(hasMore || visibleCount > STEP) && (
          <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between gap-3">
            <p className="text-[11px] text-subtle">
              Showing{" "}
              <span className="text-strong font-semibold tabular-nums">
                {pageRows.length}
              </span>{" "}
              of{" "}
              <span className="text-strong font-semibold tabular-nums">
                {filteredLog.length}
              </span>
            </p>
            {hasMore && (
              <button
                onClick={() =>
                  setVisibleCount((v) =>
                    Math.min(filteredLog.length, v + STEP),
                  )
                }
                className="h-10 px-4 rounded-lg border border-brand-border text-[12px] font-medium text-muted hover:bg-surface-3 hover:text-strong hover:border-faint transition-colors"
              >
                Show {Math.min(STEP, remaining)} more
              </button>
            )}
          </div>
        )}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
