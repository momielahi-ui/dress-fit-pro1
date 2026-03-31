import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shirt, RotateCw, ZoomIn, ZoomOut, RotateCcw, Box, SlidersHorizontal, Image as ImageIcon, Info } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { fileToDataUrl } from "@/lib/vton-api";
import { Avatar3DContainer, Avatar3DRef } from "@/components/Avatar3D";
import { Studio2D } from "@/components/Studio2D";

const MODELS_2D = [
  { id: "male_athletic", label: "Male Athletic", url: "/models/male_athletic.png" },
  { id: "female_athletic", label: "Female Athletic", url: "/models/female_athletic.png" },
  { id: "male_casual", label: "Male Casual", url: "/models/male_casual.png" },
  { id: "female_casual", label: "Female Casual", url: "/models/female_casual.png" },
];

export default function Index() {
  const [mode, setMode] = useState<"2D" | "3D">("2D");
  
  // Garment State
  const [frontGarmentUrl, setFrontGarmentUrl] = useState<string | null>(null);
  const [backGarmentUrl, setBackGarmentUrl] = useState<string | null>(null);
  
  // 3D State
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const avatarRef = useRef<Avatar3DRef>(null);

  // 2D State
  const [selectedModel, setSelectedModel] = useState<string | null>(MODELS_2D[0].url);
  const [overlayScale, setOverlayScale] = useState<number>(1);
  const [overlayPosX, setOverlayPosX] = useState<number>(0);
  const [overlayPosY, setOverlayPosY] = useState<number>(0);

  const handleFrontGarmentFile = useCallback(async (file: File) => {
    const url = await fileToDataUrl(file);
    setFrontGarmentUrl(url);
  }, []);

  const handleBackGarmentFile = useCallback(async (file: File) => {
    const url = await fileToDataUrl(file);
    setBackGarmentUrl(url);
  }, []);

  const handleReset = () => {
    setFrontGarmentUrl(null);
    setBackGarmentUrl(null);
    if (mode === "3D") {
      setAutoRotate(true);
      avatarRef.current?.resetView();
    } else {
      setOverlayScale(1);
      setOverlayPosX(0);
      setOverlayPosY(0);
    }
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
            <h1 className="font-display font-bold text-lg text-foreground tracking-wide">
              VisionFit <span className="text-primary">Pro</span> | <span className="text-muted-foreground font-normal text-sm ml-1">Elite Try-On Studio</span>
            </h1>
          </div>
          
          <button
            onClick={() => setMode(mode === "2D" ? "3D" : "2D")}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-primary/20 text-primary hover:bg-primary/30 text-sm font-semibold transition-colors border border-primary/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
          >
            {mode === "2D" ? <Box size={16} /> : <ImageIcon size={16} />}
            Switch to {mode === "2D" ? "3D Viewer" : "2D Studio"}
          </button>
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
            <h2 className="font-display text-2xl font-bold text-foreground">
              {mode === "2D" ? "Setup Styling" : "3D Properties"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "2D" 
                ? "Select a studio model and drag sliders to fit the garment."
                : "Wrap garment patterns dynamically over the mannequin."}
            </p>
          </div>

          <div className="space-y-6 bg-card p-5 rounded-xl border border-border/50 shadow-sm relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* 2D ONLY: Model Selector */}
            {mode === "2D" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ImageIcon size={14} /> Select Your Model
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {MODELS_2D.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.url)}
                      className={`relative aspect-[3/4] overflow-hidden rounded-md border-2 transition-all ${
                        selectedModel === model.url ? "border-primary glow-primary scale-[1.02]" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <img src={model.url} alt={model.label} className="object-cover w-full h-full" draggable="false" />
                      <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur-sm p-1">
                        <span className="text-[10px] font-medium block text-center truncate">{model.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <hr className="border-border/50 my-4" />
              </div>
            )}

            {/* Common Upload: Front Garment */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shirt size={14} /> {mode === "3D" ? "Front Garment" : "Garment Overlay"}
              </h3>
              <UploadZone
                label="Front photo of garment"
                icon={<Shirt size={14} />}
                preview={frontGarmentUrl}
                onFile={handleFrontGarmentFile}
                onClear={() => setFrontGarmentUrl(null)}
              />
            </div>

            {/* 3D ONLY: Back Garment */}
            {mode === "3D" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Shirt size={14} /> Back Garment
                  </h3>
                  <div className="group relative cursor-help">
                    <Info size={14} className="text-muted-foreground" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 rounded bg-popover text-popover-foreground text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                      For a pro fit, upload photos of the garment laid flat. Front maps to chest, Back maps to shoulders.
                    </div>
                  </div>
                </div>
                
                <UploadZone
                  label="Back photo of garment"
                  icon={<Shirt size={14} />}
                  preview={backGarmentUrl}
                  onFile={handleBackGarmentFile}
                  onClear={() => setBackGarmentUrl(null)}
                />
              </div>
            )}

            <hr className="border-border/50" />

            {/* Tool-specific adjusters */}
            {mode === "2D" ? (
              <div className="space-y-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <SlidersHorizontal size={14} /> Adjust Fit
                </h3>
                
                <div className="space-y-3">
                  <label className="text-xs font-medium flex justify-between">
                    <span className="text-muted-foreground">Adjust Scale</span>
                    <span>{overlayScale.toFixed(2)}x</span>
                  </label>
                  <input 
                    type="range" min="0.5" max="2" step="0.05" 
                    value={overlayScale} 
                    onChange={(e) => setOverlayScale(parseFloat(e.target.value))}
                    className="w-full accent-primary" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium flex justify-between">
                    <span className="text-muted-foreground">Adjust Position X</span>
                  </label>
                  <input 
                    type="range" min="-200" max="200" step="1" 
                    value={overlayPosX} 
                    onChange={(e) => setOverlayPosX(parseInt(e.target.value))}
                    className="w-full accent-primary" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium flex justify-between">
                    <span className="text-muted-foreground">Adjust Position Y</span>
                  </label>
                  <input 
                    type="range" min="-300" max="300" step="1" 
                    value={overlayPosY} 
                    onChange={(e) => setOverlayPosY(parseInt(e.target.value))}
                    className="w-full accent-primary" 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                    Reset
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
            )}
            
            <hr className="border-border/50" />

            <button
              onClick={handleReset}
              className="w-full py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
            >
              Reset Setup
            </button>
          </div>
        </motion.aside>

        {/* Right Main Area */}
        <motion.div 
          key={mode} 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-h-[500px] md:min-h-0 relative rounded-xl border border-border/50 overflow-hidden bg-gradient-to-b from-card to-background shadow-2xl"
        >
          {mode === "2D" ? (
            <Studio2D 
              modelUrl={selectedModel} 
              garmentUrl={frontGarmentUrl} 
              scale={overlayScale} 
              posX={overlayPosX} 
              posY={overlayPosY} 
            />
          ) : (
            <Avatar3DContainer 
              ref={avatarRef} 
              frontGarmentUrl={frontGarmentUrl} 
              backGarmentUrl={backGarmentUrl} 
              autoRotate={autoRotate} 
            />
          )}
        </motion.div>
      </main>
    </div>
  );
}
