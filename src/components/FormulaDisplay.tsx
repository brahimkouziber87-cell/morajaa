import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';

interface FormulaDisplayProps {
  formula: string;
  className?: string;
  inline?: boolean;
  copyable?: boolean;
}

/**
 * Normalizes common variations in LaTeX strings to ensure optimal KaTeX rendering.
 */
function normalizeLatex(input: string): string {
  if (!input) return '';
  let s = input.trim();

  // Strip wrapping $...$ or $$...$$ if present
  if (s.startsWith('$$') && s.endsWith('$$')) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('$') && s.endsWith('$')) {
    s = s.slice(1, -1).trim();
  }

  // Common pedagogical notation fixes
  // Moroccan & French vector notation \vec{AB} -> \overrightarrow{AB} for multi-letter vectors
  s = s.replace(/\\vec\{([A-Z]{2,})\}/g, '\\overrightarrow{$1}');

  return s;
}

/**
 * FormulaDisplay renders LaTeX expressions with authentic mathematical typography
 * using KaTeX, true horizontal fraction bars, radicals, limits, and exponents.
 */
export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  formula,
  className = '',
  inline = false,
  copyable = false
}) => {
  const [copied, setCopied] = useState(false);

  const cleanLatex = useMemo(() => normalizeLatex(formula), [formula]);

  const html = useMemo(() => {
    if (!cleanLatex) return '';
    try {
      return katex.renderToString(cleanLatex, {
        displayMode: !inline,
        throwOnError: false,
        output: 'htmlAndMathml',
        strict: false,
        trust: true
      });
    } catch {
      return cleanLatex;
    }
  }, [cleanLatex, inline]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(cleanLatex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (inline) {
    return (
      <span
        dir="ltr"
        className={`inline-math font-math align-baseline px-1 py-0.5 rounded text-indigo-200 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      dir="ltr"
      className={`relative group my-3 text-center py-3.5 px-4 bg-slate-950/80 border border-indigo-900/40 rounded-xl shadow-inner overflow-x-auto text-slate-100 ${className}`}
    >
      <div
        className="inline-block text-base sm:text-lg md:text-xl text-indigo-100 font-medium tracking-wide max-w-full overflow-x-auto select-all"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          title="نسخ الصيغة بترميز LaTeX / Copier en LaTeX"
          aria-label="Copy LaTeX formula"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs text-indigo-300 flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-300 font-mono">LaTeX Copié</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-[10px] text-indigo-300 font-mono">LaTeX</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * MathText parses mixed text containing $...$ inline LaTeX blocks
 * or renders regular text with mathematical realism.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by $...$ inline markers
  if (!text.includes('$')) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const rawMath = part.slice(1, -1);
          return <FormulaDisplay key={index} formula={rawMath} inline />;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
