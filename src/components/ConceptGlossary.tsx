import React, { useState, useMemo, useEffect } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  LEVELS,
  STREAMS
} from '../constants/dataStructure';
import { DOMAINS } from '../game/curriculumData';
import { GLOSSARY_DATABASE, GlossaryConcept } from '../constants/glossaryAndPlannerData';
import { FormulaDisplay, MathText } from './FormulaDisplay';

interface ConceptGlossaryProps {
  levelId: LevelId;
  streamId: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  onPracticeDomain?: (domain: MathDomain) => void;
}

const BOOKMARKS_STORAGE_KEY = 'math_inspector_glossary_bookmarks_v1';

export const ConceptGlossary: React.FC<ConceptGlossaryProps> = ({
  levelId,
  streamId,
  lang,
  dualLang,
  onPracticeDomain
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [levelScope, setLevelScope] = useState<'current' | 'all' | LevelId>('current');
  const [selectedDomain, setSelectedDomain] = useState<MathDomain | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryConcept['category'] | 'all' | 'saved'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedIds));
    } catch {
      // ignore storage errors
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCopyConcept = (concept: GlossaryConcept) => {
    const textToCopy = `${concept.term.ar} (${concept.term.biof})\nالرمز / الصيغة: ${concept.formula}\nالتعريف: ${concept.definition[lang]}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopiedId(concept.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeLevelFilter = levelScope === 'current' ? levelId : levelScope;

  const filteredConcepts = useMemo(() => {
    return GLOSSARY_DATABASE.filter(item => {
      // 1. Level filter
      if (activeLevelFilter !== 'all' && !item.levels.includes(activeLevelFilter)) {
        return false;
      }

      // 2. Domain filter
      if (selectedDomain !== 'all' && item.domain !== selectedDomain) {
        return false;
      }

      // 3. Category / Saved filter
      if (selectedCategory === 'saved') {
        if (!bookmarkedIds.includes(item.id)) return false;
      } else if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 4. Search query filter (matches Arabic, French BIOF, symbol, formula, or keywords)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTermAr = item.term.ar.toLowerCase().includes(q);
        const matchesTermBiof = item.term.biof.toLowerCase().includes(q);
        const matchesSymbol = item.symbol.toLowerCase().includes(q);
        const matchesFormula = item.formula.toLowerCase().includes(q);
        const matchesDefAr = item.definition.ar.toLowerCase().includes(q);
        const matchesDefBiof = item.definition.biof.toLowerCase().includes(q);
        const matchesKeywords = item.keywords.some(k => k.toLowerCase().includes(q));

        return (
          matchesTermAr ||
          matchesTermBiof ||
          matchesSymbol ||
          matchesFormula ||
          matchesDefAr ||
          matchesDefBiof ||
          matchesKeywords
        );
      }

      return true;
    });
  }, [activeLevelFilter, selectedDomain, selectedCategory, bookmarkedIds, searchQuery]);

  // Quick symbol buttons derived from the current level or all concepts
  const quickSymbols = useMemo(() => {
    const base = GLOSSARY_DATABASE.filter(c =>
      activeLevelFilter === 'all' ? true : c.levels.includes(activeLevelFilter)
    );
    return base.slice(0, 8);
  }, [activeLevelFilter]);

  const currentLevelObj = LEVELS.find(l => l.id === levelId);
  const currentStreamObj = STREAMS[streamId];

  const getCategoryLabel = (cat: GlossaryConcept['category']) => {
    switch (cat) {
      case 'definition':
        return lang === 'ar' ? 'تعريف ومفهوم' : 'Définition';
      case 'theorem':
        return lang === 'ar' ? 'مبرهنة رسمية' : 'Théorème';
      case 'symbol':
        return lang === 'ar' ? 'رمز وترميز رياضي' : 'Symbole & Notation';
      case 'property':
        return lang === 'ar' ? 'خاصية جبرية/تحليلية' : 'Propriété';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Controls Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <span>{lang === 'ar' ? 'المعجم الرياضي التفاعلي المزدوج (عربي / BIOF)' : 'Lexique Mathématique Bilingue (Arabe / BIOF)'}</span>
              <span aria-hidden="true">·</span>
              <span>{currentLevelObj?.name[lang]}</span>
              <span aria-hidden="true">·</span>
              <span>{currentStreamObj?.name[lang]}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'ar'
                ? 'قاموس المفاهيم، الرموز، والمبرهنات الرياضية (Concept Glossary)'
                : 'Glossaire des Concepts, Symboles et Théorèmes Mathématiques'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'ar'
                ? 'ابحث عن أي مصطلح رياضي، رمز، أو مبرهنة بالعربية أو بالفرنسية (BIOF) مع الصيغ المرجعية وتوجيهات المفتش التربوي لتفادي الأخطاء الشائعة في الامتحانات.'
                : 'Recherchez un terme mathématique, un symbole ou un théorème en arabe ou en français (BIOF) avec les formules de référence et les conseils de l\'inspecteur.'}
            </p>
          </div>

          {/* Summary Counter */}
          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl shrink-0">
            <div className="text-center">
              <span className="block text-[11px] text-slate-400">{lang === 'ar' ? 'المفاهيم المعروضة' : 'Concepts affichés'}</span>
              <span className="text-lg font-extrabold text-indigo-400 font-mono tabular-nums">
                {filteredConcepts.length} / {GLOSSARY_DATABASE.length}
              </span>
            </div>
            <span className="text-slate-800" aria-hidden="true">|</span>
            <div className="text-center">
              <span className="block text-[11px] text-slate-400">{lang === 'ar' ? 'المفضلة المحفوظة' : 'Favoris'}</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono tabular-nums">
                {bookmarkedIds.length}
              </span>
            </div>
          </div>
        </div>

        {/* Search Input & Level Scope Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-6 relative">
            <label htmlFor="glossary-search-input" className="sr-only">
              {lang === 'ar' ? 'ابحث عن مفهوم أو رمز رياضي' : 'Rechercher un concept ou symbole'}
            </label>
            <input
              id="glossary-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'ar'
                  ? '🔍 ابحث بالمصطلح (عربي/فرنسي) أو بالرمز (مثال: TVI، ترجع، Δ، ln، طاليس، عقدية...)'
                  : '🔍 Rechercher un terme, théorème ou symbole (ex: TVI, récurrence, Δ, ln, Thalès...)'
              }
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 cursor-pointer"
              >
                {lang === 'ar' ? 'مسح ✕' : 'Effacer ✕'}
              </button>
            )}
          </div>

          {/* Level Scope Selector */}
          <div className="lg:col-span-6 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 me-1 whitespace-nowrap">
              {lang === 'ar' ? 'نطاق المستوى:' : 'Niveau :'}
            </span>
            <button
              type="button"
              onClick={() => setLevelScope('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                levelScope === 'current'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {lang === 'ar'
                ? `مستواي الحالي (${currentLevelObj?.shortName.ar})`
                : `Mon Niveau (${currentLevelObj?.shortName.biof})`}
            </button>
            <button
              type="button"
              onClick={() => setLevelScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                levelScope === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'جميع المستويات (1AC → 2Bac)' : 'Tous les Niveaux (1AC → 2Bac)'}
            </button>
          </div>
        </div>

        {/* Quick Mathematical Symbols Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {lang === 'ar' ? 'وصول سريع بالرموز:' : 'Accès rapide par symbole :'}
          </span>
          {quickSymbols.map(item => {
            const isSelected = searchQuery === item.symbol;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSearchQuery(isSelected ? '' : item.symbol)}
                dir="ltr"
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-indigo-300 hover:border-indigo-500/50 hover:text-white'
                }`}
              >
                {item.symbol}
              </button>
            );
          })}
        </div>

        {/* Domain & Category Filter Rows */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          {/* Domain Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedDomain === 'all'
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'كل المجالات' : 'Tous les domaines'}
            </button>
            {(Object.keys(DOMAINS) as MathDomain[]).map(domKey => (
              <button
                key={domKey}
                type="button"
                onClick={() => setSelectedDomain(domKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDomain === domKey
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {DOMAINS[domKey].icon} {DOMAINS[domKey].name[lang]}
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', ar: 'الكل', biof: 'Tout' },
                { id: 'definition', ar: 'تعاريف', biof: 'Définitions' },
                { id: 'theorem', ar: 'مبرهنات', biof: 'Théorèmes' },
                { id: 'symbol', ar: 'رموز', biof: 'Symboles' },
                { id: 'saved', ar: `★ المحفوظة (${bookmarkedIds.length})`, biof: `★ Favoris (${bookmarkedIds.length})` }
              ] as const
            ).map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary Cards Grid */}
      {filteredConcepts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <p className="text-base font-bold text-slate-200">
            {lang === 'ar'
              ? 'لم يتم العثور على مفاهيم مطابقة لبحثك في هذا النطاق.'
              : 'Aucun concept mathématique ne correspond à votre recherche.'}
          </p>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'جرب توسيع النطاق ليشمل «جميع المستويات» أو مسح كلمة البحث.'
              : 'Essayez d\'élargir la recherche à « Tous les Niveaux » ou de réinitialiser les filtres.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setLevelScope('all');
                setSelectedDomain('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إظهار جميع المفاهيم والمبرهنات' : 'Afficher tous les concepts'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredConcepts.map(concept => {
            const isBookmarked = bookmarkedIds.includes(concept.id);
            const domainInfo = DOMAINS[concept.domain];
            const levelLabels = concept.levels
              .map(lvlId => LEVELS.find(l => l.id === lvlId)?.shortName[lang] || lvlId)
              .join(' / ');

            return (
              <article
                key={concept.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-colors shadow-lg"
              >
                <div className="space-y-4">
                  {/* Top Metadata Row (Zero-Pill clean unboxed text with separators) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="text-indigo-400 font-semibold">
                        {domainInfo.icon} {domainInfo.name[lang]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{getCategoryLabel(concept.category)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-medium">{levelLabels}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyConcept(concept)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                        title={lang === 'ar' ? 'نسخ الصيغة والتعريف' : 'Copier la formule et définition'}
                      >
                        {copiedId === concept.id
                          ? (lang === 'ar' ? '✓ تم النسخ' : '✓ Copié')
                          : (lang === 'ar' ? 'نسخ الصيغة' : 'Copier')}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(concept.id)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          isBookmarked
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isBookmarked
                          ? (lang === 'ar' ? '★ محفوظ' : '★ Favori')
                          : (lang === 'ar' ? '☆ حفظ' : '☆ Sauver')}
                      </button>
                    </div>
                  </div>

                  {/* Concept Title & Symbol Box */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white leading-snug">
                        {concept.term[lang]}
                      </h3>
                      {(dualLang || lang === 'ar') && (
                        <p className="text-xs font-medium text-indigo-300/90">
                          {concept.term[lang === 'ar' ? 'biof' : 'ar']}
                        </p>
                      )}
                    </div>

                    <div
                      dir="ltr"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-indigo-300 font-mono text-sm font-bold shrink-0"
                    >
                      <FormulaDisplay formula={concept.symbol} inline />
                    </div>
                  </div>

                  {/* Canonical Mathematical Formula rendered realistically via KaTeX */}
                  <FormulaDisplay formula={concept.formula} copyable className="my-2 py-3" />

                  {/* Bilingual or Selected Language Definition */}
                  <div className="space-y-2 text-sm text-slate-200 leading-relaxed">
                    <p><MathText text={concept.definition[lang]} /></p>
                    {dualLang && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                        <MathText text={concept.definition[lang === 'ar' ? 'biof' : 'ar']} />
                      </p>
                    )}
                  </div>

                  {/* Concrete Example */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                    <span className="text-xs font-bold text-cyan-400 block">
                      {lang === 'ar' ? 'مثال تطبيقي:' : 'Exemple d\'application :'}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <MathText text={concept.example[lang]} />
                    </p>
                  </div>
                </div>

                {/* Footer: Inspector Tip & Direct Practice Button */}
                <div className="pt-4 mt-4 border-t border-slate-800 space-y-3">
                  <div className="text-xs text-amber-300/90 leading-relaxed">
                    <strong className="font-bold">
                      {lang === 'ar' ? 'توجيه المفتش التربوي: ' : 'Conseil de l\'Inspecteur : '}
                    </strong>
                    <span>{concept.inspectorTip[lang]}</span>
                  </div>

                  {onPracticeDomain && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onPracticeDomain(concept.domain)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer whitespace-nowrap"
                      >
                        {lang === 'ar'
                          ? `تطبيق هذا المفهوم في تمارين ${domainInfo.name.ar} ←`
                          : `S'entraîner sur ${domainInfo.name.biof} →`}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
