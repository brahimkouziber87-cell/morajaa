import React, { useState, useMemo } from 'react';
import { AppTab } from './Header';
import { LanguageOption } from '../types/curriculum';

export type ModeCategory = 'all' | 'learning' | 'challenge' | 'labs' | 'planning';

export interface GameModeConfig {
  id: AppTab;
  category: 'learning' | 'challenge' | 'labs' | 'planning';
  title: { ar: string; biof: string };
  shortLabel: { ar: string; biof: string };
  badge?: { ar: string; biof: string };
  badgeColor?: string;
  icon: string;
  accentBorder: string;
  activeBg: string;
  description: { ar: string; biof: string };
}

export const GAME_MODES: GameModeConfig[] = [
  // 1. Learning & Adventure
  {
    id: 'adventure',
    category: 'learning',
    title: { ar: 'شجرة المهارات والمغامرة', biof: 'Arbre des Compétences' },
    shortLabel: { ar: 'شجرة المهارات', biof: 'Compétences' },
    badge: { ar: 'RPG', biof: 'RPG' },
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: '🗺️',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    activeBg: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/25',
    description: {
      ar: 'مسار تعلم متدرج، فتح البوابات بالمتطلبات القبلية، والنجوم الثلاث لكل كفاية',
      biof: 'Progression par prérequis, déblocage de paliers et 3 étoiles par compétence'
    }
  },
  {
    id: 'quiz',
    category: 'learning',
    title: { ar: 'المراجعة والذكاء الاصطناعي', biof: 'Révision & Questions IA' },
    shortLabel: { ar: 'المراجعة والـ AI', biof: 'Révision & IA' },
    badge: { ar: 'صوتي + AI', biof: 'Vocal + IA' },
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: '🧠',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    activeBg: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25',
    description: {
      ar: 'تمارين تفاعلية، توليد آلي بالذكاء الاصطناعي، وإجابة صوتية مع المرشد السقراطي',
      biof: 'Exercices interactifs, génération par IA, saisie vocale et tuteur socratique'
    }
  },
  {
    id: 'flashcards',
    category: 'learning',
    title: { ar: 'البطاقات المقلوبة (Flashcards 3D)', biof: 'Cartes Mémoire 3D' },
    shortLabel: { ar: 'البطاقات 3D', biof: 'Flashcards' },
    icon: '🃏',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    activeBg: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25',
    description: {
      ar: 'تثبيت المبرهنات والقواعد بالاسترجاع النشط ثلاثي الأبعاد وتقييم التمكن',
      biof: 'Mémorisation active des propriétés et théorèmes avec cartes 3D'
    }
  },
  {
    id: 'glossary',
    category: 'learning',
    title: { ar: 'المعجم الرياضي والرموز', biof: 'Glossaire des Concepts' },
    shortLabel: { ar: 'المعجم والرموز', biof: 'Glossaire' },
    icon: '📖',
    accentBorder: 'border-blue-500/40 hover:border-blue-400',
    activeBg: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25',
    description: {
      ar: 'قاموس شامل للمصطلحات الرياضية والرموز ثنائي اللغة عربي - فرنسي (BIOF)',
      biof: 'Dictionnaire bilingue arabe-français des notions et notations officielles'
    }
  },

  // 2. Challenges & Battles
  {
    id: 'timed',
    category: 'challenge',
    title: { ar: 'التحدي الزمني السريع (10 أسئلة)', biof: 'Défi Chrono (10 Q)' },
    shortLabel: { ar: 'التحدي الزمني', biof: 'Défi Chrono' },
    badge: { ar: 'سرعة', biof: 'Speed' },
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: '⏱️',
    accentBorder: 'border-rose-500/40 hover:border-rose-400',
    activeBg: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/25',
    description: {
      ar: '10 أسئلة متسلسلة ضد الساعة لاختبار سرعة الاستحضار ومضاعفة النقاط',
      biof: '10 questions rapides contre la montre pour tester les réflexes et le combo'
    }
  },
  {
    id: 'classroom',
    category: 'challenge',
    title: { ar: 'تحدي الفصل الحي (Tournament)', biof: 'Tournoi de Classe Live' },
    shortLabel: { ar: 'تحدي الفصل Live', biof: 'Classe Live' },
    badge: { ar: 'مباشر', biof: 'Live' },
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: '👥',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    activeBg: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/25',
    description: {
      ar: 'تنافس صفي متزامن برمز PIN، وضع الأستاذ والتلميذ، ومنصة تتويج ثلاثية',
      biof: 'Compétition en direct de type Kahoot avec code PIN et podium'
    }
  },
  {
    id: 'boss',
    category: 'challenge',
    title: { ar: 'معركة الزعيم الرياضي ⚔️', biof: 'Combat de Boss ⚔️' },
    shortLabel: { ar: 'معركة الزعيم', biof: 'Boss Fight' },
    badge: { ar: 'نزال', biof: 'Boss' },
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: '⚔️',
    accentBorder: 'border-red-500/40 hover:border-red-400',
    activeBg: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25',
    description: {
      ar: 'مواجهة زعماء الامتحان الوطني بأسئلة مركبة واستراتيجية لحسم النقاط الكبرى',
      biof: 'Affrontez les boss de fin de chapitre avec des questions d\'examen'
    }
  },
  {
    id: 'leaderboard',
    category: 'challenge',
    title: { ar: 'لوحة الصدارة والأوسمة', biof: 'Classement & Badges' },
    shortLabel: { ar: 'لوحة الصدارة', biof: 'Classement' },
    icon: '🏆',
    accentBorder: 'border-yellow-500/40 hover:border-yellow-400',
    activeBg: 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white shadow-lg shadow-yellow-600/25',
    description: {
      ar: 'ترتيب التلاميذ الوطني، فتح الأوسمة، وبطاقات الإنجاز القابلة للمشاركة',
      biof: 'Classement général des élèves et collection de badges de maîtrise'
    }
  },

  // 3. Labs & Proofs
  {
    id: 'spatial',
    category: 'labs',
    title: { ar: 'مختبر الهندسة الفضائية 3D', biof: 'Géométrie dans l\'Espace 3D' },
    shortLabel: { ar: 'الفضاء 3D', biof: 'Espace 3D' },
    badge: { ar: '3D تفاعلي', biof: '3D' },
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: '🪐',
    accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
    activeBg: 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-600/25',
    description: {
      ar: 'تدوير حر 360° لتقاطع الفلكة والمستوى، الجداء المتجهي، والإسقاطات الفضائية',
      biof: 'Manipulation 3D dynamique 360° : sphère, plan et produit vectoriel'
    }
  },
  {
    id: 'lab',
    category: 'labs',
    title: { ar: 'المختبر البياني للدوال', biof: 'Labo Graphique des Fonctions' },
    shortLabel: { ar: 'المختبر البياني', biof: 'Labo Fonctions' },
    icon: '📈',
    accentBorder: 'border-teal-500/40 hover:border-teal-400',
    activeBg: 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-600/25',
    description: {
      ar: 'تمثيل الدوال، المشتقات، المماس، وتوليد جدول التغيرات آلياً',
      biof: 'Tracé de courbes, tangentes et tableau de variations interactif'
    }
  },
  {
    id: 'proof',
    category: 'labs',
    title: { ar: 'مركب البراهين والاستدلال', biof: 'Constructeur de Preuves' },
    shortLabel: { ar: 'مركب البراهين', biof: 'Preuves' },
    icon: '🧩',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    activeBg: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25',
    description: {
      ar: 'ترتيب خطوات البرهان المنطقي والاستدلال بالترجع والخلف وفصل الحالات',
      biof: 'Assemblage méthodique par étapes des démonstrations mathématiques'
    }
  },
  {
    id: 'pitfalls',
    category: 'labs',
    title: { ar: 'صائد الأخطاء الشائعة', biof: 'Chasseur d\'Erreurs' },
    shortLabel: { ar: 'صائد الأخطاء', biof: 'Chasseur d\'Erreurs' },
    icon: '⚠️',
    accentBorder: 'border-orange-500/40 hover:border-orange-400',
    activeBg: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/25',
    description: {
      ar: 'تشخيص وتصويب الأخطاء الديداكتيكية الكلاسيكية في تحرير خطوات الحل',
      biof: 'Repérez l\'étape erronée dans les rédactions pièges d\'examens'
    }
  },

  // 4. Assessment & Planning
  {
    id: 'report',
    category: 'planning',
    title: { ar: 'تقرير المفتش وتدارك الأخطاء', biof: 'Bilan de l\'Inspecteur & Remédiation' },
    shortLabel: { ar: 'تقرير المفتش', biof: 'Bilan' },
    badge: { ar: 'تدارك', biof: 'Audit' },
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: '📋',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    activeBg: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25',
    description: {
      ar: 'مبيان تطور الأداء آخر 7 أيام، رادار الكفايات، وجلسات تدارك الأسئلة الخاطئة',
      biof: 'Activité sur 7 jours, diagnostic des 4 compétences et remédiation ciblée'
    }
  },
  {
    id: 'planner',
    category: 'planning',
    title: { ar: 'مخطط المراجعة الأسبوعي', biof: 'Planificateur d\'Étude' },
    shortLabel: { ar: 'مخطط المراجعة', biof: 'Planning' },
    icon: '📅',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    activeBg: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25',
    description: {
      ar: 'برنامج مذاكرة مخصص للمقرر مع فترات بومودورو الموجهة للتركيز',
      biof: 'Emploi du temps personnalisé et sessions de travail Pomodoro'
    }
  }
];

