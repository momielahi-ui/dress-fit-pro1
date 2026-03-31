import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Shirt, Box, Image as ImageIcon, Download, Loader2, AlertCircle, RefreshCw, Sparkles, RotateCw, RotateCcw, ZoomIn, ZoomOut, Info
} from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { fileToDataUrl } from "@/lib/vton-api";
import { Avatar3DContainer, Avatar3DRef } from "@/components/Avatar3D";

const MODELS_2D = [
  { id: "male_casual", label: "Male Casual", url: "/models/male_casual.png" },
  { id: "female_casual", label: "Female Casual", url: "/models/female_casual.png" },
  { id: "male_athletic", label: "Male Athletic", url: "/models/male_athletic.png" },
  { id: "female_athletic", label: "Female Athletic", url: "/models/female_athletic.png" },
];

type AiStatus = "idle" | "processing" | "done" | "error";

export default function Index() {
  const [mode, setMode] = useState<"2D" | "3D">("2D");

  // Garment State
  const [frontGarmentUrl, setFrontGarmentUrl] = useState<string | null>(null);
  const [backGarmentUrl, setBackGarmentUrl] = useState<string | null>(null);

  // 2D State
  const [selectedModel, setSelectedModel] = useState<string | null>(MODELS_2D[0].url);
  
  // AI State
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // 3D State
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const avatarRef = useRef<Avatar3DRef>(null);

  const handleFrontGarmentFile = useCallback(async (file: File) => {
    const rawUrl = await fileToDataUrl(file);
    setFrontGarmentUrl(rawUrl);
    setAiResultUrl(null);
    setAiStatus("idle");
    setAiError(null);
  }, []);

  const handleBackGarmentFile = useCallback(async (file: File) => {
    const url = await fileToDataUrl(file);
    setBackGarmentUrl(url);
  }, []);

  const handleGenerateAI = async () => {
    if (!selectedModel || !frontGarmentUrl) return;

    setAiStatus("processing");
    setAiResultUrl(null);
    setAiError(null);

    try {
      // Fetch the model image and convert to base64
      const modelRes = await fetch(selectedModel);
      const modelBlob = await modelRes.blob();
      const humanImg = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(modelBlob);
      });

      const response = await fetch("/api/vton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          humanImg,
          garmentImg: frontGarmentUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.details || data.error || "API request failed");
      }

      setAiResultUrl(data.result);
      setAiStatus("done");
    } catch (err: any) {
      console.error("AI VTON Error:", err);
      setAiError(err.message || "Something went wrong. Please try again.");
      setAiStatus("error");
    }
  };

  const handleDownload = () => {
    if (!aiResultUrl) return;
    const link = document.createElement("a");
    link.href = aiResultUrl;
    link.download = "visionfit-ai-tryon.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFrontGarmentUrl(null);
    setBackGarmentUrl(null);
    setAiResultUrl(null);
    setAiStatus("idle");
    setAiError(null);
    if (mode === "3D") {
      setAutoRotate(true);
      avatarRef.current?.resetView();
    }
  };

  const canGenerate = !!selectedModel && !!frontGarmentUrl && aiStatus !== "processing";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_18px_rgba(52,211,153,0.25)]">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground tracking-wide leading-none">
                VisionFit <span className="text-primary">Pro</span>
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">AI Virtual Studio</p>
            </div>
          </div>

          <button
            onClick={() => setMode(mode === "2D" ? "3D" : "2D")}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-primary/15 text-primary hover:bg-primary/25 text-sm font-semibold transition-all border border-primary/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
          >
            {mode === "2D" ? <Box size={15} /> : <ImageIcon size={15} />}
            {mode === "2D" ? "Switch to 3D Viewer" : "Switch to AI Studio"}
          </button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8">

        {/* Left Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-80 space-y-6 flex-shrink-0"
        >
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {mode === "2D" ? "AI Studio" : "3D Viewer"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "2D"
                ? "Select a model, upload a garment, and let the AI do the magic."
                : "Wrap garment textures over the 3D mannequin."}
            </p>
          </div>

          <div className="space-y-5 bg-card p-5 rounded-2xl border border-border/50 shadow-md relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* 2D: Model Selector */}
            {mode === "2D" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ImageIcon size={13} /> Select Studio Model
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {MODELS_2D.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model.url); setAiResultUrl(null); setAiStatus("idle"); }}
                      className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition-all ${
                        selectedModel === model.url
                          ? "border-primary shadow-[0_0_12px_rgba(52,211,153,0.3)] scale-[1.02]"
                          : "border-border/60 hover:border-muted-foreground/60"
                      }`}
                    >
                      <img src={model.url} alt={model.label} className="object-cover w-full h-full" draggable="false" />
                      <div className="absolute inset-x-0 bottom-0 bg-background/85 backdrop-blur-sm py-1.5">
                        <span className="text-[10px] font-medium block text-center truncate text-foreground">{model.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <hr className="border-border/40" />
              </div>
            )}

            {/* Garment Upload */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shirt size={13} /> {mode === "3D" ? "Front Garment" : "Garment Photo"}
              </h3>
              <UploadZone
                label="Upload garment image"
                icon={<Shirt size={14} />}
                preview={frontGarmentUrl}
                onFile={handleFrontGarmentFile}
                onClear={() => { setFrontGarmentUrl(null); setAiResultUrl(null); setAiStatus("idle"); }}
              />
            </div>

            {/* 3D Only: Back garment */}
            {mode === "3D" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Shirt size={13} /> Back Garment
                  <div className="group relative cursor-help ml-auto">
                    <Info size={13} className="text-muted-foreground" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 rounded-lg bg-popover text-popover-foreground text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none shadow-lg border border-border">
                      Lay the garment flat and photograph the back. This maps to the mannequin's shoulders.
                    </div>
                  </div>
                </h3>
                <UploadZone
                  label="Upload back photo"
                  icon={<Shirt size={14} />}
                  preview={backGarmentUrl}
                  onFile={handleBackGarmentFile}
                  onClear={() => setBackGarmentUrl(null)}
                />
              </div>
            )}

            <hr className="border-border/40" />

            {/* 2D: AI Generate Button */}
            {mode === "2D" && (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: canGenerate ? 1.02 : 1 }}
                  whileTap={{ scale: canGenerate ? 0.97 : 1 }}
                  onClick={handleGenerateAI}
                  disabled={!canGenerate}
                  id="btn-generate-ai"
                  className={`w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 ${
                    canGenerate
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(52,211,153,0.35)] hover:shadow-[0_0_28px_rgba(52,211,153,0.5)]"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                >
                  {aiStatus === "processing" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      AI is stitching your garment...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate AI Try-On
                    </>
                  )}
                </motion.button>

                {!selectedModel && (
                  <p className="text-xs text-muted-foreground text-center">← Select a model above</p>
                )}
                {selectedModel && !frontGarmentUrl && (
                  <p className="text-xs text-muted-foreground text-center">← Upload your garment above</p>
                )}

                {/* Download button once result is ready */}
                {aiStatus === "done" && aiResultUrl && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleDownload}
                    id="btn-download-result"
                    className="w-full py-3 rounded-xl font-display font-semibold text-sm tracking-wide border border-primary/40 text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download High-Res Result
                  </motion.button>
                )}

                {/* Error state */}
                {aiStatus === "error" && aiError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
                    <AlertCircle size={15} className="text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-destructive">Generation Failed</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{aiError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3D: Camera Controls */}
            {mode === "3D" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Box size={13} /> Camera Controls
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      autoRotate
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <RotateCw size={15} className={autoRotate ? "animate-spin-slow" : ""} />
                    Auto-Rotate
                  </button>
                  <button onClick={() => avatarRef.current?.resetView()} className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-all">
                    <RotateCcw size={15} /> Reset
                  </button>
                  <button onClick={() => avatarRef.current?.zoomIn()} className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-all">
                    <ZoomIn size={15} /> Zoom In
                  </button>
                  <button onClick={() => avatarRef.current?.zoomOut()} className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-all">
                    <ZoomOut size={15} /> Zoom Out
                  </button>
                </div>
              </div>
            )}

            <hr className="border-border/40" />

            <button
              onClick={handleReset}
              className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all border border-transparent hover:border-destructive/15 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Reset Studio
            </button>
          </div>
        </motion.aside>

        {/* Right: Main Viewer */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-h-[500px] md:min-h-0 relative rounded-2xl border border-border/50 overflow-hidden bg-gradient-to-b from-card/80 to-background shadow-2xl"
        >

          {mode === "2D" ? (
            <div className="w-full h-full min-h-[500px] relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                {/* AI Result */}
                {aiStatus === "done" && aiResultUrl ? (
                  <motion.div
                    key="ai-result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full flex items-center justify-center p-4"
                  >
                    <img
                      src={aiResultUrl}
                      alt="AI Generated Try-On"
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-semibold rounded-full backdrop-blur-sm">
                        ✦ AI Generated
                      </span>
                    </div>
                  </motion.div>
                ) : aiStatus === "processing" ? (
                  /* Processing State */
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-6 p-12"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={24} className="text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-display font-bold text-lg text-foreground">AI is stitching your garment</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Our AI engine is analyzing the garment texture, pose, and lighting. This takes 15–60 seconds.
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  /* Default idle: show model with garment preview */
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full relative flex items-center justify-center"
                  >
                    {selectedModel ? (
                      <>
                        <img
                          src={selectedModel}
                          alt="Studio Model"
                          className="max-w-full max-h-full object-contain"
                          style={{ maxHeight: "680px" }}
                        />
                        {frontGarmentUrl && (
                          <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-md border border-primary/30 rounded-xl p-3 shadow-xl flex items-center gap-3">
                            <img src={frontGarmentUrl} alt="Garment" className="w-14 h-14 object-contain rounded-lg bg-background border border-border" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">Garment Ready</p>
                              <p className="text-[10px] text-muted-foreground">Click "Generate AI Try‑On" →</p>
                            </div>
                          </div>
                        )}
                        {!frontGarmentUrl && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border/60 rounded-full text-xs text-muted-foreground">
                            Upload a garment in the sidebar to begin
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <ImageIcon size={28} className="text-primary/60" />
                        </div>
                        <div>
                          <p className="font-display font-semibold text-foreground">Select a Studio Model</p>
                          <p className="text-sm text-muted-foreground mt-1">Choose a model from the left panel to get started</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

      {/* Footer */}
      <footer className="border-t border-border/30 mt-8">
        <div className="container max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 VisionFit Pro · AI-Powered Virtual Try-On Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
