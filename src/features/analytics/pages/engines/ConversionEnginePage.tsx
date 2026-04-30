import { useState } from "react";
import { AnalyticsShell } from "../../components/AnalyticsShell";
import { KpiCard } from "../../components/KpiCard";
import { SectionCard } from "../../components/SectionCard";
import { Funnel } from "../../components/Funnel";
import {
  type Period,
  conversionFunnel,
  conversionPages,
} from "../../lib/mockData";
import { formatCurrency } from "../../../../utils";
const ACTION_LOG = [
  {
    date: "21 Apr 2026, 14:32",
    type: "AI booking inquiry response",
    guest: "Élise Caron",
    channel: "WhatsApp",
    connects: 4,
  },
  {
    date: "21 Apr 2026, 14:18",
    type: "Rate proposal sent",
    guest: "Henrik Bauer",
    channel: "Email",
    connects: 3,
  },
  {
    date: "21 Apr 2026, 13:54",
    type: "Abandoned booking follow-up",
    guest: "Mei Tanaka",
    channel: "Web Widget",
    connects: 4,
  },
  {
    date: "21 Apr 2026, 13:22",
    type: "Booking link sent",
    guest: "Diego Fernández",
    channel: "WhatsApp",
    connects: 3,
  },
  {
    date: "21 Apr 2026, 12:48",
    type: "Booking completed",
    guest: "Aisha Al-Mansouri",
    channel: "Email",
    connects: 2,
  },
  {
    date: "21 Apr 2026, 12:14",
    type: "Offer applied",
    guest: "Theo Lambert",
    channel: "WhatsApp",
    connects: 3,
  },
];
export function ConversionEnginePage() {
  const [period, setPeriod] = useState<Period>("30d");
  return (
    <AnalyticsShell
      eyebrow="AI Engine"
      title="Conversion"
      subtitle="Pre-sale consultations, booking inquiries, and direct revenue."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-7 gap-3">
        {" "}
        <KpiCard label="Total actions" value="1,842" delta={12} />{" "}
        <KpiCard label="Proposals" value="1,102" delta={9} />{" "}
        <KpiCard label="Follow-ups" value="624" delta={4} />{" "}
        <KpiCard label="Bookings" value="286" delta={18} />{" "}
        <KpiCard label="Inquiry → Booking" value="15.5%" delta={3} accent />{" "}
        <KpiCard
          label="Direct revenue"
          value={formatCurrency(142800)}
          delta={22}
        />{" "}
        <KpiCard label="Connects spent" value="9,210" delta={8} />{" "}
      </div>{" "}
      <SectionCard
        title="Conversion funnel"
        subtitle="Inquiry → Proposal → Follow-up → Booking"
      >
        {" "}
        <Funnel stages={conversionFunnel} />{" "}
      </SectionCard>{" "}
      <div className="grid grid-cols-2 gap-5">
        {" "}
        <SectionCard
          title="Top-5 pages by conversion"
          subtitle="Where AI conversations turned into bookings"
        >
          {" "}
          <table className="w-full">
            {" "}
            <thead>
              {" "}
              <tr className="border-b border-brand-border">
                {" "}
                <th className="py-2.5 text-left text-[10px] font-semibold text-subtle ">
                  Page
                </th>{" "}
                <th className="py-2.5 text-right text-[10px] font-semibold text-subtle ">
                  Conv. rate
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-border-soft">
              {" "}
              {conversionPages.map((p) => (
                <tr
                  key={p.page}
                  className="hover:bg-surface-2 transition-colors"
                >
                  {" "}
                  <td className="py-2.5 text-[12px] text-strong font-medium">
                    {p.page}
                  </td>{" "}
                  <td className="py-2.5 text-right">
                    {" "}
                    <div className="inline-flex items-center gap-2">
                      {" "}
                      <div className="w-20 h-1 bg-surface-3 rounded-full overflow-hidden">
                        {" "}
                        <div
                          className="h-full bg-brand-blue"
                          style={{ width: `${(p.conv / 15) * 100}%` }}
                        />{" "}
                      </div>{" "}
                      <span className="text-[12px] font-semibold text-strong tabular-nums w-12 text-right">
                        {p.conv}%
                      </span>{" "}
                    </div>{" "}
                  </td>{" "}
                </tr>
              ))}{" "}
            </tbody>{" "}
          </table>{" "}
        </SectionCard>{" "}
        <SectionCard
          title="Recent action log"
          subtitle="Live trail of engine actions"
        >
          {" "}
          <div className="space-y-2">
            {" "}
            {ACTION_LOG.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-2 transition-colors"
              >
                {" "}
                <div className="flex-1 min-w-0">
                  {" "}
                  <p className="text-[12px] text-strong font-medium truncate">
                    {a.type}
                  </p>{" "}
                  <p className="text-[10px] text-subtle mt-0.5">
                    {a.guest} · {a.channel} · {a.date}
                  </p>{" "}
                </div>{" "}
                <span className="text-[11px] text-muted tabular-nums font-semibold flex-shrink-0">
                  {" "}
                  {a.connects} Conn.{" "}
                </span>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </SectionCard>{" "}
      </div>{" "}
    </AnalyticsShell>
  );
}
