"use client";

import { useState, useCallback } from "react";
import { Link2, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isValidDestyPdfUrl } from "@/lib/pdf-fetcher";

interface LinkInputProps {
  onSubmit: (url: string) => void;
  isProcessing: boolean;
}

export function LinkInput({ onSubmit, isProcessing }: LinkInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const validate = useCallback((value: string): string | null => {
    if (!value.trim()) return null; // no error when empty
    if (!isValidDestyPdfUrl(value.trim())) {
      return "Link harus berupa URL PDF dari Desty (desty-upload-indonesia.oss-ap-southeast-5.aliyuncs.com)";
    }
    return null;
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSubmit(trimmed);
    setUrl("");
  }, [url, validate, onSubmit]);

  const handleChange = useCallback(
    (value: string) => {
      setUrl(value);
      if (error) {
        setError(validate(value.trim()));
      }
    },
    [error, validate]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text").trim();
      // Auto-submit on paste if valid
      setTimeout(() => {
        if (isValidDestyPdfUrl(pasted)) {
          setError(null);
          onSubmit(pasted);
          setUrl("");
        }
      }, 100);
    },
    [onSubmit]
  );

  const isValid = url.trim() !== "" && !validate(url.trim());

  return (
    <div className="flex flex-col gap-3">
      {/* Input row */}
      <div
        className={cn(
          "flex gap-2 items-start transition-all duration-200",
          isFocused && "scale-[1.005]"
        )}
      >
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Link2
              className={cn(
                "w-4 h-4 transition-colors",
                isFocused ? "text-primary" : "text-muted-foreground/50"
              )}
            />
          </div>
          <Input
            id="link-input"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Paste link PDF Desty di sini..."
            disabled={isProcessing}
            className={cn(
              "h-11 pl-9 pr-4 text-sm bg-secondary/40 border-border/50 rounded-xl",
              "focus-visible:ring-primary/50 focus-visible:border-primary/40",
              "placeholder:text-muted-foreground/40",
              "transition-all duration-200",
              error && "border-destructive/50 focus-visible:ring-destructive/30"
            )}
          />
        </div>
        <Button
          id="process-link-btn"
          onClick={handleSubmit}
          disabled={isProcessing || !isValid}
          className={cn(
            "h-11 px-5 rounded-xl gap-2 font-medium transition-all duration-200",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
            "disabled:shadow-none"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          <span>Proses</span>
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-destructive/80 pl-1 animate-slide-down">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      <p className="text-[11px] text-muted-foreground/50 pl-1">
        Format: https://desty-upload-indonesia.oss-ap-southeast-5.aliyuncs.com/desty-omni/...pdf
      </p>
    </div>
  );
}
