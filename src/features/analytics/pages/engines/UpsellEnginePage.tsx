import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  upsellOffers,
  upsellRevenueDaily,
} from "../../lib/mockData";
import { formatCurrency } from "../../../../utils";
export function UpsellEnginePage() {
  const [period, setPeriod] = useState<Period>("30d");
  const totalRevenue = upsellOffers.reduce((s, o) => s + o.revenue, 0);
  const totalConn = upsellOffers.reduce((s, o) => s + o.connects, 0);
  return (
    <AnalyticsShell
      eyebrow="AI Engine"
      title="Upsell"
      subtitle="Upgrades, add-ons, and revenue uplift."
      period={period}
      onPeriodChange={setPeriod}
    >
      {" "}
      <div className="grid grid-cols-7 gap-3">
        {" "}
        <KpiCard label="Total actions" value="644" delta={11} />{" "}
        <KpiCard label="Offers sent" value="1,146" delta={9} />{" "}
        <KpiCard label="Accepted" value="392" delta={14} />{" "}
        <KpiCard label="Declined" value="754" delta={4} />{" "}
        <KpiCard label="Acceptance rate" value="34%" delta={5} accent />{" "}
        <KpiCard
          label="Revenue generated"
          value={formatCurrency(59700)}
          delta={22}
        />{" "}
        <KpiCard label="Connects spent" value="3,220" delta={7} />{" "}
      </div>{" "}
      <SectionCard
        title="Top-5 offers by revenue"
        subtitle="Sent vs accepted volume"
      >
        {" "}
        <ResponsiveContainer width="100%" height={260}>
          {" "}
          <BarChart
            data={upsellOffers}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            {" "}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F4F5F7"
              vertical={false}
            />{" "}
            <XAxis
              dataKey="name"
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
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#5C6370" }}
              iconSize={8}
              iconType="circle"
            />{" "}
            <Bar
              dataKey="sent"
              name="Sent"
              fill="#BED4F6"
              radius={[6, 6, 0, 0]}
            />{" "}
            <Bar
              dataKey="accepted"
              name="Accepted"
              fill="#2355A7"
              radius={[6, 6, 0, 0]}
            />{" "}
          </BarChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <SectionCard
        title="Upsell revenue — daily"
        subtitle="Revenue attributed to engine offers"
      >
        {" "}
        <ResponsiveContainer width="100%" height={220}>
          {" "}
          <LineChart
            data={upsellRevenueDaily}
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
              width={48}
              tickFormatter={(v) => `€${(v / 1000).toFixed(1)}k`}
            />{" "}
            <Tooltip
              {...chartTooltipStyle}
              formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
            />{" "}
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2355A7"
              strokeWidth={2.5}
              dot={{ fill: "#2355A7", r: 3 }}
            />{" "}
          </LineChart>{" "}
        </ResponsiveContainer>{" "}
      </SectionCard>{" "}
      <SectionCard title="Offer performance" subtitle="ROI per offer">
        {" "}
        <table className="w-full">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-brand-border">
              {" "}
              {[
                "Offer",
                "Sent",
                "Accepted",
                "Acceptance",
                "Revenue",
                "Connects",
                "ROI",
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
            {upsellOffers.map((o) => {
              const acc = ((o.accepted / o.sent) * 100).toFixed(0);
              const roi = (o.revenue / o.connects).toFixed(0);
              return (
                <tr
                  key={o.name}
                  className="hover:bg-surface-2 transition-colors"
                >
                  {" "}
                  <td className="py-2.5 text-[12px] text-strong font-medium">
                    {o.name}
                  </td>{" "}
                  <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">
                    {o.sent.toLocaleString()}
                  </td>{" "}
                  <td className="py-2.5 text-[12px] text-strong tabular-nums text-right">
                    {o.accepted.toLocaleString()}
                  </td>{" "}
                  <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">
                    {acc}%
                  </td>{" "}
                  <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                    {formatCurrency(o.revenue)}
                  </td>{" "}
                  <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">
                    {o.connects.toLocaleString()}
                  </td>{" "}
                  <td className="py-2.5 text-[12px] text-brand-blue tabular-nums font-semibold text-right">
                    {roi}×
                  </td>{" "}
                </tr>
              );
            })}{" "}
            <tr className="border-t-2 border-brand-border bg-surface-2">
              {" "}
              <td className="py-2.5 text-[12px] text-strong font-semibold">
                Total
              </td>{" "}
              <td colSpan={3} />{" "}
              <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                {formatCurrency(totalRevenue)}
              </td>{" "}
              <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">
                {totalConn.toLocaleString()}
              </td>{" "}
              <td className="py-2.5 text-[12px] text-brand-blue tabular-nums font-semibold text-right">
                {(totalRevenue / totalConn).toFixed(0)}×
              </td>{" "}
            </tr>{" "}
          </tbody>{" "}
        </table>{" "}
      </SectionCard>{" "}
    </AnalyticsShell>
  );
}
