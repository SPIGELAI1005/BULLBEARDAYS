import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string, images: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSubmit, isLoading = false, placeholder = "Describe your trade setup or paste a chart image..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setImages(prev => [...prev, ev.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setImages(prev => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input
    e.target.value = "";
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(() => {
    if ((!message.trim() && images.length === 0) || isLoading) return;
    
    onSubmit(message.trim(), images);
    setMessage("");
    setImages([]);
    textareaRef.current?.focus();
  }, [message, images, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const canSubmit = (message.trim() || images.length > 0) && !isLoading;

  return (
    <div className="glass-panel p-4 space-y-3">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Uploaded ${index + 1}`}
                className="h-20 w-auto rounded-lg object-cover border border-border/50"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "min-h-[60px] max-h-[200px] resize-none pr-12",
              "bg-background/50 border-border/50 focus:border-primary/50",
              "placeholder:text-muted-foreground/60"
            )}
            rows={2}
          />
          
          {/* Image upload button inside textarea */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-3 bottom-3 p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Add image"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "h-12 px-4 rounded-xl transition-all",
            canSubmit 
              ? "bg-gradient-to-r from-bullish to-accent hover:opacity-90" 
              : "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        Paste chart images directly (Ctrl+V) or click <ImagePlus className="w-3 h-3 inline" /> to upload • Press Enter to analyze
      </p>
    </div>
  );
};

export default ChatInput;
