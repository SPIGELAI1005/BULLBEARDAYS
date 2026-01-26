import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "disclaimer",
    title: "Important: Educational Tool",
    description: "BullBearDays provides scenario analysis for educational purposes only. Not financial advice. Always do your own research and consult licensed advisors before trading.",
    target: ".disclaimer-banner",
  },
  {
    id: "upload",
    title: "Upload Your Chart",
    description: "Drag and drop or click to upload a trading chart screenshot for AI-powered scenario analysis",
    target: ".chart-upload-area",
  },
  {
    id: "models",
    title: "Select AI Models",
    description: "Choose one or more AI models to analyze your chart. Different models may provide different perspectives on bull and bear scenarios",
    target: ".ai-model-selector",
  },
  {
    id: "analyze",
    title: "Generate Scenarios",
    description: "Click to receive AI-generated bull and bear scenarios with key levels, evidence, and risk factors",
    target: ".analyze-button",
  },
  {
    id: "history",
    title: "Track Your Analyses",
    description: "View past scenario analyses and mark which scenarios played out to improve your understanding",
    target: ".history-panel",
  },
  {
    id: "performance",
    title: "Analytics Dashboard",
    description: "See analysis history, scenario tracking, and identify which patterns work best for your trading style",
    target: "#performance",
  },
];

export const useOnboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsCompleted(data.onboarding_completed);
        if (!data.onboarding_completed) {
          setIsActive(true);
        }
      } else {
        // Create preferences if they don't exist
        await supabase.from("user_preferences").insert({
          user_id: user.id,
          onboarding_completed: false,
        });
        setIsCompleted(false);
        setIsActive(true);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    }
  }, [user]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = async () => {
    setIsActive(false);
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
        });
      
      setIsActive(false);
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const restartOnboarding = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  return {
    currentStep,
    isActive,
    isCompleted,
    steps: ONBOARDING_STEPS,
    nextStep,
    prevStep,
    skipOnboarding,
    restartOnboarding,
  };
};