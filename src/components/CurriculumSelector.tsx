import React from 'react';
import { LevelId, StreamId, LanguageOption, CycleId, LEVELS, STREAMS } from '../constants/dataStructure';

interface CurriculumSelectorProps {
  selectedLevel: LevelId;
  selectedStream: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  onLevelChange: (level: LevelId, defaultStream: StreamId) => void;
  onStreamChange: (stream: StreamId) => void;
  onLangChange: (lang: LanguageOption) => void;
  onDualLangChange: (dual: boolean) => void;
}

export const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  selectedLevel,
  selectedStream,
  lang,
  dualLang,
  onLevelChange,
  onStreamChange,
  onLangChange,
  onDualLangChange
}) => {
  const currentLevelConfig = LEVELS.find(l => l.id === selectedLevel) || LEVELS[0];
  const currentCycle: CycleId = currentLevelConfig.cycle;

  const collegeLevels = LEVELS.filter(l => l.cycle === 'college');
  const lyceeLevels = LEVELS.filter(l => l.cycle === 'lycee');

  const handleCycleSelect = (cycle: CycleId) => {
    if (cycle === 'college') {
      const target = collegeLevels[2]; // 3AC default
      onLevelChange(target.id, target.allowedStreams[0]);
    } else {
      const target = lyceeLevels[2]; // 2Bac default
      onLevelChange(target.id, target.allowedStreams[0]);
    }
  };

  const handleLevelSelect = (levelId: LevelId) => {
    const config = LEVELS.find(l => l.id === levelId);
    if (!config) return;
    const defaultStream = config.allowedStreams.includes(selectedStream)
      ? selectedStream
      : config.allowedStreams[0];
    onLevelChange(levelId, defaultStream);
  };

  return (
    <section
      aria-label={lang === 'ar' ? 'اختيار السلك والمستوى والشعبة والخيار' : 'Sélection du Cycle, Niveau, Filière et Option'}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <p className="text-xs text-slate-400 mb-1">
            {lang === 'ar'
              ? 'الإطار المرجعي الرسمي · وزارة التربية الوطنية'
              : 'Cadre Référentiel Officiel · Ministère de l\'Éducation Nationale'}
          </p>
          <h2 className="text-xl font-bold text-white">
            {lang === 'ar'
              ? 'ضبط المسار الدراسي للمراجعة الشاملة'
              : 'Configuration du Parcours de Révision Générale'}
          </h2>
        </div>

        {/* Cycle Selection & Option Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cycle Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleCycleSelect('college')}
              className={`px-3.5 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentCycle === 'college'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'الثانوي الإعدادي (Collège)' : 'Secondaire Collégial'}
            </button>
            <button
              type="button"
              onClick={() => handleCycleSelect('lycee')}
              className={`px-3.5 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentCycle === 'lycee'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'الثانوي التأهيلي (Lycée)' : 'Secondaire Qualifiant'}
            </button>
          </div>

          {/* Dual Language Display Toggle */}
          <button
            type="button"
            onClick={() => onDualLangChange(!dualLang)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              dualLang
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {dualLang
              ? (lang === 'ar' ? 'العرض المزدوج (عربي + فرنسي): مفعل' : 'Affichage Bilingue (AR + FR) : Actif')
              : (lang === 'ar' ? 'تفعيل العرض المزدوج (AR/FR)' : 'Activer Affichage Bilingue (AR/FR)')}
          </button>
        </div>
      </div>

      {/* Interactive Selection Grid: Level, Stream, Option */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5">
        {/* Column 1: Level Cards (5 cols) */}
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-400 mb-2.5">
            {lang === 'ar' ? '1. اختر المستوى الدراسي:' : '1. Choisir le Niveau Scolaire :'}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(currentCycle === 'college' ? collegeLevels : lyceeLevels).map(level => {
              const isSelected = level.id === selectedLevel;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => handleLevelSelect(level.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-bold whitespace-nowrap">{level.shortName[lang]}</span>
                  <span className="text-[11px] text-slate-400 mt-1 whitespace-nowrap">
                    {level.isExamYear
                      ? (lang === 'ar' ? 'مستوى إشهادي' : 'Examen Officiel')
                      : (lang === 'ar' ? 'أساسي' : 'Fondamental')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Stream Selection (4 cols) */}
        <div className="md:col-span-4">
          <label htmlFor="stream-select" className="block text-xs font-semibold text-slate-400 mb-2.5">
            {lang === 'ar' ? '2. اختر الشعبة أو المسلك:' : '2. Choisir la Filière / Branche :'}
          </label>
          <select
            id="stream-select"
            value={selectedStream}
            onChange={(e) => onStreamChange(e.target.value as StreamId)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium outline-none transition-colors mb-2"
          >
            {currentLevelConfig.allowedStreams.map(streamId => (
              <option key={streamId} value={streamId}>
                {STREAMS[streamId].name.ar} — {STREAMS[streamId].code}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1.5">
            {currentLevelConfig.allowedStreams.map(streamId => {
              const active = streamId === selectedStream;
              return (
                <button
                  key={streamId}
                  type="button"
                  onClick={() => onStreamChange(streamId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {STREAMS[streamId].code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 3: Language Option (3 cols) */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-400 mb-2.5">
            {lang === 'ar' ? '3. خيار لغة التدريس:' : '3. Option Linguistique :'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onLangChange('ar')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'ar'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              خيار عربي
            </button>
            <button
              type="button"
              onClick={() => onLangChange('biof')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'biof'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              خيار فرنسي BIOF
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {dualLang
              ? (lang === 'ar' ? 'يتم عرض نص التمرين بالعربية والفرنسية معاً.' : 'Énoncés affichés simultanément en Arabe et Français.')
              : (lang === 'ar' ? 'يمكنك تفعيل العرض المزدوج لمقارنة المصطلحات.' : 'Activez le mode bilingue pour comparer la terminologie.')}
          </p>
        </div>
      </div>
    </section>
  );
};
