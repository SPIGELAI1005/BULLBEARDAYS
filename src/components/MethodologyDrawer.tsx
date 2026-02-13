import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MethodologyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-panel p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3"
        aria-expanded={open}
        aria-controls="methodology-body"
      >
        <div className="text-sm font-semibold text-foreground">How to read this analysis</div>
        <ChevronDown className={open ? "w-4 h-4 text-muted-foreground rotate-180 transition-transform" : "w-4 h-4 text-muted-foreground transition-transform"} />
      </button>

      {open && (
        <div id="methodology-body" className="mt-3 text-sm text-muted-foreground space-y-2">
          <p>
            BullBearDays produces <strong>educational scenario analysis</strong>. You always get both
            a bull and a bear scenario.
          </p>
          <p>
            <strong>Bias</strong> is a lightweight summary of which scenario currently has more technical
            evidence on the selected timeframe. It is not a directive.
          </p>
          <p>
            <strong>Confidence</strong> is confidence in the <em>chart read quality</em> (image clarity + setup clarity),
            not a probability of profit.
          </p>
          <p>
            <strong>Invalidation</strong> is the condition that would make a scenario less likely.
            Use it to structure risk thinking.
          </p>
        </div>
      )}
    </div>
  );
}
