import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface Step {
  id: string;
  label: string;
  hint?: string;
}

const STEPS: Step[] = [
  { id: "upload", label: "Upload a chart screenshot", hint: "Drag & drop or paste an image." },
  { id: "inputs", label: "Select instrument, timeframe, and strategy", hint: "The analysis is contextual." },
  { id: "models", label: "Pick an AI provider (optional)", hint: "If one provider fails, switch models." },
  { id: "analyze", label: "Run your first analysis", hint: "You’ll get bull + bear scenarios." },
];

function storageKey() {
  return "bbd:getting-started:v1";
}

export default function GettingStartedChecklist(props: {
  hasUploadedImage: boolean;
  hasRunAnalysis: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.dismissed) setDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  const completed = useMemo(() => {
    return {
      upload: props.hasUploadedImage,
      inputs: true,
      models: true,
      analyze: props.hasRunAnalysis,
    } as Record<string, boolean>;
  }, [props.hasUploadedImage, props.hasRunAnalysis]);

  const doneCount = STEPS.filter((s) => completed[s.id]).length;

  if (dismissed || doneCount === STEPS.length) return null;

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Getting started</div>
          <div className="text-xs text-muted-foreground mt-1">
            Complete these steps to get value in under a minute.
          </div>
        </div>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(storageKey(), JSON.stringify({ dismissed: true }));
            } catch {
              // ignore
            }
          }}
        >
          Dismiss
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {STEPS.map((s) => {
          const isDone = completed[s.id];
          const Icon = isDone ? CheckCircle2 : Circle;
          return (
            <div key={s.id} className="flex items-start gap-2">
              <Icon className={isDone ? "text-primary w-4 h-4 mt-0.5" : "text-muted-foreground w-4 h-4 mt-0.5"} />
              <div>
                <div className="text-sm text-foreground">{s.label}</div>
                {s.hint && <div className="text-xs text-muted-foreground">{s.hint}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Progress: {doneCount}/{STEPS.length}
      </div>
    </div>
  );
}
