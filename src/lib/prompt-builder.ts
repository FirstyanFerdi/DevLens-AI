import {
  Annotation,
  DeveloperIntent,
  SanitizedResult,
  SpatialAnchor,
  BrailleMatrixResult,
} from './types';

interface PromptBuilderParams {
  intent: DeveloperIntent;
  userInstruction: string;
  annotations: Annotation[];
  spatialAnchors: SpatialAnchor[];
  sanitizedOCR: SanitizedResult;
  brailleResult: BrailleMatrixResult | null;
  imageDimensions?: { width: number; height: number } | null;
}

/**
 * Extracts error classification and file path from OCR stack trace text
 */
function extractErrorInfo(text: string): {
  errorType: string;
  fileLocation: string;
  cleanSnippet: string;
} {
  // Identify Error Names
  const errorMatch = text.match(
    /\b((?:Type|Reference|Syntax|Range|URI|Eval|Aggregate)?Error|Exception|FATAL|UnhandledPromiseRejection|Panic|Warning|Failed to compile)\b[:\s]([^\n]+)/i
  );
  const errorType = errorMatch ? errorMatch[0].trim() : 'Runtime Exception / Error Trace';

  // Identify File:Line:Col
  const fileMatch = text.match(
    /(?:at\s+)?([a-zA-Z0-9_\-\.\/\\~]+\.(?:tsx?|jsx?|vue|svelte|py|go|rs|java|rb|php|css|html|json)):(\d+)(?::(\d+))?/i
  );
  const fileLocation = fileMatch
    ? fileMatch[0].trim().replace(/^at\s+/, '')
    : 'Unknown target file';

  // Clean lines for stack trace display (up to 15 relevant lines)
  const lines = text
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);
  
  const cleanSnippet = lines.slice(0, 18).join('\n');

  return { errorType, fileLocation, cleanSnippet };
}

/**
 * Guesses programming language from code snippet
 */
function detectCodeLanguage(code: string): string {
  if (/interface\s+\w+|type\s+\w+\s*=|:\s*(?:string|number|boolean|any)/.test(code)) {
    return 'typescript';
  }
  if (/def\s+\w+\(.*\):|import\s+\w+\s+as\s+\w+|print\(/.test(code)) {
    return 'python';
  }
  if (/func\s+\w+\(.*\)|package\s+\w+/.test(code)) {
    return 'go';
  }
  if (/<\/?[a-z][\s\S]*>/i.test(code)) {
    return 'tsx';
  }
  if (/const\s+\w+|let\s+\w+|function\s+\w+|=>/.test(code)) {
    return 'javascript';
  }
  return 'typescript';
}

export function buildPrompt({
  intent,
  userInstruction,
  annotations,
  spatialAnchors,
  sanitizedOCR,
  brailleResult,
  imageDimensions,
}: PromptBuilderParams): string {
  const customNote = userInstruction.trim();

  switch (intent) {
    case 'add-feature': {
      // Find the main target box or first annotation
      const primaryAnchor = spatialAnchors[0];
      const targetCoords = primaryAnchor
        ? `[x: ${primaryAnchor.targetBox.x}, y: ${primaryAnchor.targetBox.y}, w: ${primaryAnchor.targetBox.w}, h: ${primaryAnchor.targetBox.h}]`
        : annotations[0]
        ? `[x: ${annotations[0].x}, y: ${annotations[0].y}, w: ${annotations[0].width}, h: ${annotations[0].height}]`
        : '[x: Target Area Noted by User]';

      const relativePos = primaryAnchor
        ? `(${primaryAnchor.relativeDescription})`
        : '(Designated Target Area)';

      const adjacentList = primaryAnchor && primaryAnchor.adjacentElements.length > 0
        ? primaryAnchor.adjacentElements
            .filter((e) => e.position !== 'inside')
            .slice(0, 4)
            .map((e) => `${e.text} (${capitalize(e.position)})`)
            .join(', ')
        : 'Adjacent to current container element';

      const instruction = customNote || 'Tambahkan dropdown filter kategori di area yang ditandai kotak.';

      return `[SYSTEM CONTEXT: DEVELOPER UI FEATURE MODIFICATION]
- Target Area: Bounding Box ${targetCoords} ${relativePos}
- Adjacent Elements: ${adjacentList}
- User Intent: "${instruction}"
[TASK FOR LLM]: Generate React/Tailwind component code that fits into the designated target coordinates. Preserve existing styling and responsive container layout.`;
    }

    case 'fix-bug': {
      const { errorType, fileLocation, cleanSnippet } = extractErrorInfo(
        sanitizedOCR.cleanText || 'Error log trace captured on screen'
      );
      const instruction = customNote || 'Identifikasi penyebab crash dan berikan solusi kode perbaikan.';

      const annotationsInfo = annotations.length > 0
        ? `\n- Visual Annotations: ${annotations.length} marked error regions on screen`
        : '';

      return `[SYSTEM CONTEXT: RUNTIME BUG & STACK TRACE DEBUGGING]
- Error Classification: ${errorType}
- Target Source File: \`${fileLocation}\`${annotationsInfo}
- Sanitized Error Logs:
\`\`\`
${cleanSnippet || '[No raw stack trace text detected]'}
\`\`\`
- User Context: "${instruction}"
[TASK FOR LLM]: Identify the root cause, explain why this error occurred, and provide the exact code patch with defensive null checks and proper error handling.`;
    }

    case 'refactor-code': {
      const codeText = sanitizedOCR.cleanText || '// Extracted code snippet';
      const lang = detectCodeLanguage(codeText);
      const instruction = customNote || 'Refactor kode ini agar lebih bersih, gunakan TypeScript ketat, dan optimalkan performanya.';

      return `[SYSTEM CONTEXT: CODE REFACTORING & QUALITY INSPECTION]
- Extracted Code Snippet:
\`\`\`${lang}
${codeText}
\`\`\`
- User Intent: "${instruction}"
[TASK FOR LLM]: Review the code snippet, optimize algorithmic complexity, add strict TypeScript interfaces, eliminate potential memory leaks, and preserve existing functionality.`;
    }

    case 'spatial-wireframe': {
      const brailleMap = brailleResult?.brailleString || '⢀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⡀\n⢸⠋⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠙⡇\n⢸⠀DevLens Micro Grid Matrix⠀ ⢸\n⠘⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⠜';
      const density = brailleResult ? `${Math.round(brailleResult.density * 100)}%` : '28%';
      const resolution = imageDimensions
        ? `${imageDimensions.width}x${imageDimensions.height}px`
        : 'Desktop Resolution';

      const pinsList = annotations
        .map((a, i) => `- [${a.label || i + 1}] ${a.type.toUpperCase()} at (x: ${Math.round(a.x)}, y: ${Math.round(a.y)})`)
        .join('\n');

      const instruction = customNote || 'Rekonstruksi tata letak halaman ini menjadi komponen Next.js/Tailwind CSS yang responsif.';

      return `[SYSTEM CONTEXT: 2D SPATIAL TOPOLOGY & RESPONSIVE WIREFRAME]
- Resolution Baseline: ${resolution} (Micro-Grid Density: ${density})
- 32x32 Braille Micro-Grid Topology:
\`\`\`
${brailleMap}
\`\`\`
${pinsList ? `- Key UI Anchors:\n${pinsList}\n` : ''}- User Intent: "${instruction}"
[TASK FOR LLM]: Reconstruct the responsive CSS Grid / Flexbox layout adhering strictly to this spatial topology. Ensure mobile-first responsiveness and accessible semantic HTML.`;
    }

    default:
      return sanitizedOCR.cleanText || customNote;
  }
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
