import { cn } from "../../../utils";
interface Props {
  label: string;
  value: string | number;
  hint?: string;
  delta?: number;
  invertDelta?: boolean;
  accent?: boolean;
  /** 0..1 — renders a progress bar instead of trend. Pairs with `hint`. */ progress?: number;
}
export function KpiCard({
  label,
  value,
  hint,
  delta,
  invertDelta,
  accent,
  progress,
}: Props) {
  const positiveTrend =
    delta != null && delta !== 0 && (invertDelta ? delta < 0 : delta > 0);
  const negativeTrend =
    delta != null && delta !== 0 && (invertDelta ? delta > 0 : delta < 0);
  return (
    <div
      className={cn(
        "relative h-full flex flex-col px-3.5 pt-3 pb-3 rounded-xl bg-white border border-brand-border overflow-hidden",
        accent && "border-brand-blue-light",
      )}
    >
      {" "}
      {/* Subtle accent stripe — replaces full color fill */}{" "}
      {accent && (
        <span
          className="absolute inset-x-0 top-0 h-[2px] bg-brand-blue/80"
          aria-hidden
        />
      )}{" "}
      {/* Label */}{" "}
      <p
        className={cn(
          "text-[11px] leading-tight truncate",
          accent ? "text-brand-blue font-semibold" : "text-subtle font-medium",
        )}
        title={label}
      >
        {" "}
        {label}{" "}
      </p>{" "}
      {/* Value */}{" "}
      <p
        className="mt-1.5 text-[20px] font-semibold tabular-nums leading-none truncate text-strong tracking-tight"
        title={String(value)}
      >
        {" "}
        {value}{" "}
      </p>{" "}
      {/* Footer */}{" "}
      {progress != null ? (
        <div className="mt-2.5">
          {" "}
          <div className="h-[3px] bg-surface-3 rounded-full overflow-hidden">
            {" "}
            <div
              className={cn(
                "h-full rounded-full",
                accent ? "bg-brand-blue" : "bg-strong",
              )}
              style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
            />{" "}
          </div>{" "}
          {hint && (
            <p
              className={cn(
                "mt-1.5 text-[11px] leading-tight truncate",
                accent ? "text-brand-blue/70" : "text-subtle",
              )}
            >
              {hint}
            </p>
          )}{" "}
        </div>
      ) : delta != null || hint ? (
        <p className="mt-2 text-[11px] leading-tight truncate">
          {" "}
          {delta != null && (
            <span
              className={cn(
                "tabular-nums font-medium",
                positiveTrend && "text-brand-blue",
                negativeTrend && "text-strong",
                !positiveTrend && !negativeTrend && "text-subtle",
              )}
            >
              {" "}
              {delta > 0 ? "+" : ""}
              {delta}%{" "}
            </span>
          )}{" "}
          {delta != null && hint && (
            <span className="text-faint mx-1.5">·</span>
          )}{" "}
          {hint && (
            <span className={cn(accent ? "text-brand-blue/70" : "text-subtle")}>
              {" "}
              {hint}{" "}
            </span>
          )}{" "}
        </p>
      ) : null}{" "}
    </div>
  );
}