const CATEGORIES: { id: ModeCategory; icon: string; label: { ar: string; biof: string } }[] = [
  { id: 'all', icon: '🌟', label: { ar: 'جميع الأنماط (14)', biof: 'Tous les modes (14)' } },
  { id: 'learning', icon: '🗺️', label: { ar: 'مسار التعلم (4)', biof: 'Apprentissage (4)' } },
  { id: 'challenge', icon: '⚔️', label: { ar: 'التحديات والبطولات (4)', biof: 'Défis & Arènes (4)' } },
  { id: 'labs', icon: '🔬', label: { ar: 'المختبرات والبرهان (4)', biof: 'Labos & Preuves (4)' } },
  { id: 'planning', icon: '📊', label: { ar: 'المتابعة والتقييم (2)', biof: 'Bilan & Planning (2)' } }
];

interface GameModeHubSelectorProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  lang: LanguageOption;
  dualLang?: boolean;
}

export const GameModeHubSelector: React.FC<GameModeHubSelectorProps> = ({
  currentTab,
  onTabChange,
  lang
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ModeCategory>('all');

  const filteredModes = useMemo(() => {
    if (selectedCategory === 'all') return GAME_MODES;
    return GAME_MODES.filter(m => m.category === selectedCategory);
  }, [selectedCategory]);

  const activeModeConfig = useMemo(() => {
    return GAME_MODES.find(m => m.id === currentTab) || GAME_MODES[0];
  }, [currentTab]);

  return (
    <div className="space-y-4 pt-6 mt-4 border-t border-slate-800/80">
      {/* Category Filter Tabs (Pill-free Segmented Control) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label[lang]}</span>
            </button>
          ))}
        </div>

        {/* Current Active Mode Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>{lang === 'ar' ? 'النمط الحالي:' : 'Mode actif :'}</span>
          <span className="font-bold text-white flex items-center gap-1">
            <span>{activeModeConfig.icon}</span>
            <span>{activeModeConfig.title[lang]}</span>
          </span>
        </div>
      </div>

      {/* Mode Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
        {filteredModes.map(mode => {
          const isActive = currentTab === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onTabChange(mode.id)}
              title={mode.description[lang]}
              className={`group relative p-2.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                isActive
                  ? `${mode.activeBg} border-transparent scale-[1.02]`
                  : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full">
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                  {mode.icon}
                </span>
                {mode.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : mode.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {mode.badge[lang]}
                  </span>
                )}
              </div>

              <div className="mt-2">
                <p
                  className={`text-xs font-extrabold leading-snug line-clamp-2 ${
                    isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {mode.shortLabel[lang]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
