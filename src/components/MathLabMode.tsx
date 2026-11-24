import React, { useState, useMemo } from 'react';
import { LanguageOption } from '../constants/dataStructure';
import { LAB_FUNCTIONS } from '../game/engine';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';

interface MathLabModeProps {
  lang: LanguageOption;
  onLabChallengeCompleted?: (xp: number, score: number) => void;
}

export const MathLabMode: React.FC<MathLabModeProps> = ({ lang, onLabChallengeCompleted }) => {
  const [selectedFuncId, setSelectedFuncId] = useState<string>(LAB_FUNCTIONS[0].id);
  const [x0, setX0] = useState<number>(1.5);
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [missionFeedback, setMissionFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const activeFunc = useMemo(
    () => LAB_FUNCTIONS.find(f => f.id === selectedFuncId) || LAB_FUNCTIONS[0],
    [selectedFuncId]
  );
  const y0 = activeFunc.fn(x0);
  const slope = activeFunc.derivative(x0);

  // Coordinate system mapping: x in [-4, 6], y in [-5, 7]
  const width = 640;
  const height = 400;
  const xMin = -4;
  const xMax = 6;
  const yMin = -5;
  const yMax = 7;

  const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  // Memoize SVG path for f(x) so moving x0 slider never recomputes the 125 curve coordinates
  const curvePathD = useMemo(() => {
    const pts: string[] = [];
    for (let px = xMin; px <= xMax; px += 0.08) {
      const py = activeFunc.fn(px);
      if (py >= yMin - 3 && py <= yMax + 3) {
        const sx = ((px - xMin) / (xMax - xMin)) * width;
        const sy = height - ((py - yMin) / (yMax - yMin)) * height;
        pts.push(`${pts.length === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, [activeFunc]);

  // Tangent line segment around x0
  const tx1 = x0 - 2;
  const ty1 = y0 + slope * (tx1 - x0);
  const tx2 = x0 + 2;
  const ty2 = y0 + slope * (tx2 - x0);

  const monotonicityState =
    Math.abs(slope) < 0.05
      ? {
          code: 'EXTREMUM',
          label: lang === 'ar' ? '● مطراف / مماس أفقي (f\'(x₀) = 0)' : '● Extremum / Tangente Horizontale (f\'(x₀) = 0)',
          color: 'text-amber-400'
        }
      : slope > 0
      ? {
          code: 'INCREASING',
          label: lang === 'ar' ? '▲ الدالة تزايدية قطعا (f\'(x₀) > 0)' : '▲ Fonction Strictement Croissante (f\'(x₀) > 0)',
          color: 'text-emerald-400'
        }
      : {
          code: 'DECREASING',
          label: lang === 'ar' ? '▼ الدالة تناقصية قطعا (f\'(x₀) < 0)' : '▼ Fonction Strictement Décroissante (f\'(x₀) < 0)',
          color: 'text-rose-400'
        };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-6">
        <div>
          <p className="text-xs font-semibold text-cyan-400">
            {lang === 'ar'
              ? 'المختبر البياني التفاعلي · محاكاة الاشتقاق والرتابة ومعادلة المماس'
              : 'Laboratoire Graphique Interactif · Simulation Dérivée, Monotonie & Tangente'}
          </p>
          <h3 className="text-xl font-bold text-white mt-1">
            {lang === 'ar'
              ? 'استكشاف العلاقة الهندسية بين العدد المشتق f\'(x₀) والمنحنى (Cf)'
              : 'Exploration Géométrique du Nombre Dérivé f\'(x₀) et de la Courbe (Cf)'}
          </h3>
        </div>

        {/* Function selector buttons */}
        <div className="flex flex-wrap gap-1.5">
          {LAB_FUNCTIONS.map(func => (
            <button
              key={func.id}
              type="button"
              onClick={() => {
                setSelectedFuncId(func.id);
                setX0(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-math transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedFuncId === func.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
              dir="ltr"
            >
              {func.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Zone (7 cols): Interactive Coordinate Canvas */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="w-full overflow-hidden rounded-xl bg-slate-950" dir="ltr">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              role="img"
              aria-label="منحنى الدالة والمماس في المعلم المتعامد الممنظم"
            >
              {/* Grid lines */}
              {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).map(gx => (
                <g key={`gx-${gx}`}>
                  <line
                    x1={toScreenX(gx)}
                    y1={0}
                    x2={toScreenX(gx)}
                    y2={height}
                    stroke={gx === 0 ? '#475569' : '#1e293b'}
                    strokeWidth={gx === 0 ? 2 : 1}
                  />
                  {gx !== 0 && (
                    <text
                      x={toScreenX(gx) - 4}
                      y={toScreenY(0) + 15}
                      fill="#64748b"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {gx}
                    </text>
                  )}
                </g>
              ))}
              {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map(gy => (
                <g key={`gy-${gy}`}>
                  <line
                    x1={0}
                    y1={toScreenY(gy)}
                    x2={width}
                    y2={toScreenY(gy)}
                    stroke={gy === 0 ? '#475569' : '#1e293b'}
                    strokeWidth={gy === 0 ? 2 : 1}
                  />
                  {gy !== 0 && (
                    <text
                      x={toScreenX(0) + 6}
                      y={toScreenY(gy) + 4}
                      fill="#64748b"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {gy}
                    </text>
                  )}
                </g>
              ))}

              {/* Function Curve (Cf) */}
              <path
                d={curvePathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Tangent Line (T) */}
              {showTangent && (
                <line
                  x1={toScreenX(tx1)}
                  y1={toScreenY(ty1)}
                  x2={toScreenX(tx2)}
                  y2={toScreenY(ty2)}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
              )}

              {/* Projections to axes */}
              <line
                x1={toScreenX(x0)}
                y1={toScreenY(0)}
                x2={toScreenX(x0)}
                y2={toScreenY(y0)}
                stroke="#818cf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Active Point M(x0, f(x0)) */}
              <circle
                cx={toScreenX(x0)}
                cy={toScreenY(y0)}
                r="6"
                fill="#f59e0b"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <g transform={`translate(${Math.min(toScreenX(x0) + 12, width - 130)}, ${Math.max(toScreenY(y0) - 28, 20)})`}>
                <rect
                  x="-6"
                  y="-14"
                  width="124"
                  height="22"
                  rx="5"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.92"
                />
                <text
                  x="0"
                  y="1"
                  fill="#f8fafc"
                  fontSize="11.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  M({x0.toFixed(1)}, {y0.toFixed(2)})
                </text>
              </g>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-900 text-xs text-slate-400">
            <span>
              <strong className="text-sky-400">━━ (Cf)</strong> : {activeFunc.label}
            </span>
            <span>
              <strong className="text-amber-400">┅┅ (T)</strong> : {lang === 'ar' ? 'المماس عند الأفصول x₀' : 'Tangente au point x₀'}
            </span>
          </div>
        </div>

        {/* Right Zone (5 cols): Control & Concept Deck */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            {/* Labeled Parameter Slider */}
            <div>
              <div className="flex items-center justify-between text-sm font-bold mb-2">
                <label htmlFor="x0-slider" className="text-slate-200">
                  {lang === 'ar' ? 'تحريك الأفصول x₀ على المحور:' : 'Déplacer l\'abscisse x₀ :'}
                </label>
                <span className="font-math text-cyan-400 tabular-nums" dir="ltr">
                  x₀ = {x0.toFixed(2)}
                </span>
              </div>
              <input
                id="x0-slider"
                type="range"
                min={activeFunc.domain[0]}
                max={activeFunc.domain[1]}
                step="0.1"
                value={x0}
                onChange={(e) => setX0(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeFunc.presetPoints.map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setX0(pt)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-xs font-mono text-slate-300 cursor-pointer"
                    dir="ltr"
                  >
                    x₀ = {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Tangent */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-xs font-semibold text-slate-300">
                {lang === 'ar' ? 'إظهار مستقيم المماس (T):' : 'Afficher la droite tangente (T) :'}
              </span>
              <button
                type="button"
                onClick={() => setShowTangent(!showTangent)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  showTangent ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {showTangent ? (lang === 'ar' ? 'مفعل' : 'Visible') : (lang === 'ar' ? 'مخفي' : 'Masqué')}
              </button>
            </div>

            {/* Live Mathematical Readout */}
            <div className="space-y-2.5 pt-2 border-t border-slate-900">
              <div className="flex items-center justify-between bg-slate-900/90 rounded-xl p-3">
                <span className="text-xs text-slate-400">
                  {lang === 'ar' ? 'الأرتوب (الصورة) f(x₀):' : 'Ordonnée f(x₀) :'}
                </span>
                <span className="font-math font-bold text-white tabular-nums" dir="ltr">
                  f({x0.toFixed(1)}) = {y0.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/90 rounded-xl p-3">
                <span className="text-xs text-slate-400">
                  {lang === 'ar' ? 'العدد المشتق (الميل) f\'(x₀):' : 'Nombre dérivé (pente) f\'(x₀) :'}
                </span>
                <span className="font-math font-bold text-amber-400 tabular-nums" dir="ltr">
                  f'({x0.toFixed(1)}) = {slope.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 space-y-1">
                <span className="text-xs text-slate-400 block">
                  {lang === 'ar' ? 'التأويل الهندسي والرتابة الآنية:' : 'Interprétation Géométrique & Monotonie :'}
                </span>
                <p className={`text-xs font-bold ${monotonicityState.color}`}>
                  {monotonicityState.label}
                </p>
              </div>

              {/* Realistic Mathematical Tangent Equation (KaTeX) */}
              <div className="bg-slate-900/95 border border-amber-500/30 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>{lang === 'ar' ? 'المعادلة الديكارتية المختزلة للمماس (T):' : 'Équation Réduite de la Tangente (T) :'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">y = f'(x₀)(x - x₀) + f(x₀)</span>
                </div>
                <FormulaDisplay
                  formula={`(T) : y = ${slope.toFixed(2)}(x - ${x0.toFixed(1)}) ${y0 >= 0 ? '+ ' + y0.toFixed(2) : '- ' + Math.abs(y0).toFixed(2)} \\iff y = ${slope.toFixed(2)}x ${y0 - slope * x0 >= 0 ? '+ ' + (y0 - slope * x0).toFixed(2) : '- ' + Math.abs(y0 - slope * x0).toFixed(2)}`}
                  className="py-2 text-sm bg-slate-950 border-amber-500/20"
                  copyable
                />
              </div>
            </div>
          </div>

          {/* Interactive Graded Lab Mission (Phase 3) */}
          <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                <span>🎯</span>
                <span>
                  {lang === 'ar'
                    ? 'مهمة المختبر التطبيقية: رصد المطراف والمماس الأفقي'
                    : 'Mission Pratique du Labo : Tangente Horizontale'}
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300">
                {completedMissions[activeFunc.id] ? (lang === 'ar' ? '✓ منجزة' : '✓ Validée') : '+35 XP'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'حرّك المزلاج x₀ حتى يصبح المماس (T) أفقياً تماماً (أي تنعدم المشتقة f\'(x₀) ≈ 0 عند مطراف الدالة)، ثم اضغط على زر التحقق.'
                : 'Déplacez le curseur x₀ jusqu\'à obtenir une tangente horizontale (f\'(x₀) ≈ 0 à un extremum), puis validez.'}
            </p>
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const isExtremum = Math.abs(slope) < 0.08;
                  if (isExtremum) {
                    soundFeedback.playCorrectSound();
                    if (!completedMissions[activeFunc.id]) {
                      setCompletedMissions(prev => ({ ...prev, [activeFunc.id]: true }));
                      onLabChallengeCompleted?.(35, 25);
                    }
                    setMissionFeedback({
                      ok: true,
                      msg:
                        lang === 'ar'
                          ? `أحسنت! عند x₀ = ${x0.toFixed(2)} تنعدم المشتقة f'(${x0.toFixed(2)}) = 0 ويقبل المنحنى مماساً أفقياً (+35 XP).`
                          : `Bravo ! En x₀ = ${x0.toFixed(2)}, f'(${x0.toFixed(2)}) = 0 et la tangente est horizontale (+35 XP).`
                    });
                  } else {
                    soundFeedback.playIncorrectSound();
                    setMissionFeedback({
                      ok: false,
                      msg:
                        lang === 'ar'
                          ? `الميل الحالي هو f'(${x0.toFixed(2)}) = ${slope.toFixed(2)} ≠ 0. ابحث عن قمة أو قعر المنحنى حيث ينعدم الميل!`
                          : `La pente actuelle est f'(${x0.toFixed(2)}) = ${slope.toFixed(2)} ≠ 0. Cherchez un sommet où la pente s'annule !`
                    });
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'تحقق من المماس الأفقي' : 'Vérifier la Tangente Horizontale'}
              </button>
              {missionFeedback && (
                <span
                  className={`text-[11px] font-bold ${
                    missionFeedback.ok ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {missionFeedback.msg}
                </span>
              )}
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-3.5 text-xs text-indigo-200 leading-relaxed">
            {lang === 'ar'
              ? 'توجيه المفتش: لاحظ أنه كلما انعدمت المشتقة f\'(x₀) = 0 مع تغيير إشارتها، يقبل المنحنى مطرافاً محلياً ويكون المماس أفقياً موازياً لمحور الأفاصيل.'
              : 'Note de l\'Inspecteur : Lorsque f\'(x₀) = 0 en changeant de signe, la courbe admet un extremum local et la tangente est horizontale.'}
          </div>
        </div>
      </div>
    </div>
  );
};
