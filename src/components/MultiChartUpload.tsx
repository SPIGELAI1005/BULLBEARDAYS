import { useState, useCallback } from "react";
import { Upload, Image, X, Plus, Layers } from "lucide-react";

interface MultiChartUploadProps {
  onImagesUpload: (images: string[]) => void;
  uploadedImages: string[];
  onClearAll: () => void;
  onClearOne: (index: number) => void;
  maxCharts?: number;
}

const MultiChartUpload = ({
  onImagesUpload,
  uploadedImages,
  onClearAll,
  onClearOne,
  maxCharts = 4,
}: MultiChartUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [uploadedImages]);

  const handleFiles = (files: File[]) => {
    const remainingSlots = maxCharts - uploadedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onImagesUpload([...uploadedImages, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  if (uploadedImages.length > 0) {
    return (
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Multi-Chart Comparison ({uploadedImages.length}/{maxCharts})
            </span>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-bearish transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className={`grid gap-3 ${
          uploadedImages.length === 1 ? 'grid-cols-1' :
          uploadedImages.length === 2 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => onClearOne(index)}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:border-destructive transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
              <img
                src={image}
                alt={`Chart ${index + 1}`}
                className="w-full h-auto rounded-xl object-contain max-h-[200px] border border-border/30"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                Chart {index + 1}
              </div>
            </div>
          ))}

          {uploadedImages.length < maxCharts && (
            <label
              className={`flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors min-h-[150px] ${
                isDragging ? "border-primary bg-primary/5" : ""
              }`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <Plus className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Add chart</span>
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-panel p-8 transition-all duration-300 chart-upload-area ${
        isDragging ? "border-primary bg-primary/5 scale-[1.02]" : ""
      }`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center cursor-pointer min-h-[280px]">
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          multiple
          className="hidden"
        />

        <div
          className={`p-6 rounded-2xl bg-muted/50 mb-6 transition-all ${
            isDragging ? "scale-110 bg-primary/20" : ""
          }`}
        >
          <Upload
            className={`w-10 h-10 ${
              isDragging ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>

        <h3 className="text-lg font-medium text-foreground mb-2">
          Drop your charts here
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Upload up to {maxCharts} charts for side-by-side AI comparison analysis
        </p>

        <div className="mt-6 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
          Browse Files
        </div>
      </label>
    </div>
  );
};

export default MultiChartUpload;