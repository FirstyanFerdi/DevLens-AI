import { OCRResult, OCRWord, OCRBlock } from './types';
import { createWorker, Worker } from 'tesseract.js';

let sharedWorker: Worker | null = null;
let isInitializing = false;

async function getWorker(onProgress?: (progress: number, status: string) => void): Promise<Worker> {
  if (sharedWorker) {
    return sharedWorker;
  }

  isInitializing = true;
  try {
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (onProgress && typeof m.progress === 'number') {
          const pct = Math.round(m.progress * 100);
          onProgress(pct, m.status || 'Processing image...');
        }
      },
    });
    sharedWorker = worker;
    return worker;
  } finally {
    isInitializing = false;
  }
}

/**
 * Extracts words and coordinates from SVG data-URI as an instant fallback / booster
 */
function extractFromSvgDataUri(svgDataUri: string): OCRResult | null {
  try {
    const prefix = 'data:image/svg+xml;utf8,';
    if (!svgDataUri.startsWith(prefix)) return null;

    const rawSvg = decodeURIComponent(svgDataUri.slice(prefix.length));
    if (typeof window === 'undefined') return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    const textNodes = Array.from(doc.querySelectorAll('text'));

    if (textNodes.length === 0) return null;

    const words: OCRWord[] = [];
    const blockTexts: string[] = [];

    textNodes.forEach((node) => {
      const text = node.textContent?.trim() || '';
      if (!text) return;

      blockTexts.push(text);
      const x = parseFloat(node.getAttribute('x') || '0');
      const y = parseFloat(node.getAttribute('y') || '0');
      const fontSize = parseFloat(node.getAttribute('font-size') || '14');

      // Approximate text width: ~fontSize * 0.6 * charLength
      const textWidth = text.length * fontSize * 0.6;
      const textHeight = fontSize * 1.2;

      // Split into individual words
      const subWords = text.split(/\s+/);
      let curX = x;
      subWords.forEach((sw) => {
        if (!sw) return;
        const swWidth = sw.length * fontSize * 0.6;
        words.push({
          text: sw,
          confidence: 99,
          bbox: {
            x0: Math.round(curX),
            y0: Math.round(y - textHeight + 2),
            x1: Math.round(curX + swWidth),
            y1: Math.round(y + 2),
          },
        });
        curX += swWidth + fontSize * 0.3;
      });
    });

    const rawText = blockTexts.join('\n');
    const blocks: OCRBlock[] = [
      {
        text: rawText,
        bbox: { x0: 0, y0: 0, x1: 900, y1: 500 },
        words,
      },
    ];

    return {
      rawText,
      blocks,
      words,
      status: 'success',
      progress: 100,
      statusText: 'SVG Vector Extraction Complete',
    };
  } catch (e) {
    console.warn('SVG extraction fallback failed:', e);
    return null;
  }
}

/**
 * Converts an image source or SVG data-URI into a rasterized PNG canvas
 */
async function rasterizeToCanvas(
  imageSource: string | HTMLCanvasElement | ImageData
): Promise<HTMLCanvasElement | string> {
  if (typeof imageSource !== 'string') {
    return imageSource as HTMLCanvasElement;
  }

  if (typeof window === 'undefined') {
    return imageSource;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 900;
      canvas.height = img.naturalHeight || 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      } else {
        resolve(imageSource);
      }
    };
    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
}

export async function runClientSideOCR(
  imageSource: string | HTMLCanvasElement | ImageData,
  onProgress?: (progress: number, status: string) => void
): Promise<OCRResult> {
  // If it's an SVG data URI, check if we have vector text elements
  if (typeof imageSource === 'string' && imageSource.startsWith('data:image/svg+xml')) {
    const svgResult = extractFromSvgDataUri(imageSource);
    if (svgResult && svgResult.words.length > 0) {
      if (onProgress) onProgress(100, 'Vector Elements Extracted');
      return svgResult;
    }
  }

  try {
    const rasterSource = await rasterizeToCanvas(imageSource);
    const worker = await getWorker(onProgress);

    const ret = await worker.recognize(rasterSource as any);
    const data = ret.data;

    const rawText = data.text || '';
    const words: OCRWord[] = (data.words || []).map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: {
        x0: w.bbox.x0,
        y0: w.bbox.y0,
        x1: w.bbox.x1,
        y1: w.bbox.y1,
      },
    }));

    const blocks: OCRBlock[] = (data.blocks || []).map((b) => ({
      text: b.text,
      bbox: {
        x0: b.bbox.x0,
        y0: b.bbox.y0,
        x1: b.bbox.x1,
        y1: b.bbox.y1,
      },
      words: (b.words || []).map((w) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: {
          x0: w.bbox.x0,
          y0: w.bbox.y0,
          x1: w.bbox.x1,
          y1: w.bbox.y1,
        },
      })),
    }));

    return {
      rawText,
      blocks,
      words,
      status: 'success',
      progress: 100,
      statusText: 'OCR Extraction Complete',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown OCR error';
    console.warn('Tesseract OCR fallback encountered:', err);

    // Fallback: If it was an SVG data-URI
    if (typeof imageSource === 'string') {
      const svgResult = extractFromSvgDataUri(imageSource);
      if (svgResult) return svgResult;
    }

    return {
      rawText: '',
      blocks: [],
      words: [],
      status: 'error',
      progress: 0,
      statusText: 'Failed',
      errorMessage: errorMsg,
    };
  }
}

export async function terminateOCRWorker(): Promise<void> {
  if (sharedWorker) {
    await sharedWorker.terminate();
    sharedWorker = null;
  }
}
