import React, { useState } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  CycleId,
  LEVELS,
  STREAMS
} from '../constants/dataStructure';

interface StudentOnboardingModalProps {
  initialName: string;
  initialLevel: LevelId;
  initialStream: StreamId;
  initialLang: LanguageOption;
  onComplete: (profile: {
    playerName: string;
    levelId: LevelId;
    streamId: StreamId;
    lang: LanguageOption;
  }) => void;
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  initialName,
  initialLevel,
  initialStream,
  initialLang,
  onComplete
}) => {
  const [name, setName] = useState<string>(initialName);
  const [levelId, setLevelId] = useState<LevelId>(initialLevel);
  const [streamId, setStreamId] = useState<StreamId>(initialStream);
  const [lang, setLang] = useState<LanguageOption>(initialLang);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentLevelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0];
  const currentCycle: CycleId = currentLevelConfig.cycle;

  const collegeLevels = LEVELS.filter(l => l.cycle === 'college');
  const lyceeLevels = LEVELS.filter(l => l.cycle === 'lycee');

  const handleCycleChange = (cycle: CycleId) => {
    if (cycle === 'college') {
      const target = collegeLevels[2]; // 3AC
      setLevelId(target.id);
      setStreamId(target.allowedStreams[0]);
    } else {
      const target = lyceeLevels[2]; // 2Bac
      setLevelId(target.id);
      setStreamId(target.allowedStreams[0]);
    }
  };

  const handleLevelChange = (newLevel: LevelId) => {
    const cfg = LEVELS.find(l => l.id === newLevel);
    if (!cfg) return;
    setLevelId(newLevel);
    if (!cfg.allowedStreams.includes(streamId)) {
      setStreamId(cfg.allowedStreams[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى إدخال اسمك الكامل أو لقبك الدراسي قبل بدء المراجعة.'
          : 'Veuillez saisir votre nom ou prénom avant de commencer la révision.'
      );
      return;
    }

    onComplete({
      playerName: trimmed,
      levelId,
      streamId,
      lang
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center font-math text-xl shadow-md">
              ∑
            </span>
            <div>
              <p className="text-xs font-semibold text-indigo-400">
                {lang === 'ar'
                  ? 'بطاقة تسجيل المتعلم · تخصيص المقرر والذكاء الاصطناعي'
                  : 'Profil de l\'Apprenant · Personnalisation du Programme & IA'}
              </p>
              <h2 id="onboarding-title" className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
                {lang === 'ar'
                  ? 'أهلاً بك في منصة المراجعة الشاملة للرياضيات'
                  : 'Bienvenue sur MathInspector · Révision des Mathématiques'}
              </h2>
            </div>
          </div>

          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                lang === 'ar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              عربية
            </button>
            <button
              type="button"
              onClick={() => setLang('biof')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                lang === 'biof' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              BIOF
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Player Name Input */}
          <div>
            <label htmlFor="student-name-input" className="block text-sm font-bold text-slate-200 mb-2">
              {lang === 'ar' ? '1. اسم التلميذ(ة) أو اللقب الدراسي:' : '1. Nom ou Prénom de l\'Élève :'}
            </label>
            <input
              id="student-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={lang === 'ar' ? 'مثال: ياسين المنصوري / سلمى العلمي...' : 'Ex: Yassine Mansouri / Salma El Alami...'}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm md:text-base text-white outline-none transition-colors"
            />
            {errorMsg && (
              <p className="text-xs font-bold text-rose-400 mt-1.5" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          {/* 2. Cycle Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              {lang === 'ar' ? '2. اختر السلك التعليمي:' : '2. Choisir le Cycle Scolaire :'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCycleChange('college')}
                className={`py-3 px-4 rounded-xl border text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  currentCycle === 'college'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'السلك الثانوي الإعدادي (Collège)' : 'Secondaire Collégial (1AC - 3AC)'}
              </button>
              <button
                type="button"
                onClick={() => handleCycleChange('lycee')}
                className={`py-3 px-4 rounded-xl border text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  currentCycle === 'lycee'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'السلك الثانوي التأهيلي (Lycée)' : 'Secondaire Qualifiant (TC - Bac)'}
              </button>
            </div>
          </div>

          {/* 3. Level Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              {lang === 'ar' ? '3. حدد مستواك الدراسي:' : '3. Sélectionner votre Niveau d\'Études :'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(currentCycle === 'college' ? collegeLevels : lyceeLevels).map(lvl => {
                const isSelected = lvl.id === levelId;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleLevelChange(lvl.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold block">{lvl.shortName[lang]}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {lvl.name[lang]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Stream Selection */}
          <div>
            <label htmlFor="onboarding-stream-select" className="block text-sm font-bold text-slate-200 mb-2">
              {lang === 'ar' ? '4. اختر الشعبة أو المسلك الدراسي:' : '4. Choisir la Filière / Branche :'}
            </label>
            <select
              id="onboarding-stream-select"
              value={streamId}
              onChange={(e) => setStreamId(e.target.value as StreamId)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none"
            >
              {currentLevelConfig.allowedStreams.map(stId => (
                <option key={stId} value={stId}>
                  {STREAMS[stId].name[lang]} ({STREAMS[stId].code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm md:text-base rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            {lang === 'ar'
              ? 'بدء رحلة المراجعة الشاملة وضبط المقرر ←'
              : 'Commencer la Révision Générale →'}
          </button>
        </form>
      </div>
    </div>
  );
};
