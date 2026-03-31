import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, User, Zap, RotateCcw } from "lucide-react";
import { ModelGallery } from "@/components/ModelGallery";
import { UploadZone } from "@/components/UploadZone";
import { ScannerOverlay } from "@/components/ScannerOverlay";
import { ResultViewer } from "@/components/ResultViewer";
import { startTryOn, fileToDataUrl, VtonStatus } from "@/lib/vton-api";
import { toast } from "sonner";

type Category = "upper_body" | "lower_body" | "dresses";

const categories: { value: Category; label: string }[] = [
  { value: "upper_body", label: "Upper Body" },
  { value: "lower_body", label: "Lower Body" },
  { value: "dresses", label: "Dress" },
];

export default function Index() {
  const [personImg, setPersonImg] = useState<string | null>(null);
  const [garmentImg, setGarmentImg] = useState<string | null>(null);
  const [selectedModelSrc, setSelectedModelSrc] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("upper_body");
  const [status, setStatus] = useState<VtonStatus | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const assetUrlToDataUrl = useCallback(async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to load the selected model image.");
    }

    const blob = await response.blob();
    const file = new File([blob], "model-image", { type: blob.type || "image/jpeg" });
    return fileToDataUrl(file);
  }, []);

  const handlePersonFile = useCallback(async (file: File) => {
    const url = await fileToDataUrl(file);
    setSelectedModelSrc(null);
    setPersonImg(url);
  }, []);

  const handleSelectModel = useCallback(
    async (src: string) => {
      try {
        const url = await assetUrlToDataUrl(src);
        setSelectedModelSrc(src);
        setPersonImg(url);
      } catch (error) {
        console.error("Failed to load model image:", error);
        toast.error("Failed to load the selected model image.");
      }
    },
    [assetUrlToDataUrl],
  );

  const handleGarmentFile = useCallback(async (file: File) => {
    const url = await fileToDataUrl(file);
    setGarmentImg(url);
  }, []);

  const handleGenerate = async () => {
    if (!personImg || !garmentImg) {
      toast.error("Please select a person and upload a garment image.");
      return;
    }

    setStatus("starting");
    setResultUrl(null);

    try {
      setStatus("processing");
      const result = await startTryOn(personImg, garmentImg, category);

      if (result.status === "succeeded" && result.output) {
        const output = Array.isArray(result.output) ? result.output[0] : result.output;
        setResultUrl(output);
        setStatus(null);
        toast.success("Try-on complete!");
      } else if (result.error) {
        setStatus(null);
        toast.error(result.error);
      } else {
        setStatus(null);
        toast.error("No image was generated. Try different photos.");
      }
    } catch (err: any) {
      setStatus(null);
      toast.error(err.message || "Something went wrong.");
    }
  };

  const handleReset = () => {
    setPersonImg(null);
    setGarmentImg(null);
    setSelectedModelSrc(null);
    setResultUrl(null);
    setStatus(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap size={16} className="text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg text-foreground">
              VisionFit <span className="text-primary">Pro</span>
            </h1>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md glass glass-hover text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence>
          {status && <ScannerOverlay status={status} />}
        </AnimatePresence>

        {resultUrl && personImg ? (
          <ResultViewer
            resultUrl={resultUrl}
            personImg={personImg}
            onClose={() => setResultUrl(null)}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero */}
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient">
                Virtual Try-On Studio
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Select a model or upload your photo, add a garment, and see the magic.
              </p>
            </div>

            {/* Dual zone layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Person */}
              <div className="space-y-6">
                <UploadZone
                  label="Upload Your Photo"
                  icon={<User size={14} />}
                  preview={personImg}
                  onFile={handlePersonFile}
                  onClear={() => setPersonImg(null)}
                />
                <div className="relative">
                  <div className="absolute inset-x-0 top-0 h-px bg-border" />
                  <p className="relative text-center text-xs text-muted-foreground bg-background px-3 -top-2 mx-auto w-fit">
                    or select a model
                  </p>
                </div>
                <ModelGallery selected={selectedModelSrc} onSelect={handleSelectModel} />
              </div>

              {/* Right: Garment */}
              <div className="space-y-6">
                <UploadZone
                  label="Garment Image"
                  icon={<Shirt size={14} />}
                  preview={garmentImg}
                  onFile={handleGarmentFile}
                  onClear={() => setGarmentImg(null)}
                />

                {/* Category selector */}
                <div className="space-y-2">
                  <h3 className="text-sm font-display font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </h3>
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                          category === cat.value
                            ? "bg-primary text-primary-foreground"
                            : "glass glass-hover text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!personImg || !garmentImg || !!status}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity glow-primary"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Zap size={16} />
                    Generate Try-On
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
