import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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
import {
  type Period,
  guestSatisfactionDist,
  guestSourcesDist,
  guestNewVsReturning,
} from "../lib/mockData";
import { mockGuests } from "../../../data/mock/guests";
import { formatCurrency, cn } from "../../../utils";
const ENGINES_USED: Record<string, string[]> = {};
export function GuestInsightsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const totalNvR = guestNewVsReturning.reduce((s, x) => s + x.value, 0);
  const totalSrc = guestSourcesDist.reduce((s, x) => s + x.value, 0);
  const guests = mockGuests.slice(0, 10);
  return (
    <AnalyticsShell
      eyebrow="Guests"
      title="Guest insights"
      subtitle="Who's reaching out, how often, and what they're worth."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-5 gap-3">
        {" "}
        <KpiCard label="Unique guests" value="1,135" delta={9} />{" "}
        <KpiCard label="New" value="412" delta={11} />{" "}
        <KpiCard label="Returning" value="723" delta={4} />{" "}
        <KpiCard
          label="Avg LTV"
          value={formatCurrency(8420)}
          delta={6}
          accent
        />{" "}
        <KpiCard label="Avg CSAT" value="4.6" delta={3} />{" "}
      </div>{" "}
      <div className="grid grid-cols-2 gap-5">
        {" "}
        <SectionCard
          title="New vs Returning"
          subtitle="Distribution of guests in this period"
        >
          {" "}
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            {" "}
            <ResponsiveContainer width="100%" height={220}>
              {" "}
              <PieChart>
                {" "}
                <Pie
                  data={guestNewVsReturning}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {" "}
                  {guestNewVsReturning.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}{" "}
                </Pie>{" "}
                <Tooltip {...chartTooltipStyle} />{" "}
              </PieChart>{" "}
            </ResponsiveContainer>{" "}
            <div className="space-y-3">
              {" "}
              {guestNewVsReturning.map((s) => {
                const pct = ((s.value / totalNvR) * 100).toFixed(1);
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
                      {s.value.toLocaleString()} guests
                    </p>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </SectionCard>{" "}
        <SectionCard title="Acquisition source" subtitle="Direct · OTA · Other">
          {" "}
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            {" "}
            <ResponsiveContainer width="100%" height={220}>
              {" "}
              <PieChart>
                {" "}
                <Pie
                  data={guestSourcesDist}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {" "}
                  {guestSourcesDist.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}{" "}
                </Pie>{" "}
                <Tooltip {...chartTooltipStyle} />{" "}
              </PieChart>{" "}
            </ResponsiveContainer>{" "}
            <div className="space-y-3">
              {" "}
              {guestSourcesDist.map((s) => {
                const pct = ((s.value / totalSrc) * 100).toFixed(1);
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
                      {s.value.toLocaleString()} guests
                    </p>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </SectionCard>{" "}
      </div>{" "}
      <SectionCard
        title="Satisfaction distribution"
        subtitle="Across all guests"
      >
        {" "}
        <ResponsiveContainer width="100%" height={220}>
          {" "}
          <BarChart
            data={guestSatisfactionDist}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            {" "}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F4F5F7"
              vertical={false}
            />{" "}
            <XAxis
              dataKey="score"
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
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {" "}
              {guestSatisfactionDist.map((d, i) => (
                <Cell
                  key={d.score}
                  fill={i < 2 ? "#2355A7" : i === 2 ? "#BED4F6" : "#0E1013"}
                />
              ))}{" "}
            </Bar>{" "}
          </BarChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <SectionCard
        title="Guest table"
        subtitle="Click a row to open the full Guest 360"
      >
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              {[
                "Guest",
                "Visits",
                "LTV",
                "Actions",
                "Connects spent",
                "Channel",
                "Score",
                "State",
              ].map((h, i) => (
                <th
                  key={h}
                  className={`py-2.5 text-[10px] font-semibold text-subtle ${i === 0 ? "text-left" : "text-right"}`}
                >
                  {h}
                </th>
              ))}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {guests.map((g) => (
              <tr
                key={g.id}
                className="hover:bg-surface-2 transition-colors cursor-pointer"
              >
                {" "}
                <td className="py-3.5">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <Avatar name={g.name} size="lg" />{" "}
                    <div>
                      {" "}
                      <p className="text-[13px] text-strong font-medium">
                        {g.name}
                      </p>{" "}
                      <p className="text-[11px] text-subtle">{g.email}</p>{" "}
                    </div>{" "}
                  </div>{" "}
                </td>{" "}
                <td className="py-3.5 text-[13px] text-strong tabular-nums text-right">
                  {g.totalVisits}
                </td>{" "}
                <td className="py-3.5 text-[13px] text-strong tabular-nums font-semibold text-right">
                  {formatCurrency(g.lifetimeValue)}
                </td>{" "}
                <td className="py-3.5 text-[13px] text-muted tabular-nums text-right">
                  {g.totalVisits * 12}
                </td>{" "}
                <td className="py-3.5 text-[13px] text-muted tabular-nums text-right">
                  {g.totalVisits * 38}
                </td>{" "}
                <td className="py-3.5 text-[13px] text-muted capitalize text-right">
                  {g.preferredChannel.replace("_", " ")}
                </td>{" "}
                <td className="py-3.5 text-right">
                  {" "}
                  {g.satisfactionScore != null ? (
                    <span className="inline-flex items-center gap-1 text-[13px] text-strong font-semibold tabular-nums">
                      {" "}
                      <Star className="w-3.5 h-3.5 fill-brand-blue text-brand-blue" />{" "}
                      {g.satisfactionScore}{" "}
                    </span>
                  ) : (
                    <span className="text-faint">—</span>
                  )}{" "}
                </td>{" "}
                <td className="py-3.5 text-right">
                  {" "}
                  <span
                    className={cn(
                      "inline-flex h-7 px-2.5 items-center rounded-full text-[11px] font-semibold border capitalize",
                      g.status === "vip" &&
                        "bg-[#0E1013] text-white border-[#0E1013]",
                      g.status === "checked_in" &&
                        "bg-brand-blue-50 text-brand-blue border-brand-blue-light",
                      g.status === "upcoming" &&
                        "bg-surface-3 text-muted border-brand-border",
                      g.status === "checked_out" &&
                        "bg-surface-3 text-subtle border-brand-border",
                      g.status === "flagged" &&
                        "bg-note-bg text-note-text border-note-border",
                    )}
                  >
                    {" "}
                    {g.status.replace("_", " ")}{" "}
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
