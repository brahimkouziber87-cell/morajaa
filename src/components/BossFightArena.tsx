import React, { useState, useEffect, useMemo } from 'react';
import { LanguageOption, LevelId } from '../constants/dataStructure';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import { Swords, Shield, Trophy, Skull } from 'lucide-react';

interface BossPhase {
  question: { ar: string; biof: string };
  formula?: string;
  options: { ar: string; biof: string }[];
  correctIndex: number;
  damageToBoss: number;
  explanation: { ar: string; biof: string };
}

interface BossProfile {
  id: string;
  recommendedLevels: LevelId[];
  name: { ar: string; biof: string };
  title: { ar: string; biof: string };
  icon: string;
  maxHp: number;
  domainName: { ar: string; biof: string };
  phases: BossPhase[];
}

const BOSSES: BossProfile[] = [
  {
    id: 'boss-college-equations',
    recommendedLevels: ['1ac', '2ac', '3ac'],
    name: { ar: 'حارس المعادلات والجبر الإعدادي', biof: 'Le Gardien des Équations & Identités' },
    title: { ar: 'زعيم السلك الإعدادي (1AC - 3AC)', biof: 'Boss du Cycle Collégial (1AC - 3AC)' },
    icon: '🛡️',
    maxHp: 150,
    domainName: { ar: 'الحساب العددي والجبر الإعدادي', biof: 'Calcul Algébrique & Équations' },
    phases: [
      {
        question: {
          ar: 'المرحلة 1: اختراق درع المعادلات من الدرجة الأولى بمجهول واحد:',
          biof: 'Phase 1 : Résoudre l\'équation du premier degré suivante :'
        },
        formula: '3x - 7 = x + 5',
        options: [
          { ar: 'x = 6', biof: 'x = 6' },
          { ar: 'x = -1', biof: 'x = -1' },
          { ar: 'x = 1', biof: 'x = 1' },
          { ar: 'x = 3', biof: 'x = 3' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'ننقل المجاهيل إلى اليسار والمعاليم إلى اليمين مع تغيير الإشارة: 3x - x = 5 + 7 ⇒ 2x = 12 ⇒ x = 6.',
          biof: 'On transpose : 3x - x = 5 + 7 ⇒ 2x = 12 ⇒ x = 6.'
        }
      },
      {
        question: {
          ar: 'المرحلة 2: تفكيك المتطابقة الهامة بدون السقوط في فخ الجداء المزدوج:',
          biof: 'Phase 2 : Développer correctement l\'identité remarquable :'
        },
        formula: 'A = (2x - 3)^2',
        options: [
          { ar: '4x² - 12x + 9', biof: '4x² - 12x + 9' },
          { ar: '4x² - 9', biof: '4x² - 9' },
          { ar: '2x² - 6x + 9', biof: '2x² - 6x + 9' },
          { ar: '4x² - 6x + 9', biof: '4x² - 6x + 9' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: '(a - b)² = a² - 2ab + b²، إذن (2x)² - 2(2x)(3) + 3² = 4x² - 12x + 9.',
          biof: '(a - b)² = a² - 2ab + b² = (2x)² - 2(2x)(3) + 3² = 4x² - 12x + 9.'
        }
      },
      {
        question: {
          ar: 'المرحلة 3: تبسيط الجذور المربعة في الثالثة إعدادي:',
          biof: 'Phase 3 : Simplifier l\'expression avec radicaux :'
        },
        formula: 'B = \\sqrt{50} - \\sqrt{18}',
        options: [
          { ar: '2\\sqrt{2}', biof: '2\\sqrt{2}' },
          { ar: '\\sqrt{32}', biof: '\\sqrt{32}' },
          { ar: '4\\sqrt{2}', biof: '4\\sqrt{2}' },
          { ar: '8\\sqrt{2}', biof: '8\\sqrt{2}' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: '√50 = 5√2 و √18 = 3√2، إذن B = 5√2 - 3√2 = 2√2.',
          biof: '√50 = 5√2 et √18 = 3√2, donc B = 5√2 - 3√2 = 2√2.'
        }
      },
      {
        question: {
          ar: 'الضربة الاحتياطية (المرحلة 4): تعميل تعبير جبري باستعمال فرق مربعين:',
          biof: 'Phase 4 (Décisive) : Factoriser la différence de deux carrés :'
        },
        formula: 'E = 9x^2 - 25',
        options: [
          { ar: '(3x - 5)(3x + 5)', biof: '(3x - 5)(3x + 5)' },
          { ar: '(3x - 5)^2', biof: '(3x - 5)^2' },
          { ar: '(9x - 5)(9x + 5)', biof: '(9x - 5)(9x + 5)' },
          { ar: '3(x - 5)(x + 5)', biof: '3(x - 5)(x + 5)' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'نستعمل المتطابقة a² - b² = (a - b)(a + b) مع a = 3x و b = 5.',
          biof: 'On applique a² - b² = (a - b)(a + b) avec a = 3x et b = 5.'
        }
      }
    ]
  },
  {
    id: 'boss-college-geometry',
    recommendedLevels: ['1ac', '2ac', '3ac'],
    name: { ar: 'عملاق الهندسة والمبرهنات الإعدادية', biof: 'Le Titan de Pythagore & Thalès' },
    title: { ar: 'حارس المثلث القائم والتوازي (Collège)', biof: 'Gardien du Triangle & Proportionnalité' },
    icon: '📐',
    maxHp: 150,
    domainName: { ar: 'الهندسة المستوية والحساب المثلثي', biof: 'Géométrie Plane & Trigonométrie' },
    phases: [
      {
        question: {
          ar: 'المرحلة 1: في مثلث ABC قائم الزاوية في A حيث AB = 6 و AC = 8، ما طول الوتر BC؟',
          biof: 'Phase 1 : Dans un triangle ABC rectangle en A avec AB = 6 et AC = 8, calculer BC :'
        },
        formula: 'BC^2 = AB^2 + AC^2',
        options: [
          { ar: '10', biof: '10' },
          { ar: '14', biof: '14' },
          { ar: '48', biof: '48' },
          { ar: '\\sqrt{28}', biof: '\\sqrt{28}' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'BC² = 6² + 8² = 36 + 64 = 100 ⇒ BC = √100 = 10.',
          biof: 'BC² = 36 + 64 = 100 ⇒ BC = √100 = 10.'
        }
      },
      {
        question: {
          ar: 'المرحلة 2: تطبيق مبرهنة طاليس المباشرة مع (MN) // (BC):',
          biof: 'Phase 2 : Configuration de Thalès avec (MN) // (BC) :'
        },
        formula: '\\frac{AM}{AB} = \\frac{2}{5} \\quad \\text{et} \\quad AC = 15 \\implies AN = \\; ?',
        options: [
          { ar: '6', biof: '6' },
          { ar: '7.5', biof: '7.5' },
          { ar: '5', biof: '5' },
          { ar: '3', biof: '3' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'حسب طاليس المباشرة: AN/AC = AM/AB = 2/5، إذن AN = (2/5) × 15 = 6.',
          biof: 'Par Thalès : AN = (AM/AB) × AC = (2/5) × 15 = 6.'
        }
      },
      {
        question: {
          ar: 'المرحلة 3: العلاقة الأساسية للحساب المثلثي لزاوية حادة α:',
          biof: 'Phase 3 : Relation fondamentale trigonométrique pour un angle aigu α :'
        },
        formula: '\\cos(\\alpha) = \\frac{3}{5} \\implies \\sin(\\alpha) = \\; ?',
        options: [
          { ar: '4/5', biof: '4/5' },
          { ar: '2/5', biof: '2/5' },
          { ar: '16/25', biof: '16/25' },
          { ar: '3/4', biof: '3/4' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'sin²(α) = 1 - cos²(α) = 1 - 9/25 = 16/25. وبما أن α زاوية حادة فإن sin(α) > 0، إذن 4/5.',
          biof: 'sin²(α) = 1 - 9/25 = 16/25, comme sin(α) > 0 on obtient 4/5.'
        }
      },
      {
        question: {
          ar: 'الضربة الاحتياطية (المرحلة 4): مجموع قياسات زوايا أي مثلث في الهندسة الإقليدية:',
          biof: 'Phase 4 (Décisive) : Somme des angles d\'un triangle si A = 45° et B = 65° :'
        },
        formula: '\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ \\implies \\widehat{C} = \\; ?',
        options: [
          { ar: '70°', biof: '70°' },
          { ar: '80°', biof: '80°' },
          { ar: '110°', biof: '110°' },
          { ar: '60°', biof: '60°' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'C = 180° - (45° + 65°) = 180° - 110° = 70°.',
          biof: 'C = 180° - (45° + 65°) = 70°.'
        }
      }
    ]
  },
  {
    id: 'boss-tc-arithmetic-polynomials',
    recommendedLevels: ['tc'],
    name: { ar: 'حارس المجموعات والحسابيات والحدوديات', biof: 'Le Gardien de l\'Arithmétique & des Polynômes' },
    title: { ar: 'زعيم الجذع المشترك العلمي والأدبي (TC)', biof: 'Boss du Tronc Commun (TCS & TCL)' },
    icon: '🏛️',
    maxHp: 150,
    domainName: { ar: 'الحسابيات والحدوديات والهندسة المستوية', biof: 'Arithmétique, Polynômes & Vecteurs' },
    phases: [
      {
        question: {
          ar: 'المرحلة 1: زوجية التعبير n(n + 1) لكل عدد صحيح طبيعي n ∈ ℕ:',
          biof: 'Phase 1 : Parité du produit de deux entiers consécutifs n(n + 1) dans ℕ :'
        },
        formula: 'A = n(n + 1) \\quad (n \\in \\mathbb{N})',
        options: [
          { ar: 'عدد زوجي دائماً (مضاعف لـ 2)', biof: 'Toujours un nombre pair (multiple de 2)' },
          { ar: 'عدد فردي دائماً', biof: 'Toujours un nombre impair' },
          { ar: 'عدد أولي دائماً', biof: 'Toujours un nombre premier' },
          { ar: 'يعتمد على زوجية n', biof: 'Cela dépend de la parité de n' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'جداء عددين صحيحين طبيعيين متتابعين n و n+1 يكون دائماً زوجياً لأن أحدهما بالضرورة زوجي.',
          biof: 'Le produit de deux entiers consécutifs est toujours pair car l\'un des deux est nécessairement multiple de 2.'
        }
      },
      {
        question: {
          ar: 'المرحلة 2: استخراج جذري الحدودية من الدرجة الثانية وتعميلها:',
          biof: 'Phase 2 : Déterminer l\'ensemble des solutions de l\'équation du second degré :'
        },
        formula: 'x^2 - 5x + 6 = 0',
        options: [
          { ar: 'S = {2 ; 3}', biof: 'S = {2 ; 3}' },
          { ar: 'S = {-2 ; -3}', biof: 'S = {-2 ; -3}' },
          { ar: 'S = {1 ; 6}', biof: 'S = {1 ; 6}' },
          { ar: 'S = ∅', biof: 'S = ∅' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'المميز Δ = (-5)² - 4(1)(6) = 25 - 24 = 1 > 0. الحلان هما x₁ = (5-1)/2 = 2 و x₂ = (5+1)/2 = 3.',
          biof: 'Δ = 25 - 24 = 1. Les racines sont x₁ = (5-1)/2 = 2 et x₂ = (5+1)/2 = 3.'
        }
      },
      {
        question: {
          ar: 'المرحلة 3: شرط استقامية متجهتين u⃗(2, -3) و v⃗(4, m) في المستوى المنسوب لمعلم:',
          biof: 'Phase 3 : Condition de colinéarité des vecteurs u⃗(2, -3) et v⃗(4, m) :'
        },
        formula: '\\det(\\vec{u}, \\vec{v}) = 2m - (-3)(4) = 0 \\implies m = \\; ?',
        options: [
          { ar: 'm = -6', biof: 'm = -6' },
          { ar: 'm = 6', biof: 'm = 6' },
          { ar: 'm = -1.5', biof: 'm = -1.5' },
          { ar: 'm = 12', biof: 'm = 12' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'تكون المتجهتان مستقيميتين إذا انعدم المحدد: 2m + 12 = 0 ⟺ 2m = -12 ⟺ m = -6.',
          biof: 'det(u⃗, v⃗) = 2m - (-12) = 2m + 12 = 0 ⟺ m = -6.'
        }
      },
      {
        question: {
          ar: 'الضربة الاحتياطية (المرحلة 4): القيمة المضبوطة لـ cos(π/3) + sin(π/6):',
          biof: 'Phase 4 (Décisive) : Calculer la valeur exacte de cos(π/3) + sin(π/6) :'
        },
        formula: '\\cos\\left(\\frac{\\pi}{3}\\right) + \\sin\\left(\\frac{\\pi}{6}\\right)',
        options: [
          { ar: '1', biof: '1' },
          { ar: '√3', biof: '√3' },
          { ar: '1/2', biof: '1/2' },
          { ar: '0', biof: '0' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'نعلم أن cos(π/3) = 1/2 و sin(π/6) = 1/2، إذن مجموعهما يساوي 1/2 + 1/2 = 1.',
          biof: 'Comme cos(π/3) = 1/2 et sin(π/6) = 1/2, la somme vaut exactement 1.'
        }
      }
    ]
  },
  {
    id: 'boss-1bac-regional-sequences',
    recommendedLevels: ['1bac'],
    name: { ar: 'سيد المتتاليات والتعداد والامتحان الجهوي', biof: 'Le Maître des Suites, Dénombrement & Régional' },
    title: { ar: 'زعيم الأولى باكالوريا (1Bac SM/SE/Eco/Lit)', biof: 'Boss de 1ère Année Baccalauréat (1Bac)' },
    icon: '👑',
    maxHp: 150,
    domainName: { ar: 'المتتاليات العددية والتعداد والاشتقاق', biof: 'Suites Numériques, Dénombrement & Dérivation' },
    phases: [
      {
        question: {
          ar: 'المرحلة 1: متتالية حسابية (u_n) حدها الأول u₀ = 4 وأساسها r = 3. ما قيمة u₁₀؟',
          biof: 'Phase 1 : Suite arithmétique (u_n) de premier terme u₀ = 4 et raison r = 3. Calculer u₁₀ :'
        },
        formula: 'u_n = u_0 + n \\cdot r \\implies u_{10} = \\; ?',
        options: [
          { ar: '34', biof: '34' },
          { ar: '30', biof: '30' },
          { ar: '37', biof: '37' },
          { ar: '17', biof: '17' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'بالتعويض في صيغة الحد العام لمتتالية حسابية: u₁₀ = u₀ + 10r = 4 + 10 × 3 = 34.',
          biof: 'u₁₀ = u₀ + 10 × r = 4 + 30 = 34.'
        }
      },
      {
        question: {
          ar: 'المرحلة 2: حساب مجموع 10 حدود متتابعة لمتتالية حسابية حيث u₀ = 2 و u₉ = 20:',
          biof: 'Phase 2 : Calculer la somme S = u₀ + u₁ + ... + u₉ sachant que u₀ = 2 et u₉ = 20 :'
        },
        formula: 'S = 10 \\times \\frac{u_0 + u_9}{2}',
        options: [
          { ar: '110', biof: '110' },
          { ar: '220', biof: '220' },
          { ar: '99', biof: '99' },
          { ar: '100', biof: '100' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'عدد الحدود من 0 إلى 9 هو 9 - 0 + 1 = 10 حدود. إذن S = 10 × (2 + 20) / 2 = 10 × 11 = 110.',
          biof: 'Il y a 10 termes. Ainsi S = 10 × (2 + 20)/2 = 110.'
        }
      },
      {
        question: {
          ar: 'المرحلة 3: عدد السحبات الآنية الممكنة لـ 2 كرات من كيس يضم 5 كرات (C₅²):',
          biof: 'Phase 3 : Nombre de tirages simultanés de 2 boules parmi 5 (C₅²) :'
        },
        formula: 'C_5^2 = \\frac{5 \\times 4}{2 \\times 1}',
        options: [
          { ar: '10', biof: '10' },
          { ar: '20', biof: '20' },
          { ar: '25', biof: '25' },
          { ar: '7', biof: '7' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'C₅² = (5 × 4) / 2 = 20 / 2 = 10.',
          biof: 'C₅² = (5 × 4) / 2 = 10.'
        }
      },
      {
        question: {
          ar: 'الضربة الاحتياطية (المرحلة 4): مشتقة الدالة الحدودية f(x) = x³ - 6x² + 5 عند x = 4:',
          biof: 'Phase 4 (Décisive) : Calculer f\'(4) pour f(x) = x³ - 6x² + 5 :'
        },
        formula: 'f\'(x) = 3x^2 - 12x \\implies f\'(4) = \\; ?',
        options: [
          { ar: '0', biof: '0' },
          { ar: '12', biof: '12' },
          { ar: '-16', biof: '-16' },
          { ar: '24', biof: '24' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'f\'(4) = 3(4)² - 12(4) = 3(16) - 48 = 48 - 48 = 0 (تقبل مطرافاً محلياً عند x = 4).',
          biof: 'f\'(4) = 3(16) - 48 = 0 (tangente horizontale en x = 4).'
        }
      }
    ]
  },
  {
    id: 'boss-limits',
    recommendedLevels: ['2bac'],
    name: { ar: 'غول الأشكال غير المحددة والنهايات', biof: 'Le Golem des Formes Indéterminées' },
    title: { ar: 'حارس النهايات التورطية في ℝ', biof: 'Gardien des Limites Indéterminées' },
    icon: '👹',
    maxHp: 150,
    domainName: { ar: 'التحليل ودراسة الدوال', biof: 'Analyse & Étude de Fonctions' },
    phases: [
      {
        question: {
          ar: 'المرحلة 1: فك الشكل غير المحدد (0/0) عند الصفر لهزيمة الدرع الأول:',
          biof: 'Phase 1 : Lever la forme indéterminée (0/0) en 0 pour briser le premier bouclier :'
        },
        formula: '\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}',
        options: [
          { ar: '3', biof: '3' },
          { ar: '1', biof: '1' },
          { ar: '0', biof: '0' },
          { ar: '1/3', biof: '1/3' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'نكتب: sin(3x)/x = 3 × [sin(3x)/(3x)]. بما أن lim_{X->0} sin(X)/X = 1، فالنهاية تساوي 3.',
          biof: 'On a sin(3x)/x = 3 × (sin(3x)/3x). Avec lim_{X->0} sin(X)/X = 1, la limite vaut 3.'
        }
      },
      {
        question: {
          ar: 'المرحلة 2: اختراق الشكل غير المحدد (+∞ - ∞) باستعمال المرافق والتعميل:',
          biof: 'Phase 2 : Traverser la forme indéterminée (+∞ - ∞) par factorisation/conjugué :'
        },
        formula: '\\lim_{x \\to +\\infty} (\\sqrt{x^2 + 4x} - x)',
        options: [
          { ar: '2', biof: '2' },
          { ar: '4', biof: '4' },
          { ar: '+∞', biof: '+∞' },
          { ar: '0', biof: '0' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'نضرب في المرافق: [(x² + 4x) - x²] / [√(x² + 4x) + x] = 4x / [x(√(1 + 4/x) + 1)] = 4 / 2 = 2.',
          biof: 'Multiplication par l\'expression conjuguée : 4x / (√(x²+4x) + x) -> 4 / 2 = 2.'
        }
      },
      {
        question: {
          ar: 'المرحلة 3: التزايد المقارن بين الدالة الأسية والحدوديات بجوار +∞:',
          biof: 'Phase 3 : Croissances comparées exponentielle / polynôme :'
        },
        formula: '\\lim_{x \\to +\\infty} \\frac{e^x}{x^3}',
        options: [
          { ar: '+∞', biof: '+∞' },
          { ar: '0', biof: '0' },
          { ar: '1', biof: '1' },
          { ar: '3', biof: '3' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'حسب مبرهنة التزايد المقارن، الدالة الأسية تقوى على أي حدودية عند +∞، إذن النهاية هي +∞.',
          biof: 'Par croissances comparées, l\'exponentielle l\'emporte sur toute puissance de x : +∞.'
        }
      },
      {
        question: {
          ar: 'الضربة الاحتياطية (المرحلة 4): نهاية اللوغاريتم النبيري بجوار 0⁺:',
          biof: 'Phase 4 (Décisive) : Croissance comparée logarithmique en 0⁺ :'
        },
        formula: '\\lim_{x \\to 0^+} x \\ln(x)',
        options: [
          { ar: '0', biof: '0' },
          { ar: '-∞', biof: '-∞' },
          { ar: '1', biof: '1' },
          { ar: '+∞', biof: '+∞' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'نهاية اعتيادية مرجعية في البكالوريا: lim_{x -> 0⁺} x ln(x) = 0.',
          biof: 'Limite usuelle de référence au Bac : lim_{x -> 0⁺} x ln(x) = 0.'
        }
      }
    ]
  },
  {
    id: 'boss-geometry',
    recommendedLevels: ['tc', '1bac', '2bac'],
    name: { ar: 'تنين الهندسة الفضائية وحساب المتجهات', biof: 'Le Dragon de la Géométrie & Vecteurs' },
    title: { ar: 'حارس الفلكة ومسافة النقطة عن المستوى', biof: 'Gardien de la Sphère & des Plans' },
    icon: '🐉',
    maxHp: 150,
    domainName: { ar: 'الهندسة والجداء السلمي', biof: 'Géométrie & Produit Scalaire' },
    phases: [
      {
        question: {
          ar: 'المرحلة 1: تحديد متجهة منظمية على المستوى (P):',
          biof: 'Phase 1 : Déterminer un vecteur normal au plan (P) :'
        },
        formula: '(P) : \\quad 2x - 3y + z - 5 = 0',
        options: [
          { ar: 'n⃗(2, -3, 1)', biof: 'n⃗(2, -3, 1)' },
          { ar: 'n⃗(2, 3, -1)', biof: 'n⃗(2, 3, -1)' },
          { ar: 'n⃗(-2, 3, 5)', biof: 'n⃗(-2, 3, 5)' },
          { ar: 'n⃗(1, -3, 2)', biof: 'n⃗(1, -3, 2)' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'معاملات x و y و z في المعادلة الديكارتية للمستوى تشكل إحداثيات المتجهة المنظمية n⃗(a, b, c).',
          biof: 'Les coefficients de x, y et z donnent directement les coordonnées du vecteur normal n⃗(2, -3, 1).'
        }
      },
      {
        question: {
          ar: 'المرحلة 2: حساب الجداء السلمي لمتجهتين متعامدتين:',
          biof: 'Phase 2 : Produit scalaire de deux vecteurs orthogonaux :'
        },
        formula: '\\vec{u}(1, 2, -1) \\quad \\text{et} \\quad \\vec{v}(2, -1, 0)',
        options: [
          { ar: '0 (المتجهتان متعامدتان)', biof: '0 (Vecteurs orthogonaux)' },
          { ar: '4', biof: '4' },
          { ar: '-2', biof: '-2' },
          { ar: '1', biof: '1' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'u⃗ · v⃗ = 1(2) + 2(-1) + (-1)(0) = 2 - 2 + 0 = 0. إذن المتجهتان متعامدتان.',
          biof: 'u⃗ · v⃗ = 1×2 + 2×(-1) + (-1)×0 = 2 - 2 + 0 = 0. Les vecteurs sont orthogonaux.'
        }
      },
      {
        question: {
          ar: 'المرحلة 3: تحديد الوضع النسبي لمستوى وفلكة عندما d(Ω, (P)) = R:',
          biof: 'Phase 3 : Position relative d\'un plan et d\'une sphère si d(Ω, (P)) = R :'
        },
        formula: 'd(\\Omega, (P)) = R',
        options: [
          { ar: 'المستوى مماس للفلكة في نقطة وحيدة H', biof: 'Le plan est tangent à la sphère en un point H' },
          { ar: 'المستوى يقطع الفلكة وفق دائرة', biof: 'Le plan coupe la sphère selon un cercle' },
          { ar: 'المستوى لا يقطع الفلكة', biof: 'Le plan et la sphère sont disjoints' },
          { ar: 'مركز الفلكة ينتمي للمستوى', biof: 'Le centre appartient au plan' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: 'إذا كانت مسافة المركز عن المستوى تساوي بالضبط شعاع الفلكة R، فالمستوى مماس للفلكة في نقطة وحيدة.',
          biof: 'Lorsque d(Ω, (P)) = R, le plan est tangent à la sphère en un point de contact unique.'
        }
      },
      {
        question: {
          ar: 'الضربة الاحتياطية (المرحلة 4): منظم المتجهة u⃗(3, -4, 0) في الفضاء:',
          biof: 'Phase 4 (Décisive) : Calculer la norme du vecteur u⃗(3, -4, 0) :'
        },
        formula: '\\|\\vec{u}\\| = \\sqrt{3^2 + (-4)^2 + 0^2}',
        options: [
          { ar: '5', biof: '5' },
          { ar: '7', biof: '7' },
          { ar: '25', biof: '25' },
          { ar: '1', biof: '1' }
        ],
        correctIndex: 0,
        damageToBoss: 50,
        explanation: {
          ar: '||u⃗|| = √(9 + 16 + 0) = √25 = 5.',
          biof: '||u⃗|| = √(9 + 16 + 0) = √25 = 5.'
        }
      }
    ]
  }
];

interface BossFightArenaProps {
  levelId?: LevelId;
  lang: LanguageOption;
  dualLang: boolean;
  onVictoryReward?: (bonusXp: number) => void;
}

function findRecommendedBossIndex(levelId?: LevelId): number {
  if (!levelId) return 2;
  const idx = BOSSES.findIndex(b => b.recommendedLevels.includes(levelId));
  return idx >= 0 ? idx : 0;
}

export const BossFightArena: React.FC<BossFightArenaProps> = ({
  levelId = '2bac',
  lang,
  dualLang,
  onVictoryReward
}) => {
  const [selectedBossIndex, setSelectedBossIndex] = useState(() => findRecommendedBossIndex(levelId));
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [bossHp, setBossHp] = useState(() => BOSSES[findRecommendedBossIndex(levelId)].maxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shakeBoss, setShakeBoss] = useState(false);
  const [conqueredPhases, setConqueredPhases] = useState<number[]>([]);
  const [attemptSeed, setAttemptSeed] = useState<number>(1);

  useEffect(() => {
    const recIdx = findRecommendedBossIndex(levelId);
    setSelectedBossIndex(recIdx);
    setBossHp(BOSSES[recIdx].maxHp);
    setPlayerHp(100);
    setCurrentPhaseIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsVictory(false);
    setIsGameOver(false);
    setConqueredPhases([]);
  }, [levelId]);

  const currentBoss = BOSSES[selectedBossIndex] || BOSSES[0];
  const currentPhase = currentBoss.phases[currentPhaseIndex] || currentBoss.phases[0];

  const { activeOptions, activeCorrectIndex } = useMemo(() => {
    const opts = currentPhase.options;
    const n = opts.length;
    if (n <= 1) return { activeOptions: opts, activeCorrectIndex: currentPhase.correctIndex };
    const shift = ((selectedBossIndex + 1) * 3 + (currentPhaseIndex + 1) * 5 + attemptSeed) % n || 1;
    const rotated = opts.map((_, idx) => opts[(idx + shift) % n]);
    const newCorrectIdx = rotated.findIndex((_, idx) => (idx + shift) % n === currentPhase.correctIndex);
    return {
      activeOptions: rotated,
      activeCorrectIndex: newCorrectIdx >= 0 ? newCorrectIdx : 0
    };
  }, [currentPhase, selectedBossIndex, currentPhaseIndex, attemptSeed]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered || isVictory || isGameOver) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === activeCorrectIndex;
    if (isCorrect) {
      setShakeBoss(true);
      setTimeout(() => setShakeBoss(false), 600);
      const alreadyConquered = conqueredPhases.includes(currentPhaseIndex);
      const damage = alreadyConquered ? 0 : currentPhase.damageToBoss;
      const newBossHp = Math.max(0, bossHp - damage);
      if (!alreadyConquered) {
        setConqueredPhases(prev => [...prev, currentPhaseIndex]);
      }
      setBossHp(newBossHp);

      if (newBossHp <= 0) {
        setIsVictory(true);
        soundFeedback.playExamResultSound(true);
        onVictoryReward?.(150);
      } else {
        soundFeedback.playCorrectSound(conqueredPhases.length + 1);
      }
    } else {
      const newPlayerHp = Math.max(0, playerHp - 35);
      setPlayerHp(newPlayerHp);
      if (newPlayerHp <= 0) {
        setIsGameOver(true);
        soundFeedback.playExamResultSound(false);
      } else {
        soundFeedback.playIncorrectSound();
      }
    }
  };

  const handleNextPhase = () => {
    soundFeedback.playClickSound();
    if (currentPhaseIndex < currentBoss.phases.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else if (bossHp > 0 && playerHp > 0) {
      // Find first un-conquered phase so player is never soft-locked
      const remainingPhaseIdx = currentBoss.phases.findIndex((_, idx) => !conqueredPhases.includes(idx));
      setCurrentPhaseIndex(remainingPhaseIdx >= 0 ? remainingPhaseIdx : 0);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    soundFeedback.playClickSound();
    setBossHp(currentBoss.maxHp);
    setPlayerHp(100);
    setCurrentPhaseIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsVictory(false);
    setIsGameOver(false);
    setConqueredPhases([]);
    setAttemptSeed(prev => prev + 1);
  };

  const handleSwitchBoss = (bIdx: number) => {
    soundFeedback.playClickSound();
    const b = BOSSES[bIdx];
    setSelectedBossIndex(bIdx);
    setBossHp(b.maxHp);
    setPlayerHp(100);
    setCurrentPhaseIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsVictory(false);
    setIsGameOver(false);
    setConqueredPhases([]);
  };

  const hpPct = Math.round((bossHp / currentBoss.maxHp) * 100);

  return (
    <div className="bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-5 md:p-7 shadow-2xl space-y-6">
      {/* Boss Arena Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
            <Swords className="w-4 h-4" />
            <span>{lang === 'ar' ? 'طور معركة الزعيم البيداغوجي (Didactic Boss Fight)' : 'Arène du Boss Pédagogique'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {currentBoss.name[lang]}
          </h2>
          {dualLang && (
            <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
              {currentBoss.name[lang === 'ar' ? 'biof' : 'ar']}
            </p>
          )}
          <p className="text-xs text-slate-300">
            {currentBoss.title[lang]} · {currentBoss.domainName[lang]}
          </p>
        </div>

        {/* Boss Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {BOSSES.map((b, bIdx) => {
            const isLevelMatch = b.recommendedLevels.includes(levelId);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSwitchBoss(bIdx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedBossIndex === bIdx
                    ? 'bg-rose-600 text-white shadow-md'
                    : isLevelMatch
                    ? 'bg-slate-950 text-amber-300 border border-amber-500/40 hover:border-rose-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span>{b.icon}</span>
                <span className="hidden sm:inline">{b.name[lang].split(' ').slice(0, 2).join(' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duel Combat HUD (Boss HP vs Player HP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Boss Health Status */}
        <div className={`bg-slate-950 border border-rose-900/60 rounded-2xl p-4 space-y-2 transition-transform ${shakeBoss ? 'animate-bounce' : ''}`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-rose-400 flex items-center gap-1.5">
              <span className="text-xl">{currentBoss.icon}</span>
              <span>{currentBoss.name[lang]}</span>
            </span>
            <span className="font-mono font-bold text-rose-300">{bossHp} / {currentBoss.maxHp} HP</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-rose-950">
            <div
              className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* Player Health & Shield */}
        <div className="bg-slate-950 border border-indigo-900/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-indigo-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'طاقة ودرع المتعلم' : 'Énergie de l\'élève'}</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">{playerHp} / 100 HP</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-indigo-950">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${playerHp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Encounter Stage */}
      {isVictory ? (
        <div className="bg-slate-950 border-2 border-amber-500 rounded-3xl p-8 text-center space-y-4 animate-fadeIn shadow-2xl">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-extrabold text-white">
            {lang === 'ar' ? '🎉 تم إسقاط الزعيم البيداغوجي بنجاح!' : '🎉 Victoire Épique contre le Boss !'}
          </h3>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            {lang === 'ar'
              ? 'أثبتّ تحكماً خارقاً في حل المسائل المركبة وفك الفخاخ الرياضية. تم منحك +150 نقطة خبرة!'
              : 'Vous avez terrassé les pièges conceptuels avec brio. Récompense débloquée : +150 XP !'}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-colors cursor-pointer shadow-lg"
          >
            {lang === 'ar' ? 'خوض معركة زعيم جديدة' : 'Nouveau Combat'}
          </button>
        </div>
      ) : isGameOver ? (
        <div className="bg-slate-950 border-2 border-rose-600 rounded-3xl p-8 text-center space-y-4 animate-fadeIn shadow-2xl">
          <Skull className="w-16 h-16 text-rose-500 mx-auto" />
          <h3 className="text-2xl font-extrabold text-white">
            {lang === 'ar' ? 'سقط درعك أمام فخاخ الزعيم!' : 'Échec du Défi !'}
          </h3>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            {lang === 'ar'
              ? 'نفذت نقاط طاقتك. راجع القواعد والعلاقات المرجعية في بطاقات الدرس ثم أعد المحاولة!'
              : 'Votre bouclier a cédé. Révisez les fiches de cours et tentez à nouveau votre chance.'}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm transition-colors cursor-pointer shadow-lg"
          >
            {lang === 'ar' ? 'إعادة المحاولة ↺' : 'Réessayer ↺'}
          </button>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-rose-400">
              {lang === 'ar'
                ? `الطور ${currentPhaseIndex + 1} من ${currentBoss.phases.length}`
                : `Phase ${currentPhaseIndex + 1} sur ${currentBoss.phases.length}`}
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              ⚔️ {lang === 'ar' ? 'قوة الضربة:' : 'Dégâts :'} -{currentPhase.damageToBoss} HP
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-white leading-relaxed">
              <MathText text={currentPhase.question[lang]} />
            </p>
            {dualLang && (
              <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                <MathText text={currentPhase.question[lang === 'ar' ? 'biof' : 'ar']} />
              </p>
            )}
          </div>

          {currentPhase.formula && (
            <FormulaDisplay formula={currentPhase.formula} copyable className="py-3 text-lg" />
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeOptions.map((opt, oIdx) => {
              const isSelected = selectedAnswer === oIdx;
              const isCorrect = oIdx === activeCorrectIndex;
              let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-rose-500/60';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/30';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                }
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`p-4 rounded-xl border text-start transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 text-rose-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {oIdx + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      <MathText text={opt[lang]} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Phase Button (Unlocked on both correct hit and survivable miss) */}
          {isAnswered && !isVictory && !isGameOver && (
            <div className="pt-4 border-t border-slate-800 space-y-3 animate-fadeIn">
              {selectedAnswer !== activeCorrectIndex && (
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 font-bold">
                  {lang === 'ar'
                    ? `💥 أصابك الزعيم بضربة مضادة (-35 HP)! الدرع المتبقي: ${playerHp} HP`
                    : `💥 Contre-attaque du Boss (-35 HP) ! Bouclier restant : ${playerHp} HP`}
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-emerald-400 block">
                  {lang === 'ar' ? 'التعليل الرياضي الصائب للضربة:' : 'Justification mathématique :'}
                </span>
                <p><MathText text={currentPhase.explanation[lang]} /></p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextPhase}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                >
                  {currentPhaseIndex < currentBoss.phases.length - 1
                    ? (lang === 'ar' ? 'التقدم نحو المرحلة التالية ⚔️' : 'Phase Suivante ⚔️')
                    : (lang === 'ar' ? 'جولة حاسمة لكسر ما تبقى من درع الزعيم ⚔️' : 'Assaut Décisif ⚔️')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
