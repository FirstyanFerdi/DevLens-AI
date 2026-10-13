'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Annotation, AnnotationType, Point, OCRWord } from '@/lib/types';
import { Loader2, Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface AnnotationCanvasProps {
  imageSrc: string;
  annotations: Annotation[];
  activeTool: AnnotationType;
  activeColor: string;
  ocrWords: OCRWord[];
  showOcrBoxes: boolean;
  isProcessing: boolean;
  processingProgress: number;
  processingStep: string;
  onAddAnnotation: (ann: Annotation) => void;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  imageSrc,
  annotations,
  activeTool,
  activeColor,
  ocrWords,
  showOcrBoxes,
  isProcessing,
  processingProgress,
  processingStep,
  onAddAnnotation,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [penPoints, setPenPoints] = useState<Point[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Helper to convert client event coordinates to original image coordinates
  const getImageCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = (img.naturalWidth || canvas.width) / rect.width;
      const scaleY = (img.naturalHeight || canvas.height) / rect.height;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      return {
        x: Math.round(clientX * scaleX),
        y: Math.round(clientY * scaleY),
      };
    },
    []
  );

  // Redraw canvas content
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalWidth = img.naturalWidth || 800;
    const naturalHeight = img.naturalHeight || 600;

    canvas.width = naturalWidth;
    canvas.height = naturalHeight;

    // Draw base screenshot
    ctx.clearRect(0, 0, naturalWidth, naturalHeight);
    ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

    // Optional: Draw OCR word bounding boxes
    if (showOcrBoxes && ocrWords.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(57, 197, 187, 0.45)';
      ctx.fillStyle = 'rgba(224, 247, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      for (const word of ocrWords) {
        const w = word.bbox.x1 - word.bbox.x0;
        const h = word.bbox.y1 - word.bbox.y0;
        ctx.strokeRect(word.bbox.x0, word.bbox.y0, w, h);
        ctx.fillRect(word.bbox.x0, word.bbox.y0, w, h);
      }
      ctx.restore();
    }

    // Draw Existing Annotations
    let pinCounter = 1;
    for (const ann of annotations) {
      ctx.save();
      ctx.strokeStyle = ann.color || '#39C5BB';
      ctx.fillStyle = ann.color || '#39C5BB';
      ctx.lineWidth = 3;

      if (ann.type === 'box') {
        // Glowing rectangle
        ctx.fillStyle = hexToRgba(ann.color, 0.15);
        ctx.fillRect(ann.x, ann.y, ann.width, ann.height);

        ctx.lineWidth = 3;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

        // Corner accents
        drawCornerAccents(ctx, ann.x, ann.y, ann.width, ann.height, ann.color);

        // Label badge
        const badgeLabel = ann.label || `Box [${ann.width}×${ann.height}]`;
        drawLabelBadge(ctx, badgeLabel, ann.x, ann.y - 8, ann.color);
      } else if (ann.type === 'arrow' && ann.points && ann.points.length >= 2) {
        const from = ann.points[0];
        const to = ann.points[1];
        drawArrow(ctx, from.x, from.y, to.x, to.y, ann.color);
      } else if (ann.type === 'pen' && ann.points && ann.points.length > 1) {
        ctx.strokeStyle = hexToRgba(ann.color, 0.7);
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
      } else if (ann.type === 'pin') {
        const label = ann.label || `${pinCounter++}`;
        drawNumberedPin(ctx, ann.x, ann.y, label, ann.color);
      }
      ctx.restore();
    }

    // Draw In-Progress Interactive Annotation
    if (isDrawing && startPoint && currentPoint) {
      ctx.save();
      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = 3;

      if (activeTool === 'box') {
        const x = Math.min(startPoint.x, currentPoint.x);
        const y = Math.min(startPoint.y, currentPoint.y);
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);

        ctx.fillStyle = hexToRgba(activeColor, 0.2);
        ctx.fillRect(x, y, width, height);

        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x, y, width, height);

        drawCornerAccents(ctx, x, y, width, height, activeColor);
      } else if (activeTool === 'arrow') {
        drawArrow(ctx, startPoint.x, startPoint.y, currentPoint.x, currentPoint.y, activeColor);
      } else if (activeTool === 'pen' && penPoints.length > 1) {
        ctx.strokeStyle = hexToRgba(activeColor, 0.7);
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(penPoints[0].x, penPoints[0].y);
        for (let i = 1; i < penPoints.length; i++) {
          ctx.lineTo(penPoints[i].x, penPoints[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [
    annotations,
    activeTool,
    activeColor,
    isDrawing,
    startPoint,
    currentPoint,
    penPoints,
    ocrWords,
    showOcrBoxes,
  ]);

  // Handle image load & redraw
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, renderCanvas]);

  // Redraw when state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getImageCoordinates(e);

    if (activeTool === 'pin') {
      const pinCount = annotations.filter((a) => a.type === 'pin').length + 1;
      onAddAnnotation({
        id: `pin-${Date.now()}`,
        type: 'pin',
        x: pt.x,
        y: pt.y,
        width: 32,
        height: 32,
        label: `${pinCount}`,
        color: activeColor,
      });
      return;
    }

    setIsDrawing(true);
    setStartPoint(pt);
    setCurrentPoint(pt);

    if (activeTool === 'pen') {
      setPenPoints([pt]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getImageCoordinates(e);
    setCurrentPoint(pt);

    if (activeTool === 'pen') {
      setPenPoints((prev) => [...prev, pt]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentPoint) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
      setPenPoints([]);
      return;
    }

    const minX = Math.min(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    if (activeTool === 'box' && width > 10 && height > 10) {
      onAddAnnotation({
        id: `box-${Date.now()}`,
        type: 'box',
        x: minX,
        y: minY,
        width,
        height,
        color: activeColor,
      });
    } else if (activeTool === 'arrow' && (width > 15 || height > 15)) {
      onAddAnnotation({
        id: `arrow-${Date.now()}`,
        type: 'arrow',
        x: startPoint.x,
        y: startPoint.y,
        width: currentPoint.x - startPoint.x,
        height: currentPoint.y - startPoint.y,
        points: [startPoint, currentPoint],
        color: activeColor,
      });
    } else if (activeTool === 'pen' && penPoints.length > 2) {
      onAddAnnotation({
        id: `pen-${Date.now()}`,
        type: 'pen',
        x: minX,
        y: minY,
        width: Math.max(width, 20),
        height: Math.max(height, 20),
        points: penPoints,
        color: activeColor,
      });
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setPenPoints([]);
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl bg-slate-900 overflow-hidden shadow-card border border-miku-mint-border group"
    >
      {/* Zoom / View controls bar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
          className="p-1 text-white hover:text-miku-cyan transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono text-white/80 px-1">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
          className="p-1 text-white hover:text-miku-cyan transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1 text-white hover:text-miku-cyan transition-colors ml-1 border-l border-white/20 pl-2"
          title="Reset Zoom"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Interactive Canvas Container */}
      <div className="overflow-auto max-h-[620px] flex items-center justify-center p-4 bg-slate-950/40">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          className="max-w-full h-auto cursor-crosshair rounded-xl shadow-2xl transition-transform duration-100"
        />
      </div>

      {/* Processing Spinner Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center z-30 space-y-4 text-white">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-miku-cyan/20 border-t-miku-cyan animate-spin" />
            <Sparkles className="w-6 h-6 text-miku-pink absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-miku-cyan">
              Processing Screenshot
            </h4>
            <p className="text-xs text-white/80 font-mono">
              {processingStep || 'Running Tesseract OCR & Spatial Engine...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-miku-cyan to-miku-pink transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-teal-200">
            {processingProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

// Canvas Drawing Helpers
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 57;
  const g = parseInt(clean.substring(2, 4), 16) || 197;
  const b = parseInt(clean.substring(4, 6), 16) || 187;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawCornerAccents(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  const len = Math.min(14, w / 4, h / 4);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Top-Left
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  // Top-Right
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  // Bottom-Left
  ctx.moveTo(x, y + h - len);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + len, y + h);
  // Bottom-Right
  ctx.moveTo(x + w - len, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
}

function drawLabelBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string
) {
  ctx.font = 'bold 12px sans-serif';
  const metrics = ctx.measureText(text);
  const padX = 8;
  const padY = 4;
  const bw = metrics.width + padX * 2;
  const bh = 18;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y - bh, bw, bh, 4);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x + padX, y - bh + 13);
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string
) {
  const headLen = 16;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  // Draw arrow shaft
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Draw arrow head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

function drawNumberedPin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color: string
) {
  const radius = 16;
  // Pin circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // White stroke
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Pin text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`[${label}]`, x, y);
}
