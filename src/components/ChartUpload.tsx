import { useState, useCallback } from "react";
import { Upload, Image, X } from "lucide-react";

interface ChartUploadProps {
  onImageUpload: (image: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

const ChartUpload = ({ onImageUpload, uploadedImage, onClear }: ChartUploadProps) => {
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

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  if (uploadedImage) {
    return (
      <div className="glass-panel p-4 relative group">
        <button
          onClick={onClear}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:border-destructive transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={uploadedImage}
          alt="Uploaded chart"
          className="w-full h-auto rounded-xl object-contain max-h-[400px]"
        />
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Image className="w-4 h-4" />
          <span>Chart uploaded successfully</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-panel p-8 transition-all duration-300 ${
        isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : ''
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
          className="hidden"
        />
        
        <div className={`p-6 rounded-2xl bg-muted/50 mb-6 transition-all ${isDragging ? 'scale-110 bg-primary/20' : ''}`}>
          <Upload className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        <h3 className="text-lg font-medium text-foreground mb-2">
          Drop your chart here
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Upload a screenshot of your trading chart (15m, 1H, 4H, Daily) for AI-powered analysis
        </p>
        
        <div className="mt-6 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
          Browse Files
        </div>
      </label>
    </div>
  );
};

export default ChartUpload;