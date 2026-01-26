import { Check } from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const models: AIModel[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Advanced multimodal analysis",
    icon: "✦",
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: "gpt",
    name: "OpenAI GPT",
    description: "Deep reasoning capabilities",
    icon: "◆",
    color: "from-emerald-400 to-green-400",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    description: "Nuanced market insights",
    icon: "◈",
    color: "from-orange-400 to-amber-400",
  },
];

interface AIModelSelectorProps {
  selectedModels: string[];
  referenceModel: string;
  onToggleModel: (modelId: string) => void;
  onSetReference: (modelId: string) => void;
}

const AIModelSelector = ({
  selectedModels,
  referenceModel,
  onToggleModel,
  onSetReference,
}: AIModelSelectorProps) => {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-medium text-foreground mb-1">AI Models</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select models for analysis. Click star to set as reference.
      </p>

      <div className="space-y-3">
        {models.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const isReference = referenceModel === model.id;

          return (
            <div
              key={model.id}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-muted/50 border-primary/30"
                  : "bg-muted/20 border-border/50 hover:border-border"
              }`}
              onClick={() => onToggleModel(model.id)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${model.color}`}
                >
                  {model.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {model.name}
                    </span>
                    {isReference && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                        Reference
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {model.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetReference(model.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isReference
                          ? "text-accent"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isReference ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  )}
                  
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIModelSelector;