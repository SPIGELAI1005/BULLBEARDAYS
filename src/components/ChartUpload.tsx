import { useState, useCallback } from "react";
import { Upload, Image, X, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { validateChartImage, quickValidate, type ImageValidationResult } from "@/lib/imageValidation";

interface ChartUploadProps {
  onImageUpload: (image: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

const ChartUpload = ({ onImageUpload, uploadedImage, onClear }: ChartUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ImageValidationResult | null>(null);

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

  const handleFile = async (file: File) => {
    // Quick validation first
    const quickCheck = quickValidate(file);
    if (!quickCheck.valid) {
      setValidationResult({
        valid: false,
        errors: quickCheck.errors,
        warnings: [],
      });
      return;
    }

    // Set validating state
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Read file
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const base64 = e.target.result as string;

          // Full validation
          const validation = await validateChartImage(base64);
          setValidationResult(validation);
          setIsValidating(false);

          // Only upload if valid or has minor warnings
          if (validation.valid) {
            onImageUpload(base64);
          }
        }
      };
      reader.onerror = () => {
        setValidationResult({
          valid: false,
          errors: ['Failed to read file'],
          warnings: [],
        });
        setIsValidating(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
        warnings: [],
      });
      setIsValidating(false);
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
          onClick={() => {
            onClear();
            setValidationResult(null);
          }}
          aria-label="Remove uploaded image"
          type="button"
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:border-destructive transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={uploadedImage}
          alt="Uploaded chart"
          className="w-full h-auto rounded-xl object-contain max-h-[400px]"
        />
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          {validationResult && validationResult.valid && validationResult.warnings.length === 0 && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-500 font-medium">
                Excellent quality
              </span>
            </>
          )}
          {validationResult && validationResult.valid && validationResult.warnings.length > 0 && (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-500 font-medium">
                Acceptable quality
              </span>
            </>
          )}
          {(!validationResult || !validationResult.valid) && (
            <>
              <Image className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Chart uploaded</span>
            </>
          )}
        </div>
        {validationResult?.metadata && (
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {validationResult.metadata.width && validationResult.metadata.height && (
              <span>
                {validationResult.metadata.width} × {validationResult.metadata.height}px
              </span>
            )}
            {validationResult.metadata.size && (
              <span>
                {(validationResult.metadata.size / 1024 / 1024).toFixed(2)}MB
              </span>
            )}
            {validationResult.metadata.readabilityScore && (
              <span className="font-medium">
                Quality: {validationResult.metadata.readabilityScore}/100
              </span>
            )}
          </div>
        )}
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
          {isValidating ? 'Validating...' : 'Browse Files'}
        </div>

        {/* Validation Feedback */}
        {validationResult && (
          <div className="mt-6 w-full max-w-md">
            {!validationResult.valid && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-destructive mb-1">
                      Invalid Image
                    </h4>
                    <ul className="text-xs text-destructive/80 space-y-1">
                      {validationResult.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validationResult.valid && validationResult.warnings.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-500 mb-1">
                      Quality Warning
                    </h4>
                    <ul className="text-xs text-amber-600/80 dark:text-amber-500/80 space-y-1">
                      {validationResult.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                    {validationResult.metadata?.readabilityScore && (
                      <div className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                        Readability Score: {validationResult.metadata.readabilityScore}/100
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {validationResult.valid && validationResult.warnings.length === 0 && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-500">
                      Excellent Quality
                    </h4>
                    <p className="text-xs text-green-600/80 dark:text-green-500/80">
                      Image is ready for analysis
                      {validationResult.metadata?.readabilityScore &&
                        ` (Score: ${validationResult.metadata.readabilityScore}/100)`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </label>
    </div>
  );
};

export default ChartUpload;