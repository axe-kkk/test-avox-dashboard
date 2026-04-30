import { useState } from "react";
import { Check, X } from "lucide-react";
import { AnalyticsShell } from "../../components/AnalyticsShell";
import { KpiCard } from "../../components/KpiCard";
import { SectionCard } from "../../components/SectionCard";
import { Funnel } from "../../components/Funnel";
import { type Period, arrivalGuests } from "../../lib/mockData";
const FUNNEL = [
  { stage: "Pre-arrival", actions: 498, conv: 100 },
  { stage: "Preferences", actions: 412, conv: 83 },
  { stage: "Online check-in", actions: 318, conv: 77 },
  { stage: "Digital key", actions: 248, conv: 78 },
  { stage: "Welcome", actions: 232, conv: 94 },
];
export function ArrivalEnginePage() {
  const [period, setPeriod] = useState<Period>("30d");
  return (
    <AnalyticsShell
      eyebrow="AI Engine"
      title="Arrival"
      subtitle="Pre-arrival, preferences, online check-in, and welcome flow."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-7 gap-3">
        {" "}
        <KpiCard label="Total actions" value="531" delta={9} />{" "}
        <KpiCard label="Pre-arrival" value="498" delta={6} />{" "}
        <KpiCard label="Preferences" value="412" delta={11} />{" "}
        <KpiCard label="Online check-in" value="318" delta={14} />{" "}
        <KpiCard label="Digital keys" value="248" delta={18} />{" "}
        <KpiCard label="Welcomes sent" value="232" delta={4} />{" "}
        <KpiCard label="Connects spent" value="2,655" delta={5} />{" "}
      </div>{" "}
      <SectionCard
        title="Arrival funnel"
        subtitle="Pre-arrival → Preferences → Check-in → Key → Welcome"
      >
        {" "}
        <Funnel stages={FUNNEL} />{" "}
      </SectionCard>{" "}
      <SectionCard
        title="Guest progress"
        subtitle="Upcoming arrivals and their pre-arrival completion"
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
                "Check-in",
                "Pre-arrival",
                "Preferences",
                "Online check-in",
                "Digital key",
                "Conn.",
              ].map((h, i) => (
                <th
                  key={h}
                  className={`py-2.5 text-[10px] font-semibold text-subtle ${i < 2 ? "text-left" : i === 6 ? "text-right" : "text-center"}`}
                >
                  {" "}
                  {h}{" "}
                </th>
              ))}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-border-soft">
            {" "}
            {arrivalGuests.map((g) => (
              <tr key={g.name} className="hover:bg-surface-2 transition-colors">
                {" "}
                <td className="py-2.5 text-[12px] text-strong font-medium">
                  {g.name}
                </td>{" "}
                <td className="py-2.5 text-[12px] text-muted tabular-nums">
                  {g.date}
                </td>{" "}
                <CheckCell ok={g.pre} /> <CheckCell ok={g.prefs} />{" "}
                <CheckCell ok={g.checkin} /> <CheckCell ok={g.key} />{" "}
                <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                  {g.connects}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
function CheckCell({ ok }: { ok: boolean }) {
  return (
    <td className="py-2.5 text-center">
      {" "}
      {ok ? (
        <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-brand-blue-50">
          {" "}
          <Check className="w-3 h-3 text-brand-blue" />{" "}
        </span>
      ) : (
        <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-surface-3">
          {" "}
          <X className="w-3 h-3 text-faint" />{" "}
        </span>
      )}{" "}
    </td>
  );
}
