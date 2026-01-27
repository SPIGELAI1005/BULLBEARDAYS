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
    description: "bullbeardays provides scenario analysis for educational purposes only. Not financial advice. Always do your own research and consult licensed advisors before trading.",
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

const ONBOARDING_STORAGE_KEY = "bullbeardays_onboarding_completed";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    // Check localStorage first (works for all users, authenticated or not)
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
    
    if (hasSeenOnboarding) {
      setIsCompleted(true);
      setIsActive(false);
      return;
    }

    // If user is authenticated, also check database for consistency
    if (user) {
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          const dbCompleted = data.onboarding_completed;
          setIsCompleted(dbCompleted);
          // If database says completed but localStorage doesn't, sync localStorage
          if (dbCompleted) {
            localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
            setIsActive(false);
          } else {
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
        // Fallback: if database check fails, use localStorage
        setIsCompleted(hasSeenOnboarding);
        setIsActive(!hasSeenOnboarding);
      }
    } else {
      // For non-authenticated users, use localStorage only
      setIsCompleted(false);
      setIsActive(true);
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
    // Always save to localStorage (works for all users)
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsActive(false);
    setIsCompleted(true);

    // If user is authenticated, also update database
    if (user) {
      try {
        await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            onboarding_completed: true,
          });
      } catch (error) {
        console.error("Failed to update onboarding status in database:", error);
        // localStorage is already set, so continue
      }
    }
  };

  const restartOnboarding = () => {
    // Clear localStorage flag to allow restarting
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setCurrentStep(0);
    setIsActive(true);
    setIsCompleted(false);
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