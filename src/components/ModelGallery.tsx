import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Avatar3D } from "@/components/Avatar3D";
import modelMale from "@/assets/model-male.jpg";
import modelFemale from "@/assets/model-female.jpg";
import modelAlt from "@/assets/model-alt.jpg";

const models = [
  {
    id: "male",
    label: "Model A",
    src: modelMale,
    skinColor: "#c68642",
    shirtColor: "#1a1a2e",
    pantsColor: "#16213e",
  },
  {
    id: "female",
    label: "Model B",
    src: modelFemale,
    skinColor: "#f1c27d",
    shirtColor: "#e74c3c",
    pantsColor: "#2c3e50",
  },
  {
    id: "alt",
    label: "Model C",
    src: modelAlt,
    skinColor: "#8d5524",
    shirtColor: "#27ae60",
    pantsColor: "#34495e",
  },
];

interface ModelGalleryProps {
  selected: string | null;
  onSelect: (src: string) => void | Promise<void>;
}

export function ModelGallery({ selected, onSelect }: ModelGalleryProps) {
  const selectedModel = models.find((m) => m.src === selected);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-display font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <User size={14} />
        Choose a 3D Model
      </h3>

      {/* 3D Preview of selected model */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg glass overflow-hidden"
        >
          <Avatar3D
            skinColor={selectedModel.skinColor}
            shirtColor={selectedModel.shirtColor}
            pantsColor={selectedModel.pantsColor}
          />
          <div className="p-2 text-center">
            <span className="text-xs font-display font-medium text-foreground">
              {selectedModel.label} — Drag to rotate
            </span>
          </div>
        </motion.div>
      )}

      {/* Thumbnail selectors */}
      <div className="grid grid-cols-3 gap-3">
        {models.map((model) => (
          <motion.button
            key={model.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              void onSelect(model.src);
            }}
            className={`relative overflow-hidden rounded-lg glass glass-hover transition-all ${
              selected === model.src ? "ring-2 ring-primary glow-primary" : ""
            }`}
          >
            <img
              src={model.src}
              alt={model.label}
              className="w-full aspect-[3/4] object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-2">
              <span className="text-xs font-display font-medium text-foreground">
                {model.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
