export type AnnotationType = 'box' | 'arrow' | 'pen' | 'pin';

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];
  label?: string;
  color: string;
  strokeWidth?: number;
}

export type DeveloperIntent = 
  | 'add-feature' 
  | 'fix-bug' 
  | 'refactor-code' 
  | 'spatial-wireframe';

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OCRWord {
  text: string;
  bbox: BoundingBox;
  confidence: number;
}

export interface OCRBlock {
  text: string;
  bbox: BoundingBox;
  words: OCRWord[];
}

export interface OCRResult {
  rawText: string;
  blocks: OCRBlock[];
  words: OCRWord[];
  status: 'idle' | 'loading' | 'success' | 'error';
  progress: number;
  statusText?: string;
  errorMessage?: string;
}

export interface RedactedItem {
  type: string;
  patternName: string;
  originalMatched: string;
  replacement: string;
}

export interface SanitizedResult {
  cleanText: string;
  redactedItems: RedactedItem[];
  redactedCount: number;
}

export interface AdjacentElement {
  position: 'left' | 'right' | 'above' | 'below' | 'inside';
  text: string;
  distance: number;
  bbox: BoundingBox;
}

export interface SpatialAnchor {
  annotationId: string;
  label?: string;
  targetBox: { x: number; y: number; w: number; h: number };
  relativeDescription: string;
  adjacentElements: AdjacentElement[];
  screenRegion: string;
}

export interface BrailleMatrixResult {
  grid: string[];
  brailleString: string;
  density: number;
  dimensions: { width: number; height: number };
}

export interface TokenMetrics {
  devLensPromptTokens: number;
  visionEstimatedTokens: number;
  savedTokens: number;
  savedPercentage: number;
  costVisionUSD: number;
  costDevLensUSD: number;
  costSavingsPercent: number;
}

export interface SamplePreset {
  id: string;
  title: string;
  subtitle: string;
  intent: DeveloperIntent;
  userInstruction: string;
  imageSrc: string;
  initialAnnotations: Annotation[];
}
