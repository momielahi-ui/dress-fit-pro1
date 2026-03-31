import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Columns2, Maximize2, X } from "lucide-react";

interface ResultViewerProps {
  resultUrl: string;
  personImg: string;
  onClose: () => void;
}

export function ResultViewer({ resultUrl, personImg, onClose }: ResultViewerProps) {
  const [compare, setCompare] = useState(false);

  const handleDownload = async () => {
    const res = await fetch(resultUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visionfitpro-result.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Result</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompare(!compare)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md glass glass-hover text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Columns2 size={14} />
            {compare ? "Single" : "Compare"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Download size={14} />
            Download HQ
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md glass glass-hover text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className={`grid ${compare ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
        {compare && (
          <div className="rounded-lg overflow-hidden glass">
            <img src={personImg} alt="Original" className="w-full aspect-[3/4] object-cover" />
            <p className="text-center text-xs text-muted-foreground py-2">Original</p>
          </div>
        )}
        <div className="rounded-lg overflow-hidden glass glow-primary">
          <img src={resultUrl} alt="Try-on result" className="w-full aspect-[3/4] object-cover" />
          <p className="text-center text-xs text-muted-foreground py-2">Try-On Result</p>
        </div>
      </div>
    </motion.div>
  );
}
