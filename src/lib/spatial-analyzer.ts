import { Annotation, OCRWord, OCRBlock, SpatialAnchor, AdjacentElement, BoundingBox } from './types';

function getScreenRegion(x: number, y: number, imgWidth: number, imgHeight: number): string {
  if (imgWidth <= 0 || imgHeight <= 0) return 'Center';

  const relX = x / imgWidth;
  const relY = y / imgHeight;

  const vertical = relY < 0.33 ? 'Upper' : relY < 0.66 ? 'Middle' : 'Lower';
  const horizontal = relX < 0.33 ? 'Left' : relX < 0.66 ? 'Center' : 'Right';

  return `${vertical}-${horizontal} quadrant`;
}

function calculateOverlap(min1: number, max1: number, min2: number, max2: number): number {
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
}

export function analyzeSpatialRelationships(
  annotations: Annotation[],
  ocrWords: OCRWord[],
  ocrBlocks: OCRBlock[],
  imageDimensions: { width: number; height: number }
): SpatialAnchor[] {
  if (annotations.length === 0) {
    return [];
  }

  // Combine words and blocks to identify coherent text labels
  const textElements: { text: string; bbox: BoundingBox; centerX: number; centerY: number }[] = [];

  // Group nearby words or use blocks if available
  if (ocrBlocks.length > 0) {
    for (const block of ocrBlocks) {
      const clean = block.text.trim().replace(/\s+/g, ' ');
      if (clean.length > 0) {
        textElements.push({
          text: clean,
          bbox: block.bbox,
          centerX: (block.bbox.x0 + block.bbox.x1) / 2,
          centerY: (block.bbox.y0 + block.bbox.y1) / 2,
        });
      }
    }
  } else {
    for (const word of ocrWords) {
      const clean = word.text.trim();
      if (clean.length > 1) {
        textElements.push({
          text: clean,
          bbox: word.bbox,
          centerX: (word.bbox.x0 + word.bbox.x1) / 2,
          centerY: (word.bbox.y0 + word.bbox.y1) / 2,
        });
      }
    }
  }

  const results: SpatialAnchor[] = [];

  for (const ann of annotations) {
    // Standardize bounds
    const boxX = ann.x;
    const boxY = ann.y;
    const boxW = Math.max(ann.width, 20);
    const boxH = Math.max(ann.height, 20);
    const boxX2 = boxX + boxW;
    const boxY2 = boxY + boxH;
    const boxCenterX = boxX + boxW / 2;
    const boxCenterY = boxY + boxH / 2;

    const screenRegion = getScreenRegion(boxCenterX, boxCenterY, imageDimensions.width, imageDimensions.height);

    const adjacentElements: AdjacentElement[] = [];
    const elementsInside: string[] = [];

    let nearestLeft: { el: typeof textElements[0]; dist: number } | null = null;
    let nearestRight: { el: typeof textElements[0]; dist: number } | null = null;
    let nearestAbove: { el: typeof textElements[0]; dist: number } | null = null;
    let nearestBelow: { el: typeof textElements[0]; dist: number } | null = null;

    for (const el of textElements) {
      const { bbox, text } = el;
      const elW = bbox.x1 - bbox.x0;
      const elH = bbox.y1 - bbox.y0;

      // Inside check
      if (bbox.x0 >= boxX - 10 && bbox.x1 <= boxX2 + 10 && bbox.y0 >= boxY - 10 && bbox.y1 <= boxY2 + 10) {
        elementsInside.push(text);
        continue;
      }

      const vOverlap = calculateOverlap(boxY, boxY2, bbox.y0, bbox.y1);
      const hOverlap = calculateOverlap(boxX, boxX2, bbox.x0, bbox.x1);

      // Element to the Left
      if (bbox.x1 <= boxX + 15) {
        const dist = boxX - bbox.x1;
        const vWeight = vOverlap > 0 ? 1 : 1 + Math.abs(boxCenterY - el.centerY) / 50;
        const score = dist * vWeight;
        if (!nearestLeft || score < nearestLeft.dist) {
          nearestLeft = { el, dist: score };
        }
      }

      // Element to the Right
      if (bbox.x0 >= boxX2 - 15) {
        const dist = bbox.x0 - boxX2;
        const vWeight = vOverlap > 0 ? 1 : 1 + Math.abs(boxCenterY - el.centerY) / 50;
        const score = dist * vWeight;
        if (!nearestRight || score < nearestRight.dist) {
          nearestRight = { el, dist: score };
        }
      }

      // Element Above
      if (bbox.y1 <= boxY + 15) {
        const dist = boxY - bbox.y1;
        const hWeight = hOverlap > 0 ? 1 : 1 + Math.abs(boxCenterX - el.centerX) / 50;
        const score = dist * hWeight;
        if (!nearestAbove || score < nearestAbove.dist) {
          nearestAbove = { el, dist: score };
        }
      }

      // Element Below
      if (bbox.y0 >= boxY2 - 15) {
        const dist = bbox.y0 - boxY2;
        const hWeight = hOverlap > 0 ? 1 : 1 + Math.abs(boxCenterX - el.centerX) / 50;
        const score = dist * hWeight;
        if (!nearestBelow || score < nearestBelow.dist) {
          nearestBelow = { el, dist: score };
        }
      }
    }

    if (elementsInside.length > 0) {
      adjacentElements.push({
        position: 'inside',
        text: elementsInside.slice(0, 3).join('; '),
        distance: 0,
        bbox: { x0: boxX, y0: boxY, x1: boxX2, y1: boxY2 },
      });
    }

    if (nearestLeft && nearestLeft.dist < 600) {
      adjacentElements.push({
        position: 'left',
        text: nearestLeft.el.text,
        distance: Math.round(nearestLeft.dist),
        bbox: nearestLeft.el.bbox,
      });
    }

    if (nearestRight && nearestRight.dist < 600) {
      adjacentElements.push({
        position: 'right',
        text: nearestRight.el.text,
        distance: Math.round(nearestRight.dist),
        bbox: nearestRight.el.bbox,
      });
    }

    if (nearestAbove && nearestAbove.dist < 400) {
      adjacentElements.push({
        position: 'above',
        text: nearestAbove.el.text,
        distance: Math.round(nearestAbove.dist),
        bbox: nearestAbove.el.bbox,
      });
    }

    if (nearestBelow && nearestBelow.dist < 400) {
      adjacentElements.push({
        position: 'below',
        text: nearestBelow.el.text,
        distance: Math.round(nearestBelow.dist),
        bbox: nearestBelow.el.bbox,
      });
    }

    // Build natural language description
    const descParts: string[] = [];
    if (nearestLeft) {
      descParts.push(`Right of "${truncateText(nearestLeft.el.text, 25)}"`);
    }
    if (nearestRight) {
      descParts.push(`Left of "${truncateText(nearestRight.el.text, 25)}"`);
    }
    if (nearestAbove && descParts.length < 2) {
      descParts.push(`Below "${truncateText(nearestAbove.el.text, 25)}"`);
    }
    if (nearestBelow && descParts.length < 2) {
      descParts.push(`Above "${truncateText(nearestBelow.el.text, 25)}"`);
    }

    const relativeDescription = descParts.length > 0
      ? descParts.join(', ')
      : `Located in ${screenRegion}`;

    results.push({
      annotationId: ann.id,
      label: ann.label,
      targetBox: {
        x: Math.round(boxX),
        y: Math.round(boxY),
        w: Math.round(boxW),
        h: Math.round(boxH),
      },
      relativeDescription,
      adjacentElements,
      screenRegion,
    });
  }

  return results;
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 2) + '..';
}
