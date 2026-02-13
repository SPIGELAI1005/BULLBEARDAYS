import { Switch } from "@/components/ui/switch";
import { useDemoMode } from "@/hooks/useDemoMode";

export default function DemoToggle(props: { compact?: boolean }) {
  const { enabled, setEnabled } = useDemoMode();

  return (
    <div className={props.compact ? "flex items-center justify-between gap-3" : "flex items-center gap-3"}>
      <div className="min-w-0">
        <div className="text-xs font-medium text-foreground">Demo mode</div>
        {!props.compact && (
          <div className="text-[11px] text-muted-foreground">
            Uses local sample data (no backend required)
          </div>
        )}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={(v) => setEnabled(Boolean(v))}
        aria-label="Toggle demo mode"
      />
    </div>
  );
}
