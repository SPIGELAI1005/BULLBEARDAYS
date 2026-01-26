import { useState, useEffect, useCallback } from "react";
import { AnalysisRecord } from "@/lib/api";

const CACHE_KEY = "bullbeardays_offline_cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  analyses: AnalysisRecord[];
  timestamp: number;
}

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedAnalyses, setCachedAnalyses] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load cached data on mount
    loadFromCache();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CacheData = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - data.timestamp < CACHE_EXPIRY) {
          setCachedAnalyses(data.analyses);
          return data.analyses;
        }
      }
    } catch (error) {
      console.error("Failed to load cache:", error);
    }
    return [];
  }, []);

  const saveToCache = useCallback((analyses: AnalysisRecord[]) => {
    try {
      const cacheData: CacheData = {
        analyses: analyses.slice(0, 50), // Keep last 50 analyses
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCachedAnalyses(cacheData.analyses);
    } catch (error) {
      console.error("Failed to save cache:", error);
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      setCachedAnalyses([]);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }, []);

  const getCacheAge = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CacheData = JSON.parse(cached);
        const ageMs = Date.now() - data.timestamp;
        const minutes = Math.floor(ageMs / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
      }
    } catch (error) {
      console.error("Failed to get cache age:", error);
    }
    return null;
  }, []);

  return {
    isOnline,
    cachedAnalyses,
    saveToCache,
    loadFromCache,
    clearCache,
    getCacheAge,
  };
};