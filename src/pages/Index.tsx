import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, Shirt, RotateCw, ZoomIn, ZoomOut, RotateCcw, Box } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { fileToDataUrl } from "@/lib/vton-api";
import { Avatar3DContainer, Avatar3DRef } from "@/components/Avatar3D";

export default function Index() {
  const [garmentImg, setGarmentImg] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const avatarRef = useRef<Avatar3DRef>(null);

  const handleGarmentFile = useCallback(async (file: File) => {
    const url = await fileToDataUrl(file);
    setGarmentImg(url);
  }, []);

  const handleReset = () => {
    setGarmentImg(null);
    setAutoRotate(true);
    avatarRef.current?.resetView();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap size={16} className="text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg text-foreground">
              VisionFit <span className="text-primary">360</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar - Controls */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-80 space-y-6 flex-shrink-0"
        >
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">Controls</h2>
            <p className="text-sm text-muted-foreground">Adjust camera and try on new textures in real-time.</p>
          </div>

          <div className="space-y-6 bg-card p-5 rounded-xl border border-border shadow-sm">
            {/* Texture Upload */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shirt size={14} /> Garment Pattern
              </h3>
              <UploadZone
                label="Garment image to wrap"
                icon={<Shirt size={14} />}
                preview={garmentImg}
                onFile={handleGarmentFile}
                onClear={() => setGarmentImg(null)}
              />
            </div>

            <hr className="border-border" />

            {/* Camera Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Box size={14} /> Camera Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    autoRotate 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <RotateCw size={16} className={autoRotate ? "animate-spin-slow" : ""} />
                  Auto-Rotate
                </button>

                <button
                  onClick={() => avatarRef.current?.resetView()}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset View
                </button>

                <button
                  onClick={() => avatarRef.current?.zoomIn()}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  <ZoomIn size={16} />
                  Zoom In
                </button>

                <button
                  onClick={() => avatarRef.current?.zoomOut()}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  <ZoomOut size={16} />
                  Zoom Out
                </button>
              </div>
            </div>
            
            <hr className="border-border" />

            <button
              onClick={handleReset}
              className="w-full py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              Clear All Selections
            </button>
          </div>
        </motion.aside>

        {/* Right Main Area - Canvas */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 min-h-[500px] md:min-h-0 relative rounded-xl border border-border overflow-hidden bg-gradient-to-b from-card to-background shadow-lg"
        >
          <Avatar3DContainer 
            ref={avatarRef} 
            garmentUrl={garmentImg} 
            autoRotate={autoRotate} 
          />
        </motion.div>
      </main>
    </div>
  );
}
