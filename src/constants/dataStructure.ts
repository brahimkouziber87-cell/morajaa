import {
  CycleId,
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  Competency,
  LocalizedString,
  Question,
  StepErrorPitfall,
  UserStats,
  MissedQuestionRecord,
  PlayerClassId,
  PlayerClassConfig,
  SkillNode,
  InspectorReview
} from '../types/curriculum';
import { LEVELS, STREAMS, DOMAINS, QUESTIONS_DATABASE, LevelConfig, StreamConfig } from '../game/curriculumData';
import { PITFALLS_DATABASE } from '../game/pitfallsData';

export type {
  CycleId,
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  Competency,
  LocalizedString,
  Question,
  StepErrorPitfall,
  UserStats,
  MissedQuestionRecord,
  PlayerClassId,
  PlayerClassConfig,
  SkillNode,
  InspectorReview,
  LevelConfig,
  StreamConfig
};

export interface LessonSummary {
  id: string;
  levelId: LevelId;
  streams: StreamId[];
  domain: MathDomain;
  title: LocalizedString;
  objectives: LocalizedString[];
  keyFormulas: {
    label: LocalizedString;
    formula: string;
  }[];
  inspectorNote: LocalizedString;
}

export const LESSONS_DATABASE: LessonSummary[] = [
  {
    id: 'lesson-1ac-ops',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'العمليات على الأعداد الصحيحة والعشرية والنسبية', biof: 'Opérations sur les Nombres Décimaux et Relatifs' },
    objectives: [
      { ar: 'احترام أسبقية الضرب والقسمة على الجمع والطرح في غياب الأقواس', biof: 'Respecter la priorité de la multiplication et division sur l\'addition et soustraction' },
      { ar: 'تطبيق خاصية التوزيع k(a + b) = ka + kb في النشر والتعميل', biof: 'Appliquer la distributivité k(a + b) = ka + kb pour développer et factoriser' }
    ],
    keyFormulas: [
      { label: { ar: 'توزيعية الضرب على الجمع', biof: 'Distributivité' }, formula: 'k \\times (a + b) = k \\times a + k \\times b' },
      { label: { ar: 'طرح عدد نسبي', biof: 'Soustraction d\'un relatif' }, formula: 'a - b = a + (-b)' }
    ],
    inspectorNote: {
      ar: 'توجيه تربوي: ضبط الحساب الحرفي وأسبقية العمليات في السنة الأولى إعدادي هو الأساس المتين لجميع مراحل الجبر اللاحقة.',
      biof: 'Note de l\'Inspecteur : La maîtrise des priorités opératoires en 1AC conditionne toute la réussite algébrique future.'
    }
  },
  {
    id: 'lesson-2ac-pythagore',
    levelId: '2ac',
    streams: ['general'],
    domain: 'geometry_trig',
    title: { ar: 'مبرهنة فيثاغورس والترتيب والعمليات', biof: 'Théorème de Pythagore & Calcul Littéral' },
    objectives: [
      { ar: 'توظيف مبرهنة فيثاغورس المباشرة لحساب طول ضلع في مثلث قائم الزاوية', biof: 'Utiliser le théorème de Pythagore pour calculer une longueur dans un triangle rectangle' },
      { ar: 'نشر وتعميل التعابير الجبرية باستعمال المتطابقات الهامة', biof: 'Développer et factoriser à l\'aide des identités remarquables' }
    ],
    keyFormulas: [
      { label: { ar: 'علاقة فيثاغورس', biof: 'Relation de Pythagore' }, formula: 'BC^2 = AB^2 + AC^2' },
      { label: { ar: 'فرق مربعين', biof: 'Différence de deux carrés' }, formula: 'a^2 - b^2 = (a - b)(a + b)' }
    ],
    inspectorNote: {
      ar: 'توجيه تربوي: يجب التمييز دائماً بين مبرهنة فيثاغورس المباشرة (لحساب الأطوال) والعكسية (لإثبات تعامد ضلعين).',
      biof: 'Note de l\'Inspecteur : Distinguez rigoureusement le théorème direct (calcul de longueur) et la réciproque (preuve de l\'angle droit).'
    }
  },
  {
    id: 'lesson-3ac-brevet',
    levelId: '3ac',
    streams: ['general'],
    domain: 'analysis_functions',
    title: { ar: 'المراجعة الشاملة للامتحان الجهوي الموحد (3 إعدادي)', biof: 'Révision Générale Brevet Régional (3AC)' },
    objectives: [
      { ar: 'تبسيط الجذور المربعة وحذف الجذر من المقام باستعمال المرافق', biof: 'Simplifier les racines carrées et rendre rationnel un dénominateur' },
      { ar: 'تطبيق مبرهنة طاليس المباشرة والعكسية في الهندسة المستوية', biof: 'Appliquer le théorème de Thalès direct et sa réciproque' },
      { ar: 'تحديد صيغة الدالة الخطية والتآلفية ومعادلة مستقيم في المعلم', biof: 'Déterminer une fonction linéaire/affine et l\'équation réduite d\'une droite' }
    ],
    keyFormulas: [
      { label: { ar: 'قاعدة الجذور المربعة', biof: 'Propriété des radicaux' }, formula: '\\sqrt{a^2 \\times b} = |a|\\sqrt{b}' },
      { label: { ar: 'معامل الدالة التآلفية', biof: 'Coefficient d\'une fonction affine' }, formula: 'a = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}' }
    ],
    inspectorNote: {
      ar: 'توجيه تربوي للامتحان الموحد: الهندسة التحليلية والدوال تمثلان أكثر من 40% من تنقيط الامتحان الجهوي للسنة الثالثة إعدادي.',
      biof: 'Note pour l\'Examen Régional : La géométrie analytique et les fonctions représentent plus de 40% du barème officiel en 3AC.'
    }
  },
  {
    id: 'lesson-tc-trigo',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'geometry_trig',
    title: { ar: 'الحساب المثلثي ومجموعات تعريف الدوال العددية', biof: 'Calcul Trigonométrique & Généralités sur les Fonctions' },
    objectives: [
      { ar: 'تمثيل الأفصول المنحني على الدائرة المثلثية واستخراج علاقات الزوايا المرتبطة', biof: 'Représenter les abscisses curvilignes et utiliser les angles associés' },
      { ar: 'تحديد مجموعة تعريف دالة ودراسة شفعيتها ورتابتها', biof: 'Déterminer le domaine de définition, la parité et les variations d\'une fonction' }
    ],
    keyFormulas: [
      { label: { ar: 'العلاقة الأساسية للحساب المثلثي', biof: 'Relation fondamentale' }, formula: '\\cos^2(x) + \\sin^2(x) = 1' },
      { label: { ar: 'شرط الدالة الجذرية والكسرية', biof: 'Domaine racine/quotient' }, formula: 'f(x) = \\frac{\\sqrt{u(x)}}{v(x)} \\iff u(x) \\ge 0 \\; \\text{et} \\; v(x) \\ne 0' }
    ],
    inspectorNote: {
      ar: 'توجيه تربوي: الجذع المشترك هو القنطرة الحاسمة نحو التوجيه العلمي السليم؛ إتقان الدائرة المثلثية وتحديد إشارة ثلاثية الحدود لا غنى عنه.',
      biof: 'Note de l\'Inspecteur : Le Tronc Commun fonde toute l\'analyse du cycle Bac. Maîtrisez le signe du trinôme et le cercle trigonométrique.'
    }
  },
  {
    id: 'lesson-1bac-deriv',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '1bac_lit'],
    domain: 'analysis_functions',
    title: { ar: 'المنطق الرياضي، المتتاليات العددية والاشتقاق', biof: 'Logique, Suites Numériques & Dérivation' },
    objectives: [
      { ar: 'إتقان أنماط البرهان الرياضي (الترجع، الخلف، فصل الحالات، الاستلزام المضاد للعكس)', biof: 'Maîtriser les raisonnements (récurrence, absurde, contraposée, disjonction)' },
      { ar: 'حساب الدالة المشتقة واستنتاج رتابة الدالة ومعادلة المماس', biof: 'Calculer la fonction dérivée, dresser le tableau de variations et trouver la tangente' },
      { ar: 'حساب الحد العام ومجموع حدود متتالية حسابية وهندسية', biof: 'Exprimer le terme général et la somme d\'une suite arithmétique ou géométrique' }
    ],
    keyFormulas: [
      { label: { ar: 'معادلة المماس عند x0', biof: 'Équation de la tangente' }, formula: 'y = f\'(x_0)(x - x_0) + f(x_0)' },
      { label: { ar: 'مجموع متتالية هندسية', biof: 'Somme géométrique' }, formula: 'S = u_p \\times \\frac{1 - q^{n - p + 1}}{1 - q}' }
    ],
    inspectorNote: {
      ar: 'توجيه تربوي: انتبه لارتباط إشارة المشتقة f\'(x) برتابة الدالة الأصلية f(x)؛ هذا المحور يرافقك بنفس الثقل في السنة الثانية باكالوريا.',
      biof: 'Note de l\'Inspecteur : Le lien entre le signe de f\'(x) et les variations de f est le pilier central de l\'épreuve d\'analyse en 1Bac et 2Bac.'
    }
  },
  {
    id: 'lesson-2bac-national',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    title: { ar: 'المراجعة الشاملة للامتحان الوطني الموحد للبكالوريا', biof: 'Révision Générale Examen National du Baccalauréat' },
    objectives: [
      { ar: 'دراسة الاتصال والاشتقاق والدوال اللوغاريتمية والأسية وحساب النهايات الاعتيادية', biof: 'Étudier la continuité, dérivabilité et limites des fonctions ln et exp' },
      { ar: 'حساب التكامل ومساحة الحيز الهندسي بتوظيف الدوال الأصلية والمكاملة بالأجزاء', biof: 'Calculer des intégrales et des aires via les primitives et l\'intégration par parties' },
      { ar: 'ضبط الأعداد العقدية (الشكل الجبري والمثلثي والأسّي) وحساب الاحتمالات', biof: 'Maîtriser les nombres complexes (formes algébrique, trigonométrique, exponentielle) et les probabilités' }
    ],
    keyFormulas: [
      { label: { ar: 'المكاملة بالأجزاء', biof: 'Intégration par parties' }, formula: '\\int_a^b u(x)v\'(x)dx = [u(x)v(x)]_a^b - \\int_a^b u\'(x)v(x)dx' },
      { label: { ar: 'صيغة أولير والترميز الأسّي', biof: 'Notation exponentielle complexe' }, formula: 'z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}' }
    ],
    inspectorNote: {
      ar: 'توجيه الإطار المرجعي للامتحان الوطني: مسألة التحليل (دراسة دالة + متتالية مرتبطة بها + تكامل) تمثل من 8 إلى 11 نقطة من أصل 20.',
      biof: 'Cadre Référentiel du Bac National : Le problème d\'analyse (fonction + suite + intégrale) pèse entre 8 et 11 points sur 20.'
    }
  },
  {
    id: 'lesson-1ac-geom',
    levelId: '1ac',
    streams: ['general'],
    domain: 'geometry_trig',
    title: { ar: 'الهندسة المستوية: المثلث، التماثل المركزي ومتوازي الأضلاع', biof: 'Géométrie Plane : Triangle, Symétrie Centrale & Parallélogramme' },
    objectives: [
      { ar: 'استعمال مجموع قياسات زوايا مثلث (180°) والمتفاوتة المثلثية في البرهان الهندسي', biof: 'Utiliser la somme des angles d\'un triangle (180°) et l\'inégalité triangulaire' },
      { ar: 'توظيف خاصيات الحفاظ على المسافة والقياس في التماثل المركزي وخاصيات متوازي الأضلاع', biof: 'Exploiter les propriétés de conservation de la symétrie centrale et du parallélogramme' }
    ],
    keyFormulas: [
      { label: { ar: 'مجموع زوايا مثلث', biof: 'Somme des angles' }, formula: '\\hat{A} + \\hat{B} + \\hat{C} = 180^\\circ' },
      { label: { ar: 'المتفاوتة المثلثية', biof: 'Inégalité triangulaire' }, formula: 'AB < AC + BC' }
    ],
    inspectorNote: {
      ar: 'توجيه تربوي رسمي: الانتقال من الهندسة المعتمدة على الملاحظة بالعين المجردة (التعليم الابتدائي) إلى الهندسة الاستدلالية المبنية على الخاصيات والبرهان هو الهدف المركزي للسنة الأولى إعدادي.',
      biof: 'Orientation Pédagogique : Le passage de la géométrie perceptive à la géométrie déductive fondée sur la démonstration est l\'objectif central en 1AC.'
    }
  },
  {
    id: 'lesson-2ac-func',
    levelId: '2ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الحساب الحرفي، المعادلات والأعداد الجذرية', biof: 'Calcul Littéral, Équations & Nombres Rationnels' },
    objectives: [
      { ar: 'ضبط العمليات الأربع والقوى على الأعداد الجذرية مع توحيد المقامات', biof: 'Maîtriser les quatre opérations et les puissances sur les nombres rationnels' },
      { ar: 'ترييض الوضعيات وحل معادلات من الدرجة الأولى بمجهول واحد في Q', biof: 'Mettre en équation un problème et résoudre des équations du 1er degré dans Q' }
    ],
    keyFormulas: [
      { label: { ar: 'قوى عدد جذري', biof: 'Puissances rationnelles' }, formula: '\\left(\\frac{a}{b}\\right)^{-n} = \\left(\\frac{b}{a}\\right)^n' },
      { label: { ar: 'المتطابقة الهامة الأولى', biof: 'Identité remarquable 1' }, formula: '(a + b)^2 = a^2 + 2ab + b^2' }
    ],
    inspectorNote: {
      ar: 'توجيه تربوي رسمي: ينبغي التركيز على مراحل ترييض المسائل (اختيار المجهول، صياغة المعادلة، حل المعادلة، التحقق وتأويل النتيجة).',
      biof: 'Orientation Pédagogique : Insister sur les 4 étapes de mise en équation : choix de l\'inconnue, formulation, résolution et vérification.'
    }
  },
  {
    id: 'lesson-2bac-complex-prob',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'geometry_trig',
    title: { ar: 'الأعداد العقدية والهندسة الفضائية وحساب الاحتمالات', biof: 'Nombres Complexes, Géométrie dans l\'Espace & Probabilités' },
    objectives: [
      { ar: 'التأويل الهندسي للأعداد العقدية (الاستقامية، التعامد، التحاكي، الدوران)', biof: 'Interpréter géométriquement le module et l\'argument (alignement, orthogonalité, rotation)' },
      { ar: 'توظيف الجداء السلمي والجداء المتجهي لحساب المسافات ومعادلة المستوى والفلكة', biof: 'Utiliser le produit scalaire et vectoriel pour les plans, sphères et distances' },
      { ar: 'حساب احتمالات الأحداث المستقلة والاحتمال الشرطي وقانون التوزيع الحداني', biof: 'Calculer les probabilités conditionnelles, l\'indépendance et la loi binomiale' }
    ],
    keyFormulas: [
      { label: { ar: 'الكتابة العقدية للدوران', biof: 'Écriture complexe d\'une rotation' }, formula: 'z\' - \\omega = e^{i\\theta}(z - \\omega)' },
      { label: { ar: 'مسافة نقطة عن مستوى', biof: 'Distance point-plan' }, formula: 'd(\\Omega, (P)) = \\frac{|ax_\\Omega + by_\\Omega + cz_\\Omega + d|}{\\sqrt{a^2 + b^2 + c^2}}' }
    ],
    inspectorNote: {
      ar: 'توجيه الإطار المرجعي: تمرين الأعداد العقدية (3 إلى 5 نقط) وتمرين الاحتمالات (3 نقط) يمثلان فرصة حاسمة لضمان نقط كاملة بفضل دقة القواعد المباشرة.',
      biof: 'Cadre Référentiel : Les exercices sur les nombres complexes (3-5 pts) et les probabilités (3 pts) offrent des points rapides grâce aux formules directes.'
    }
  }
];

