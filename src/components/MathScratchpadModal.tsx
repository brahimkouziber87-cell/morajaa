import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LanguageOption } from '../types/curriculum';
import {
  ScratchpadVerificationResult,
  verifyAlgebraicStepsDeterministic
} from '../game/engine';
import { FormulaDisplay } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import {
  Pen,
  Eraser,
  RotateCcw,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  Grid,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface MathScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageOption;
}

type ToolType = 'pen' | 'highlighter' | 'eraser';
type GridType = 'squares' | 'lines' | 'blank';

interface Point {
  x: number;
  y: number;
}

interface PathItem {
  tool: ToolType;
  color: string;
  size: number;
  points: Point[];
}

const COLORS = [
  { name: 'white', value: '#ffffff', label: 'أبيض' },
  { name: 'amber', value: '#fbbf24', label: 'أصفر' },
  { name: 'cyan', value: '#38bdf8', label: 'أزرق' },
  { name: 'emerald', value: '#34d399', label: 'أخضر' },
  { name: 'rose', value: '#f43f5e', label: 'وردي' }
];

const PRESET_SCRATCHPAD_CASES = [
  {
    id: 'sign-error',
    label: {
      ar: 'تجربة 1: خطأ إشارة عند نقل حد',
      biof: 'Exemple 1 : Erreur de signe (transposition)'
    },
    context: 'حل المعادلة 3x - 5 = 10',
    stepsText: '3x - 5 = 10\n3x = 5\nx = 5/3'
  },
  {
    id: 'identity-error',
    label: {
      ar: 'تجربة 2: نسيان الجداء المزدوج 2ab',
      biof: 'Exemple 2 : Oubli du double produit 2ab'
    },
    context: 'نشر المتطابقة الهامة (x + 3)²',
    stepsText: '(x+3)^2 = x^2+9'
  },
  {
    id: 'derivative-error',
    label: {
      ar: 'تجربة 3: اشتقاق الدالة الأسية المركبة',
      biof: 'Exemple 3 : Dérivée de exp(2x)'
    },
    context: 'حساب مشتقة الدالة f(x) = e^{2x}',
    stepsText: "(e^{2x})' = e^{2x}"
  },
  {
    id: 'valid-steps',
    label: {
      ar: 'تجربة 4: خطوات حل متكافئة وسليمة',
      biof: 'Exemple 4 : Démarche 100% valide'
    },
    context: 'حل المعادلة 4x + 2 = 2x + 10',
    stepsText: '4x + 2 = 2x + 10\n2x = 8\nx = 4'
  },
  {
    id: 'inequality-error',
    label: {
      ar: 'تجربة 5: نسيان عكس رمز المتراجحة عند القسمة على سالب',
      biof: 'Exemple 5 : Inéquation & division par un négatif'
    },
    context: 'حل المتراجحة -2x + 4 > 10 في ℝ',
    stepsText: '-2x + 4 > 10\n-2x > 6\nx > -3'
  },
  {
    id: 'quadratic-delta-error',
    label: {
      ar: 'تجربة 6: خطأ في حساب المميز Δ لمعادلة من الدرجة الثانية',
      biof: 'Exemple 6 : Erreur de discriminant Δ (2nd degré)'
    },
    context: 'حل المعادلة x² - 5x + 6 = 0 في ℝ',
    stepsText: 'x^2 - 5x + 6 = 0\nΔ = (-5)^2 - 4(1)(6) = 49\nx = 2 أو x = 3'
  }
];

