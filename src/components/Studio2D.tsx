import React from 'react';

interface Studio2DProps {
  modelUrl: string | null;
  garmentUrl: string | null;
  scale: number;
  widthWarp: number;
  posX: number;
  posY: number;
}

export function Studio2D({ modelUrl, garmentUrl, scale, widthWarp, posX, posY }: Studio2DProps) {
  if (!modelUrl) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-muted/10 border border-dashed border-border rounded-xl p-8 text-center">
        <h3 className="text-lg font-display font-semibold text-foreground">No Model Selected</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Select a 2D model from the sidebar to start styling your static look.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative overflow-hidden flex items-center justify-center bg-background rounded-xl shadow-inner group">
      <div className="relative inline-block h-[600px] max-w-full select-none">
        {/* Base Model Image */}
        <img 
          src={modelUrl} 
          alt="2D Base Model" 
          className="h-full w-auto object-contain drop-shadow-2xl"
          draggable="false"
        />
        
        {/* Garment Overlay */}
        {garmentUrl && (
          <img 
            src={garmentUrl} 
            alt="Garment Overlay" 
            className="absolute z-10 origin-center opacity-[0.97] pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scaleX(${scale * widthWarp}) scaleY(${scale})`,
              width: '300px' // Base width, scalable via slider
            }}
            draggable="false"
          />
        )}
      </div>
    </div>
  );
}
