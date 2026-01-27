import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useOnboarding, ONBOARDING_STEPS } from "@/hooks/useOnboarding";

const OnboardingTour = () => {
  const { currentStep, isActive, steps, nextStep, prevStep, skipOnboarding } = useOnboarding();

  if (!isActive) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm" />
      
      {/* Spotlight effect on target element */}
      <style>
        {`
          ${step.target} {
            position: relative;
            z-index: 61;
            box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 40px 10px hsl(var(--primary) / 0.3);
            border-radius: 12px;
          }
        `}
      </style>

      {/* Tour modal */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] w-full max-w-md mx-4">
        <div className="glass-panel p-6 shadow-2xl min-h-[260px] flex flex-col">
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={skipOnboarding}
              className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground mb-6 min-h-[72px]">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-auto">
            <button
              onClick={skipOnboarding}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;