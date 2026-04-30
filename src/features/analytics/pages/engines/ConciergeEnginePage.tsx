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
  Legend,
} from "recharts";
import { Plus } from "lucide-react";
import { AnalyticsShell } from "../../components/AnalyticsShell";
import { KpiCard } from "../../components/KpiCard";
import {
  SectionCard,
  chartTooltipStyle,
  axisTick,
} from "../../components/SectionCard";
import {
  type Period,
  engineDailyMix,
  conciergeSplit,
  conciergeEscalations,
} from "../../lib/mockData";
import { useApp } from "../../../../app/AppContext";
const LOG = [
  {
    date: "21 Apr 2026, 14:32",
    type: "AI guest Q&A",
    guest: "Élise Caron",
    reservation: "RSV-10248",
    channel: "WhatsApp",
    connects: 3,
  },
  {
    date: "21 Apr 2026, 13:18",
    type: "Service booking",
    guest: "Henrik Bauer",
    reservation: "RSV-10239",
    channel: "Web Widget",
    connects: 5,
  },
  {
    date: "21 Apr 2026, 11:54",
    type: "In-stay message sent",
    guest: "Mei Tanaka",
    reservation: "RSV-10231",
    channel: "WhatsApp",
    connects: 2,
  },
  {
    date: "21 Apr 2026, 10:22",
    type: "Recommendations sent",
    guest: "Diego Fernández",
    reservation: "RSV-10218",
    channel: "WhatsApp",
    connects: 2,
  },
  {
    date: "21 Apr 2026, 09:48",
    type: "Escalation to reception",
    guest: "Theo Lambert",
    reservation: "RSV-10204",
    channel: "WhatsApp",
    connects: 4,
  },
];
export function ConciergeEnginePage() {
  const { addToast } = useApp();
  const [period, setPeriod] = useState<Period>("30d");
  const data = engineDailyMix.Concierge;
  const totalSplit = conciergeSplit.reduce((s, x) => s + x.value, 0);
  return (
    <AnalyticsShell
      eyebrow="AI Engine"
      title="Concierge"
      subtitle="In-stay assistance, recommendations, and service bookings."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-7 gap-3">
        {" "}
        <KpiCard label="Total actions" value="2,104" delta={11} />{" "}
        <KpiCard label="AI replies" value="1,432" delta={8} />{" "}
        <KpiCard label="Recommendations" value="284" delta={4} />{" "}
        <KpiCard label="Bookings ($)" value="€18.4k" delta={22} />{" "}
        <KpiCard label="Escalations" value="168" delta={-9} invertDelta />{" "}
        <KpiCard label="Resolution rate" value="92%" delta={3} accent />{" "}
        <KpiCard label="Connects spent" value="6,312" delta={8} />{" "}
      </div>{" "}
      <SectionCard
        title="Daily action mix"
        subtitle="AI · Recommendations · Bookings · In-stay · Escalations"
      >
        {" "}
        <ResponsiveContainer width="100%" height={260}>
          {" "}
          <BarChart
            data={data}
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
              width={32}
            />{" "}
            <Tooltip {...chartTooltipStyle} />{" "}
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#5C6370" }}
              iconSize={8}
              iconType="circle"
            />{" "}
            <Bar dataKey="ai" name="AI Q&A" stackId="a" fill="#2355A7" />{" "}
            <Bar
              dataKey="rec"
              name="Recommendations"
              stackId="a"
              fill="#5C6370"
            />{" "}
            <Bar dataKey="booking" name="Bookings" stackId="a" fill="#BED4F6" />{" "}
            <Bar dataKey="instay" name="In-stay" stackId="a" fill="#C4C8CF" />{" "}
            <Bar
              dataKey="escalation"
              name="Escalations"
              stackId="a"
              fill="#0E1013"
              radius={[6, 6, 0, 0]}
            />{" "}
          </BarChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <div className="grid grid-cols-2 gap-5">
        {" "}
        <SectionCard
          title="AI resolved vs Escalated"
          subtitle="Where the engine handed off"
        >
          {" "}
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            {" "}
            <ResponsiveContainer width="100%" height={220}>
              {" "}
              <PieChart>
                {" "}
                <Pie
                  data={conciergeSplit}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {" "}
                  {conciergeSplit.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}{" "}
                </Pie>{" "}
                <Tooltip {...chartTooltipStyle} />{" "}
              </PieChart>{" "}
            </ResponsiveContainer>{" "}
            <div className="space-y-3">
              {" "}
              {conciergeSplit.map((s) => {
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
                      {s.value} actions
                    </p>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </SectionCard>{" "}
        <SectionCard
          title="Questions escalated to reception"
          subtitle="Promote to Q&A so AI can answer next time"
        >
          {" "}
          <div className="divide-y divide-border-soft">
            {" "}
            {conciergeEscalations.map((e, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 group">
                {" "}
                <div className="flex-1 min-w-0">
                  {" "}
                  <p className="text-[12px] text-strong font-medium">
                    {e.question}
                  </p>{" "}
                  <p className="text-[10px] text-subtle mt-0.5">
                    Asked {e.count} times · last {e.lastSeen}
                  </p>{" "}
                </div>{" "}
                <button
                  onClick={() =>
                    addToast({
                      type: "success",
                      title: "Q&A draft created — review in Knowledge Base",
                    })
                  }
                  className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg bg-brand-blue-50 border border-brand-blue-light text-brand-blue text-[11px] font-semibold hover:bg-white transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                >
                  {" "}
                  <Plus className="w-3 h-3" /> Create Q&A{" "}
                </button>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </SectionCard>{" "}
      </div>{" "}
      <SectionCard title="Recent action log">
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              {["Date", "Type", "Guest", "Reservation", "Channel", "Conn."].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`py-2.5 text-[10px] font-semibold text-subtle ${i === 5 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ),
              )}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {LOG.map((l, i) => (
              <tr key={i} className="hover:bg-surface-2 transition-colors">
                {" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums">
                  {l.date}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-strong font-medium">
                  {l.type}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{l.guest}</td>{" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums">
                  {l.reservation}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted">{l.channel}</td>{" "}
                <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                  {l.connects}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
