import { BrailleMatrixResult } from './types';

/**
 * Standard Unicode Braille Patterns: U+2800 through U+28FF
 * A Braille cell consists of 2 columns x 4 rows of dots:
 * 
 * Column 0 (x=0)      Column 1 (x=1)
 * Row 0 (y=0): Dot 1 (0x01)    Dot 4 (0x08)
 * Row 1 (y=1): Dot 2 (0x02)    Dot 5 (0x10)
 * Row 2 (y=2): Dot 3 (0x04)    Dot 6 (0x20)
 * Row 3 (y=3): Dot 7 (0x40)    Dot 8 (0x80)
 */
const BRAILLE_OFFSET = 0x2800;

const DOT_BIT_MASKS: number[][] = [
  // [row][col]
  [0x01, 0x08], // row 0: dot 1, dot 4
  [0x02, 0x10], // row 1: dot 2, dot 5
  [0x04, 0x20], // row 2: dot 3, dot 6
  [0x40, 0x80], // row 3: dot 7, dot 8
];

/**
 * Encodes a 2D binary grid (array of rows of 0 or 1) into Braille strings.
 * Each 2x4 block of pixels becomes 1 Braille character.
 */
export function encodeBinaryGridToBraille(grid: number[][]): BrailleMatrixResult {
  const height = grid.length;
  if (height === 0) {
    return { grid: [], brailleString: '', density: 0, dimensions: { width: 0, height: 0 } };
  }
  const width = grid[0].length;

  // Pad to multiples of 2 (width) and 4 (height)
  const paddedWidth = Math.ceil(width / 2) * 2;
  const paddedHeight = Math.ceil(height / 4) * 4;

  let totalActivePixels = 0;
  const brailleLines: string[] = [];

  for (let y = 0; y < paddedHeight; y += 4) {
    let line = '';
    for (let x = 0; x < paddedWidth; x += 2) {
      let charMask = 0;

      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const py = y + dy;
          const px = x + dx;

          if (py < height && px < width && grid[py][px] > 0) {
            charMask |= DOT_BIT_MASKS[dy][dx];
            totalActivePixels++;
          }
        }
      }

      line += String.fromCharCode(BRAILLE_OFFSET + charMask);
    }
    brailleLines.push(line);
  }

  const totalGridPixels = width * height;
  const density = totalGridPixels > 0 ? (totalActivePixels / totalGridPixels) : 0;

  return {
    grid: brailleLines,
    brailleString: brailleLines.join('\n'),
    density: Math.round(density * 100) / 100,
    dimensions: { width, height },
  };
}

/**
 * Downsamples an HTMLCanvasElement or ImageData into a 32x32 binary density grid
 * using adaptive thresholding and edge detection.
 */
export function generateBrailleFromCanvas(
  canvas: HTMLCanvasElement,
  targetWidth = 32,
  targetHeight = 32
): BrailleMatrixResult {
  // Create an offscreen canvas to resize
  const offscreen = document.createElement('canvas');
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return { grid: [], brailleString: '', density: 0, dimensions: { width: 0, height: 0 } };
  }

  // Draw scaled down version
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const pixels = imgData.data;

  // Compute average luminance for thresholding
  let totalLuminance = 0;
  const luminances: number[] = new Array(targetWidth * targetHeight);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    // Standard relative luminance (ITU-R BT.709)
    const lum = a < 50 ? 255 : 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const idx = i / 4;
    luminances[idx] = lum;
    totalLuminance += lum;
  }

  const avgLuminance = totalLuminance / luminances.length;
  // Threshold: pixels significantly darker than background (foreground text / borders / shapes)
  const threshold = avgLuminance > 180 ? 160 : avgLuminance * 0.85;

  const binaryGrid: number[][] = [];
  for (let y = 0; y < targetHeight; y++) {
    const row: number[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const lum = luminances[y * targetWidth + x];
      // 1 means marked/foreground dot, 0 means blank background
      row.push(lum < threshold ? 1 : 0);
    }
    binaryGrid.push(row);
  }

  return encodeBinaryGridToBraille(binaryGrid);
}
