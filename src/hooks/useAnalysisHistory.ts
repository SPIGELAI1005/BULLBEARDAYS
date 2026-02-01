/**
 * Custom hook for managing analysis history state and operations
 */
import { useState, useCallback, useEffect } from "react";
import { getAnalysisHistory, AnalysisRecord } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineMode } from "@/hooks/useOfflineMode";

export interface UseAnalysisHistoryReturn {
  allAnalyses: AnalysisRecord[];
  selectedRecord: AnalysisRecord | null;
  showDetailModal: boolean;
  loadAllAnalyses: () => Promise<void>;
  handleSelectFromHistory: (record: AnalysisRecord) => void;
  handleDetailModalClose: () => void;
}

export function useAnalysisHistory(): UseAnalysisHistoryReturn {
  const { user } = useAuth();
  const { saveToCache, cachedAnalyses, isOnline } = useOfflineMode();

  const [allAnalyses, setAllAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadAllAnalyses = useCallback(async () => {
    if (!isOnline && cachedAnalyses.length > 0) {
      setAllAnalyses(cachedAnalyses);
      return;
    }

    try {
      const data = await getAnalysisHistory(100, user?.id);
      setAllAnalyses(data);
      saveToCache(data);
    } catch (error) {
      console.error("Failed to load analyses:", error);
      if (cachedAnalyses.length > 0) {
        setAllAnalyses(cachedAnalyses);
      }
    }
  }, [user?.id, isOnline, cachedAnalyses, saveToCache]);

  const handleSelectFromHistory = useCallback((record: AnalysisRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  }, []);

  const handleDetailModalClose = useCallback(() => {
    setShowDetailModal(false);
    setSelectedRecord(null);
  }, []);

  useEffect(() => {
    loadAllAnalyses();
  }, [loadAllAnalyses]);

  return {
    allAnalyses,
    selectedRecord,
    showDetailModal,
    loadAllAnalyses,
    handleSelectFromHistory,
    handleDetailModalClose,
  };
}
