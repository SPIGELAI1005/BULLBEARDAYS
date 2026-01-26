import { useState } from "react";
import { Eye, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";

interface WatchlistPanelProps {
  onSelectAsset?: (asset: string) => void;
}

const WatchlistPanel = ({ onSelectAsset }: WatchlistPanelProps) => {
  const { user } = useAuth();
  const { watchlist, isLoading, addToWatchlist, removeFromWatchlist, updateNotes } = useWatchlist();
  const [newAsset, setNewAsset] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  if (!user) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Watchlist</span>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Sign in to create a watchlist
        </p>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!newAsset.trim()) return;
    await addToWatchlist(newAsset.toUpperCase());
    setNewAsset("");
  };

  const handleSaveNotes = async (id: string) => {
    await updateNotes(id, editNotes);
    setEditingId(null);
    setEditNotes("");
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Watchlist</span>
        </div>
        <span className="text-xs text-muted-foreground">{watchlist.length} assets</span>
      </div>

      {/* Add new asset */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newAsset}
          onChange={(e) => setNewAsset(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add asset (e.g., BTCUSDT)"
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted/50 border border-border focus:border-primary outline-none"
        />
        <button
          onClick={handleAdd}
          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Watchlist items */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted/30 rounded-lg" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Your watchlist is empty
          </p>
        ) : (
          watchlist.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSelectAsset?.(item.asset)}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.asset}
                </button>
                <div className="flex items-center gap-1">
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={() => handleSaveNotes(item.id)}
                        className="p-1 rounded hover:bg-bullish/20 text-bullish transition-colors"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded hover:bg-muted/50 text-muted-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditNotes(item.notes || "");
                        }}
                        className="p-1 rounded hover:bg-muted/50 text-muted-foreground transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="p-1 rounded hover:bg-bearish/20 text-muted-foreground hover:text-bearish transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="mt-2 w-full px-2 py-1 text-xs rounded bg-background/50 border border-border focus:border-primary outline-none"
                  autoFocus
                />
              ) : item.notes ? (
                <p className="mt-1 text-xs text-muted-foreground truncate">{item.notes}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WatchlistPanel;