import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";

interface UploadZoneProps {
  label: string;
  icon: React.ReactNode;
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
}

export function UploadZone({ label, icon, preview, onFile, onClear }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) onFile(file);
    },
    [onFile]
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-display font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        {icon}
        {label}
      </h3>
      <motion.div
        whileHover={{ scale: preview ? 1 : 1.01 }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative aspect-[3/4] rounded-lg overflow-hidden glass glass-hover cursor-pointer flex items-center justify-center transition-all ${
          preview ? "" : "border-2 border-dashed border-muted-foreground/20"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Upload size={28} className="text-primary/60" />
            <span className="text-xs font-medium">Drop or Click</span>
          </div>
        )}
      </motion.div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}
