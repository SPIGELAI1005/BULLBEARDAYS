import { useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import { PROVIDERS } from "@/lib/ai/providerModels";

export default function CompareProvidersPanel(props: {
  selectedModels: string[];
  referenceModel: string;
  isComparing?: boolean;
  onCompare: (providerKey: string) => void;
}) {
  const candidates = useMemo(() => {
    const selected = new Set(props.selectedModels);
    return PROVIDERS.filter((p) => selected.has(p.id) && p.id !== props.referenceModel);
  }, [props.referenceModel, props.selectedModels]);

  if (candidates.length === 0) return null;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="w-4 h-4 text-primary" />
        <div className="text-sm font-semibold text-foreground">Compare providers</div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Re-run the same chart with a different provider to see differences.
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {candidates.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => props.onCompare(p.id)}
            disabled={props.isComparing}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              props.isComparing
                ? "bg-muted/30 text-muted-foreground border-border/40 cursor-not-allowed"
                : "bg-muted/40 hover:bg-muted/60 text-foreground border-border/40"
            }`}
            aria-label={`Compare with ${p.label}`}
          >
            Compare with {p.label}
          </button>
        ))}
      </div>

      {props.isComparing && (
        <div className="mt-2 text-[11px] text-muted-foreground">Comparing…</div>
      )}
    </div>
  );
}
