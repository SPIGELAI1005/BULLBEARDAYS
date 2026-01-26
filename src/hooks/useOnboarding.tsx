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
    id: "upload",
    title: "Upload Your Chart",
    description: "Drag and drop or click to upload a trading chart screenshot for AI analysis",
    target: ".chart-upload-area",
  },
  {
    id: "models",
    title: "Select AI Models",
    description: "Choose one or more AI models to analyze your chart. Different models may provide different perspectives",
    target: ".ai-model-selector",
  },
  {
    id: "analyze",
    title: "Analyze",
    description: "Click to get AI-powered trading signals with take profit and stop loss levels",
    target: ".analyze-button",
  },
  {
    id: "history",
    title: "Track Your History",
    description: "View past analyses and mark outcomes as wins or losses to track your performance",
    target: ".history-panel",
  },
  {
    id: "performance",
    title: "Performance Dashboard",
    description: "See your win rate, best performing assets, and AI model accuracy over time",
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