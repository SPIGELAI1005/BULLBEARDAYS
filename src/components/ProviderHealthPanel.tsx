import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { getProviderStatusMap, type ProviderStatusItem } from "@/lib/ai/providerStatus";
import { PROVIDERS, type UiProviderKey } from "@/lib/ai/providerModels";

function formatAge(ms: number): string {
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s ago`;
  if (ms < 60 * 60_000) return `${Math.round(ms / 60_000)}m ago`;
  return `${Math.round(ms / (60 * 60_000))}h ago`;
}

export default function ProviderHealthPanel(props: { selectedModels: string[] }) {
  const [map, setMap] = useState<Record<string, ProviderStatusItem>>({});

  useEffect(() => {
    setMap(getProviderStatusMap());
    const t = setInterval(() => setMap(getProviderStatusMap()), 2000);
    return () => clearInterval(t);
  }, []);

  const items = useMemo(() => {
    return PROVIDERS.filter((p) => props.selectedModels.includes(p.id)).map((p) => {
      const status = map[p.id];
      return { provider: p, status };
    });
  }, [map, props.selectedModels]);

  const hasAny = items.some((i) => i.status);
  if (!hasAny) return null;

  return (
    <div className="glass-panel p-4">
      <div className="text-sm font-semibold text-foreground mb-2">Provider status</div>
      <div className="text-xs text-muted-foreground mb-3">
        Local status from your recent requests (helps debug billing/rate-limit issues).
      </div>

      <div className="space-y-2">
        {items.map(({ provider, status }) => {
          const age = status ? Date.now() - status.at : null;
          const isOk = status?.code === "OK";
          const Icon = isOk ? CheckCircle2 : AlertTriangle;

          return (
            <div key={provider.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-muted/10 p-3">
              <div className="flex items-start gap-2">
                <Icon className={isOk ? "w-4 h-4 text-bullish mt-0.5" : "w-4 h-4 text-amber-500 mt-0.5"} />
                <div>
                  <div className="text-sm text-foreground font-medium">{provider.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {status?.message ? status.message : isOk ? "OK" : "No recent status"}
                  </div>
                </div>
              </div>
              {age !== null && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatAge(age)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
