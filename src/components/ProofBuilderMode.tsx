import React, { useState, useMemo, useEffect } from 'react';
import { LevelId, LanguageOption } from '../constants/dataStructure';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import {
  GitMerge,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ProofStep {
  id: string;
  order: number;
  type: 'hypothesis' | 'property' | 'deduction' | 'conclusion';
  text: { ar: string; biof: string };
  formula?: string;
  justification: { ar: string; biof: string };
}

interface ProofProblem {
  id: string;
  title: { ar: string; biof: string };
  theme: { ar: string; biof: string };
  targetLevel: LevelId;
  matchingLevels: LevelId[];
  method: { ar: string; biof: string };
  statement: { ar: string; biof: string };
  targetFormula?: string;
  inspectorAdvice: { ar: string; biof: string };
  steps: ProofStep[];
}

const PROOF_PROBLEMS: ProofProblem[] = [
  {
    id: 'proof-2bac-tvim',
    title: {
      ar: 'مبرهنة القيم الوسيطية (TVI): وجود ووحدانية حل معادلة في مجال',
      biof: 'Théorème des Valeurs Intermédiaires : Unicité de la solution α'
    },
    theme: { ar: 'التحليل ومبرهنة القيم الوسيطية (2Bac)', biof: 'TVI & Monotonie (2Bac)' },
    targetLevel: '2bac',
    matchingLevels: ['2bac'],
    method: {
      ar: 'الاستمرارية + الرتابة القطعية + تغير الإشارة',
      biof: 'Continuité + Monotonie stricte + Changement de signe'
    },
    statement: {
      ar: 'بين أن المعادلة f(x) = 0 تقبل حلاً وحيداً α في المجال [0, 1] حيث f(x) = x³ + x - 1:',
      biof: 'Montrer que l\'équation f(x) = 0 admet une solution unique α sur [0, 1] avec f(x) = x³ + x - 1 :'
    },
    targetFormula: '(\\exists ! \\alpha \\in ]0, 1[)\\quad f(\\alpha) = 0',
    inspectorAdvice: {
      ar: 'توجيه المفتش: في الامتحان الوطني للبكالوريا، نسيان شرط «الرتابة القطعية» يسقط نصف النقطة لأنه الشرط الضامن لوحدانية الحل α.',
      biof: 'Conseil de l\'Inspecteur : Au Baccalauréat, oublier la stricte monotonie fait perdre la moitié du barème car elle seule garantit l\'unicité.'
    },
    steps: [
      {
        id: 'tvi-1',
        order: 1,
        type: 'hypothesis',
        text: {
          ar: 'الشرط الأول — الاستمرارية: الدالة f حدودية على ℝ، إذن فهي متصلة على [0, 1].',
          biof: 'Condition 1 — Continuité : f est polynômiale donc continue sur [0, 1].'
        },
        formula: 'f \\in C([0, 1])',
        justification: {
          ar: 'الاتصال يضمن عدم انقطاع المنحنى بين 0 و 1.',
          biof: 'La continuité assure l\'existence d\'au moins une valeur intermédiaire.'
        }
      },
      {
        id: 'tvi-2',
        order: 2,
        type: 'property',
        text: {
          ar: 'الشرط الثاني — الرتابة القطعية: دراسة إشارة المشتقة f\'(x) = 3x² + 1:',
          biof: 'Condition 2 — Monotonie stricte : Signe de la dérivée f\'(x) = 3x² + 1 :'
        },
        formula: '(\\forall x \\in [0, 1])\\; f\'(x) = 3x^2 + 1 > 0 \\implies f \\text{ strictement croissante}',
        justification: {
          ar: 'الرتابة القطعية تمنع تقاطع المنحنى مع محور الأفاصيل أكثر من مرة.',
          biof: 'La stricte croissance garantit l\'unicité de l\'intersection.'
        }
      },
      {
        id: 'tvi-3',
        order: 3,
        type: 'deduction',
        text: {
          ar: 'الشرط الثالث — حصر الصفر بين صورتي الطرفين:',
          biof: 'Condition 3 — Changement de signe aux bornes :'
        },
        formula: 'f(0) = -1 < 0 \\quad \\text{et} \\quad f(1) = 1 > 0 \\implies f(0) \\cdot f(1) < 0',
        justification: {
          ar: 'بما أن الجداء سالب قطعا، فإن 0 محصور بين f(0) و f(1).',
          biof: 'Le produit négatif prouve que 0 ∈ f([0, 1]).'
        }
      },
      {
        id: 'tvi-4',
        order: 4,
        type: 'conclusion',
        text: {
          ar: 'الاستنتاج النهائي حسب مبرهنة القيم الوسيطية:',
          biof: 'Conclusion par le Théorème des Valeurs Intermédiaires :'
        },
        formula: '(\\exists ! \\alpha \\in ]0, 1[)\\quad \\alpha^3 + \\alpha - 1 = 0',
        justification: {
          ar: 'استيفاء الشروط الثلاثة يثبت وجود ووحدانية الحل α في المجال المفتوح.',
          biof: 'Les 3 hypothèses réunies valident l\'existence et l\'unicité de α.'
        }
      }
    ]
  },
  {
    id: 'proof-recurrence-sum',
    title: {
      ar: 'البرهان بالترجع: مجموع الأعداد الصحيحة الطبيعية الفردية',
      biof: 'Raisonnement par Récurrence : Somme des premiers entiers impairs'
    },
    theme: { ar: 'الاستدلال بالترجع (1Bac)', biof: 'Raisonnement par Récurrence (1Bac)' },
    targetLevel: '1bac',
    matchingLevels: ['1bac'],
    method: { ar: 'الترجع (التحقق، الافتراض، والاستنتاج)', biof: 'Récurrence (Initialisation, Hérédité, Conclusion)' },
    statement: {
      ar: 'برهن بالترجع أنه لكل عدد صحيح طبيعي n غير منعدم (n ≥ 1):',
      biof: 'Démontrer par récurrence que pour tout entier naturel n non nul (n ≥ 1) :'
    },
    targetFormula: '1 + 3 + 5 + \\dots + (2n - 1) = n^2',
    inspectorAdvice: {
      ar: 'توجيه المفتش: في البرهان بالترجع، الالتزام بالخطوات الثلاث القانونية (التحقق من الرتبة الأولى، افتراض صحة الخاصية لرتبة n، ثم البرهان عليها للرتبة n+1) إلزامي في سلم التنقيط الوزاري.',
      biof: 'Conseil de l\'Inspecteur : Les trois étapes canoniques (Initialisation, Hypothèse de récurrence, Hérédité) doivent être rigoureusement séparées sur la copie.'
    },
    steps: [
      {
        id: 'rec-1',
        order: 1,
        type: 'hypothesis',
        text: {
          ar: 'التحقق من صحة الخاصية من أجل أصغر رتبة n = 1 (الرتبة البدئية):',
          biof: 'Initialisation pour le plus petit rang n = 1 :'
        },
        formula: '2(1) - 1 = 1 \\quad \\text{et} \\quad 1^2 = 1 \\implies 1 = 1',
        justification: {
          ar: 'الطرفان متطابقان عند n=1، إذن الخاصية صحيحة في رتبتها البدئية.',
          biof: 'La propriété est vraie pour le rang initial n = 1.'
        }
      },
      {
        id: 'rec-2',
        order: 2,
        type: 'property',
        text: {
          ar: 'افتراض الترجع: ليكن n ≥ 1. نفترض أن الخاصية صحيحة للرتبة n:',
          biof: 'Hypothèse de récurrence : Soit n ≥ 1 fixé. Supposons la propriété vraie au rang n :'
        },
        formula: '1 + 3 + 5 + \\dots + (2n - 1) = n^2',
        justification: {
          ar: 'نثبت الرتبة n كمعطى استدلالي معتمد في باقي الخطوات.',
          biof: 'On suppose que la formule est vérifiée jusqu\'au rang n.'
        }
      },
      {
        id: 'rec-3',
        order: 3,
        type: 'deduction',
        text: {
          ar: 'البرهان على صحة الخاصية للرتبة التالية (n + 1):',
          biof: 'Hérédité : Démontrons que la propriété est vraie au rang (n + 1) :'
        },
        formula: '[1 + 3 + \\dots + (2n - 1)] + (2(n+1) - 1) = n^2 + 2n + 1 = (n + 1)^2',
        justification: {
          ar: 'نعوض المجموع الأول بـ n² حسب فرضية الترجع، فنحصل على المتطابقة الهامة (n+1)².',
          biof: 'On injecte l\'hypothèse de récurrence et on factorise en (n + 1)².'
        }
      },
      {
        id: 'rec-4',
        order: 4,
        type: 'conclusion',
        text: {
          ar: 'الخلاصة المنهجية لمبدأ الترجع:',
          biof: 'Conclusion générale par le principe de récurrence :'
        },
        formula: '(\\forall n \\in \\mathbb{N}^*)\\quad 1 + 3 + \\dots + (2n - 1) = n^2',
        justification: {
          ar: 'تحقق الشرطين يضمن صحة الخاصية لكل الأعداد الصحيحة الطبيعية غير المنعدمة.',
          biof: 'La propriété est établie pour tout entier n supérieur ou égal à 1.'
        }
      }
    ]
  },
  {
    id: 'proof-absurd-sqrt2',
    title: {
      ar: 'البرهان بالخلف: لاعيدانية العدد الحقيقي √2 (√2 ∉ ℚ)',
      biof: 'Raisonnement par l\'Absurde : Irrationalité du nombre √2'
    },
    theme: { ar: 'الاستدلال بالخلف (Tronc Commun)', biof: 'Raisonnement par l\'Absurde (TC)' },
    targetLevel: 'tc',
    matchingLevels: ['tc'],
    method: { ar: 'افتراض نقيض النتيجة للوصول إلى تناقض رياضي', biof: 'Hypothèse contradictoire menant à une impossibilité' },
    statement: {
      ar: 'برهن بالخلف على أن العدد √2 ليس عدداً جذرياً (أي √2 ∉ ℚ):',
      biof: 'Démontrer par l\'absurde que √2 n\'est pas un nombre rationnel (√2 ∉ ℚ) :'
    },
    targetFormula: '\\sqrt{2} \\notin \\mathbb{Q}',
    inspectorAdvice: {
      ar: 'توجيه المفتش: في البرهان بالخلف، يجب تحديد الكسر غير القابل للاختزال (a ∧ b = 1) بوضوح لكونه مصدر التناقض المنطقي المزدوج.',
      biof: 'Conseil de l\'Inspecteur : Spécifier que la fraction a/b est irréductible (a et b premiers entre eux) est le verrou logique du raisonnement.'
    },
    steps: [
      {
        id: 'abs-1',
        order: 1,
        type: 'hypothesis',
        text: {
          ar: 'افتراض الخلف: نفترض جدلاً أن √2 عدد جذري، أي يوجد كسر غير قابل للاختزال:',
          biof: 'Supposons par l\'absurde que √2 est rationnel : il existe a et b entiers premiers entre eux tels que :'
        },
        formula: '\\sqrt{2} = \\frac{a}{b} \\quad \\text{avec} \\quad a \\wedge b = 1 \\; \\text{et} \\; b \\ne 0',
        justification: {
          ar: 'أي كسر في ℚ يمكن كتابته بصيغة غير قابلة للاختزال حيث القاسم المشترك الأكبر يساوي 1.',
          biof: 'Toute fraction rationnelle peut être mise sous forme irréductible.'
        }
      },
      {
        id: 'abs-2',
        order: 2,
        type: 'property',
        text: {
          ar: 'الرفع إلى المربع واستنتاج زوجية العدد a:',
          biof: 'Élévation au carré et déduction de la parité de a :'
        },
        formula: '2 = \\frac{a^2}{b^2} \\implies a^2 = 2b^2 \\implies a^2 \\; \\text{est pair} \\implies a \\; \\text{est pair}',
        justification: {
          ar: 'بما أن a² مضاعف لـ 2 فهو زوجي، وإذا كان مربع عدد زوجياً فإن العدد نفسه زوجي.',
          biof: 'a² est un multiple de 2, donc a est nécessairement un entier pair.'
        }
      },
      {
        id: 'abs-3',
        order: 3,
        type: 'deduction',
        text: {
          ar: 'وضع a = 2k واستنتاج زوجية العدد b:',
          biof: 'On pose a = 2k et on déduit la parité de b :'
        },
        formula: '(2k)^2 = 2b^2 \\implies 4k^2 = 2b^2 \\implies b^2 = 2k^2 \\implies b \\; \\text{est pair}',
        justification: {
          ar: 'بالمثل نجد أن b² مضاعف لـ 2، إذن b عدد زوجي أيضاً.',
          biof: 'De la même façon, b² = 2k² montre que b est également pair.'
        }
      },
      {
        id: 'abs-4',
        order: 4,
        type: 'conclusion',
        text: {
          ar: 'إبراز التناقض والخلاصة:',
          biof: 'Contradiction finale et conclusion :'
        },
        formula: 'a \\; \\text{pair et } b \\; \\text{pair} \\implies 2 \\mid (a \\wedge b) \\; (\\text{contradiction avec } a \\wedge b = 1) \\implies \\sqrt{2} \\notin \\mathbb{Q}',
        justification: {
          ar: 'كون a و b زوجيين يناقض أولية a و b، إذن الفرضية خاطئة و √2 غير جذري.',
          biof: 'Contredit l\'irréductibilité de la fraction. Donc √2 est irrationnel.'
        }
      }
    ]
  },
  {
    id: 'proof-pythagoras-thales',
    title: {
      ar: 'مبرهنة فيثاغورس المباشرة في المثلث القائم الزاوية',
      biof: 'Théorème de Pythagore dans le Triangle Rectangle'
    },
    theme: { ar: 'الهندسة الإقليدية (Collège)', biof: 'Géométrie Euclidienne (Collège)' },
    targetLevel: '3ac',
    matchingLevels: ['1ac', '2ac', '3ac'],
    method: { ar: 'الاستدلال الاستنتاجي المباشر من الشروط إلى النتيجة', biof: 'Raisonnement déductif direct' },
    statement: {
      ar: 'في مثلث ABC قائم الزاوية في A، بين أن مربع الوتر يساوي مجموع مربعي الضلعين المحاذيين:',
      biof: 'Dans un triangle ABC rectangle en A, démontrer que le carré de l\'hypoténuse égale la somme des carrés des côtés :'
    },
    targetFormula: 'BC^2 = AB^2 + AC^2',
    inspectorAdvice: {
      ar: 'توجيه المفتش: في السلك الإعدادي، التأكد من تحديد رأس الزاوية القائمة أولاً يحميك من الخلط بين الوتر وباقي الأضلاع.',
      biof: 'Conseil de l\'Inspecteur : Identifier d\'abord le sommet de l\'angle droit pour ne jamais confondre l\'hypoténuse et les côtés de l\'angle.'
    },
    steps: [
      {
        id: 'pyth-1',
        order: 1,
        type: 'hypothesis',
        text: {
          ar: 'المعطيات الهندسية والزاوية القائمة:',
          biof: 'Hypothèses géométriques et angle droit :'
        },
        formula: '\\text{Soit } ABC \\text{ un triangle rectangle en } A \\implies \\widehat{BAC} = 90^\\circ',
        justification: {
          ar: 'تحديد رأس الزاوية القائمة A، وبالتالي الوتر المقابل لها هو الضلع [BC].',
          biof: 'Le sommet droit est A, le côté opposé [BC] est l\'hypoténuse.'
        }
      },
      {
        id: 'pyth-2',
        order: 2,
        type: 'property',
        text: {
          ar: 'استحضار مبرهنة فيثاغورس المباشرة:',
          biof: 'Application du Théorème de Pythagore Direct :'
        },
        formula: '(\\forall \\text{ triangle rectangle en } A)\\quad BC^2 = AB^2 + AC^2',
        justification: {
          ar: 'الخاصية المرجعية التي تربط أطوال أضلاع المثلث القائم الزاوية.',
          biof: 'Propriété fondamentale liant les trois longueurs.'
        }
      },
      {
        id: 'pyth-3',
        order: 3,
        type: 'conclusion',
        text: {
          ar: 'الاستنتاج الحسابي وتطبيق الأطوال:',
          biof: 'Conclusion métrique et calcul de longueur :'
        },
        formula: 'BC = \\sqrt{AB^2 + AC^2}',
        justification: {
          ar: 'بما أن الأطوال موجبة قطعاً، نطبق الجذر المربع لاستخراج طول الوتر بدقة.',
          biof: 'Les longueurs étant strictement positives, la racine carrée donne la mesure exacte.'
        }
      }
    ]
  }
];

function findMatchingProofId(levelId?: LevelId): string {
  if (!levelId) return PROOF_PROBLEMS[0].id;
  const match = PROOF_PROBLEMS.find(p => p.matchingLevels.includes(levelId));
  return match ? match.id : PROOF_PROBLEMS[0].id;
}

interface ProofBuilderModeProps {
  levelId?: LevelId;
  lang: LanguageOption;
  dualLang: boolean;
  onProofCompleted?: (earnedXp: number) => void;
}

export const ProofBuilderMode: React.FC<ProofBuilderModeProps> = ({
  levelId = '2bac',
  lang,
  dualLang,
  onProofCompleted
}) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(() => findMatchingProofId(levelId));
  const [assembledOrder, setAssembledOrder] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<'pending' | 'success' | 'error'>('pending');
  const [stepPlacementFeedback, setStepPlacementFeedback] = useState<boolean[]>([]);

  useEffect(() => {
    const matchedId = findMatchingProofId(levelId);
    setSelectedProblemId(matchedId);
    setAssembledOrder([]);
    setValidationResult('pending');
    setStepPlacementFeedback([]);
  }, [levelId]);

  const activeProblem = useMemo(
    () => PROOF_PROBLEMS.find(p => p.id === selectedProblemId) || PROOF_PROBLEMS[0],
    [selectedProblemId]
  );

  // Present steps deterministically in a non-trivial order when empty so student actually assembles
  const availableSteps = useMemo(() => {
    const remaining = activeProblem.steps.filter(s => !assembledOrder.includes(s.id));
    return [...remaining].sort((a, b) => {
      // Deterministic scramble: put middle steps before first step so it's never pre-solved
      const rank = (o: number) => (o % 2 === 0 ? o - 10 : o);
      return rank(a.order) - rank(b.order);
    });
  }, [activeProblem, assembledOrder]);

  const handleSelectProblem = (id: string) => {
    soundFeedback.playClickSound();
    setSelectedProblemId(id);
    setAssembledOrder([]);
    setValidationResult('pending');
    setStepPlacementFeedback([]);
  };

  const handleAddStep = (stepId: string) => {
    if (validationResult === 'success') return;
    soundFeedback.playClickSound();
    setAssembledOrder(prev => [...prev, stepId]);
    setValidationResult('pending');
    setStepPlacementFeedback([]);
  };

  const handleRemoveStep = (stepId: string) => {
    if (validationResult === 'success') return;
    soundFeedback.playClickSound();
    setAssembledOrder(prev => prev.filter(id => id !== stepId));
    setValidationResult('pending');
    setStepPlacementFeedback([]);
  };

  const handleReset = () => {
    soundFeedback.playClickSound();
    setAssembledOrder([]);
    setValidationResult('pending');
    setStepPlacementFeedback([]);
  };

  const handleValidateProof = () => {
    const slotChecks = assembledOrder.map((stepId, index) => {
      const step = activeProblem.steps.find(s => s.id === stepId);
      return Boolean(step && step.order === index + 1);
    });
    const isCorrect =
      assembledOrder.length === activeProblem.steps.length &&
      slotChecks.every(Boolean);

    setStepPlacementFeedback(slotChecks);

    if (isCorrect) {
      setValidationResult('success');
      soundFeedback.playTaskCompleteSound();
      onProofCompleted?.(60);
    } else {
      setValidationResult('error');
      soundFeedback.playIncorrectSound();
    }
  };

  const firstMismatchIndex = stepPlacementFeedback.findIndex(ok => !ok);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
            <GitMerge className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مختبر ومركب الاستدلال والبرهان الرياضي (25% من الامتحان)' : 'Laboratoire de Raisonnement & Démonstrations'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {lang === 'ar' ? 'أداة تركيب البراهين الرياضية (Proof Builder)' : 'Atelier Interactif d\'Assemblage de Démonstrations'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {lang === 'ar'
              ? 'رتّب خطوات البرهان الرياضي بالترتيب المنطقي السليم (الفرضيات → المبرهنة → الاستنتاج) لبناء حجة استدلالية قطعية خالية من الثغرات وفق معايير التفتيش التربوي.'
              : 'Assemblez les étapes de la démonstration dans l\'ordre logique rigoureux (Hypothèses → Propriétés → Conclusion).'}
          </p>
        </div>

        {/* Problem Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {PROOF_PROBLEMS.map(prob => (
            <button
              key={prob.id}
              type="button"
              onClick={() => handleSelectProblem(prob.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedProblemId === prob.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {prob.theme[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Active Problem Statement Banner */}
      <div className="bg-slate-950 border border-indigo-900/50 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 block mb-0.5">
              {activeProblem.method[lang]}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {activeProblem.title[lang]}
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-xs font-mono font-bold text-indigo-300">
            {activeProblem.targetLevel.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          <MathText text={activeProblem.statement[lang]} />
        </p>
        {dualLang && (
          <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
            <MathText text={activeProblem.statement[lang === 'ar' ? 'biof' : 'ar']} />
          </p>
        )}

        {activeProblem.targetFormula && (
          <FormulaDisplay formula={activeProblem.targetFormula} copyable className="py-2.5 text-base" />
        )}

        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-200">
          <p>{activeProblem.inspectorAdvice[lang]}</p>
        </div>
      </div>

      {/* Assembly Area & Step Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Assembly Track (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono">1</span>
              <span>{lang === 'ar' ? 'مسار البرهان المركب (اضغط لحذف الخطوة):' : 'Chaîne de Démonstration (Cliquez pour retirer) :'}</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {assembledOrder.length} / {activeProblem.steps.length} {lang === 'ar' ? 'خطوات' : 'étapes'}
            </span>
          </div>

          {assembledOrder.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-2 bg-slate-950/40">
              <GitMerge className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'المسار فارغ حالياً. اختر الخطوة المنطقية الأولى من قائمة اللبنات المتاحة للبدء.'
                  : 'La chaîne est vide. Sélectionnez la première étape logique pour débuter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assembledOrder.map((stepId, idx) => {
                const step = activeProblem.steps.find(s => s.id === stepId);
                if (!step) return null;

                const hasFeedback = stepPlacementFeedback.length === assembledOrder.length;
                const isSlotCorrect = hasFeedback ? stepPlacementFeedback[idx] : null;
                const cardBorder =
                  isSlotCorrect === true
                    ? 'border-emerald-500/70'
                    : isSlotCorrect === false
                    ? 'border-rose-500/80 bg-rose-950/20'
                    : 'border-indigo-500/40 hover:border-rose-500/60';

                return (
                  <div
                    key={step.id}
                    onClick={() => handleRemoveStep(step.id)}
                    className={`p-4 rounded-xl bg-slate-950 border transition-all cursor-pointer space-y-2 group shadow-md ${cardBorder}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg text-white font-mono text-xs font-bold flex items-center justify-center ${
                            isSlotCorrect === true
                              ? 'bg-emerald-600'
                              : isSlotCorrect === false
                              ? 'bg-rose-600'
                              : 'bg-indigo-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-indigo-300">
                          {step.type === 'hypothesis'
                            ? (lang === 'ar' ? 'المعطيات والفرضيات البدئية' : 'Hypothèse Initiale')
                            : step.type === 'property'
                            ? (lang === 'ar' ? 'استحضار المبرهنة أو الخاصية' : 'Propriété / Théorème')
                            : step.type === 'deduction'
                            ? (lang === 'ar' ? 'الاستلزام والحساب الجبري' : 'Déduction Algébrique')
                            : (lang === 'ar' ? 'الاستنتاج والخلاصة النهائية' : 'Conclusion Finale')}
                        </span>
                      </div>

                      {isSlotCorrect === false ? (
                        <span className="text-[11px] font-bold text-rose-400">
                          {lang === 'ar' ? '✗ موضع غير متسلسل' : '✗ Position incorrecte'}
                        </span>
                      ) : validationResult !== 'success' ? (
                        <span className="text-[10px] text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {lang === 'ar' ? '✕ انقر للحذف' : '✕ Retirer'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-400">✓</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-200">
                      <MathText text={step.text[lang]} />
                    </p>

                    {step.formula && (
                      <div className="py-0.5">
                        <FormulaDisplay formula={step.formula} inline={false} className="py-2 text-sm" />
                      </div>
                    )}

                    {validationResult === 'success' && (
                      <p className="text-[11px] text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                        💡 {step.justification[lang]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Validation Feedback & Action Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إعادة ترتيب' : 'Réinitialiser'}</span>
              </button>

              <button
                type="button"
                disabled={assembledOrder.length !== activeProblem.steps.length}
                onClick={handleValidateProof}
                className="px-5 py-2 rounded-xl text-xs md:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'ar' ? 'فحص وتصحيح البرهان ✓' : 'Valider la Démonstration ✓'}</span>
              </button>
            </div>

            {validationResult === 'success' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-bold animate-fadeIn">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? '✓ برهان رياضي متقن وخالٍ من العيوب المنطقية (+60 XP)' : '✓ Démonstration rigoureuse et validée (+60 XP)'}</span>
              </div>
            )}

            {validationResult === 'error' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-300 text-xs font-bold animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {firstMismatchIndex >= 0
                    ? (lang === 'ar'
                        ? `⚠️ خلل استدلالي في الخطوة رقم ${firstMismatchIndex + 1}. انقر عليها لتعديل الترتيب.`
                        : `⚠️ Rupture logique dès l'étape n°${firstMismatchIndex + 1}. Cliquez pour réorganiser.`)
                    : (lang === 'ar'
                        ? '⚠️ الترتيب المنطقي غير سليم. راجع تسلسل الفرضيات والاستنتاج.'
                        : '⚠️ Ordre logique incorrect. Révisez l\'enchaînement.')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step Pool (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-mono">2</span>
              <span>{lang === 'ar' ? 'لبنات الاستدلال المتاحة (انقر للإضافة):' : 'Blocs Disponibles :'}</span>
            </h4>
            <span className="text-xs text-slate-400">
              {availableSteps.length} {lang === 'ar' ? 'متبقية' : 'restants'}
            </span>
          </div>

          {availableSteps.length === 0 ? (
            <div className="text-center py-6 text-xs text-emerald-400 font-bold">
              {lang === 'ar' ? 'تم وضع جميع اللبنات في مسار البرهان!' : 'Tous les blocs ont été placés !'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {availableSteps.map(step => (
                <div
                  key={step.id}
                  onClick={() => handleAddStep(step.id)}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-400 transition-all cursor-pointer space-y-1.5 shadow-sm group"
                >
                  <div className="flex items-center justify-between text-xs text-indigo-300">
                    <span className="font-bold">
                      + {lang === 'ar' ? 'أضف هذا الاستنتاج' : 'Ajouter cette étape'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {step.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    <MathText text={step.text[lang]} />
                  </p>

                  {step.formula && (
                    <div className="py-0.5">
                      <FormulaDisplay formula={step.formula} inline={false} className="py-1 text-xs" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
