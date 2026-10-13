import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevLens AI (Screen2Prompt) — Client-Side Visual Workspace to Token-Efficient Prompts',
  description:
    '100% Client-side utility converting developer screenshots, bug traces, and annotated UI mockups into token-efficient LLM prompts (~150 tokens vs ~1,400 vision tokens). Styled in Miku UI aesthetic.',
  keywords: [
    'DevLens AI',
    'Screen2Prompt',
    'Token Optimizer',
    'Miku UI',
    'Client-Side OCR',
    'Tesseract.js',
    'Spatial Anchoring',
    'Braille Wireframe',
    'API Sanitizer',
  ],
  authors: [{ name: 'DevLens AI Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-miku-mint selection:text-miku-cyan-dark">
        {children}
      </body>
    </html>
  );
}
