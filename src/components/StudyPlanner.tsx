import React, { useState, useMemo, useEffect } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  LEVELS,
  STREAMS,
  UserStats
} from '../constants/dataStructure';
import { DOMAINS } from '../game/curriculumData';
import {
  buildPersonalizedLearningPath,
  generatePersonalizedWeeklyPlan
} from '../game/engine';
import {
  StudyPlanItem,
  DayOfWeekId,
  DAYS_OF_WEEK,
  SESSION_TYPES,
  CURRICULUM_TOPICS_DATABASE,
  generateDefaultWeeklyPlan
} from '../constants/glossaryAndPlannerData';
import { soundFeedback } from '../utils/feedbackSounds';

interface StudyPlannerProps {
  levelId: LevelId;
  streamId: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  stats?: UserStats;
  personalizedSyncTrigger?: number;
  onStartQuizSession: () => void;
  onOpenGlossary: () => void;
}

const PLANNER_STORAGE_KEY = 'math_inspector_study_planner_v1';

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  levelId,
  streamId,
  lang,
  dualLang,
  stats,
  personalizedSyncTrigger = 0,
  onStartQuizSession,
  onOpenGlossary
}) => {
  const [personalizedNotice, setPersonalizedNotice] = useState<string>('');
  // Store all study plan items across levels/streams, or generate default for current levelId/streamId
  const [allPlanItems, setAllPlanItems] = useState<StudyPlanItem[]>(() => {
    try {
      const saved = localStorage.getItem(PLANNER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore error
    }
    return generateDefaultWeeklyPlan(levelId, streamId);
  });

  // Ensure that if user switches to a level/stream that has 0 items, we seed its recommended plan automatically
  useEffect(() => {
    const hasItemsForCurrent = allPlanItems.some(
      item => item.levelId === levelId && item.streamId === streamId
    );
    if (!hasItemsForCurrent) {
      const seeded = generateDefaultWeeklyPlan(levelId, streamId);
      setAllPlanItems(prev => [...prev, ...seeded]);
    }
  }, [levelId, streamId, allPlanItems]);

  useEffect(() => {
    try {
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(allPlanItems));
    } catch {
      // ignore storage errors
    }
  }, [allPlanItems]);

  // Filter items for the currently selected level and stream
  const currentPlanItems = useMemo(
    () => allPlanItems.filter(item => item.levelId === levelId && item.streamId === streamId),
    [allPlanItems, levelId, streamId]
  );

  // Curriculum topics available for the current level and stream
  const availableCurriculumTopics = useMemo(() => {
    const matching = CURRICULUM_TOPICS_DATABASE.filter(
      t => t.levelId === levelId && (t.streams.includes(streamId) || t.streams.includes('general'))
    );
    return matching.length > 0
      ? matching
      : CURRICULUM_TOPICS_DATABASE.filter(t => t.levelId === levelId);
  }, [levelId, streamId]);

  // Form states for adding a new topic to the weekly schedule
  const [selectedDay, setSelectedDay] = useState<DayOfWeekId>('mon');
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayOfWeekId | 'all'>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('preset-0');
  const [customTopicTitle, setCustomTopicTitle] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<MathDomain>('analysis_functions');
  const [selectedSessionType, setSelectedSessionType] = useState<StudyPlanItem['sessionType']>('exercises');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedPriority, setSelectedPriority] = useState<StudyPlanItem['priority']>('high');

  // Reset preset selection when level/stream changes
  useEffect(() => {
    if (availableCurriculumTopics.length > 0) {
      setSelectedTopicId(availableCurriculumTopics[0].id);
      setSelectedDomain(availableCurriculumTopics[0].domain);
      setSelectedSessionType(availableCurriculumTopics[0].sessionType);
      setSelectedDuration(availableCurriculumTopics[0].recommendedDurationMin);
    } else {
      setSelectedTopicId('custom');
    }
  }, [availableCurriculumTopics]);

  const handleTopicSelectChange = (val: string) => {
    setSelectedTopicId(val);
    if (val !== 'custom') {
      const found = availableCurriculumTopics.find(t => t.id === val);
      if (found) {
        setSelectedDomain(found.domain);
        setSelectedSessionType(found.sessionType);
        setSelectedDuration(found.recommendedDurationMin);
      }
    }
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();

    let titleObj = {
      ar: 'حصة مراجعة وتمارين تطبيقية',
      biof: 'Séance de révision et exercices'
    };

    if (selectedTopicId === 'custom') {
      const trimmed = customTopicTitle.trim();
      if (!trimmed) return;
      titleObj = { ar: trimmed, biof: trimmed };
    } else {
      const found = availableCurriculumTopics.find(t => t.id === selectedTopicId);
      if (found) {
        titleObj = found.title;
      }
    }

    const newItem: StudyPlanItem = {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      dayId: selectedDay,
      levelId,
      streamId,
      domain: selectedDomain,
      title: titleObj,
      sessionType: selectedSessionType,
      durationMin: selectedDuration,
      priority: selectedPriority,
      completed: false
    };

    setAllPlanItems(prev => [...prev, newItem]);
    setCustomTopicTitle('');
  };

  const handleToggleComplete = (id: string) => {
    setAllPlanItems(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setAllPlanItems(prev => prev.filter(item => item.id !== id));
  };

  const handleResetToRecommended = () => {
    soundFeedback.playClickSound();
    const recommended = generateDefaultWeeklyPlan(levelId, streamId);
    setAllPlanItems(prev => [
      ...prev.filter(item => !(item.levelId === levelId && item.streamId === streamId)),
      ...recommended
    ]);
    setPersonalizedNotice('');
  };

  const handleGenerateFromPersonalizedPath = () => {
    if (!stats) return;
    soundFeedback.playTaskCompleteSound();
    const path = buildPersonalizedLearningPath(stats, levelId, streamId);
    const dynamicPlan = generatePersonalizedWeeklyPlan(path);
    setAllPlanItems(prev => [
      ...prev.filter(item => !(item.levelId === levelId && item.streamId === streamId)),
      ...dynamicPlan
    ]);
    setPersonalizedNotice(path.summaryAdvice[lang]);
  };

  useEffect(() => {
    if (personalizedSyncTrigger > 0 && stats) {
      const path = buildPersonalizedLearningPath(stats, levelId, streamId);
      const dynamicPlan = generatePersonalizedWeeklyPlan(path);
      setAllPlanItems(prev => [
        ...prev.filter(item => !(item.levelId === levelId && item.streamId === streamId)),
        ...dynamicPlan
      ]);
      setPersonalizedNotice(path.summaryAdvice[lang]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalizedSyncTrigger]);

  // Summary metrics
  const totalSessions = currentPlanItems.length;
  const completedSessions = currentPlanItems.filter(i => i.completed).length;
  const completionPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const totalMinutes = currentPlanItems.reduce((acc, i) => acc + i.durationMin, 0);
  const completedMinutes = currentPlanItems
    .filter(i => i.completed)
    .reduce((acc, i) => acc + i.durationMin, 0);

  const currentLevelObj = LEVELS.find(l => l.id === levelId);
  const currentStreamObj = STREAMS[streamId];

  const visibleDays = useMemo(() => {
    if (selectedDayFilter === 'all') return DAYS_OF_WEEK;
    return DAYS_OF_WEEK.filter(d => d.id === selectedDayFilter);
  }, [selectedDayFilter]);

  const formatHoursAndMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (lang === 'ar') {
      if (h === 0) return `${m} د`;
      if (m === 0) return `${h} س`;
      return `${h} س و ${m} د`;
    }
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Overview & Progress Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <span>{lang === 'ar' ? 'التخطيط البيداغوجي الأسبوعي' : 'Planification Pédagogique Hebdomadaire'}</span>
              <span aria-hidden="true">·</span>
              <span>{currentLevelObj?.name[lang]}</span>
              <span aria-hidden="true">·</span>
              <span>{currentStreamObj?.name[lang]}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'ar'
                ? 'مخطط الدراسة الأسبوعي وتوزيع المحاور (Study Planner)'
                : 'Planificateur d\'Étude Hebdomadaire par Niveau et Filière'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'ar'
                ? 'نظم برنامجك الأسبوعي لمراجعة دروس الرياضيات وإنجاز التمارين والفروض المحروسة حسب مستواك الدراسي وشعبتك، مع تتبع نسبة إنجازك.'
                : 'Organisez votre emploi du temps hebdomadaire de mathématiques selon le programme officiel de votre niveau et filière.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {stats && (
              <button
                type="button"
                onClick={handleGenerateFromPersonalizedPath}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-md"
              >
                {lang === 'ar' ? '🎯 توليد جدول مخصص حسب تقدمي' : '🎯 Plan selon mon parcours'}
              </button>
            )}
            <button
              type="button"
              onClick={handleResetToRecommended}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'ar' ? '🔄 استعادة البرنامج الرسمي المقترح' : '🔄 Réinitialiser le plan officiel'}
            </button>
            <button
              type="button"
              onClick={onOpenGlossary}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'ar' ? '📖 فتح المعجم الرياضي' : '📖 Ouvrir le Glossaire'}
            </button>
          </div>
        </div>

        {personalizedNotice && (
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 text-xs text-emerald-200 flex items-center justify-between gap-3">
            <span>🎯 {personalizedNotice}</span>
            <button
              type="button"
              onClick={() => setPersonalizedNotice('')}
              className="text-emerald-400 hover:text-white font-bold cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* 4-Column KPI Progress Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'الحصص المنجزة هذا الأسبوع' : 'Séances complétées'}
            </span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1 block">
              {completedSessions} / {totalSessions}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'نسبة التقدم الأسبوعي' : 'Progression hebdomadaire'}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-extrabold text-indigo-400 font-mono tabular-nums">
                {completionPct}%
              </span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'مجموع الغلاف الزمني المبرمج' : 'Volume horaire planifié'}
            </span>
            <span className="text-xl font-extrabold text-amber-400 font-mono tabular-nums mt-1 block">
              {formatHoursAndMins(totalMinutes)}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'الزمن الفعلي المنجز' : 'Temps d\'étude réalisé'}
            </span>
            <span className="text-xl font-extrabold text-cyan-400 font-mono tabular-nums mt-1 block">
              {formatHoursAndMins(completedMinutes)}
            </span>
          </div>
        </div>

        {/* Add New Study Session Form */}
        <form
          onSubmit={handleAddSession}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {lang === 'ar'
                ? '➕ إضافة محور أو حصة مراجعة جديدة إلى جدولك الأسبوعي:'
                : '➕ Ajouter une séance ou un chapitre au programme de la semaine :'}
            </h3>
            <span className="text-xs text-slate-400">
              {lang === 'ar'
                ? `مواضيع مكيفة مع: ${currentLevelObj?.shortName.ar} (${currentStreamObj?.code})`
                : `Sujets adaptés à : ${currentLevelObj?.shortName.biof} (${currentStreamObj?.code})`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Day Selector */}
            <div className="md:col-span-2">
              <label htmlFor="planner-day-select" className="block text-xs text-slate-400 mb-1">
                {lang === 'ar' ? 'اليوم:' : 'Jour :'}
              </label>
              <select
                id="planner-day-select"
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value as DayOfWeekId)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name[lang]}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Selector (Official Curriculum or Custom) */}
            <div className="md:col-span-5">
              <label htmlFor="planner-topic-select" className="block text-xs text-slate-400 mb-1">
                {lang === 'ar' ? 'المحور الدراسي من المقرر الرسمي:' : 'Chapitre du programme officiel :'}
              </label>
              <select
                id="planner-topic-select"
                value={selectedTopicId}
                onChange={e => handleTopicSelectChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                {availableCurriculumTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title[lang]}
                  </option>
                ))}
                <option value="custom">
                  {lang === 'ar' ? '✍️ كتابة موضوع مراجعة مخصص...' : '✍️ Saisir un sujet personnalisé...'}
                </option>
              </select>
            </div>

            {/* Session Type */}
            <div className="md:col-span-2">
              <label htmlFor="planner-type-select" className="block text-xs text-slate-400 mb-1">
                {lang === 'ar' ? 'نوع الحصة:' : 'Type de séance :'}
              </label>
              <select
                id="planner-type-select"
                value={selectedSessionType}
                onChange={e => setSelectedSessionType(e.target.value as StudyPlanItem['sessionType'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                {(Object.keys(SESSION_TYPES) as StudyPlanItem['sessionType'][]).map(typeKey => (
                  <option key={typeKey} value={typeKey}>
                    {SESSION_TYPES[typeKey].label[lang]}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="md:col-span-1">
              <label htmlFor="planner-duration-select" className="block text-xs text-slate-400 mb-1">
                {lang === 'ar' ? 'المدة:' : 'Durée :'}
              </label>
              <select
                id="planner-duration-select"
                value={selectedDuration}
                onChange={e => setSelectedDuration(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
              >
                {[30, 45, 60, 90, 120].map(mins => (
                  <option key={mins} value={mins}>
                    {mins}m
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'ar' ? 'إضافة للجدول +' : 'Ajouter au plan +'}
              </button>
            </div>
          </div>

          {/* Custom Title Input if 'custom' is chosen */}
          {selectedTopicId === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
              <div className="md:col-span-8">
                <input
                  type="text"
                  value={customTopicTitle}
                  onChange={e => setCustomTopicTitle(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'اكتب عنوان الدرس أو التمرين (مثال: مراجعة المتتاليات المرتبطة بدالة)...'
                      : 'Titre du chapitre ou exercice (ex: Révision des suites récurrentes)...'
                  }
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-4">
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value as MathDomain)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                >
                  {(Object.keys(DOMAINS) as MathDomain[]).map(domKey => (
                    <option key={domKey} value={domKey}>
                      {DOMAINS[domKey].name[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>

        {/* Day Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 font-semibold me-1 whitespace-nowrap">
            {lang === 'ar' ? 'عرض أيام الأسبوع:' : 'Afficher les jours :'}
          </span>
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'الأسبوع كاملاً (7 أيام)' : 'Semaine complète (7j)'}
          </button>
          {DAYS_OF_WEEK.map(day => {
            const count = currentPlanItems.filter(i => i.dayId === day.id).length;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDayFilter(day.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDayFilter === day.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                {day.name[lang]} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {visibleDays.map(day => {
          const dayItems = currentPlanItems.filter(item => item.dayId === day.id);
          const dayTotalMins = dayItems.reduce((sum, i) => sum + i.durationMin, 0);
          const dayCompletedCount = dayItems.filter(i => i.completed).length;

          return (
            <section
              key={day.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                      {day.shortName[lang]}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{day.name[lang]}</h3>
                      <span className="text-xs text-slate-400">
                        {dayItems.length === 0
                          ? (lang === 'ar' ? 'يوم راحة أو مراجعة حرة' : 'Jour libre')
                          : (lang === 'ar'
                              ? `${dayCompletedCount} من ${dayItems.length} مكتمل · ${formatHoursAndMins(dayTotalMins)}`
                              : `${dayCompletedCount}/${dayItems.length} terminé · ${formatHoursAndMins(dayTotalMins)}`)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(day.id);
                      const el = document.getElementById('planner-day-select');
                      if (el) el.focus();
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer whitespace-nowrap"
                  >
                    {lang === 'ar' ? '+ برمجة لهذا اليوم' : '+ Planifier ce jour'}
                  </button>
                </div>

                {/* Day Sessions List */}
                {dayItems.length === 0 ? (
                  <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-6 text-center">
                    <p className="text-xs text-slate-400">
                      {lang === 'ar'
                        ? 'لا توجد حصص مبرمجة في هذا اليوم حالياً.'
                        : 'Aucune séance programmée pour ce jour.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayItems.map(item => {
                      const domainObj = DOMAINS[item.domain];
                      const sessionTypeObj = SESSION_TYPES[item.sessionType];

                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4 transition-colors ${
                            item.completed
                              ? 'bg-emerald-950/15 border-emerald-500/40'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(item.id)}
                                aria-label={
                                  item.completed
                                    ? (lang === 'ar' ? 'إلغاء اكتمال الحصة' : 'Marquer non terminé')
                                    : (lang === 'ar' ? 'تحديد الحصة كمكتملة' : 'Marquer comme terminé')
                                }
                                className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                                  item.completed
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'bg-slate-900 border-slate-700 text-transparent hover:border-indigo-400'
                                }`}
                              >
                                ✓
                              </button>

                              <div className="space-y-1">
                                {/* Unboxed clean metadata line */}
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                  <span className="text-indigo-400 font-semibold">
                                    {domainObj.icon} {domainObj.name[lang]}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{sessionTypeObj.label[lang]}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono text-amber-300 tabular-nums">
                                    ⏱ {item.durationMin} {lang === 'ar' ? 'دقيقة' : 'min'}
                                  </span>
                                </div>

                                <h4
                                  className={`text-sm font-bold leading-snug ${
                                    item.completed ? 'line-through text-slate-400' : 'text-white'
                                  }`}
                                >
                                  {item.title[lang]}
                                </h4>
                                {dualLang && item.title.biof !== item.title.ar && (
                                  <p className="text-xs text-slate-400">
                                    {item.title[lang === 'ar' ? 'biof' : 'ar']}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              title={lang === 'ar' ? 'حذف الحصة' : 'Supprimer la séance'}
                              className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1 rounded transition-colors cursor-pointer shrink-0"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Action Bar */}
                          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs">
                            <span
                              className={`font-semibold ${
                                item.completed ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              {item.completed
                                ? (lang === 'ar' ? '✓ تم إنجاز هذا المحور بنجاح' : '✓ Séance terminée')
                                : (lang === 'ar' ? 'قيد الإنجاز' : 'À réaliser')}
                            </span>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={onOpenGlossary}
                                className="text-slate-300 hover:text-white underline cursor-pointer whitespace-nowrap"
                              >
                                {lang === 'ar' ? 'مراجعة المفاهيم' : 'Concepts'}
                              </button>
                              <button
                                type="button"
                                onClick={onStartQuizSession}
                                className="font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer whitespace-nowrap"
                              >
                                {lang === 'ar' ? 'بدء التمارين الآن ←' : 'S\'entraîner →'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
