import { ArrowRight } from "lucide-react";
interface Stage {
  stage: string;
  actions: number;
  connects?: number;
  conv?: number; // % conversion to next stage
}
export function Funnel({ stages }: { stages: Stage[] }) {
  const max = Math.max(...stages.map((s) => s.actions));
  return (
    <div
      className="grid items-stretch gap-2"
      style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}
    >
      {" "}
      {stages.map((s, i) => {
        const widthRatio = s.actions / max;
        return (
          <div key={s.stage} className="relative">
            {" "}
            <div className="rounded-xl border border-brand-border p-4 bg-white h-full flex flex-col">
              {" "}
              <p className="text-[10px] font-semibold text-subtle mb-3">
                {" "}
                Stage {i + 1}{" "}
              </p>{" "}
              <p className="text-[14px] font-semibold text-strong leading-tight">
                {s.stage}
              </p>{" "}
              <div className="mt-3 mb-3 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                {" "}
                <div
                  className="h-1.5 rounded-full bg-brand-blue"
                  style={{ width: `${widthRatio * 100}%` }}
                />{" "}
              </div>{" "}
              <div className="flex items-end justify-between mt-auto pt-2">
                {" "}
                <div>
                  {" "}
                  <p className="text-[18px] font-semibold text-strong tabular-nums leading-none">
                    {" "}
                    {s.actions.toLocaleString()}{" "}
                  </p>{" "}
                  <p className="text-[10px] text-subtle mt-1">actions</p>{" "}
                </div>{" "}
                <div className="text-right">
                  {" "}
                  {s.connects != null && (
                    <p className="text-[11px] text-muted tabular-nums">
                      {" "}
                      {s.connects.toLocaleString()}
                      <span className="text-subtle"> conn.</span>{" "}
                    </p>
                  )}{" "}
                  {s.conv != null && i > 0 && (
                    <p className="text-[10px] text-brand-blue font-semibold tabular-nums mt-0.5">
                      {" "}
                      {s.conv}% from prev{" "}
                    </p>
                  )}{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {i < stages.length - 1 && (
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 z-10 w-3 h-3 rounded-full bg-white border border-brand-border flex items-center justify-center">
                {" "}
                <ArrowRight className="w-2 h-2 text-subtle" />{" "}
              </div>
            )}{" "}
          </div>
        );
      })}{" "}
    </div>
  );
}
