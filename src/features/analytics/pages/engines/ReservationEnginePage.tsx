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
  reservationOutcome,
} from "../../lib/mockData";
const LOG = [
  {
    date: "21 Apr 2026, 14:32",
    type: "Confirmation sent",
    guest: "Élise Caron",
    reservation: "RSV-10248",
    channel: "Email",
    connects: 3,
  },
  {
    date: "21 Apr 2026, 13:18",
    type: "Modification processed",
    guest: "Henrik Bauer",
    reservation: "RSV-10239",
    channel: "WhatsApp",
    connects: 4,
  },
  {
    date: "21 Apr 2026, 11:54",
    type: "Cancellation processed",
    guest: "Mei Tanaka",
    reservation: "RSV-10231",
    channel: "Email",
    connects: 4,
  },
  {
    date: "21 Apr 2026, 10:22",
    type: "Alternative dates proposed",
    guest: "Mei Tanaka",
    reservation: "RSV-10231",
    channel: "Email",
    connects: 3,
  },
  {
    date: "21 Apr 2026, 09:48",
    type: "Upcoming stay reminder",
    guest: "Diego Fernández",
    reservation: "RSV-10218",
    channel: "SMS",
    connects: 2,
  },
];
export function ReservationEnginePage() {
  const [period, setPeriod] = useState<Period>("30d");
  const data = engineDailyMix.Reservation;
  const totalOutcome = reservationOutcome.reduce((s, x) => s + x.value, 0);
  return (
    <AnalyticsShell
      eyebrow="AI Engine"
      title="Reservation"
      subtitle="Confirmations, modifications, cancellations, and retention."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-7 gap-3">
        {" "}
        <KpiCard label="Total actions" value="986" delta={6} />{" "}
        <KpiCard label="Confirmations" value="854" delta={4} />{" "}
        <KpiCard label="Modifications" value="142" delta={9} />{" "}
        <KpiCard label="Cancellations" value="86" delta={-12} invertDelta />{" "}
        <KpiCard label="Alt. dates proposed" value="48" delta={14} />{" "}
        <KpiCard label="Time saved" value="142h" delta={18} accent />{" "}
        <KpiCard label="Connects spent" value="4,930" delta={5} />{" "}
      </div>{" "}
      <SectionCard
        title="Daily action mix"
        subtitle="Confirmations · modifications · cancellations · reminders"
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
            <Bar
              dataKey="confirmation"
              name="Confirmation"
              stackId="a"
              fill="#2355A7"
              radius={[0, 0, 0, 0]}
            />{" "}
            <Bar
              dataKey="modification"
              name="Modification"
              stackId="a"
              fill="#5C6370"
            />{" "}
            <Bar
              dataKey="cancellation"
              name="Cancellation"
              stackId="a"
              fill="#0E1013"
            />{" "}
            <Bar
              dataKey="reminder"
              name="Reminder"
              stackId="a"
              fill="#BED4F6"
              radius={[6, 6, 0, 0]}
            />{" "}
          </BarChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <div className="grid grid-cols-2 gap-5">
        {" "}
        <SectionCard
          title="Cancellation outcomes"
          subtitle="Retention via alt-dates & credit offers"
        >
          {" "}
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            {" "}
            <ResponsiveContainer width="100%" height={220}>
              {" "}
              <PieChart>
                {" "}
                <Pie
                  data={reservationOutcome}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {" "}
                  {reservationOutcome.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}{" "}
                </Pie>{" "}
                <Tooltip {...chartTooltipStyle} />{" "}
              </PieChart>{" "}
            </ResponsiveContainer>{" "}
            <div className="space-y-3">
              {" "}
              {reservationOutcome.map((s) => {
                const pct = ((s.value / totalOutcome) * 100).toFixed(1);
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
                      {s.value} cancellations
                    </p>{" "}
                  </div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </SectionCard>{" "}
        <SectionCard
          title="Recent action log"
          subtitle="Latest reservation events"
        >
          {" "}
          <table className="w-full">
            {" "}
            <thead>
              {" "}
              <tr className="border-b border-brand-border">
                {" "}
                <th className="py-2.5 text-left text-[10px] font-semibold text-subtle ">
                  Type
                </th>{" "}
                <th className="py-2.5 text-left text-[10px] font-semibold text-subtle ">
                  Guest
                </th>{" "}
                <th className="py-2.5 text-right text-[10px] font-semibold text-subtle ">
                  Conn.
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-border-soft">
              {" "}
              {LOG.map((l, i) => (
                <tr key={i} className="hover:bg-surface-2 transition-colors">
                  {" "}
                  <td className="py-2.5 text-[12px] text-strong font-medium">
                    {l.type}
                  </td>{" "}
                  <td className="py-2.5 text-[12px] text-muted">{l.guest}</td>{" "}
                  <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                    {l.connects}
                  </td>{" "}
                </tr>
              ))}{" "}
            </tbody>{" "}
          </table>{" "}
        </SectionCard>{" "}
      </div>{" "}
    </AnalyticsShell>
  );
}