export const MathScratchpadModal: React.FC<MathScratchpadModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>('#fbbf24');
  const [size, setSize] = useState<number>(3);
  const [grid, setGrid] = useState<GridType>('squares');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Proposal 2: Handwritten & Algebraic Step Verifier State
  const [showVerifierPanel, setShowVerifierPanel] = useState<boolean>(true);
  const [problemContext, setProblemContext] = useState<string>('حل المعادلة 3x - 5 = 10');
  const [stepsInputText, setStepsInputText] = useState<string>('3x - 5 = 10\n3x = 5\nx = 5/3');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] =
    useState<ScratchpadVerificationResult | null>(null);

  // History stack for Undo
  const pathsRef = useRef<PathItem[]>([]);
  const currentPathRef = useRef<Point[]>([]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill dark slate background so exported PNG for Vision AI has high contrast
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if selected
    if (grid === 'squares') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const step = 25;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    } else if (grid === 'lines') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const step = 30;
      for (let y = step; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw saved paths
    for (const item of pathsRef.current) {
      if (item.points.length < 2) continue;
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (item.tool === 'eraser') {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = item.size * 3;
      } else if (item.tool === 'highlighter') {
        ctx.strokeStyle = item.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = item.size * 3.5;
      } else {
        ctx.strokeStyle = item.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = item.size;
      }

      ctx.moveTo(item.points[0].x, item.points[0].y);
      for (let i = 1; i < item.points.length; i++) {
        ctx.lineTo(item.points[i].x, item.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [grid]);

  // Resize canvas when modal opens, expands, or toggles verifier panel
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      redrawCanvas();
    }
  }, [isOpen, isExpanded, showVerifierPanel, redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const pt = getCanvasCoords(e);
    if (!pt) return;
    setIsDrawing(true);
    currentPathRef.current = [pt];
  };

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pt = getCanvasCoords(e);
    if (!pt) return;

    currentPathRef.current.push(pt);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && currentPathRef.current.length >= 2) {
      const prev = currentPathRef.current[currentPathRef.current.length - 2];
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'eraser') {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = size * 3;
      } else if (tool === 'highlighter') {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = size * 3.5;
      } else {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = size;
      }

      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPathRef.current.length > 0) {
      pathsRef.current.push({
        tool,
        color,
        size,
        points: [...currentPathRef.current]
      });
      currentPathRef.current = [];
      redrawCanvas();
    }
  };

  const handleUndo = () => {
    pathsRef.current.pop();
    redrawCanvas();
  };

  const handleClear = () => {
    pathsRef.current = [];
    redrawCanvas();
  };

  // Render current typed steps onto the canvas as visual handwriting guide
  const handleProjectStepsToCanvas = (textToRender: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    redrawCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = textToRender
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    ctx.save();
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#fbbf24';
    lines.forEach((line, idx) => {
      ctx.fillText(`(${idx + 1})  ${line}`, 28, 52 + idx * 42);
    });
    ctx.restore();
  };

  const handleVerifyScratchpadSteps = async () => {
    setIsVerifying(true);
    const typedLines = stepsInputText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    let imageBase64 = '';
    try {
      if (canvasRef.current && pathsRef.current.length > 0) {
        imageBase64 = canvasRef.current.toDataURL('image/png');
      }
    } catch {
      imageBase64 = '';
    }

    try {
      const response = await fetch('/api/ai/verify-scratchpad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          typedSteps: typedLines,
          problemContext
        })
      });
      const data = await response.json();

      if (data && data.verified && Array.isArray(data.verified.steps) && data.verified.steps.length > 0) {
        setVerificationResult(data.verified);
        if (data.verified.isAllCorrect) {
          soundFeedback.playCorrectSound();
        } else {
          soundFeedback.playIncorrectSound();
        }
        setIsVerifying(false);
        return;
      }
    } catch {
      // Fall back to deterministic algebraic step verifier below
    }

    const fallbackRes = verifyAlgebraicStepsDeterministic(typedLines, problemContext);
    setVerificationResult(fallbackRes);
    if (fallbackRes.isAllCorrect) {
      soundFeedback.playCorrectSound();
    } else {
      soundFeedback.playIncorrectSound();
    }
    setIsVerifying(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scratchpad-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-sm"
    >
      <div
        className={`bg-slate-900 border-2 border-indigo-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isExpanded
            ? 'w-full h-full max-w-none max-h-none'
            : 'w-full max-w-6xl h-[88vh]'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-slate-950 border-b border-slate-800 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold flex items-center justify-center">
              ✏️
            </span>
            <div>
              <h2 id="scratchpad-title" className="font-bold text-sm text-white">
                {lang === 'ar'
                  ? 'المسودة الرياضية ومصحح الخطوات بالذكاء الاصطناعي'
                  : 'Brouillon Interactif & Vérificateur d\'Étapes IA'}
              </h2>
              <span className="text-[10px] text-slate-400">
                {lang === 'ar'
                  ? 'ارسم خطوات الحل أو اكتب السطور الجبرية لاكتشاف السطر الذي وقع فيه الخطأ فوراً'
                  : 'Dessinez ou saisissez vos étapes algébriques pour détecter toute erreur de calcul'}
              </span>
            </div>
          </div>

          {/* Tools Strip */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold cursor-pointer ${
                tool === 'pen' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'ar' ? 'قلم عادي' : 'Stylo'}
            >
              <Pen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'قلم' : 'Stylo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('highlighter')}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold cursor-pointer ${
                tool === 'highlighter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'ar' ? 'قلم تحديد ملون' : 'Surligneur'}
            >
              <span className="text-xs">🖍️</span>
              <span className="hidden sm:inline">{lang === 'ar' ? 'تحديد' : 'Surligneur'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-semibold cursor-pointer ${
                tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'ar' ? 'ممحاة' : 'Gomme'}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'ممحاة' : 'Gomme'}</span>
            </button>

            <span className="w-px h-4 bg-slate-800 mx-1" />

            {/* Color Palette */}
            {tool !== 'eraser' && (
              <div className="flex items-center gap-1">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                      color === c.value
                        ? 'scale-125 border-white ring-2 ring-indigo-500'
                        : 'border-slate-700'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            )}

            <span className="w-px h-4 bg-slate-800 mx-1" />

            {/* Stroke Thickness */}
            <div className="flex items-center gap-1">
              {[2, 4, 8].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${
                    size === s
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{ width: `${s * 1.5}px`, height: `${s * 1.5}px` }}
                  />
                </button>
              ))}
            </div>

            <span className="w-px h-4 bg-slate-800 mx-1" />

            {/* Grid Pattern Toggle */}
            <button
              type="button"
              onClick={() =>
                setGrid(prev =>
                  prev === 'squares' ? 'lines' : prev === 'lines' ? 'blank' : 'squares'
                )
              }
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
              title={lang === 'ar' ? 'تبديل نمط الورقة' : 'Changer le quadrillage'}
            >
              {grid === 'squares' ? (
                <Grid className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {grid === 'squares'
                  ? lang === 'ar'
                    ? 'تربيعات'
                    : 'Quadrillage'
                  : grid === 'lines'
                  ? lang === 'ar'
                    ? 'مسطر'
                    : 'Lignes'
                  : lang === 'ar'
                  ? 'بيضاء'
                  : 'Vierge'}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowVerifierPanel(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-colors ${
                showVerifierPanel
                  ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar' ? 'مصحح الخطوات الذكي' : 'Vérificateur IA'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleUndo}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
              title={lang === 'ar' ? 'تراجع خطوة' : 'Annuler'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 cursor-pointer"
              title={lang === 'ar' ? 'مسح الكل' : 'Effacer tout'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
              title={
                isExpanded
                  ? lang === 'ar'
                    ? 'تصغير'
                    : 'Réduire'
                  : lang === 'ar'
                  ? 'تكبير كامل الشاشة'
                  : 'Plein écran'
              }
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Workspace Split: Canvas + Proposal 2 Step Verification Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Drawing Canvas Area */}
          <div
            className={`${
              showVerifierPanel ? 'lg:col-span-7' : 'lg:col-span-12'
            } relative bg-slate-950 cursor-crosshair overflow-hidden select-none min-h-[280px] border-b lg:border-b-0 lg:border-e border-slate-800`}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDrawMove}
              onMouseUp={handleEndDraw}
              onMouseLeave={handleEndDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDrawMove}
              onTouchEnd={handleEndDraw}
              className="w-full h-full block touch-none"
            />

            <div className="absolute bottom-2 left-4 right-4 pointer-events-none flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {lang === 'ar'
                  ? '💡 ارسم باليد أو استخدم لوحة فحص الخطوات الجبرية لاكتشاف السطر الخاطئ.'
                  : '💡 Dessinez à main levée ou vérifiez vos étapes algébriques ligne par ligne.'}
              </span>
              <span className="font-mono">MathInspector Vision & Algebra</span>
            </div>
          </div>

          {/* Proposal 2: Handwritten & Algebraic Step Verification Side Panel */}
          {showVerifierPanel && (
            <div className="lg:col-span-5 bg-slate-900 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 block">
                    {lang === 'ar'
                      ? 'الرؤية الحاسوبية والتدقيق الجبري خطوة بخطوة'
                      : 'Vision IA & Audit Algébrique Étape par Étape'}
                  </span>
                  <h3 className="text-sm font-extrabold text-white mt-0.5">
                    {lang === 'ar'
                      ? 'تحليل خطوات الحل واكتشاف سطر الخطأ'
                      : 'Analyse des Étapes & Détection de la Ligne d\'Erreur'}
                  </h3>
                </div>
              </div>

              {/* Quick Preset Cases */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  {lang === 'ar'
                    ? 'أمثلة تشخيصية سريعة (اضغط للتجربة الفورية):'
                    : 'Cas de test rapides (cliquez pour charger) :'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {PRESET_SCRATCHPAD_CASES.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setProblemContext(preset.context);
                        setStepsInputText(preset.stepsText);
                        setVerificationResult(null);
                        handleProjectStepsToCanvas(preset.stepsText);
                      }}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-start text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      {preset.label[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Context & Multi-line Steps Editor */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                    {lang === 'ar' ? 'سياق التمرين / المعادلة:' : 'Énoncé / Contexte de l\'exercice :'}
                  </label>
                  <input
                    type="text"
                    value={problemContext}
                    onChange={e => setProblemContext(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400 font-semibold">
                      {lang === 'ar'
                        ? 'خطوات الحل الجبرية (سطر لكل خطوة):'
                        : 'Étapes de résolution (une étape par ligne) :'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleProjectStepsToCanvas(stepsInputText)}
                      className="text-[10px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      {lang === 'ar' ? 'عرض على السبورة ✏️' : 'Projeter sur le tableau ✏️'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    dir="ltr"
                    value={stepsInputText}
                    onChange={e => setStepsInputText(e.target.value)}
                    placeholder={'3x - 5 = 10\n3x = 15\nx = 5'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-amber-200 focus:border-indigo-500 outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleVerifyScratchpadSteps}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isVerifying
                      ? lang === 'ar'
                        ? 'جاري فحص المسودة والخطوات الجبرية...'
                        : 'Analyse de la démarche en cours...'
                      : lang === 'ar'
                      ? '🔍 فحص الخطوات واكتشاف الأخطاء الآن'
                      : '🔍 Vérifier mes étapes maintenant'}
                  </span>
                </button>
              </div>

              {/* Verification Result Breakdown */}
              {verificationResult && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div
                    className={`p-3 rounded-xl border ${
                      verificationResult.isAllCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        {verificationResult.isAllCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>
                          {verificationResult.isAllCorrect
                            ? lang === 'ar'
                              ? 'جميع الخطوات سليمة ومتكافئة!'
                              : 'Démarche 100% valide !'
                            : lang === 'ar'
                            ? `تم اكتشاف خطأ في السطر ${verificationResult.errorStepNumber}`
                            : `Erreur détectée à la ligne ${verificationResult.errorStepNumber}`}
                        </span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950/70 font-mono text-slate-300">
                        {verificationResult.source === 'gemini_vision' ? 'Gemini Vision' : 'Algebra Engine'}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {verificationResult.overallVerdict[lang]}
                    </p>
                  </div>

                  {/* Step-by-Step Line Inspection */}
                  <div className="space-y-2">
                    {verificationResult.steps.map(st => {
                      const isErr = st.status === 'error';
                      return (
                        <div
                          key={st.stepNumber}
                          className={`p-2.5 rounded-xl border space-y-1 ${
                            isErr
                              ? 'bg-rose-950/40 border-rose-500/60'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-[11px] text-slate-300">
                              {lang === 'ar' ? `السطر (${st.stepNumber})` : `Ligne (${st.stepNumber})`}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isErr
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {isErr
                                ? lang === 'ar'
                                  ? '✗ خطوة خاطئة'
                                  : '✗ Étape erronée'
                                : lang === 'ar'
                                ? '✓ خطوة سليمة'
                                : '✓ Étape valide'}
                            </span>
                          </div>

                          <div dir="ltr" className="py-0.5">
                            <FormulaDisplay formula={st.formulaLatex} inline />
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {st.comment[lang]}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Corrected Final Formula & Inspector Tip */}
                  {verificationResult.correctedFinalStepLatex && (
                    <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-300 block">
                        {lang === 'ar'
                          ? 'الصيغة / النتيجة النهائية المصححة:'
                          : 'Résultat / Formule finale corrigée :'}
                      </span>
                      <div dir="ltr">
                        <FormulaDisplay
                          formula={verificationResult.correctedFinalStepLatex}
                          inline
                        />
                      </div>
                      <p className="text-[11px] text-amber-300/90 leading-relaxed pt-1 border-t border-slate-800">
                        {verificationResult.inspectorAdvice[lang]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
