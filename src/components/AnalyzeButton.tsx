import { Sparkles } from "lucide-react";

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  helperText?: string;
}

const AnalyzeButton = ({ onClick, disabled, isLoading, helperText }: AnalyzeButtonProps) => {
  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
          w-full py-4 px-6 rounded-xl font-medium text-base
          flex items-center justify-center gap-3
          transition-all duration-300
          ${disabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_100%] text-primary-foreground hover:bg-[position:100%_0] shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze Chart</span>
          </>
        )}
      </button>
      {helperText && (
        <div className="text-xs text-muted-foreground text-center">{helperText}</div>
      )}
    </div>
  );
};

export default AnalyzeButton;