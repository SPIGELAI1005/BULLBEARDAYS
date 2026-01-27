import { useEffect, useState } from "react";

export type TimeOfDay = "sunrise" | "day" | "sunset" | "night";

export interface MarketSession {
  icon: string;
  text: string;
}

function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return "sunrise";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}

function getSessionLabel(timeOfDay: TimeOfDay): MarketSession {
  switch (timeOfDay) {
    case "sunrise":
      return { icon: "🌅", text: "Asian Session" };
    case "day":
      return { icon: "📈", text: "Markets Open" };
    case "sunset":
      return { icon: "🌆", text: "US Close" };
    case "night":
      return { icon: "🌙", text: "After Hours" };
  }
}

/**
 * Shared market session state used by AnimatedLogo (under logo) and Header (status chip).
 * Updates every minute. Session labels: Asian Session, Markets Open, US Close, After Hours.
 */
export function useMarketSession(): { timeOfDay: TimeOfDay; session: MarketSession } {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() =>
    getTimeOfDay(new Date())
  );

  useEffect(() => {
    const update = () => setTimeOfDay(getTimeOfDay(new Date()));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return { timeOfDay, session: getSessionLabel(timeOfDay) };
}
