import React, { useState, useEffect, useMemo } from 'react';
import {
  LevelId,
  LanguageOption,
  MathDomain,
  DOMAINS,
  LEVELS,
  LocalizedString
} from '../constants/dataStructure';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import { Sparkles, Zap, CheckCircle2, BookOpen, RefreshCw, Timer, Award } from 'lucide-react';

export interface DailyConceptItem {
  id: string;
  levelId: LevelId;
  domain: MathDomain;
  title: LocalizedString;
  summary: LocalizedString;
  formula: string;
  keyApplication: LocalizedString;
  challengeQuestion: {
    statement: LocalizedString;
    formula?: string;
    options: LocalizedString[];
    correctIndex: number;
    explanation: LocalizedString;
  };
}

export const DAILY_CONCEPTS_BANK: DailyConceptItem[] = [
  {
    id: 'cotd-2bac-ln-deriv',
    levelId: '2bac',
    domain: 'analysis_functions',
    title: {
      ar: 'مشتقة الدالة اللوغاريتمية المركبة ln(|u(x)|)',
      biof: 'Dérivée de la Fonction Composée ln(|u(x)|)'
    },
    summary: {
      ar: 'إذا كانت u دالة قابلة للاشتقاق ولا تنعدم على مجال I، فإن الدالة f(x) = ln(|u(x)|) قابلة للاشتقاق على I ومشتقتها هي خارج مشتقة u على u نفسها.',
      biof: 'Si u est dérivable et ne s\'annule pas sur un intervalle I, alors f(x) = ln(|u(x)|) est dérivable sur I et sa dérivée est le quotient u\'(x)/u(x).'
    },
    formula: '\\left( \\ln(|u(x)|) \\right)\' = \\frac{u\'(x)}{u(x)}',
    keyApplication: {
      ar: 'تُستعمل لتحديد رتابة الدوال اللوغاريتمية واستنتاج الدوال الأصلية التي تكتب على شكل u\'/u.',
      biof: 'Utilisée pour étudier la monotonie des fonctions logarithmiques et déterminer les primitives de la forme u\'/u.'
    },
    challengeQuestion: {
      statement: {
        ar: 'تحدي سريع: ما هي المشتقة f\'(x) للدالة f(x) = ln(x² + 1) لكل x من ℝ؟',
        biof: 'Défi Rapide : Quelle est la dérivée f\'(x) de la fonction f(x) = ln(x² + 1) sur ℝ ?'
      },
      formula: 'f(x) = \\ln(x^2 + 1)',
      options: [
        { ar: 'f\'(x) = 2x / (x² + 1)', biof: 'f\'(x) = 2x / (x² + 1)' },
        { ar: 'f\'(x) = 1 / (x² + 1)', biof: 'f\'(x) = 1 / (x² + 1)' },
        { ar: 'f\'(x) = 2x ln(x² + 1)', biof: 'f\'(x) = 2x ln(x² + 1)' },
        { ar: 'f\'(x) = 1 / (2x)', biof: 'f\'(x) = 1 / (2x)' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'نضع u(x) = x² + 1 > 0، ومشتقتها هي u\'(x) = 2x.\nبتطبيق خاصية مشتقة اللوغاريتم المركب: f\'(x) = u\'(x)/u(x) = 2x / (x² + 1).',
        biof: 'En posant u(x) = x² + 1 > 0, on a u\'(x) = 2x. Par propriété : f\'(x) = u\'(x)/u(x) = 2x / (x² + 1).'
      }
    }
  },
  {
    id: 'cotd-2bac-euler-complex',
    levelId: '2bac',
    domain: 'arithmetic_algebra',
    title: {
      ar: 'الترميز الأسي لعدد عقدي وصيغة موافر (Moivre)',
      biof: 'Notation Exponentielle Complexe & Formule de Moivre'
    },
    summary: {
      ar: 'كل عدد عقدي غير منعدم معياره r وعمدته θ يُكتب على الشكل الأسي z = r e^(iθ)، مما يحول جداء وقوى الأعداد العقدية إلى عمليات جمع وضرب بسيطة في الأس.',
      biof: 'Tout nombre complexe non nul de module r et d\'argument θ s\'écrit z = r e^(iθ), transformant les produits et puissances en opérations sur les arguments.'
    },
    formula: 'z = r e^{i\\theta} \\implies z^n = r^n e^{i n\\theta}',
    keyApplication: {
      ar: 'حساب القوى العالية للأعداد العقدية وتحديد الطبيعة الهندسية للتحويلات العقدية (الدوران والتحاكي).',
      biof: 'Calcul des puissances élevées et caractérisation géométrique des rotations dans le plan complexe.'
    },
    challengeQuestion: {
      statement: {
        ar: 'تحدي سريع: إذا كان z = e^(i π/4)، فما هي القيمة الجبرية للعدد العقدي z⁴؟',
        biof: 'Défi Rapide : Si z = e^(i π/4), quelle est la forme algébrique de z⁴ ?'
      },
      formula: 'z^4 = \\left(e^{i\\frac{\\pi}{4}}\\right)^4',
      options: [
        { ar: 'z⁴ = -1', biof: 'z⁴ = -1' },
        { ar: 'z⁴ = 1', biof: 'z⁴ = 1' },
        { ar: 'z⁴ = i', biof: 'z⁴ = i' },
        { ar: 'z⁴ = -i', biof: 'z⁴ = -i' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'بتطبيق خاصية القوى: z⁴ = e^(i × 4 × π/4) = e^(iπ) = cos(π) + i sin(π) = -1.',
        biof: 'Par la formule de Moivre : z⁴ = e^(i 4π/4) = e^(iπ) = cos(π) + i sin(π) = -1.'
      }
    }
  },
  {
    id: 'cotd-1bac-alkashi',
    levelId: '1bac',
    domain: 'geometry_trig',
    title: {
      ar: 'مبرهنة الكاشي (Al-Kashi) والجداء السلمي في المثلث',
      biof: 'Théorème d\'Al-Kashi (Loi des Cosinus)'
    },
    summary: {
      ar: 'تربط مبرهنة الكاشي أطوال أضلاع أي مثلث بجيب تمام إحدى زواياه، وهي تعميم مباشر لمبرهنة فيثاغورس على المثلثات غير القائمة.',
      biof: 'Le théorème d\'Al-Kashi relie les longueurs des côtés d\'un triangle quelconque au cosinus de l\'un de ses angles, généralisant le théorème de Pythagore.'
    },
    formula: 'a^2 = b^2 + c^2 - 2bc \\cos(\\widehat{A})',
    keyApplication: {
      ar: 'حساب طول الضلع الثالث في مثلث بمعرفة ضلعين والزاوية المحصورة بينهما، أو استنتاج قياسات الزوايا.',
      biof: 'Calculer le troisième côté d\'un triangle connaissant deux côtés et l\'angle compris entre eux.'
    },
    challengeQuestion: {
      statement: {
        ar: 'تحدي سريع: في مثلث ABC متساوي الأضلاع طول ضلعه AB = AC = 2 وقياس Â = 60° (cos 60° = 1/2). كم يساوي الجداء السلمي AB⃗ · AC⃗؟',
        biof: 'Défi Rapide : Dans un triangle équilatéral ABC de côté 2 (Â = 60°, cos 60° = 1/2), que vaut le produit scalaire AB⃗ · AC⃗ ?'
      },
      formula: '\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = AB \\times AC \\times \\cos(\\widehat{A})',
      options: [
        { ar: '2', biof: '2' },
        { ar: '4', biof: '4' },
        { ar: '1', biof: '1' },
        { ar: '0', biof: '0' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'بتطبيق الصيغة المثلثية للجداء السلمي: AB⃗ · AC⃗ = 2 × 2 × cos(60°) = 4 × (1/2) = 2.',
        biof: 'Par définition trigonométrique : AB⃗ · AC⃗ = 2 × 2 × cos(60°) = 4 × 0.5 = 2.'
      }
    }
  },
  {
    id: 'cotd-tc-discriminant',
    levelId: 'tc',
    domain: 'arithmetic_algebra',
    title: {
      ar: 'مميز ثلاثية الحدود من الدرجة الثانية ومجموع وجداء الجذرين',
      biof: 'Discriminant Δ & Relations Coefficients-Racines (Viète)'
    },
    summary: {
      ar: 'يحدد المميز Δ = b² - 4ac عدد حلول المعادلة ax² + bx + c = 0 في ℝ. وعندما يكون Δ ≥ 0، فإن مجموع الحلين هو S = -b/a وجداءهما هو P = c/a.',
      biof: 'Le discriminant Δ = b² - 4ac détermine l\'existence des racines réelles. Lorsque Δ ≥ 0, la somme des racines vaut S = -b/a et leur produit vaut P = c/a.'
    },
    formula: '\\Delta = b^2 - 4ac \\quad ; \\quad x_1 + x_2 = -\\frac{b}{a} \\quad ; \\quad x_1 x_2 = \\frac{c}{a}',
    keyApplication: {
      ar: 'إيجاد الحل الثاني لمعادلة ذهنياً بمجرد ملاحظة حل بديهي (مثل x = 1 أو x = -1)، ودراسة إشارة ثلاثية الحدود.',
      biof: 'Trouver mentalement la seconde racine à partir d\'une racine évidente et factoriser le trinôme.'
    },
    challengeQuestion: {
      statement: {
        ar: 'تحدي سريع: ليكن x₁ و x₂ حلي المعادلة 2x² - 10x + 8 = 0. دون حساب المميز، ما هي قيمة مجموع الحلين S = x₁ + x₂؟',
        biof: 'Défi Rapide : Soient x₁ et x₂ les racines de 2x² - 10x + 8 = 0. Sans calculer Δ, que vaut la somme S = x₁ + x₂ ?'
      },
      formula: '2x^2 - 10x + 8 = 0',
      options: [
        { ar: 'S = 5', biof: 'S = 5' },
        { ar: 'S = 10', biof: 'S = 10' },
        { ar: 'S = -5', biof: 'S = -5' },
        { ar: 'S = 4', biof: 'S = 4' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'حسب خاصية مجموع جذري معادلة من الدرجة الثانية: S = -b/a = -(-10)/2 = 10/2 = 5.',
        biof: 'Par la relation somme des racines : S = -b/a = -(-10)/2 = 5.'
      }
    }
  },
  {
    id: 'cotd-3ac-thales',
    levelId: '3ac',
    domain: 'geometry_trig',
    title: {
      ar: 'مبرهنة طاليس المباشرة والعكسية (Théorème de Thalès)',
      biof: 'Théorème de Thalès Direct et Réciproque'
    },
    summary: {
      ar: 'مبرهنة طاليس المباشرة تمكن من حساب الأطوال انطلاقاً من التوازي، بينما مبرهنة طاليس العكسية تثبت توازي مستقيمين انطلاقاً من تساوي نسبتين وترتيب النقط.',
      biof: 'Le théorème direct permet de calculer des longueurs grâce au parallélisme, tandis que la réciproque démontre le parallélisme à partir de l\'égalité de deux rapports.'
    },
    formula: '(MN) \\parallel (BC) \\implies \\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}',
    keyApplication: {
      ar: 'ركيزة الهندسة المستوية في الامتحان الجهوي الموحد للسنة الثالثة إعدادي (3AC).',
      biof: 'Pilier de la géométrie plane à l\'examen régional normalisé de 3ème Année Collège.'
    },
    challengeQuestion: {
      statement: {
        ar: 'تحدي سريع: في مثلث ABC لدينا M∈[AB] و N∈[AC] و (MN)//(BC). إذا كان AM/AB = 2/5 وكان BC = 15 cm، فما هو طول القطعة MN؟',
        biof: 'Défi Rapide : Dans ABC avec M∈[AB], N∈[AC] et (MN)//(BC), si AM/AB = 2/5 et BC = 15 cm, quelle est la longueur MN ?'
      },
      formula: '\\frac{MN}{15} = \\frac{2}{5}',
      options: [
        { ar: 'MN = 6 cm', biof: 'MN = 6 cm' },
        { ar: 'MN = 7.5 cm', biof: 'MN = 7.5 cm' },
        { ar: 'MN = 5 cm', biof: 'MN = 5 cm' },
        { ar: 'MN = 10 cm', biof: 'MN = 10 cm' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'بتطبيق مبرهنة طاليس المباشرة: MN / BC = AM / AB = 2 / 5.\nإذن MN = (2 × 15) / 5 = 30 / 5 = 6 cm.',
        biof: 'D\'après le théorème de Thalès : MN / 15 = 2 / 5, d\'où MN = (2 × 15) / 5 = 6 cm.'
      }
    }
  },
  {
    id: 'cotd-2ac-identites',
    levelId: '2ac',
    domain: 'arithmetic_algebra',
    title: {
      ar: 'المتطابقات الهامة الثلاث في النشر والتعميل',
      biof: 'Les Trois Identités Remarquables (Développement & Factorisation)'
    },
    summary: {
      ar: 'تمكن المتطابقات الهامة من الانتقال السريع بين المجموع والجداء، وعلى رأسها متطابقة فرق مربعين a² - b² = (a - b)(a + b).',
      biof: 'Les identités remarquables permettent de passer rapidement d\'une somme à un produit, notamment la différence de deux carrés a² - b² = (a - b)(a + b).'
    },
    formula: 'a^2 - b^2 = (a - b)(a + b) \\quad ; \\quad (a + b)^2 = a^2 + 2ab + b^2',
    keyApplication: {
      ar: 'تعميل التعابير الجبرية وحل المعادلات التي تؤول إلى معادلة جداء منعدم.',
      biof: 'Factoriser des expressions littérales et résoudre des équations-produits.'
    },
    challengeQuestion: {
      statement: {
        ar: 'تحدي سريع: بتطبيق المتطابقة الهامة الثالثة a² - b²، ما هو التعميل الصحيح للتعبير x² - 49؟',
        biof: 'Défi Rapide : En appliquant l\'identité remarquable a² - b², quelle est la factorisation de x² - 49 ?'
      },
      formula: 'x^2 - 49 = x^2 - 7^2',
      options: [
        { ar: '(x - 7)(x + 7)', biof: '(x - 7)(x + 7)' },
        { ar: '(x - 7)²', biof: '(x - 7)²' },
        { ar: '(x + 7)²', biof: '(x + 7)²' },
        { ar: 'x(x - 49)', biof: 'x(x - 49)' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'نلاحظ أن 49 = 7²، إذن x² - 49 = x² - 7² = (x - 7)(x + 7).',
        biof: 'Comme 49 = 7², on a x² - 7² = (x - 7)(x + 7).'
      }
    }
  },
  {
    id: 'cotd-1ac-priorite',
    levelId: '1ac',
    domain: 'arithmetic_algebra',
    title: {
      ar: 'أسبقية العمليات وتوزيعية الضرب على الجمع والطرح',
      biof: 'Priorités Opératoires & Distributivité'
    },
    summary: {
      ar: 'في سلسلة عمليات بدون أقواس، تُنجز عمليتا الضرب والقسمة قبل الجمع والطرح. وتسمح خاصية التوزيع k(a+b) = ka + kb بتبسيط الحساب الذهني والحرفي.',
      biof: 'En l\'absence de parenthèses, la multiplication et la division sont prioritaires sur l\'addition et la soustraction.'
    },
    formula: 'k \\times (a + b) = k \\times a + k \\times b',
    keyApplication: {
      ar: 'القاعدة الذهبية لتفادي أخطاء الحساب في جميع المستويات الإعدادية والتأهيلية.',
      biof: 'Règle fondamentale pour éviter les erreurs de calcul algébrique au collège et au lycée.'
    },
    challengeQuestion: {
      statement: {
        ar: 'تحدي سريع: احسب مع احترام أسبقية العمليات قيمة التعبير A = 20 - 3 × 5 + 2:',
        biof: 'Défi Rapide : Calculer en respectant les priorités opératoires A = 20 - 3 × 5 + 2 :'
      },
      formula: 'A = 20 - 3 \\times 5 + 2',
      options: [
        { ar: '7', biof: '7' },
        { ar: '87', biof: '87' },
        { ar: '3', biof: '3' },
        { ar: '119', biof: '119' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'نبدأ بالضرب أولاً: 3 × 5 = 15.\nثم نحسب من اليسار إلى اليمين: A = 20 - 15 + 2 = 5 + 2 = 7.',
        biof: 'La multiplication est prioritaire : 3 × 5 = 15. Puis de gauche à droite : A = 20 - 15 + 2 = 5 + 2 = 7.'
      }
    }
  }
];

const COTD_STORAGE_KEY = 'math_inspector_cotd_completed_date_v1';

interface ConceptOfTheDayCardProps {
  levelId: LevelId;
  lang: LanguageOption;
  dualLang: boolean;
  onChallengeReward: (bonusXp: number, bonusPoints: number, domain: MathDomain, isCorrect: boolean) => void;
  onOpenGlossary?: () => void;
}

export const ConceptOfTheDayCard: React.FC<ConceptOfTheDayCardProps> = ({
  levelId,
  lang,
  dualLang,
  onChallengeReward,
  onOpenGlossary
}) => {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Compute day-of-year index for deterministic daily concept selection
  const dayOfYearIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }, []);

  // Filter Mode: defaults to matching the student's active level out of the box
  const [conceptOffset, setConceptOffset] = useState<number>(0);
  const [filterByLevel, setFilterByLevel] = useState<boolean>(true);

  const activeConcept: DailyConceptItem = useMemo(() => {
    if (filterByLevel) {
      const levelMatches = DAILY_CONCEPTS_BANK.filter(c => c.levelId === levelId);
      if (levelMatches.length > 0) {
        return levelMatches[(dayOfYearIndex + conceptOffset) % levelMatches.length];
      }
    }
    return DAILY_CONCEPTS_BANK[(dayOfYearIndex + conceptOffset) % DAILY_CONCEPTS_BANK.length];
  }, [dayOfYearIndex, conceptOffset, filterByLevel, levelId]);

  const [isChallengeOpen, setIsChallengeOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(30);
  const [completedToday, setCompletedToday] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(COTD_STORAGE_KEY) === todayIso;
    } catch {
      return false;
    }
  });

  // Countdown timer when quick challenge is open and not yet submitted
  useEffect(() => {
    if (!isChallengeOpen || isSubmitted) return;
    if (timeLeftSec <= 0) {
      setIsTimedOut(true);
      setIsSubmitted(true);
      soundFeedback.playIncorrectSound();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSec(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isChallengeOpen, isSubmitted, timeLeftSec]);

  const handleLaunchQuickChallenge = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsTimedOut(false);
    setTimeLeftSec(30);
    setIsChallengeOpen(true);
  };

  const handleCycleConcept = () => {
    setConceptOffset(prev => prev + 1);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsTimedOut(false);
    setTimeLeftSec(30);
  };

  const handleOptionSelect = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedOption(optIdx);
    setIsTimedOut(false);
    setIsSubmitted(true);
    const isCorrect = optIdx === activeConcept.challengeQuestion.correctIndex;

    if (isCorrect) {
      soundFeedback.playCorrectSound(2);
      onChallengeReward(30, 20, activeConcept.domain, true);
      setCompletedToday(true);
      try {
        localStorage.setItem(COTD_STORAGE_KEY, todayIso);
      } catch {
        // ignore
      }
    } else {
      soundFeedback.playIncorrectSound();
      onChallengeReward(5, 0, activeConcept.domain, false);
    }
  };

  const levelMeta = LEVELS.find(l => l.id === activeConcept.levelId);
  const domainMeta = DOMAINS[activeConcept.domain];

  return (
    <section
      aria-label={lang === 'ar' ? 'تحدي المفهوم اليومي' : 'Concept Mathématique du Jour'}
      className="mb-6 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-amber-950/30 border border-indigo-500/40 rounded-2xl p-5 md:p-6 shadow-xl space-y-4"
    >
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar' ? '🌟 تحدي المفهوم اليومي (Concept of the Day)' : '🌟 Concept du Jour (Défi Quotidien)'}
            </span>
          </span>

          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950 border border-slate-800 text-indigo-300">
            {levelMeta ? levelMeta.shortName[lang] : activeConcept.levelId.toUpperCase()}
          </span>

          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300">
            {domainMeta.icon} {domainMeta.name[lang]}
          </span>

          {completedToday && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'مكتمل اليوم (+30 XP)' : 'Complété aujourd\'hui (+30 XP)'}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFilterByLevel(prev => !prev);
              setSelectedOption(null);
              setIsSubmitted(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              filterByLevel
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {filterByLevel
              ? lang === 'ar'
                ? '🎯 مخصص لمستواي الحالي'
                : '🎯 Adapté à mon niveau'
              : lang === 'ar'
              ? '🔄 تخصيص حسب مستواي'
              : '🔄 Filtrer par mon niveau'}
          </button>

          <button
            type="button"
            onClick={handleCycleConcept}
            title={lang === 'ar' ? 'استعراض مفهوم يومي آخر' : 'Voir un autre concept'}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'ar' ? 'مفهوم آخر' : 'Autre concept'}</span>
          </button>

          {onOpenGlossary && (
            <button
              type="button"
              onClick={onOpenGlossary}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'المعجم الكامل' : 'Glossaire'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Concept Body + Formula + Action Button */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-8 space-y-2.5">
          <h2 className="text-lg md:text-xl font-extrabold text-white">
            {activeConcept.title[lang]}
          </h2>
          {dualLang && (
            <p className="text-xs font-semibold text-indigo-300" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
              {activeConcept.title[lang === 'ar' ? 'biof' : 'ar']}
            </p>
          )}

          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            {activeConcept.summary[lang]}
          </p>
          {dualLang && (
            <p className="text-xs text-slate-400 leading-relaxed" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
              {activeConcept.summary[lang === 'ar' ? 'biof' : 'ar']}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-amber-300/90">
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-semibold">
              {lang === 'ar' ? 'تطبيق الخاصية:' : 'Application clé :'}
            </span>
            <span className="text-slate-300">{activeConcept.keyApplication[lang]}</span>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-950/90 border border-slate-800 rounded-xl p-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              {lang === 'ar' ? 'الصيغة الرياضية المرجعية:' : 'Formule Mathématique de Référence :'}
            </span>
            <FormulaDisplay formula={activeConcept.formula} copyable className="text-sm py-2" />
          </div>

          <button
            type="button"
            onClick={() =>
              isChallengeOpen ? setIsChallengeOpen(false) : handleLaunchQuickChallenge()
            }
            className={`w-full py-2.5 px-4 rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              isChallengeOpen
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>
              {isChallengeOpen
                ? lang === 'ar'
                  ? 'إخفاء التحدي السريع ▲'
                  : 'Masquer le défi rapide ▲'
                : lang === 'ar'
                ? '⚡ جرب التحدي السريع لهذا المفهوم (+30 XP)'
                : '⚡ Tester le Défi Rapide de ce Concept (+30 XP)'}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Quick Concept Challenge Drawer */}
      {isChallengeOpen && (
        <div className="bg-slate-950 border border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-inner mt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {lang === 'ar' ? '⚡ تطبيق فوري للمفهوم اليومي' : '⚡ Application Immédiate du Concept'}
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                +30 XP / +20 pts
              </span>
            </div>

            {!isSubmitted && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                  timeLeftSec <= 10
                    ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-amber-300'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{timeLeftSec}s</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm md:text-base font-bold text-white leading-relaxed">
              <MathText text={activeConcept.challengeQuestion.statement[lang]} />
            </p>
            {dualLang && (
              <p
                className="text-xs md:text-sm text-slate-400 leading-relaxed"
                dir={lang === 'ar' ? 'ltr' : 'rtl'}
              >
                <MathText
                  text={activeConcept.challengeQuestion.statement[lang === 'ar' ? 'biof' : 'ar']}
                />
              </p>
            )}

            {activeConcept.challengeQuestion.formula && (
              <div className="pt-1">
                <FormulaDisplay formula={activeConcept.challengeQuestion.formula} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeConcept.challengeQuestion.options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              const isCorrect = idx === activeConcept.challengeQuestion.correctIndex;

              let btnStyle =
                'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/60 hover:bg-slate-900/80';
              if (isSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                } else if (isChosen) {
                  btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-900/40 border-slate-800/50 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleOptionSelect(idx)}
                  className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs md:text-sm">
                      <MathText text={opt[lang]} />
                    </span>
                  </div>
                  {isSubmitted && isCorrect && (
                    <span className="text-xs font-bold text-emerald-400">✓</span>
                  )}
                  {isSubmitted && isChosen && !isCorrect && (
                    <span className="text-xs font-bold text-rose-400">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div
              className={`p-4 rounded-xl border space-y-2 text-xs ${
                selectedOption === activeConcept.challengeQuestion.correctIndex
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-sm">
                  {selectedOption === activeConcept.challengeQuestion.correctIndex
                    ? lang === 'ar'
                      ? '🎉 إجابة صحيحة! لقد أتقنت مفهوم اليوم وحصلت على +30 XP و +20 نقطة.'
                      : '🎉 Excellente réponse ! Vous maîtrisez le concept du jour (+30 XP et +20 pts).'
                    : isTimedOut
                    ? lang === 'ar'
                      ? '⏱️ انتهى الوقت المخصص (30 ثانية)! راجع طريقة تطبيق المفهوم أو أعد المحاولة:'
                      : '⏱️ Temps écoulé (30s) ! Consultez l\'application du concept ou réessayez :'
                    : lang === 'ar'
                    ? '💡 ليست الإجابة الصحيحة، إليك خطوات تطبيق المفهوم (+5 XP للمحاولة):'
                    : '💡 Pas tout à fait, voici l\'application détaillée du concept (+5 XP) :'}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedOption !== activeConcept.challengeQuestion.correctIndex && (
                    <button
                      type="button"
                      onClick={handleLaunchQuickChallenge}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                    >
                      {lang === 'ar' ? 'إعادة المحاولة ↺' : 'Réessayer ↺'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCycleConcept}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                  >
                    {lang === 'ar' ? 'تجربة تحدي مفهوم آخر ←' : 'Tester un autre concept →'}
                  </button>
                </div>
              </div>

              <p className="text-slate-200 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-800/80">
                {activeConcept.challengeQuestion.explanation[lang]}
              </p>
              {dualLang && (
                <p
                  className="text-slate-400 whitespace-pre-line leading-relaxed"
                  dir={lang === 'ar' ? 'ltr' : 'rtl'}
                >
                  {activeConcept.challengeQuestion.explanation[lang === 'ar' ? 'biof' : 'ar']}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
