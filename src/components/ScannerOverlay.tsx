import { motion } from "framer-motion";

interface ScannerOverlayProps {
  status: string;
}

export function ScannerOverlay({ status }: ScannerOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="relative w-72 sm:w-96 aspect-[3/4] rounded-xl glass overflow-hidden">
        {/* Scanner line */}
        <div className="absolute left-0 right-0 h-0.5 bg-primary scanner-line z-10" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Status text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-display text-sm font-medium text-primary tracking-wider uppercase">
            {status === "starting" ? "Initializing..." : "Processing..."}
          </p>
          <p className="text-xs text-muted-foreground">This may take 30-60 seconds</p>
        </div>
      </div>
    </motion.div>
  );
}
