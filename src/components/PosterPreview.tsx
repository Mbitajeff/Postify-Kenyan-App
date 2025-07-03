
import React, { useRef, useEffect } from 'react';
import { Loader2, ImageIcon } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  gradient: string;
}

interface PosterPreviewProps {
  business_type: string;
  promo_text: string;
  theme: Theme | null;
  promo_line: string;
  poster_image: string;
  isGenerating: boolean;
}

const PosterPreview: React.FC<PosterPreviewProps> = ({
  business_type,
  promo_text,
  theme,
  promo_line,
  poster_image,
  isGenerating
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleDownload = () => {
      if (canvasRef.current && promo_line && poster_image) {
        const link = document.createElement('a');
        link.download = `postify-poster-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
      }
    };

    window.addEventListener('downloadPoster', handleDownload);
    return () => window.removeEventListener('downloadPoster', handleDownload);
  }, [promo_line, poster_image]);

  useEffect(() => {
    if (canvasRef.current && theme && promo_line && poster_image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 1000;

      // Load and draw background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw background image (poster_image)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Add gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, theme.colors.primary + '80');
        gradient.addColorStop(1, theme.colors.secondary + '80');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw promo_line text
        ctx.fillStyle = theme.colors.text;
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Wrap and draw promo_line
        const words = promo_line.split(' ');
        const lines = [];
        let currentLine = '';
        const maxWidth = canvas.width - 80;

        for (const word of words) {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        const startY = canvas.height - (lines.length * 60) - 100;
        lines.forEach((line, index) => {
          ctx.fillText(line.trim(), canvas.width / 2, startY + (index * 60));
        });
      };
      img.src = poster_image;
    }
  }, [theme, promo_line, poster_image]);

  if (isGenerating) {
    return (
      <div className="aspect-[4/5] bg-slate-700/30 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-300">Creating your amazing poster...</p>
        </div>
      </div>
    );
  }

  if (!promo_line || !poster_image || !theme) {
    return (
      <div className="aspect-[4/5] bg-slate-700/30 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Your poster will appear here</p>
          <p className="text-sm">Fill in the details and hit generate!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-[4/5] bg-slate-700/30 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Preview Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-300">
          <span>Business:</span>
          <span className="font-medium">{business_type}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Theme:</span>
          <span className="font-medium">{theme.name}</span>
        </div>
        <div className="text-slate-400 text-xs">
          <span>Promo Line:</span>
          <p className="mt-1 italic">"{promo_line}"</p>
        </div>
      </div>
    </div>
  );
};

export default PosterPreview;