export interface OfficialPedagogicalGuideline {
  levelId: LevelId;
  officialReference: LocalizedString;
  didacticVision: LocalizedString;
  prerequisites: LocalizedString[];
  officialWeighting: {
    domain: MathDomain;
    weightPct: number;
    note: LocalizedString;
  }[];
  interdisciplinaryLinks: LocalizedString[];
  assessmentStructure: LocalizedString;
}

export const PEDAGOGICAL_GUIDELINES_BY_LEVEL: Record<LevelId, OfficialPedagogicalGuideline> = {
  '1ac': {
    levelId: '1ac',
    officialReference: {
      ar: 'التوجيهات التربوية والبرامج الخاصة بتدريس مادة الرياضيات بالسلك الثانوي الإعدادي — السنة الأولى (1AC)',
      biof: 'Orientations Pédagogiques Officielles du Cycle Secondaire Collégial — 1ère Année (1AC)'
    },
    didacticVision: {
      ar: 'تأمين الانتقال السلس من الحساب العددي والملاحظة البصرية بالتعليم الابتدائي إلى الحساب الحرفي (الجبر) والبرهان الهندسي الاستدلالي.',
      biof: 'Assurer la transition fluide du calcul numérique et de la géométrie perceptive du primaire vers le calcul littéral et la démonstration déductive.'
    },
    prerequisites: [
      { ar: 'العمليات الأربع على الأعداد الصحيحة والعشرية والكسور البسيطة', biof: 'Les quatre opérations sur les entiers, décimaux et fractions simples' },
      { ar: 'الإنشاءات الهندسية الأساسية بالمسطرة والبركار والمنقلة', biof: 'Constructions géométriques de base à la règle, l\'équerre et au compas' }
    ],
    officialWeighting: [
      { domain: 'arithmetic_algebra', weightPct: 50, note: { ar: 'الأعداد العشرية النسبية، القوى، النشر والتعميل والمعادلات', biof: 'Nombres relatifs, puissances, développement, factorisation et équations' } },
      { domain: 'geometry_trig', weightPct: 40, note: { ar: 'المثلث، المستقيمات الهامة، التماثل المركزي ومتوازي الأضلاع', biof: 'Triangle, droites remarquables, symétrie centrale et parallélogramme' } },
      { domain: 'probability_stats', weightPct: 10, note: { ar: 'التناسبية وقراءة وتأويل المبيانات الإحصائية', biof: 'Proportionnalité et lecture de graphiques statistiques' } }
    ],
    interdisciplinaryLinks: [
      { ar: 'الفيزياء والكيمياء: قياس الحجوم والكتلة الحجمية وتحويل الوحدات باستعمال القوى (10^n)', biof: 'Physique-Chimie : Mesure de volumes, masse volumique et conversions via 10^n' },
      { ar: 'علوم الحياة والأرض والجغرافيا: قراءة المبيانات المناخية والتمثيلات المبيانية', biof: 'SVT & Géographie : Lecture de diagrammes ombrothermiques et échelles' }
    ],
    assessmentStructure: {
      ar: '3 فروض محروسة في كل أسدوس (مدة كل فرض ساعة واحدة) تشمل تطبيقاً مباشراً (50%)، استدلالاً هندسياً (35%)، ومسألة إدماجية (15%).',
      biof: '3 devoirs surveillés par semestre (1 heure chacun) : application directe (50%), raisonnement géométrique (35%) et problème intégrateur (15%).'
    }
  },
  '2ac': {
    levelId: '2ac',
    officialReference: {
      ar: 'التوجيهات التربوية والبرامج الخاصة بتدريس مادة الرياضيات بالسلك الثانوي الإعدادي — السنة الثانية (2AC)',
      biof: 'Orientations Pédagogiques Officielles du Cycle Secondaire Collégial — 2ème Année (2AC)'
    },
    didacticVision: {
      ar: 'بناء مفهوم العدد الجذري وتعميق الحساب الحرفي (المتطابقات الهامة) وإرساء اللبنات الأولى للهندسة المترية (فيثاغورس وجيب تمام زاوية) والمتجهات.',
      biof: 'Construire le corps des rationnels, approfondir le calcul littéral et introduire la géométrie métrique (Pythagore, cosinus) et vectorielle.'
    },
    prerequisites: [
      { ar: 'العمليات على الأعداد النسبية وقواعد الإشارات والنشر البسيط', biof: 'Opérations sur les nombres relatifs, règle des signes et distributivité simple' },
      { ar: 'خاصيات التماثل المركزي ومتوازي الأضلاع والمثلث القائم', biof: 'Propriétés de la symétrie centrale, du parallélogramme et du triangle rectangle' }
    ],
    officialWeighting: [
      { domain: 'arithmetic_algebra', weightPct: 45, note: { ar: 'الأعداد الجذرية، القوى، الحساب الحرفي، المعادلات والترتيب', biof: 'Nombres rationnels, puissances, calcul littéral, équations et ordre' } },
      { domain: 'geometry_trig', weightPct: 40, note: { ar: 'التماثل المحوري، مبرهنة فيثاغورس، جيب التمام، المتجهات والإزاحة', biof: 'Symétrie axiale, Pythagore, cosinus, vecteurs et translation' } },
      { domain: 'analysis_functions', weightPct: 10, note: { ar: 'مقدمة الدوال الخطية والتناسبية', biof: 'Introduction aux fonctions linéaires et proportionnalité' } },
      { domain: 'probability_stats', weightPct: 5, note: { ar: 'الحصيص المتراكم والتردد والمعدل الحسابي', biof: 'Effectifs cumulés, fréquences et moyenne arithmétique' } }
    ],
    interdisciplinaryLinks: [
      { ar: 'الفيزياء: تمثيل القوى بمتجهات وتطبيق قانون أوم والتناسبية', biof: 'Physique : Modélisation des forces par des vecteurs et loi d\'Ohm' }
    ],
    assessmentStructure: {
      ar: '3 فروض محروسة في كل أسدوس مع التركيز على سلامة الصياغة الاستدلالية في مبرهنة فيثاغورس والبرهان بالتماثل المحوري.',
      biof: '3 devoirs surveillés par semestre avec exigence de rédaction rigoureuse des hypothèses dans le théorème de Pythagore.'
    }
  },
  '3ac': {
    levelId: '3ac',
    officialReference: {
      ar: 'التوجيهات التربوية والإطار المرجعي للامتحان الجهوي الموحد لنيل شهادة السلك الإعدادي — السنة الثالثة (3AC)',
      biof: 'Orientations Pédagogiques & Cadre Référentiel de l\'Examen Régional Normalisé (3AC)'
    },
    didacticVision: {
      ar: 'تتويج كفايات السلك الإعدادي بضبط مجموعة الأعداد الحقيقية (الجذور المربعة)، الربط بين الجبر والهندسة عبر المعلم في المستوى ومعادلة مستقيم، والتحكم في الدوال الخطية والتآلفية.',
      biof: 'Couronner le cycle collégial par la maîtrise des réels (radicaux), le pont algèbre-géométrie (repère, équation de droite) et les fonctions affines.'
    },
    prerequisites: [
      { ar: 'المتطابقات الهامة الثلاث ومبرهنة فيثاغورس والحساب على الأعداد الجذرية', biof: 'Les trois identités remarquables, théorème de Pythagore et calcul rationnel' }
    ],
    officialWeighting: [
      { domain: 'arithmetic_algebra', weightPct: 25, note: { ar: 'الجذور المربعة، المتطابقات الهامة، القوى، المعادلات والمتراجحات والنظمات', biof: 'Racines carrées, identités, équations, inéquations et systèmes (5 pts / 20)' } },
      { domain: 'analysis_functions', weightPct: 20, note: { ar: 'الدوال الخطية والدوال التآلفية وتمثيلها المبياني', biof: 'Fonctions linéaires et affines et représentation graphique (4 pts / 20)' } },
      { domain: 'geometry_trig', weightPct: 45, note: { ar: 'مبرهنة طاليس، الحساب المثلثي، الزوايا المحيطية، الإزاحة، المعلم ومعادلة مستقيم والهندسة الفضائية', biof: 'Thalès, trigonométrie, géométrie analytique et géométrie dans l\'espace (9 pts / 20)' } },
      { domain: 'probability_stats', weightPct: 10, note: { ar: 'الإحصاء: القيمة الوسطية، المنوال، المعدل الحسابي والتشتت', biof: 'Statistiques : médiane, mode, moyenne et dispersion (2 pts / 20)' } }
    ],
    interdisciplinaryLinks: [
      { ar: 'الفيزياء (الميكانيك والكهرباء): استغلال الدالة الخطية U = R.I والدالة التآلفية وتمثيل متجهة القوة والوزن', biof: 'Physique : Exploitation de la caractéristique linéaire U = R.I et représentation vectorielle du poids P' }
    ],
    assessmentStructure: {
      ar: 'الامتحان الجهوي الموحد (مدته ساعتان — المعامل 3): موزع بدقة وفق الإطار المرجعي الوزاري بين الأنشطة العددية (5 ن)، الدوال (4 ن)، الهندسة التحليلية والفضائية (9 ن)، والإحصاء (2 ن).',
      biof: 'Examen Régional Normalisé (durée 2h — coeff 3) : Activités numériques (5 pts), Fonctions (4 pts), Géométrie plane/analytique/espace (9 pts), Statistiques (2 pts).'
    }
  },
  'tc': {
    levelId: 'tc',
    officialReference: {
      ar: 'التوجيهات التربوية والبرامج الخاصة بتدريس الرياضيات بسلك الجذوع المشتركة للتعليم الثانوي التأهيلي (TC)',
      biof: 'Orientations Pédagogiques Officielles du Cycle Secondaire Qualifiant — Tronc Commun (TC)'
    },
    didacticVision: {
      ar: 'إرساء البناء المفاهيمي الصارم للرياضيات التأهيلية: الانتقال من دراسة دوال خاصة (خطية/تآلفية) إلى المفهوم العام للدالة العددية، وتعميق الحساب المثلثي على الدائرة المثلثية والحساب المتجهي والحدوديات.',
      biof: 'Fonder la rigueur du cycle qualifiant : généralités sur les fonctions numériques, trigonométrie sur le cercle orienté, calcul vectoriel et polynômes.'
    },
    prerequisites: [
      { ar: 'التعميل بالمتطابقات الهامة، حل المعادلات والمتراجحات، والحساب المثلثي في المثلث القائم', biof: 'Factorisation, équations/inéquations du 1er degré et trigonométrie du triangle rectangle' }
    ],
    officialWeighting: [
      { domain: 'arithmetic_algebra', weightPct: 35, note: { ar: 'مبادئ في الحسابيات في N، المجموعات، الترتيب في R، القيمة المطلقة، الحدوديات، المعادلات والمتراجحات من الدرجة الثانية', biof: 'Arithmétique dans N, ordre dans R, valeur absolue, polynômes et trinôme du second degré' } },
      { domain: 'analysis_functions', weightPct: 30, note: { ar: 'عموميات حول الدوال العددية: مجموعة التعريف، الزوجية، الرتابة، المطارف والتمثيل المبياني للدوال الاعتيادية', biof: 'Généralités sur les fonctions : domaine, parité, monotonie, extremums et hyperbole/parabole' } },
      { domain: 'geometry_trig', weightPct: 30, note: { ar: 'الحساب المتجهي، الإسقاط، المستقيم في المستوى، الحساب المثلثي 1 و2، الجداء السلمي والتحويلات والهندسة الفضائية', biof: 'Calcul vectoriel, projection, droite dans le plan, trigonométrie, produit scalaire et espace' } },
      { domain: 'probability_stats', weightPct: 5, note: { ar: 'الإحصاء الوصفي: مؤشرات الموقع ومؤشرات التشتت', biof: 'Statistique descriptive : paramètres de position et de dispersion' } }
    ],
    interdisciplinaryLinks: [
      { ar: 'الفيزياء: إسقاط القوى على معلم متعامد ممنظم وتوظيف النسب المثلثية وشغل قوة (الجداء السلمي)', biof: 'Physique : Projection des forces sur un repère orthonormé et travail d\'une force' }
    ],
    assessmentStructure: {
      ar: '3 فروض محروسة في كل أسدوس (مدتها ساعتان للعلميين وساعة ونصف للأدبيين) تركز على سلامة الاستدلال وتحديد مجموعات التعريف وإشارة ثلاثية الحدود.',
      biof: '3 devoirs surveillés par semestre (2h en TC Sciences) axés sur le signe du trinôme, le cercle trigonométrique et l\'étude qualitative des fonctions.'
    }
  },
  '1bac': {
    levelId: '1bac',
    officialReference: {
      ar: 'التوجيهات التربوية والأطر المرجعية للسنة الأولى من سلك الباكالوريا — العلوم الرياضية، العلوم التجريبية، الاقتصاد والآداب (1Bac)',
      biof: 'Orientations Pédagogiques & Cadres Référentiels de la 1ère Année du Baccalauréat (1Bac)'
    },
    didacticVision: {
      ar: 'هيكلة التفكير الرياضي الصوري عبر درس "مبادئ في المنطق"، وبناء مفهومي النهاية والاشتقاق كأداتين حاسمتين لدراسة الدوال وتمثيلها المبياني، إلى جانب المتتاليات العددية والمرجح وتطبيقات الجداء السلمي.',
      biof: 'Structurer la pensée formelle par la logique mathématique, et bâtir les concepts de limite, dérivation, suites numériques et barycentre.'
    },
    prerequisites: [
      { ar: 'إشارة ثلاثية الحدود من الدرجة الثانية، عموميات حول الدوال، والحساب المثلثي والمتجهي للجذع المشترك', biof: 'Signe du trinôme, généralités sur les fonctions et calcul trigonométrique/vectoriel du TC' }
    ],
    officialWeighting: [
      { domain: 'arithmetic_algebra', weightPct: 25, note: { ar: 'المنطق الرياضي، التعداد، الحسابيات في Z (للعلوم الرياضية) وعموميات', biof: 'Logique mathématique, dénombrement et arithmétique dans Z (SM)' } },
      { domain: 'analysis_functions', weightPct: 45, note: { ar: 'المتتاليات العددية، نهاية دالة عددية، الاشتقاق وتطبيقاته، ودراسة الدوال وتمثيلها المبياني', biof: 'Suites numériques, limites, dérivation et étude complète de fonctions' } },
      { domain: 'geometry_trig', weightPct: 30, note: { ar: 'المرجح في المستوى، التحليلي للجداء السلمي والدائرة، الدوران، صيغ التحويل المثلثي والهندسة الفضائية', biof: 'Barycentre, étude analytique du produit scalaire et du cercle, rotation et formules trigonométriques' } }
    ],
    interdisciplinaryLinks: [
      { ar: 'الفيزياء والكيمياء: السرعة اللحظية والتسارع كمشتقة، وشغل وقدرة قوة باستعمال الجداء السلمي', biof: 'Physique-Chimie : Vitesse instantanée comme dérivée et travail mécanique via le produit scalaire' },
      { ar: 'الاقتصاد والتدبير: المتتاليات الحسابية والهندسية في حساب الفوائد البسيطة والمركبة والكلفة الحدية', biof: 'Économie : Suites arithmétiques/géométriques pour les intérêts simples/composés et coût marginal' }
    ],
    assessmentStructure: {
      ar: 'للشعب العلمية: 3 فروض محروسة في كل أسدوس (ساعتان). للشعب الأدبية والاقتصادية: الامتحان الجهوي الموحد في نهاية السنة (المبني على المعادلات، المتتاليات، التعداد ودراسة الدوال).',
      biof: 'Filières scientifiques : 3 devoirs surveillés/semestre (2h). Filières littéraires : Examen Régional Normalisé en fin d\'année.'
    }
  },
  '2bac': {
    levelId: '2bac',
    officialReference: {
      ar: 'الأطر المرجعية المحينة للامتحان الوطني الموحد لنيل شهادة الباكالوريا — جميع المسالك العلمية والتقنية والاقتصادية (2Bac)',
      biof: 'Cadres Référentiels Officiels de l\'Examen National Normalisé du Baccalauréat (2Bac)'
    },
    didacticVision: {
      ar: 'التحكم الشامل في التحليل الدالي المتقدم (الاتصال، الاشتقاق، الدوال اللوغاريتمية والأسية، المعادلات التفاضلية، التكامل والمتتاليات المرتبطة بدالة)، البنيات الجبرية والأعداد العقدية، الهندسة الفضائية وحساب الاحتمالات.',
      biof: 'Maîtrise approfondie de l\'analyse fonctionnelle (continuité, ln, exp, équations différentielles, calcul intégral, suites liées), nombres complexes, géométrie spatiale et probabilités.'
    },
    prerequisites: [
      { ar: 'حساب النهايات والاشتقاق ومعادلة المماس والترجع من السنة الأولى باكالوريا', biof: 'Calcul de limites, dérivation, équation de la tangente et raisonnement par récurrence de 1Bac' }
    ],
    officialWeighting: [
      { domain: 'analysis_functions', weightPct: 55, note: { ar: 'مسألة التحليل الشاملة (الاتصال، الاشتقاق، ln/exp، الدوال الأصلية والتكامل، والمتتاليات المرتبطة بدالة): 11 نقطة على 20', biof: 'Problème d\'analyse complet (continuité, ln/exp, intégrale et suite associée) : ~11 points sur 20' } },
      { domain: 'geometry_trig', weightPct: 30, note: { ar: 'الأعداد العقدية وتطبيقاتها الهندسية (3 إلى 5 نقط) + الهندسة الفضائية والجداء السلمي والمتجهي (3 نقط)', biof: 'Nombres complexes (3 à 5 pts) + Géométrie dans l\'espace (3 pts)' } },
      { domain: 'probability_stats', weightPct: 15, note: { ar: 'حساب الاحتمالات: الاستقلالية، الاحتمال الشرطي، المتغير العشوائي والقانون الحداني (3 نقط)', biof: 'Calcul des probabilités : probabilité conditionnelle, variable aléatoire et loi binomiale (3 pts)' } }
    ],
    interdisciplinaryLinks: [
      { ar: 'الفيزياء النووية والكهرباء (RC, RL, RLC): حل المعادلات التفاضلية من الرتبة الأولى والثانية واستغلال دالتي ln و exp في التناقص الإشعاعي', biof: 'Physique (Nucléaire & Dipôles RC/RL/RLC) : Équations différentielles et fonctions ln/exp pour la décroissance radioactive' },
      { ar: 'علوم الحياة والأرض والاقتصاد: الاحتمالات في علم الوراثة البشرية ودراسة الدوال في النمذجة الاقتصادية', biof: 'SVT & Économie : Probabilités en génétique humaine et optimisation économique par les fonctions' }
    ],
    assessmentStructure: {
      ar: 'الامتحان الوطني الموحد (3 ساعات للعلوم الفيزيائية وعلوم الحياة والأرض — المعامل 7؛ 4 ساعات للعلوم الرياضية — المعامل 9): يتكون من 3 إلى 4 تمارين مستقلة (متتاليات، عقدية، فضائية، احتمالات) ومسألة تحليل شاملة.',
      biof: 'Examen National Normalisé (3h en PC/SVT coeff 7 ; 4h en SM coeff 9) : 3 à 4 exercices indépendants (suites, complexes, espace, probabilités) + 1 grand problème d\'analyse.'
    }
  }
};

export {
  LEVELS,
  STREAMS,
  DOMAINS,
  QUESTIONS_DATABASE,
  PITFALLS_DATABASE
};

