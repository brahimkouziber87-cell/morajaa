import { LevelId, StreamId, MathDomain, Question, LocalizedString } from '../types/curriculum';

export interface LevelConfig {
  id: LevelId;
  cycle: 'college' | 'lycee';
  name: LocalizedString;
  shortName: LocalizedString;
  badge: string;
  allowedStreams: StreamId[];
  isExamYear?: boolean; // 3AC (Mowahad), 1Bac (Régional), 2Bac (National)
}

export interface StreamConfig {
  id: StreamId;
  name: LocalizedString;
  code: string;
}

export const LEVELS: LevelConfig[] = [
  {
    id: '1ac',
    cycle: 'college',
    name: { ar: 'الأولى ثانوي إعدادي', biof: '1ère Année Collège (1AC)' },
    shortName: { ar: '1 إعدادي', biof: '1AC' },
    badge: '1AC',
    allowedStreams: ['general']
  },
  {
    id: '2ac',
    cycle: 'college',
    name: { ar: 'الثانية ثانوي إعدادي', biof: '2ème Année Collège (2AC)' },
    shortName: { ar: '2 إعدادي', biof: '2AC' },
    badge: '2AC',
    allowedStreams: ['general']
  },
  {
    id: '3ac',
    cycle: 'college',
    name: { ar: 'الثالثة ثانوي إعدادي (سنة إشهادية)', biof: '3ème Année Collège - Brevet (3AC)' },
    shortName: { ar: '3 إعدادي (الموحد)', biof: '3AC Brevet' },
    badge: '3AC ★',
    allowedStreams: ['general'],
    isExamYear: true
  },
  {
    id: 'tc',
    cycle: 'lycee',
    name: { ar: 'الجذع المشترك', biof: 'Tronc Commun (TC)' },
    shortName: { ar: 'جذع مشترك', biof: 'TC' },
    badge: 'TC',
    allowedStreams: ['tc_sciences', 'tc_lettres']
  },
  {
    id: '1bac',
    cycle: 'lycee',
    name: { ar: 'الأولى باكالوريا (الامتحان الجهوي)', biof: '1ère Année Baccalauréat (1Bac)' },
    shortName: { ar: '1 باك (الجهوي)', biof: '1Bac' },
    badge: '1Bac ★',
    allowedStreams: ['1bac_sm', '1bac_se', '1bac_eco', '1bac_lit'],
    isExamYear: true
  },
  {
    id: '2bac',
    cycle: 'lycee',
    name: { ar: 'الثانية باكالوريا (الامتحان الوطني)', biof: '2ème Année Baccalauréat (2Bac)' },
    shortName: { ar: '2 باك (الوطني)', biof: '2Bac' },
    badge: '2Bac ★★★',
    allowedStreams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    isExamYear: true
  }
];

export const STREAMS: Record<StreamId, StreamConfig> = {
  general: {
    id: 'general',
    name: { ar: 'مسار عام / مسار دولي', biof: 'Section Générale / Internationale' },
    code: 'GEN'
  },
  tc_sciences: {
    id: 'tc_sciences',
    name: { ar: 'جذع مشترك علمي وتكنولوجي', biof: 'Tronc Commun Scientifique & Technologique' },
    code: 'TCS'
  },
  tc_lettres: {
    id: 'tc_lettres',
    name: { ar: 'جذع مشترك آداب وعلوم إنسانية', biof: 'Tronc Commun Lettres & Sciences Humaines' },
    code: 'TCL'
  },
  '1bac_sm': {
    id: '1bac_sm',
    name: { ar: '1 باك علوم رياضية', biof: '1ère Bac Sciences Mathématiques' },
    code: '1Bac SM'
  },
  '1bac_se': {
    id: '1bac_se',
    name: { ar: '1 باك علوم تجريبية', biof: '1ère Bac Sciences Expérimentales' },
    code: '1Bac SE'
  },
  '1bac_eco': {
    id: '1bac_eco',
    name: { ar: '1 باك علوم اقتصادية وتدبير', biof: '1ère Bac Sciences Économiques & Gestion' },
    code: '1Bac Eco'
  },
  '1bac_lit': {
    id: '1bac_lit',
    name: { ar: '1 باك آداب وعلوم إنسانية', biof: '1ère Bac Lettres & Sciences Humaines' },
    code: '1Bac Lit'
  },
  '2bac_sm': {
    id: '2bac_sm',
    name: { ar: '2 باك علوم رياضية (أ) و (ب)', biof: '2ème Bac Sciences Mathématiques (A & B)' },
    code: '2Bac SM'
  },
  '2bac_pc': {
    id: '2bac_pc',
    name: { ar: '2 باك علوم فيزيائية', biof: '2ème Bac Sciences Physiques (PC)' },
    code: '2Bac PC'
  },
  '2bac_svt': {
    id: '2bac_svt',
    name: { ar: '2 باك علوم الحياة والأرض', biof: '2ème Bac Sciences de la Vie et de la Terre (SVT)' },
    code: '2Bac SVT'
  },
  '2bac_eco': {
    id: '2bac_eco',
    name: { ar: '2 باك علوم اقتصادية وتدبير محاسباتي', biof: '2ème Bac Sciences Économiques & Gestion' },
    code: '2Bac Eco'
  }
};

export const DOMAINS: Record<MathDomain, { name: LocalizedString; icon: string }> = {
  arithmetic_algebra: {
    name: { ar: 'الحسابيات والجبر', biof: 'Arithmétique & Algèbre' },
    icon: '∑'
  },
  analysis_functions: {
    name: { ar: 'التحليل ودراسة الدوال', biof: 'Analyse & Étude de Fonctions' },
    icon: '∫'
  },
  geometry_trig: {
    name: { ar: 'الهندسة والحساب المثلثي', biof: 'Géométrie & Trigonométrie' },
    icon: '△'
  },
  probability_stats: {
    name: { ar: 'الاحتمالات والإحصاء', biof: 'Probabilités & Statistiques' },
    icon: '⚄'
  }
};

export const QUESTIONS_DATABASE: Question[] = [
  // ==========================================
  // 1AC (الأولى إعدادي)
  // ==========================================
  {
    id: 'q-1ac-01',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'أسبقية العمليات الحسابية', biof: 'Priorité des Opérations' },
    statement: {
      ar: 'احسب قيمة التعبير التالي مع احترام أسبقية العمليات:',
      biof: 'Calculer la valeur de l\'expression suivante en respectant les priorités opératoires :'
    },
    formula: 'A = 15 - 3 \\times 4 + 8 \\div 2',
    options: [
      { ar: '7', biof: '7' },
      { ar: '28', biof: '28' },
      { ar: '11', biof: '11' },
      { ar: '3', biof: '3' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'الضرب والقسمة لهما الأسبقية على الجمع والطرح:\n15 - (3 × 4) + (8 ÷ 2) = 15 - 12 + 4 = 3 + 4 = 7.',
      biof: 'La multiplication et la division sont prioritaires sur l\'addition et la soustraction :\n15 - (3 × 4) + (8 ÷ 2) = 15 - 12 + 4 = 3 + 4 = 7.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: يخلط العديد من تلاميذ 1AC بين العمليات من اليمين إلى اليسار دون احترام أسبقية الضرب والقسمة قبل الجمع والطرح.',
      biof: 'Conseil de l\'Inspecteur : Beaucoup d\'élèves de 1AC calculent naïvement de gauche à droite sans respecter la priorité des produits et quotients.'
    },
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'q-1ac-02',
    levelId: '1ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'restitution',
    title: { ar: 'مجموع قياسات زوايا مثلث', biof: 'Somme des Angles d\'un Triangle' },
    statement: {
      ar: 'في مثلث ABC، إذا علمت أن قياس الزاوية Â = 50° و قياس الزاوية B̂ = 70°، فما هو قياس الزاوية Ĉ؟',
      biof: 'Dans un triangle ABC, si l\'angle Â = 50° et B̂ = 70°, quelle est la mesure de l\'angle Ĉ ?'
    },
    formula: '\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^{\\circ}',
    options: [
      { ar: '60°', biof: '60°' },
      { ar: '50°', biof: '50°' },
      { ar: '80°', biof: '80°' },
      { ar: '90°', biof: '90°' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'مجموع قياسات زوايا أي مثلث في الهندسة الإقليدية يساوي 180°: Ĉ = 180° - (50° + 70°) = 180° - 120° = 60°.',
      biof: 'La somme des mesures des angles d\'un triangle vaut 180° : Ĉ = 180° - (50° + 70°) = 180° - 120° = 60°.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: خاصية محورية تؤسس لجميع براهين حساب الزوايا والتماثل في السلك الإعدادي.',
      biof: 'Conseil de l\'Inspecteur : Propriété fondamentale indispensable pour tous les calculs d\'angles et les démonstrations de symétrie au collège.'
    },
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'q-1ac-03',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'reasoning',
    title: { ar: 'معادلة من الدرجة الأولى بمجهول واحد', biof: 'Équation du Premier Degré' },
    statement: {
      ar: 'حل المعادلة التالية في مجموعة الأعداد النسبية:',
      biof: 'Résoudre l\'équation suivante dans l\'ensemble des nombres relatifs :'
    },
    formula: '3x - 7 = 2x + 5',
    options: [
      { ar: 'x = 12', biof: 'x = 12' },
      { ar: 'x = -2', biof: 'x = -2' },
      { ar: 'x = 2', biof: 'x = 2' },
      { ar: 'x = 6', biof: 'x = 6' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نعزل المجاهيل في طرف والمعاليم في طرف مع تغيير الإشارة: 3x - 2x = 5 + 7 ومنه x = 12.',
      biof: 'On regroupe les termes en x à gauche et les constantes à droite : 3x - 2x = 5 + 7 donc x = 12.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: القاعدة الذهبية هي: كل حد ينقل من طرف لآخر تتغير إشارته الجبرية.',
      biof: 'Conseil de l\'Inspecteur : Règle d\'or : tout terme changeant de membre change obligatoirement de signe.'
    },
    points: 15,
    difficulty: 'medium'
  },

  // ==========================================
  // 2AC (الثانية إعدادي)
  // ==========================================
  {
    id: 'q-2ac-01',
    levelId: '2ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'مبرهنة فيثاغورس المباشرة', biof: 'Théorème de Pythagore Direct' },
    statement: {
      ar: 'ABC مثلث قائم الزاوية في A حيث AB = 6 cm و AC = 8 cm. احسب طول الوتر BC:',
      biof: 'Soit ABC un triangle rectangle en A tel que AB = 6 cm et AC = 8 cm. Calculer la longueur de l\'hypoténuse BC :'
    },
    formula: 'BC^2 = AB^2 + AC^2',
    options: [
      { ar: '10 cm', biof: '10 cm' },
      { ar: '14 cm', biof: '14 cm' },
      { ar: '100 cm', biof: '100 cm' },
      { ar: '12 cm', biof: '12 cm' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'حسب مبرهنة فيثاغورس المباشرة: BC² = 6² + 8² = 36 + 64 = 100. إذن BC = √100 = 10 cm.',
      biof: 'D\'après le théorème de Pythagore : BC² = 6² + 8² = 36 + 64 = 100. D\'où BC = √100 = 10 cm.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تأكد دائماً من ذكر الشرط: "بما أن المثلث قائم الزاوية في A، إذن..." لأن المبرهنة لا تطبق إلا في المثلث القائم.',
      biof: 'Conseil de l\'Inspecteur : Exigez toujours la condition d\'application : "Comme le triangle est rectangle en A, alors...".'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-2ac-02',
    levelId: '2ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'reasoning',
    title: { ar: 'المتطابقات الهامة والتعميل', biof: 'Identités Remarquables' },
    statement: {
      ar: 'ما هو التعميل الصحيح للتعبير الجبري التالي؟',
      biof: 'Quelle est la factorisation correcte de l\'expression algébrique suivante ?'
    },
    formula: 'E = (2x - 3)^2 - 25',
    options: [
      { ar: '(2x + 2)(2x - 8)', biof: '(2x + 2)(2x - 8)' },
      { ar: '(2x - 3 - 25)(2x - 3 + 25)', biof: '(2x - 3 - 25)(2x - 3 + 25)' },
      { ar: '4x^2 - 12x - 16', biof: '4x^2 - 12x - 16' },
      { ar: '(2x - 8)^2', biof: '(2x - 8)^2' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نلاحظ أن 25 = 5²، فنطبق المتطابقة الهامة a² - b² = (a - b)(a + b):\nE = [(2x - 3) - 5][(2x - 3) + 5] = (2x - 8)(2x + 2).',
      biof: 'On remarque que 25 = 5², on applique a² - b² = (a - b)(a + b) :\nE = [(2x - 3) - 5][(2x - 3) + 5] = (2x - 8)(2x + 2).'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: خطأ شائع: يميل التلاميذ إلى نشر العبارة أولاً مما يعقد التعميل بدلاً من ملاحظة شكل الفرق بين مربعين.',
      biof: 'Conseil de l\'Inspecteur : Écueil classique : développer l\'expression au lieu de reconnaître directement la forme a² - b².'
    },
    points: 15,
    difficulty: 'medium'
  },

  // ==========================================
  // 3AC (الثالثة إعدادي - الامتحان الجهوي الموحد)
  // ==========================================
  {
    id: 'q-3ac-01',
    levelId: '3ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'تبسيط الجذور المربعة', biof: 'Simplification des Racines Carrées' },
    statement: {
      ar: 'بسط التعبير العددي التالي لأبسط شكل ممكن:',
      biof: 'Simplifier l\'expression numérique suivante sous sa forme la plus simple :'
    },
    formula: 'B = \\sqrt{75} - 2\\sqrt{12} + \\sqrt{27}',
    options: [
      { ar: '4√3', biof: '4√3' },
      { ar: '2√3', biof: '2√3' },
      { ar: '6√3', biof: '6√3' },
      { ar: '√90', biof: '√90' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نفكك ما بداخل الجذور بمربعات كاملة:\n√75 = √(25×3) = 5√3\n2√12 = 2√(4×3) = 4√3\n√27 = √(9×3) = 3√3\nإذن B = 5√3 - 4√3 + 3√3 = 4√3.',
      biof: 'On fait apparaître les carrés parfaits :\n√75 = √(25×3) = 5√3\n2√12 = 2√(4×3) = 4√3\n√27 = √(9×3) = 3√3\nD\'où B = 5√3 - 4√3 + 3√3 = 4√3.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: سؤال قار في الامتحان الموحد الجهوي لنيل شهادة السلك الإعدادي (يمنح 1.5 إلى 2 نقاط).',
      biof: 'Conseil de l\'Inspecteur : Question incontournable à l\'Examen Normalisé Régional du Brevet (1.5 à 2 points garantis).'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-3ac-02',
    levelId: '3ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'reasoning',
    title: { ar: 'مبرهنة طاليس المباشرة', biof: 'Théorème de Thalès Direct' },
    statement: {
      ar: 'في مثلث ABC، النقطة M تنتمي إلى [AB] و N تنتمي إلى [AC] حيث (MN) // (BC). إذا كان AB = 9 و AM = 3 و BC = 12، فما هو طول القطعة [MN]؟',
      biof: 'Dans un triangle ABC, M ∈ [AB] et N ∈ [AC] tels que (MN) // (BC). Si AB = 9, AM = 3 et BC = 12, calculer la longueur MN :'
    },
    formula: '\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}',
    options: [
      { ar: '4', biof: '4' },
      { ar: '3', biof: '3' },
      { ar: '6', biof: '6' },
      { ar: '36', biof: '36' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'بما أن (MN) // (BC) و M ∈ [AB] و N ∈ [AC]، فحسب مبرهنة طاليس:\nMN / BC = AM / AB => MN / 12 = 3 / 9 = 1 / 3 => MN = 12 / 3 = 4.',
      biof: 'Comme (MN) // (BC), d\'après le théorème de Thalès :\nMN / BC = AM / AB => MN / 12 = 3 / 9 = 1 / 3 => MN = 12 / 3 = 4.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: احرص على كتابة تناسب الأضلاع بالترتيب: رأس المثلث المشترك هو نقطة الانطلاق في الكسور الثلاثة.',
      biof: 'Conseil de l\'Inspecteur : Le sommet commun est toujours le point de départ de vos trois quotients pour ne jamais vous tromper.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-3ac-03',
    levelId: '3ac',
    streams: ['general'],
    domain: 'analysis_functions',
    competency: 'problem_solving',
    title: { ar: 'الدالة التآلفية ومعاملها الموجه', biof: 'Fonction Affine & Coefficient' },
    statement: {
      ar: 'لتكن f دالة تآلفية تحقق f(2) = 7 و f(5) = 16. ما هي صيغة الدالة f(x)؟',
      biof: 'Soit f une fonction affine telle que f(2) = 7 et f(5) = 16. Déterminer l\'expression explicite de f(x) :'
    },
    formula: 'a = \\frac{f(x_1) - f(x_2)}{x_1 - x_2}',
    options: [
      { ar: 'f(x) = 3x + 1', biof: 'f(x) = 3x + 1' },
      { ar: 'f(x) = 2x + 3', biof: 'f(x) = 2x + 3' },
      { ar: 'f(x) = 3x - 1', biof: 'f(x) = 3x - 1' },
      { ar: 'f(x) = 4x - 1', biof: 'f(x) = 4x - 1' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'المعامل a = (16 - 7) / (5 - 2) = 9 / 3 = 3. إذن f(x) = 3x + b. بما أن f(2) = 7: 3(2) + b = 7 => b = 7 - 6 = 1. إذن f(x) = 3x + 1.',
      biof: 'Coefficient directeur : a = (16 - 7)/(5 - 2) = 9/3 = 3. Donc f(x) = 3x + b. Or f(2) = 7 => 3(2) + b = 7 => b = 1. Donc f(x) = 3x + 1.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: سؤال كلاسيكي في الموحد الإشهادي لاختبار قدرة التلميذ على التمييز بين الدالة الخطية f(x)=ax والدالة التآلفية f(x)=ax+b.',
      biof: 'Conseil de l\'Inspecteur : Distinguer rigoureusement fonction linéaire (passe par l\'origine) et fonction affine (ordonnée à l\'origine b).'
    },
    points: 25,
    difficulty: 'hard'
  },

  // ==========================================
  // Tronc Commun (الجذع المشترك)
  // ==========================================
  {
    id: 'q-tc-01',
    levelId: 'tc',
    streams: ['tc_sciences'],
    domain: 'arithmetic_algebra',
    competency: 'restitution',
    title: { ar: 'الحسابيات في N والزوجية', biof: 'Arithmétique dans N & Parité' },
    statement: {
      ar: 'ليكن n عدداً صحيحاً طبيعياً. ما هي طبيعة العدد A = n(n + 1) + 4؟',
      biof: 'Soit n un entier naturel. Quelle est la parité du nombre A = n(n + 1) + 4 ?'
    },
    formula: 'A = n(n + 1) + 4',
    options: [
      { ar: 'دائماً عدد زوجي', biof: 'Toujours un nombre pair' },
      { ar: 'دائماً عدد فردي', biof: 'Toujours un nombre impair' },
      { ar: 'زوجي إذا كان n زوجياً فقط', biof: 'Pair seulement si n est pair' },
      { ar: 'أولي دائماً', biof: 'Toujours un nombre premier' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'جداء عددين متتابعين n و (n+1) هو دائماً عدد زوجي (أحدهما زوجي بالضرورة). مجموع عدد زوجي والعدد الزوجي 4 يعطي دائماً عدداً زوجياً.',
      biof: 'Le produit de deux entiers consécutifs n et n+1 est toujours pair. La somme de deux entiers pairs (n(n+1) et 4) est toujours un nombre pair.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: الاستدلال بفصل الحالات (Disjonction des cas) من الأدوات المنهجية التي يجب ضبطها في الجذع المشترك العلمي.',
      biof: 'Conseil de l\'Inspecteur : Le raisonnement par disjonction de cas (n pair / n impair) est fondamental dès le Tronc Commun Scientifique.'
    },
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'q-tc-02',
    levelId: 'tc',
    streams: ['tc_sciences'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'الحساب المثلثي - الزوايا الاعتيادية', biof: 'Trigonométrie - Angles Associés' },
    statement: {
      ar: 'بسط العبارة المثلثية التالية لكل عدد حقيقي x:',
      biof: 'Simplifier l\'expression trigonométrique suivante pour tout réel x :'
    },
    formula: 'T(x) = \\cos(\\pi - x) + \\sin\\left(\\frac{\\pi}{2} - x\\right) + \\cos(-x)',
    options: [
      { ar: 'cos(x)', biof: 'cos(x)' },
      { ar: '-cos(x)', biof: '-cos(x)' },
      { ar: '2cos(x)', biof: '2cos(x)' },
      { ar: '0', biof: '0' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نطبق العلاقات على الدائرة المثلثية:\ncos(π - x) = -cos(x)\nsin(π/2 - x) = cos(x)\ncos(-x) = cos(x)\nإذن T(x) = -cos(x) + cos(x) + cos(x) = cos(x).',
      biof: 'On applique les formules du cercle trigonométrique :\ncos(π - x) = -cos(x)\nsin(π/2 - x) = cos(x)\ncos(-x) = cos(x)\nD\'où T(x) = -cos(x) + cos(x) + cos(x) = cos(x).'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: رسم الدائرة المثلثية ذهنياً يجنبك حفظ الجداول المعقدة والخلط في الإشارات (+/-).',
      biof: 'Conseil de l\'Inspecteur : Visualiser le cercle trigonométrique évite d\'apprendre par cœur sans comprendre et élimine les erreurs de signe.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-tc-03',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'مجموعة تعريف دالة عددية', biof: 'Domaine de Définition d\'une Fonction' },
    statement: {
      ar: 'حدد مجموعة تعريف الدالة العددية التالية:',
      biof: 'Déterminer l\'ensemble de définition de la fonction numérique suivante :'
    },
    formula: 'f(x) = \\frac{\\sqrt{2x - 6}}{x - 5}',
    options: [
      { ar: '[3, 5[ ∪ ]5, +∞[', biof: '[3, 5[ ∪ ]5, +∞[' },
      { ar: '[3, +∞[', biof: '[3, +∞[' },
      { ar: ']3, 5[ ∪ ]5, +∞[', biof: ']3, 5[ ∪ ]5, +∞[' },
      { ar: 'ℝ \\ {5}', biof: 'ℝ \\ {5}' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'شروط وجود الدالة:\n1) ما بداخل الجذر موجب: 2x - 6 ≥ 0 => 2x ≥ 6 => x ≥ 3 (أي [3, +∞[)\n2) المقام يخالف الصفر: x - 5 ≠ 0 => x ≠ 5\nالتقاطع: D_f = [3, 5[ ∪ ]5, +∞[.',
      biof: 'Conditions d\'existence :\n1) Expression sous la racine positive ou nulle : 2x - 6 ≥ 0 => x ≥ 3.\n2) Dénominateur non nul : x - 5 ≠ 0 => x ≠ 5.\nIntersection : D_f = [3, 5[ ∪ ]5, +∞[.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: انتبه! المجال مغلق عند 3 لأن الجذر يقبل الصفر، ومفتوح عند 5 لأن المقام لا يقبل الصفر قط.',
      biof: 'Conseil de l\'Inspecteur : Attention aux crochets : fermé en 3 (la racine s\'annule sans problème), ouvert en 5 (valeur interdite au dénominateur).'
    },
    points: 20,
    difficulty: 'medium'
  },

  // ==========================================
  // 1Bac (الأولى باكالوريا - الامتحان الجهوي)
  // ==========================================
  {
    id: 'q-1bac-01',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se'],
    domain: 'arithmetic_algebra',
    competency: 'reasoning',
    title: { ar: 'مبادئ في المنطق - نفي عبارة مكممة', biof: 'Logique - Négation d\'une Proposition' },
    statement: {
      ar: 'ما هو النفي المنطقي الدقيق للعبارة (P) التالية؟',
      biof: 'Quelle est la négation logique rigoureuse de la proposition quantifiée (P) ?'
    },
    formula: '(P): \\quad (\\forall x \\in \\mathbb{R})\\; (\\exists y \\in \\mathbb{R}) \\; [x < y \\implies f(x) \\le f(y)]',
    options: [
      { ar: '(∃x ∈ ℝ) (∀y ∈ ℝ) [x < y et f(x) > f(y)]', biof: '(∃x ∈ ℝ) (∀y ∈ ℝ) [x < y et f(x) > f(y)]' },
      { ar: '(∃x ∈ ℝ) (∀y ∈ ℝ) [x ≥ y ou f(x) > f(y)]', biof: '(∃x ∈ ℝ) (∀y ∈ ℝ) [x ≥ y ou f(x) > f(y)]' },
      { ar: '(∀x ∈ ℝ) (∃y ∈ ℝ) [x < y et f(x) > f(y)]', biof: '(∀x ∈ ℝ) (∃y ∈ ℝ) [x < y et f(x) > f(y)]' },
      { ar: '(∃x ∈ ℝ) (∀y ∈ ℝ) [x < y ⇒ f(x) > f(y)]', biof: '(∃x ∈ ℝ) (∀y ∈ ℝ) [x < y ⇒ f(x) > f(y)]' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نفي ∀ هو ∃ ونفي ∃ هو ∀. نفي الاستلزام (A ⇒ B) هو (A و لا B): نفي [x < y ⇒ f(x) ≤ f(y)] هو [x < y و f(x) > f(y)].',
      biof: 'La négation de ∀ est ∃ et celle de ∃ est ∀. La négation de l\'implication (A ⇒ B) est (A et non B) : [x < y et f(x) > f(y)].'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: خطأ كارثي لدى تلاميذ البكالوريا: نفي (A ⇒ B) ليس (A ⇒ لا B)، بل هو (A و لا B). الاستلزام لا ينفى باستلزام آخر!',
      biof: 'Conseil de l\'Inspecteur : Erreur classique : la négation de A ⇒ B n\'est JAMAIS A ⇒ non B, mais bien (A ET non B).'
    },
    points: 25,
    difficulty: 'hard'
  },
  {
    id: 'q-1bac-02',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'الاشتقاق ومعادلة المماس', biof: 'Dérivation & Équation de la Tangente' },
    statement: {
      ar: 'نعتبر الدالة f(x) = x³ - 3x + 2. ما هي معادلة المماس لمنحنى الدالة عند النقطة ذات الأفصول x₀ = 2؟',
      biof: 'Soit f(x) = x³ - 3x + 2. Quelle est l\'équation de la tangente (T) à la courbe au point d\'abscisse x₀ = 2 ?'
    },
    formula: 'y = f\'(x_0)(x - x_0) + f(x_0)',
    options: [
      { ar: 'y = 9x - 14', biof: 'y = 9x - 14' },
      { ar: 'y = 9x + 4', biof: 'y = 9x + 4' },
      { ar: 'y = 3x - 2', biof: 'y = 3x - 2' },
      { ar: 'y = 6x - 8', biof: 'y = 6x - 8' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'المشتقة: f\'(x) = 3x² - 3. عند x₀ = 2: f\'(2) = 3(4) - 3 = 9. والصورة: f(2) = 8 - 6 + 2 = 4.\nمعادلة المماس: y = 9(x - 2) + 4 = 9x - 18 + 4 = 9x - 14.',
      biof: 'Dérivée : f\'(x) = 3x² - 3. En x₀ = 2 : f\'(2) = 9 et f(2) = 4.\nÉquation de la tangente : y = f\'(2)(x - 2) + f(2) = 9(x - 2) + 4 = 9x - 14.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: المعامل الموجه للمماس هو العدد المشتق f\'(x₀). إذا كان f\'(x₀)=0 فالمماس أفقي مواز لمحور الأفاصيل.',
      biof: 'Conseil de l\'Inspecteur : Le coefficient directeur de la tangente est exactement le nombre dérivé f\'(x₀). Si f\'(x₀)=0, la tangente est horizontale.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-1bac-03',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco'],
    domain: 'analysis_functions',
    competency: 'problem_solving',
    title: { ar: 'المتتاليات الهندسية ومجموع الحدود', biof: 'Suites Géométriques & Somme' },
    statement: {
      ar: 'لتكن (vₙ) متتالية هندسية حدها الأول v₀ = 3 وأساسها q = 2. احسب مجموع الحدود: S = v₀ + v₁ + ... + v₄:',
      biof: 'Soit (vₙ) une suite géométrique de premier terme v₀ = 3 et de raison q = 2. Calculer la somme S = v₀ + v₁ + ... + v₄ :'
    },
    formula: 'S_n = v_0 \\times \\frac{1 - q^{n+1}}{1 - q}',
    options: [
      { ar: '93', biof: '93' },
      { ar: '45', biof: '45' },
      { ar: '96', biof: '96' },
      { ar: '189', biof: '189' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'عدد الحدود هو 4 - 0 + 1 = 5 حدود.\nS = 3 × (1 - 2⁵) / (1 - 2) = 3 × (1 - 32) / (-1) = 3 × 31 = 93.',
      biof: 'Le nombre de termes est 4 - 0 + 1 = 5 termes.\nS = 3 × (1 - 2⁵) / (1 - 2) = 3 × (-31) / (-1) = 3 × 31 = 93.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: احذر دائماً من عدد الحدود: عدد الحدود في المتتالية من p إلى n هو (n - p + 1) وليس (n - p).',
      biof: 'Conseil de l\'Inspecteur : Le nombre de termes de l\'indice p à n est toujours n - p + 1. N\'oubliez jamais le +1 !'
    },
    points: 25,
    difficulty: 'medium'
  },

  // ==========================================
  // 2Bac (الثانية باكالوريا - الامتحان الوطني للبكالوريا)
  // ==========================================
  {
    id: 'q-2bac-01',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'analysis_functions',
    competency: 'reasoning',
    title: { ar: 'النهايات والاتصال - مبرهنة القيم الوسيطية (TVI)', biof: 'Continuité - Théorème des Valeurs Intermédiaires' },
    statement: {
      ar: 'لتكن f دالة متصلة ورتيبة قطعا على المجال [1, 2] بحيث f(1) = -3 و f(2) = 5. كم حلا تقبل المعادلة f(x) = 0 في المجال ]1, 2[؟',
      biof: 'Soit f une fonction continue et strictement monotone sur [1, 2] telle que f(1) = -3 et f(2) = 5. Combien de solutions admet l\'équation f(x) = 0 sur ]1, 2[ ?'
    },
    formula: 'f(a) \\times f(b) < 0 \\implies (\\exists! \\alpha \\in ]a,b[)\\; f(\\alpha) = 0',
    options: [
      { ar: 'حل وحيد تماماً α', biof: 'Une solution unique α' },
      { ar: 'حلان على الأقل', biof: 'Au moins deux solutions' },
      { ar: 'لا تقبل أي حل', biof: 'Aucune solution' },
      { ar: 'ما لا نهاية من الحلول', biof: 'Une infinité de solutions' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'بما أن f متصلة ورتيبة قطعا على [1, 2] ولدينا f(1)×f(2) = (-3)×5 = -15 < 0، فحسب مبرهنة القيم الوسيطية ووحدانية الحل (بسبب الرتابة القطعية)، المعادلة f(x)=0 تقبل حلا وحيدا α في المجال ]1, 2[.',
      biof: 'Puisque f est continue et STRICTEMENT monotone sur [1, 2] avec f(1) × f(2) < 0, le corollaire du TVI garantit l\'existence et l\'UNICITÉ d\'une solution α dans ]1, 2[.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: في الامتحان الوطني، كلمة "رتيبة قطعا" هي المفتاح الحاسم للانتقال من "على الأقل حل" إلى "حل وحيد". عدم ذكر الرتابة يكلف نصف النقطة.',
      biof: 'Conseil de l\'Inspecteur : Au Bac National, la stricte monotonie est indispensable pour conclure à l\'UNICITÉ de la solution. Son omission coûte des points.'
    },
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'q-2bac-02',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'الدوال اللوغاريتمية والأسية - النهايات الاعتيادية', biof: 'Fonctions Logarithme & Exponentielle - Limites' },
    statement: {
      ar: 'احسب النهاية الهامة التالية ذات الشكل غير المحدد:',
      biof: 'Calculer la limite fondamentale suivante présentant une forme indéterminée :'
    },
    formula: '\\lim_{x \\to +\\infty} \\frac{e^{2x} - 1}{x}',
    options: [
      { ar: '+∞', biof: '+∞' },
      { ar: '2', biof: '2' },
      { ar: '0', biof: '0' },
      { ar: '1', biof: '1' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نكتب: (e^(2x) - 1)/x = 2 × (e^(2x)/2x) - 1/x. بما أن lim (e^X / X) = +∞ عندما X->+∞ (التزايد المقارن)، فالنهاية هي +∞.',
      biof: 'On a (e^(2x) - 1)/x = 2 × (e^(2x)/2x) - 1/x. Par croissances comparées, lim_{X->+∞} (e^X / X) = +∞, d\'où le résultat +∞.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: ميز بدقة بين النهايات بجوار 0 والنهايات بجوار +∞: lim_{x->0} (e^(2x)-1)/x = 2 (باستعمال العدد المشتق)، أما عند +∞ فتؤول إلى +∞.',
      biof: 'Conseil de l\'Inspecteur : Ne confondez pas la limite en 0 (qui vaut 2 via le nombre dérivé) et la limite en +∞ (qui vaut +∞ par croissances comparées).'
    },
    points: 25,
    difficulty: 'hard'
  },
  {
    id: 'q-2bac-03',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'الأعداد العقدية - الشكل المثلثي والعمدة', biof: 'Nombres Complexes - Forme Trigonométrique' },
    statement: {
      ar: 'ما هو الشكل المثلثي الدقيق للعدد العقدي التالي؟',
      biof: 'Quelle est la forme trigonométrique exacte du nombre complexe suivant ?'
    },
    formula: 'z = 1 - i\\sqrt{3}',
    options: [
      { ar: '2 [cos(-π/3) + i sin(-π/3)]', biof: '2 [cos(-π/3) + i sin(-π/3)]' },
      { ar: '2 [cos(π/3) + i sin(π/3)]', biof: '2 [cos(π/3) + i sin(π/3)]' },
      { ar: '4 [cos(-π/6) + i sin(-π/6)]', biof: '4 [cos(-π/6) + i sin(-π/6)]' },
      { ar: '2 [cos(2π/3) + i sin(2π/3)]', biof: '2 [cos(2π/3) + i sin(2π/3)]' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'المعيار: |z| = √(1² + (-√3)²) = √(1+3) = 2.\nz = 2(1/2 - i√3/2) = 2[cos(-π/3) + i sin(-π/3)]. إذن العمدة arg(z) ≡ -π/3 [2π].',
      biof: 'Module : |z| = √(1 + 3) = 2.\nz = 2(1/2 - i√3/2) = 2[cos(-π/3) + i sin(-π/3)]. L\'argument est -π/3 modulo 2π.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تمرين الأعداد العقدية مضمون في الوطني (3 إلى 3.5 نقطة)، ضبط الشكل المثلثي والأسّي ركيزة حل معادلات الدرجة 2 والدوران.',
      biof: 'Conseil de l\'Inspecteur : Les nombres complexes représentent 3 à 3.5 points au Bac National. Maîtriser le passage forme algébrique -> trigonométrique est vital.'
    },
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'q-2bac-04',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    competency: 'problem_solving',
    title: { ar: 'حساب التكامل بالمكاملة بالأجزاء', biof: 'Calcul Intégral - Intégration par Parties' },
    statement: {
      ar: 'احسب قيمة التكامل التالي باستخدام المكاملة بالأجزاء:',
      biof: 'Calculer la valeur de l\'intégrale suivante à l\'aide d\'une intégration par parties :'
    },
    formula: 'I = \\int_1^e x \\ln(x) \\, dx',
    options: [
      { ar: '(e² + 1) / 4', biof: '(e² + 1) / 4' },
      { ar: '(e² - 1) / 2', biof: '(e² - 1) / 2' },
      { ar: 'e² / 4', biof: 'e² / 4' },
      { ar: '(3e² - 1) / 4', biof: '(3e² - 1) / 4' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نضع u(x) = ln(x) => u\'(x) = 1/x\nونضع v\'(x) = x => v(x) = x²/2\nI = [x² ln(x) / 2]₁ᵉ - ∫₁ᵉ (x²/2)(1/x) dx = (e²/2 - 0) - ∫₁ᵉ (x/2) dx\n= e²/2 - [x²/4]₁ᵉ = e²/2 - (e²/4 - 1/4) = (e² + 1) / 4.',
      biof: 'On pose u(x) = ln(x) => u\'(x) = 1/x et v\'(x) = x => v(x) = x²/2.\nI = [(x²/2) ln(x)]₁ᵉ - ∫₁ᵉ (x/2) dx = e²/2 - [x²/4]₁ᵉ = e²/2 - e²/4 + 1/4 = (e² + 1)/4.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: قاعدة ALPES لتحديد الدالة المشتقة: Arcsin/Arccos, Logarithme, Polynôme, Exponentielle, Sin/Cos. نضع دائما الدالة الأسبق في u(x).',
      biof: 'Conseil de l\'Inspecteur : Règle mnémotechnique ALPES (Arc, Log, Polynôme, Exp, Sin/Cos) pour choisir judicieusement la fonction à dériver u(x).'
    },
    points: 30,
    difficulty: 'hard'
  },
  {
    id: 'q-2bac-05',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'probability_stats',
    competency: 'problem_solving',
    title: { ar: 'الاحتمالات - السحب في آن واحد والمتغير العشوائي', biof: 'Probabilités - Tirage Simultané' },
    statement: {
      ar: 'يحتوي صندوق على 4 كرات بيضاء و 3 كرات سوداء لا يمكن التمييز بينها باللمس. نسحب عشوائيا وفي آن واحد 2 كرات من الصندوق. ما هو احتمال سحب كرتين من نفس اللون؟',
      biof: 'Une urne contient 4 boules blanches et 3 boules noires indiscernables au toucher. On tire simultanément 2 boules de l\'urne. Quelle est la probabilité de tirer 2 boules de même couleur ?'
    },
    formula: 'P(E) = \\frac{\\text{Card}(E)}{\\text{Card}(\\Omega)} = \\frac{C_4^2 + C_3^2}{C_7^2}',
    options: [
      { ar: '3 / 7', biof: '3 / 7' },
      { ar: '4 / 7', biof: '4 / 7' },
      { ar: '1 / 2', biof: '1 / 2' },
      { ar: '2 / 5', biof: '2 / 5' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'السحب في آن واحد يعتمد على التوافقات C:\nCard(Ω) = C(7, 2) = (7×6)/(2×1) = 21.\nالحدث "كرتان من نفس اللون": إما 2 بيضاوين C(4, 2) = 6 أو 2 سوداوين C(3, 2) = 3.\nCard(E) = 6 + 3 = 9.\nإذن P(E) = 9 / 21 = 3 / 7.',
      biof: 'Tirage simultané -> Combinaisons C_n^k :\nCard(Ω) = C_7^2 = 21.\nL\'événement "même couleur" = 2 blanches ou 2 noires : C_4^2 + C_3^2 = 6 + 3 = 9.\nP(E) = 9/21 = 3/7.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: في آن واحد -> التوافقات C. بتتابع وبدون إحلال -> الترتيبات A. بتتابع وبإحلال -> قوى n^p.',
      biof: 'Conseil de l\'Inspecteur : Mémorisez la trilogie : Simultané -> C_n^k ; Successif sans remise -> A_n^k ; Successif avec remise -> n^p.'
    },
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'q-2bac-sm-01',
    levelId: '2bac',
    streams: ['2bac_sm'],
    domain: 'arithmetic_algebra',
    competency: 'reasoning',
    title: { ar: 'الحسابيات في Z - مبرهنة بيزو وغوص', biof: 'Arithmétique dans Z - Théorèmes de Bézout & Gauss' },
    statement: {
      ar: 'إذا كان a و b و c أعدادا صحيحة نسبية غير منعدمة حيث a يقسم bc و a أوليا مع b (أي a ∧ b = 1). ماذا نستنتج حتماً؟',
      biof: 'Si a, b et c sont des entiers relatifs non nuls avec a divise bc et a ∧ b = 1 (premiers entre eux). Que peut-on rigoureusement déduire ?'
    },
    formula: 'a \\mid bc \\quad \\text{et} \\quad a \\wedge b = 1 \\implies a \\mid c',
    options: [
      { ar: 'a يقسم c (مبرهنة غوص)', biof: 'a divise c (Théorème de Gauss)' },
      { ar: 'b يقسم c', biof: 'b divise c' },
      { ar: 'a = b', biof: 'a = b' },
      { ar: 'c يقسم a', biof: 'c divise a' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'هذا هو النص الصريح لمبرهنة غوص (Théorème de Gauss). البرهان يعتمد على متساوية بيزو: بما أن a ∧ b = 1 فإنه يوجد (u, v) حيث au + bv = 1. بضرب المتساوية في c نحصل على acu + bcv = c. وبما أن a يقسم acu و a يقسم bcv فإن a يقسم مجموعهما c.',
      biof: 'C\'est l\'énoncé du théorème de Gauss. Démonstration via Bézout : ∃(u,v), au+bv=1 => acu+bcv=c. Comme a divise acu et bcv, a divise c.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: جوهرة شعبة العلوم الرياضية في الحسابيات. تأكد دائماً من التحقق من شرط "أوليا فيما بينهما" قبل استدعاء غوص.',
      biof: 'Conseil de l\'Inspecteur : Clé de voûte du programme SM. Vérifiez scrupuleusement que a et b sont premiers entre eux avant d\'invoquer Gauss.'
    },
    points: 30,
    difficulty: 'hard'
  },
  {
    id: 'q-2bac-06',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    competency: 'restitution',
    title: { ar: 'الدالة الأصلية لدالة اعتيادية', biof: 'Primitive d\'une Fonction Usuelle' },
    statement: {
      ar: 'حدد الدالة الأصلية F للدالة f(x) = 2x · e^(x²) على ℝ والتي تحقق الشرط البدئي F(0) = 3:',
      biof: 'Déterminer la primitive F de la fonction f(x) = 2x · e^(x²) sur ℝ vérifiant F(0) = 3 :'
    },
    formula: 'f(x) = u\'(x)e^{u(x)} \\implies F(x) = e^{u(x)} + C',
    options: [
      { ar: 'F(x) = e^(x²) + 3', biof: 'F(x) = e^(x²) + 3' },
      { ar: 'F(x) = e^(x²) + 2', biof: 'F(x) = e^(x²) + 2' },
      { ar: 'F(x) = 2e^(x²) + 1', biof: 'F(x) = 2e^(x²) + 1' },
      { ar: 'F(x) = x² e^(x²) + 3', biof: 'F(x) = x² e^(x²) + 3' }
    ],
    correctIndex: 1,
    explanation: {
      ar: 'نلاحظ أن f(x) = (x²)\' e^(x²)، إذن الدوال الأصلية هي F(x) = e^(x²) + C. وبما أن F(0) = 3 فإن e⁰ + C = 3 أي 1 + C = 3 ومنه C = 2.',
      biof: 'On reconnaît u\'e^u avec u(x)=x². Ainsi F(x) = e^(x²) + C. Or F(0) = 1 + C = 3 d\'où C = 2.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: لا تنس أن e⁰ = 1 وليس 0 عند حساب ثابتة الدالة الأصلية C!',
      biof: 'Conseil de l\'Inspecteur : Attention au piège classique : e⁰ = 1 (et non 0) lors de la détermination de la constante C.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-2bac-07',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'الهندسة الفضائية - الجداء السلمي ومعادلة المستوى', biof: 'Géométrie dans l\'Espace - Équation d\'un Plan' },
    statement: {
      ar: 'في الفضاء المنسوب إلى معلم متعامد ممنظم، ما هي المتجهة المنظمية للمستوى (P) ذي المعادلة الديكارتية التالية؟',
      biof: 'Dans l\'espace rapporté à un repère orthonormé, quel est un vecteur normal au plan (P) d\'équation cartésienne :'
    },
    formula: '(P) : \\quad 2x - 3y + 5z - 7 = 0',
    options: [
      { ar: 'n(2, 3, -7)', biof: 'n(2, 3, -7)' },
      { ar: 'n(-3, 5, -7)', biof: 'n(-3, 5, -7)' },
      { ar: 'n(2, -3, 5)', biof: 'n(2, -3, 5)' },
      { ar: 'n(-2, -3, 5)', biof: 'n(-2, -3, 5)' }
    ],
    correctIndex: 2,
    explanation: {
      ar: 'كل مستوى معادلته على الشكل ax + by + cz + d = 0 يقبل المتجهة n(a, b, c) متجهة منظمية عليه، ومنه n(2, -3, 5).',
      biof: 'Un plan d\'équation ax + by + cz + d = 0 admet n(a, b, c) comme vecteur normal, soit ici n(2, -3, 5).'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: استخراج المتجهة المنظمية لمستوى ومتجهة موجهة لمستقيم هو المدخل الأساسي لحساب المسافات وتقاطع الفلكة والمستوى.',
      biof: 'Conseil de l\'Inspecteur : Identifier immédiatement le vecteur normal permet de calculer la distance d\'un point au plan et d\'étudier la sphère.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-2bac-08',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    competency: 'reasoning',
    title: { ar: 'تقارب متتالية عددية - مصاديق التقارب', biof: 'Convergence d\'une Suite Numérique' },
    statement: {
      ar: 'إذا كانت (uₙ) متتالية تزايدية ومكبورة بالعدد 5، فماذا يمكن الاستنتاج بخصوص تقاربها؟',
      biof: 'Si (uₙ) est une suite croissante et majorée par 5, que peut-on conclure quant à sa convergence ?'
    },
    formula: '(\\forall n \\in \\mathbb{N}) \\quad u_n \\le u_{n+1} \\le 5',
    options: [
      { ar: 'المتتالية متباعدة نحو +∞', biof: 'La suite diverge vers +∞' },
      { ar: 'المتتالية دورية غير متقاربة', biof: 'La suite est périodique' },
      { ar: 'المتتالية متقاربة ونهايتها L ≤ 5', biof: 'La suite est convergente et sa limite L ≤ 5' },
      { ar: 'نهايتها تساوي حتماً 0', biof: 'Sa limite vaut nécessairement 0' }
    ],
    correctIndex: 2,
    explanation: {
      ar: 'حسب مصداق التقارب الموروث عن خاصية التمام في ℝ: كل متتالية تزايدية ومكبورة هي متتالية متقاربة، ونهايتها L أصغر من أو تساوي العدد الكابر 5.',
      biof: 'D\'après le théorème de la convergence monotone : toute suite croissante et majorée par M converge vers une limite L ≤ M.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: انتبه! كون المتتالية مكبورة بـ 5 لا يعني أن نهايتها تساوي 5 بالضرورة، بل تعني فقط أنها متقاربة نحو عدد L ≤ 5.',
      biof: 'Conseil de l\'Inspecteur : Être majorée par 5 garantit la convergence vers L ≤ 5, mais L n\'est pas forcément égal à 5 !'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-2bac-09',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'مشتقة الدالة اللوغاريتمية المركبة', biof: 'Dérivée de la Fonction Composée ln(u)' },
    statement: {
      ar: 'لتكن الدالة f المعرفة على المجال ]0, +∞[ بـ f(x) = ln(x² + 1). ما هي صيغة الدالة المشتقة f\'(x)؟',
      biof: 'Soit f la fonction définie sur ℝ par f(x) = ln(x² + 1). Quelle est l\'expression de sa dérivée f\'(x) ?'
    },
    formula: '(\\ln(|u(x)|))\' = \\frac{u\'(x)}{u(x)}',
    options: [
      { ar: '1 / (x² + 1)', biof: '1 / (x² + 1)' },
      { ar: '2x · ln(x² + 1)', biof: '2x · ln(x² + 1)' },
      { ar: 'x / (x² + 1)', biof: 'x / (x² + 1)' },
      { ar: '2x / (x² + 1)', biof: '2x / (x² + 1)' }
    ],
    correctIndex: 3,
    explanation: {
      ar: 'نطبق قاعدة مشتقة مركب اللوغاريتم: u\'(x) / u(x) حيث u(x) = x² + 1 و u\'(x) = 2x، ومنه f\'(x) = 2x / (x² + 1).',
      biof: 'En appliquant (ln(u))\' = u\' / u avec u(x) = x² + 1 et u\'(x) = 2x, on obtient f\'(x) = 2x / (x² + 1).'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: نسيان ضرب البسط في المشتقة الداخلية u\'(x) من أكثر الأخطاء شيوعاً في دراسة الدوال اللوغاريتمية.',
      biof: 'Conseil de l\'Inspecteur : Oublier la dérivée intérieure u\'(x) au numérateur est une erreur fréquente lors de l\'étude des fonctions.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-1bac-04',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'الجداء السلمي في المستوى - شرط التعامد', biof: 'Produit Scalaire - Condition d\'Orthogonalité' },
    statement: {
      ar: 'في معلم متعامد ممنظم، نعتبر المتجهتين u(3, -2) و v(4, m). ما هي قيمة العدد الحقيقي m التي تجعل المتجهتين متعامدتين؟',
      biof: 'Dans un repère orthonormé, soient u(3, -2) et v(4, m). Pour quelle valeur de m les deux vecteurs sont-ils orthogonaux ?'
    },
    formula: '\\vec{u} \\perp \\vec{v} \\iff xx\' + yy\' = 0',
    options: [
      { ar: 'm = -6', biof: 'm = -6' },
      { ar: 'm = 6', biof: 'm = 6' },
      { ar: 'm = 12', biof: 'm = 12' },
      { ar: 'm = 8 / 3', biof: 'm = 8 / 3' }
    ],
    correctIndex: 1,
    explanation: {
      ar: 'تتعامد متجهتان إذا وفقط إذا انعدم جداؤهما السلمي: 3 × 4 + (-2) × m = 0 => 12 - 2m = 0 => m = 6.',
      biof: 'Deux vecteurs sont orthogonaux ssi leur produit scalaire est nul : 3(4) + (-2)m = 0 => 12 - 2m = 0 => m = 6.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: لا تخلط بين شرط التعامد (xx\' + yy\' = 0) وشرط الاستقامية (xy\' - x\'y = 0).',
      biof: 'Conseil de l\'Inspecteur : Ne confondez jamais orthogonalité (xx\' + yy\' = 0) et colinéarité (déterminant xy\' - x\'y = 0).'
    },
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'q-3ac-04',
    levelId: '3ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'الهندسة التحليلية - المسافة بين نقطتين', biof: 'Géométrie Analytique - Distance entre Deux Points' },
    statement: {
      ar: 'في معلم متعامد ممنظم (O, I, J)، نعتبر النقطتين A(1, 2) و B(4, 6). احسب المسافة AB:',
      biof: 'Dans un repère orthonormé (O, I, J), on considère les points A(1, 2) et B(4, 6). Calculer la distance AB :'
    },
    formula: 'AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}',
    options: [
      { ar: '7', biof: '7' },
      { ar: '25', biof: '25' },
      { ar: '5', biof: '5' },
      { ar: '√7', biof: '√7' }
    ],
    correctIndex: 2,
    explanation: {
      ar: 'أفصول المتجهة AB هو 4 - 1 = 3 وأرتوبها 6 - 2 = 4. إذن AB = √(3² + 4²) = √(9 + 16) = √25 = 5.',
      biof: 'Les coordonnées du vecteur AB sont (3 ; 4). Ainsi AB = √(3² + 4²) = √25 = 5.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: حساب إحداثيات متجهة والمسافة بين نقطتين هو السؤال الأول دائماً في مسألة المعلم بالامتحان الجهوي الموحد 3AC.',
      biof: 'Conseil de l\'Inspecteur : Le calcul des coordonnées d\'un vecteur et de la norme ouvre systématiquement l\'exercice de repère au Brevet.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-1ac-04',
    levelId: '1ac',
    streams: ['general'],
    domain: 'probability_stats',
    competency: 'application',
    title: { ar: 'التناسبية والنسب المئوية', biof: 'Proportionnalité & Pourcentages' },
    statement: {
      ar: 'في قسم يتكون من 40 تلميذاً، نجح 85% من التلاميذ في فرض الرياضيات. ما هو عدد التلاميذ الناجحين؟',
      biof: 'Dans une classe de 40 élèves, 85% ont réussi le devoir de mathématiques. Quel est le nombre d\'élèves ayant réussi ?'
    },
    formula: 'N = 40 \\times \\frac{85}{100}',
    options: [
      { ar: '32 تلميذاً', biof: '32 élèves' },
      { ar: '34 تلميذاً', biof: '34 élèves' },
      { ar: '35 تلميذاً', biof: '35 élèves' },
      { ar: '36 تلميذاً', biof: '36 élèves' }
    ],
    correctIndex: 1,
    explanation: {
      ar: 'نحسب 85% من 40: N = (40 × 85) / 100 = 3400 / 100 = 34 تلميذاً.',
      biof: 'On calcule 85% de 40 : N = (40 × 85) / 100 = 34 élèves.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: التناسبية وحساب النسب المئوية هي مدخل أساسي للإحصاء في السلك الإعدادي.',
      biof: 'Conseil de l\'Inspecteur : La proportionnalité et les pourcentages préparent directement au chapitre de statistique.'
    },
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'q-2ac-03',
    levelId: '2ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'القوى والكتابة العلمية', biof: 'Puissances & Écriture Scientifique' },
    statement: {
      ar: 'ما هي الكتابة العلمية للعدد العشري التالي؟',
      biof: 'Quelle est l\'écriture scientifique du nombre décimal suivant ?'
    },
    formula: 'M = 0.00045 \\times 10^7',
    options: [
      { ar: '45 × 10²', biof: '45 × 10²' },
      { ar: '0.45 × 10⁴', biof: '0.45 × 10⁴' },
      { ar: '4.5 × 10³', biof: '4.5 × 10³' },
      { ar: '4.5 × 10⁻¹¹', biof: '4.5 × 10⁻¹¹' }
    ],
    correctIndex: 2,
    explanation: {
      ar: 'لدينا 0.00045 = 4.5 × 10⁻⁴. إذن M = 4.5 × 10⁻⁴ × 10⁷ = 4.5 × 10³ (حيث 1 ≤ 4.5 < 10).',
      biof: 'On a 0.00045 = 4.5 × 10⁻⁴. Ainsi M = 4.5 × 10⁻⁴⁺⁷ = 4.5 × 10³ avec 1 ≤ 4.5 < 10.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: الكتابة العلمية تُكتب دائماً على شكل a × 10ⁿ حيث 1 ≤ a < 10.',
      biof: 'Conseil de l\'Inspecteur : L\'écriture scientifique est impérativement de la forme a × 10ⁿ avec 1 ≤ a < 10.'
    },
    points: 15,
    difficulty: 'medium'
  },
  {
    id: 'q-3ac-05',
    levelId: '3ac',
    streams: ['general'],
    domain: 'probability_stats',
    competency: 'application',
    title: { ar: 'الإحصاء - المعدل الحسابي والقيمة الوسطية', biof: 'Statistiques - Moyenne & Médiane' },
    statement: {
      ar: 'نقط تلميذ في 5 فروض هي: 12، 14، 15، 16، 18. ما هو المعدل الحسابي m والقيمة الوسطية Me لهذه المتسلسلة؟',
      biof: 'Les notes d\'un élève à 5 devoirs sont : 12, 14, 15, 16, 18. Quels sont la moyenne m et la médiane Me de cette série ?'
    },
    formula: 'm = \\frac{\\sum x_i}{N}',
    options: [
      { ar: 'm = 15 و Me = 15', biof: 'm = 15 et Me = 15' },
      { ar: 'm = 14.5 و Me = 15', biof: 'm = 14.5 et Me = 15' },
      { ar: 'm = 15 و Me = 14', biof: 'm = 15 et Me = 14' },
      { ar: 'm = 15.5 و Me = 16', biof: 'm = 15.5 et Me = 16' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'المعدل الحسابي: m = (12 + 14 + 15 + 16 + 18) / 5 = 75 / 5 = 15.\nبما أن القيم مرتبة وعددها 5 فردي، فالقيمة الوسطية هي القيمة الثالثة في الوسط أي Me = 15.',
      biof: 'Moyenne : m = 75 / 5 = 15. La série étant ordonnée de taille impaire 5, la médiane est la 3ème valeur : Me = 15.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تمرين الإحصاء في الموحد الجهوي للسنة الثالثة إعدادي يمنح نقطتين مضمونتين، احرص على ترتيب القيم قبل استخراج القيمة الوسطية.',
      biof: 'Conseil de l\'Inspecteur : Ordonnez toujours les valeurs par ordre croissant avant de déterminer la médiane.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-tc-04',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'arithmetic_algebra',
    competency: 'reasoning',
    title: { ar: 'المعادلات من الدرجة الثانية - المميز Δ', biof: 'Équations du Second Degré - Discriminant Δ' },
    statement: {
      ar: 'نعتبر في ℝ المعادلة x² - 5x + 6 = 0. ما هي مجموعة حلول هذه المعادلة؟',
      biof: 'On considère dans ℝ l\'équation x² - 5x + 6 = 0. Quel est l\'ensemble des solutions S ?'
    },
    formula: '\\Delta = b^2 - 4ac',
    options: [
      { ar: 'S = {-2, -3}', biof: 'S = {-2, -3}' },
      { ar: 'S = {2, 3}', biof: 'S = {2, 3}' },
      { ar: 'S = {1, 6}', biof: 'S = {1, 6}' },
      { ar: 'S = {-1, 6}', biof: 'S = {-1, 6}' }
    ],
    correctIndex: 1,
    explanation: {
      ar: 'المميز Δ = (-5)² - 4(1)(6) = 25 - 24 = 1 > 0.\nالحلان هما x₁ = (5 - 1)/2 = 2 و x₂ = (5 + 1)/2 = 3. إذن S = {2, 3}.',
      biof: 'Δ = (-5)² - 4(1)(6) = 1 > 0. Les racines sont x₁ = (5 - 1)/2 = 2 et x₂ = (5 + 1)/2 = 3, d\'où S = {2, 3}.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: يمكنك التحقق فوراً من صحة الحلين عبر مجموع الجذرين S = -b/a = 5 وجدائهما P = c/a = 6.',
      biof: 'Conseil de l\'Inspecteur : Vérifiez toujours vos racines avec la somme S = -b/a = 5 et le produit P = c/a = 6.'
    },
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'q-1bac-05',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '1bac_lit'],
    domain: 'probability_stats',
    competency: 'application',
    title: { ar: 'التعداد - عدد التبديلات والترتيبات', biof: 'Dénombrement - Permutations & Arrangements' },
    statement: {
      ar: 'بكم طريقة مختلفة يمكن لـ 4 تلاميذ الجلوس في 4 مقاعد مرقمة من 1 إلى 4؟',
      biof: 'De combien de façons différentes 4 élèves peuvent-ils s\'asseoir sur 4 chaises numérotées de 1 à 4 ?'
    },
    formula: 'n! = n \\times (n - 1) \\times \\dots \\times 2 \\times 1',
    options: [
      { ar: '16 طريقة', biof: '16 façons' },
      { ar: '12 طريقة', biof: '12 façons' },
      { ar: '24 طريقة', biof: '24 façons' },
      { ar: '256 طريقة', biof: '256 façons' }
    ],
    correctIndex: 2,
    explanation: {
      ar: 'الأمر يتعلق بتبديلة لـ 4 عناصر، وعدد التبديلات هو العاملي 4! = 4 × 3 × 2 × 1 = 24 طريقة.',
      biof: 'Il s\'agit d\'une permutation de 4 éléments distincts : 4! = 4 × 3 × 2 × 1 = 24 façons.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: إتقان مبادئ التعداد في الأولى باكالوريا هو المفتاح الأساسي لحساب الاحتمالات في الثانية باكالوريا.',
      biof: 'Conseil de l\'Inspecteur : Le dénombrement en 1Bac est le socle direct du calcul des probabilités en 2Bac.'
    },
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'q-2bac-10',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'analysis_functions',
    competency: 'problem_solving',
    title: { ar: 'المعادلات التفاضلية من الرتبة الأولى', biof: 'Équations Différentielles y\' = ay + b' },
    statement: {
      ar: 'ما هو الحل العام للمعادلة التفاضلية (E) : y\' - 3y = 6 على ℝ؟',
      biof: 'Quelle est la solution générale sur ℝ de l\'équation différentielle (E) : y\' - 3y = 6 ?'
    },
    formula: 'y\' = ay + b \\iff y(x) = k e^{ax} - \\frac{b}{a}',
    options: [
      { ar: 'y(x) = k e^(3x) + 2', biof: 'y(x) = k e^(3x) + 2' },
      { ar: 'y(x) = k e^(-3x) - 2', biof: 'y(x) = k e^(-3x) - 2' },
      { ar: 'y(x) = k e^(3x) - 2', biof: 'y(x) = k e^(3x) - 2' },
      { ar: 'y(x) = k e^(6x) - 3', biof: 'y(x) = k e^(6x) - 3' }
    ],
    correctIndex: 2,
    explanation: {
      ar: 'نكتب المعادلة على الشكل القانوني y\' = 3y + 6 حيث a = 3 و b = 6.\nالحل العام هو y(x) = k e^(ax) - b/a = k e^(3x) - 6/3 = k e^(3x) - 2 مع k ∈ ℝ.',
      biof: 'Sous forme canonique y\' = 3y + 6 (a = 3, b = 6). Les solutions sont y(x) = k e^(3x) - 6/3 = k e^(3x) - 2.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: يمكنك دائماً التحقق من الحل العام باشتقاقه وتعويضه في المعادلة التفاضلية الأصلية!',
      biof: 'Conseil de l\'Inspecteur : Dérivez toujours votre solution pour vérifier instantanément qu\'elle vérifie l\'équation.'
    },
    points: 25,
    difficulty: 'medium'
  },
  // ============================================================================
  // تمارين تطبيقية للخاصيات (EXERCICES D'APPLICATION DES PROPRIÉTÉS & THÉORÈMES)
  // ============================================================================
  {
    id: 'q-1ac-prop-01',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'تطبيق خاصيات القوى - جداء وخارج قوتين لهما نفس الأساس', biof: 'Application des Propriétés des Puissances (Même Base)' },
    statement: {
      ar: 'بتطبيق خاصيتي جداء وخارج قوتين لهما نفس الأساس، بسط التعبير التالي على شكل قوة واحدة للعدد 7:',
      biof: 'En appliquant les propriétés du produit et du quotient de deux puissances de même base, simplifier l\'expression suivante sous forme d\'une seule puissance de 7 :'
    },
    formula: 'A = \\frac{7^5 \\times 7^4}{7^6}',
    options: [
      { ar: '7³ = 343', biof: '7³ = 343' },
      { ar: '7¹⁵', biof: '7¹⁵' },
      { ar: '7¹⁴', biof: '7¹⁴' },
      { ar: '7² = 49', biof: '7² = 49' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'خاصية 1: a^m × a^n = a^(m+n) | خاصية 2: a^p / a^q = a^(p-q).',
      biof: 'Propriété 1 : a^m × a^n = a^(m+n) | Propriété 2 : a^p / a^q = a^(p-q).'
    },
    explanation: {
      ar: 'نطبق خاصية جداء قوتين في البسط: 7⁵ × 7⁴ = 7^(5+4) = 7⁹.\nثم نطبق خاصية خارج قوتين لهما نفس الأساس: 7⁹ / 7⁶ = 7^(9-6) = 7³ = 343.',
      biof: 'Au numérateur : 7⁵ × 7⁴ = 7^(5+4) = 7⁹.\nEnsuite par propriété du quotient : 7⁹ / 7⁶ = 7^(9-6) = 7³ = 343.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تجنب الخلط بين جمع الأسس (في الجداء) وضرب الأسس الذي لا يطبق إلا في حالة قوة قوة (a^m)^n.',
      biof: 'Conseil de l\'Inspecteur : Ne confondez jamais l\'addition des exposants (produit) avec leur multiplication réservée à (a^m)^n.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-1ac-prop-02',
    levelId: '1ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'تطبيق خاصية زوايا المثلث المتساوي الساقين', biof: 'Propriété des Angles d\'un Triangle Isocèle' },
    statement: {
      ar: 'ليكن ABC مثلثاً متساوي الساقين رأسه الأساسي A بحيث قياس زاوية الرأس هو Â = 40°. بتطبيق خاصية زوايا القاعدة ومجموع زوايا مثلث، ما هو قياس الزاوية B̂؟',
      biof: 'Soit ABC un triangle isocèle en A tel que Â = 40°. En appliquant la propriété des angles à la base et la somme des angles d\'un triangle, quelle est la mesure de l\'angle B̂ ?'
    },
    formula: '\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ \\quad \\text{et} \\quad \\widehat{B} = \\widehat{C}',
    options: [
      { ar: '70°', biof: '70°' },
      { ar: '40°', biof: '40°' },
      { ar: '140°', biof: '140°' },
      { ar: '60°', biof: '60°' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'في مثلث متساوي الساقين رأسه A، زاويتا القاعدة B̂ و Ĉ متقايستان.',
      biof: 'Dans un triangle isocèle en A, les deux angles à la base B̂ et Ĉ sont égaux.'
    },
    explanation: {
      ar: 'حسب خاصية المثلث المتساوي الساقين في A فإن B̂ = Ĉ.\nوحسب خاصية مجموع زوايا مثلث: Â + 2B̂ = 180° أي 40° + 2B̂ = 180° ومنه 2B̂ = 140° إذن B̂ = 70°.',
      biof: 'Puisque ABC est isocèle en A, on a B̂ = Ĉ. Ainsi 40° + 2B̂ = 180°, soit 2B̂ = 140°, d\'où B̂ = 70°.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: اذكر دائماً اسم الخاصية الهندسية ("بما أن المثلث متساوي الساقين في A فإن...") قبل كتابة العملية الحسابية.',
      biof: 'Conseil de l\'Inspecteur : Énoncez toujours la propriété géométrique utilisée avant d\'effectuer le calcul numérique.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-1ac-prop-03',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'تطبيق خاصية التوزيعية في التعميل الذهني', biof: 'Application de la Distributivité (Factorisation)' },
    statement: {
      ar: 'استعمل خاصية التوزيعية العكسية k×a - k×b = k×(a - b) لحساب التعبير التالي بأسرع طريقة دون آلة حاسبة:',
      biof: 'Utiliser la propriété de distributivité k×a - k×b = k×(a - b) pour calculer mentalement l\'expression suivante :'
    },
    formula: 'S = 17 \\times 104 - 17 \\times 4',
    options: [
      { ar: '1700', biof: '1700' },
      { ar: '170', biof: '170' },
      { ar: '100', biof: '100' },
      { ar: '1768', biof: '1768' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'العامل المشترك بين الحدين هو العدد 17.',
      biof: 'Le facteur commun aux deux termes est 17.'
    },
    explanation: {
      ar: 'بتطبيق خاصية التعميل بالعامل المشترك 17:\nS = 17 × (104 - 4) = 17 × 100 = 1700.',
      biof: 'En factorisant par le facteur commun 17 :\nS = 17 × (104 - 4) = 17 × 100 = 1700.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: التعميل يحول فرقاً معقداً إلى جداء بسيط في 100، وهي مهارة أساسية للحساب الذهني السريع.',
      biof: 'Conseil de l\'Inspecteur : La factorisation transforme une différence complexe en un produit immédiat par 100.'
    },
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'q-2ac-prop-01',
    levelId: '2ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'reasoning',
    title: { ar: 'تطبيق خاصية مستقيم المنتصفين في مثلث', biof: 'Application de la Propriété de la Droite des Milieux' },
    statement: {
      ar: 'في مثلث ABC، النقطة I منتصف [AB] والنقطة J منتصف [AC]. إذا علمت أن BC = 14 cm، فما هو طول القطعة [IJ] بتطبيق خاصية مستقيم المنتصفين؟',
      biof: 'Dans un triangle ABC, I est le milieu de [AB] et J est le milieu de [AC]. Sachant que BC = 14 cm, quelle est la longueur du segment [IJ] ?'
    },
    formula: 'IJ = \\frac{1}{2} BC \\quad \\text{et} \\quad (IJ) \\parallel (BC)',
    options: [
      { ar: 'IJ = 7 cm', biof: 'IJ = 7 cm' },
      { ar: 'IJ = 28 cm', biof: 'IJ = 28 cm' },
      { ar: 'IJ = 14 cm', biof: 'IJ = 14 cm' },
      { ar: 'IJ = 3.5 cm', biof: 'IJ = 3.5 cm' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'طول القطعة الرابطة بين منتصفي ضلعي مثلث يساوي نصف طول الضلع الثالث.',
      biof: 'La longueur du segment joignant les milieux de deux côtés est égale à la moitié du troisième côté.'
    },
    explanation: {
      ar: 'بما أن I منتصف [AB] و J منتصف [AC] في المثلث ABC، فإنه حسب خاصية مستقيم المنتصفين: IJ = BC / 2 = 14 / 2 = 7 cm.',
      biof: 'Comme I est le milieu de [AB] et J le milieu de [AC], d\'après le théorème des milieux : IJ = BC / 2 = 14 / 2 = 7 cm.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: خاصية مستقيم المنتصفين في السنة الثانية إعدادي هي التمهيد المباشر لمبرهنة طاليس في السنة الثالثة إعدادي.',
      biof: 'Conseil de l\'Inspecteur : Le théorème des milieux en 2AC constitue le cas particulier fondamental du théorème de Thalès en 3AC.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-2ac-prop-02',
    levelId: '2ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'reasoning',
    title: { ar: 'تطبيق مبرهنة فيثاغورس العكسية لإثبات التعامد', biof: 'Réciproque du Théorème de Pythagore' },
    statement: {
      ar: 'نعتبر مثلثاً EFG أطوال أضلاعه هي EF = 6 cm و EG = 8 cm و FG = 10 cm. بتطبيق مبرهنة فيثاغورس العكسية، ما هي طبيعة المثلث EFG؟',
      biof: 'Soit EFG un triangle tel que EF = 6 cm, EG = 8 cm et FG = 10 cm. En appliquant la réciproque de Pythagore, quelle est la nature de EFG ?'
    },
    formula: 'FG^2 = 10^2 = 100 \\quad ; \\quad EF^2 + EG^2 = 6^2 + 8^2',
    options: [
      { ar: 'مثلث قائم الزاوية في E', biof: 'Triangle rectangle en E' },
      { ar: 'مثلث قائم الزاوية في F', biof: 'Triangle rectangle en F' },
      { ar: 'مثلث قائم الزاوية في G', biof: 'Triangle rectangle en G' },
      { ar: 'مثلث غير قائم الزاوية', biof: 'Triangle non rectangle' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'أطول ضلع هو [FG]، إذن الزاوية القائمة إن وجدت ستكون مقابلة للوتر [FG] أي في الرأس E.',
      biof: 'Le plus grand côté est [FG], donc l\'angle droit éventuel est opposé à [FG], c\'est-à-dire en E.'
    },
    explanation: {
      ar: 'نحسب من جهة: FG² = 10² = 100.\nومن جهة أخرى: EF² + EG² = 6² + 8² = 36 + 64 = 100.\nبما أن FG² = EF² + EG²، فإنه حسب مبرهنة فيثاغورس العكسية المثلث EFG قائم الزاوية في E.',
      biof: 'D\'une part FG² = 100, d\'autre part EF² + EG² = 36 + 64 = 100. Comme FG² = EF² + EG², d\'après la réciproque de Pythagore, EFG est rectangle en E.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: عند تطبيق فيثاغورس العكسية، احسب مربع أطول ضلع لوحده ومجموع مربعي الضلعين الآخرين لوحده قبل كتابة التساوي!',
      biof: 'Conseil de l\'Inspecteur : Séparez toujours le calcul de FG² et celui de EF² + EG² avant de conclure à l\'égalité.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-2ac-prop-03',
    levelId: '2ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'تطبيق خاصية جيب تمام زاوية حادة (Cosinus)', biof: 'Application du Cosinus d\'un Angle Aigu' },
    statement: {
      ar: 'في مثلث ABC قائم الزاوية في A، لدينا AB = 4 cm والوتر BC = 8 cm. ما هي قيمة جيب تمام الزاوية B̂ (cos B̂)؟',
      biof: 'Dans un triangle ABC rectangle en A, on a AB = 4 cm et l\'hypoténuse BC = 8 cm. Quelle est la valeur de cos(B̂) ?'
    },
    formula: '\\cos(\\widehat{B}) = \\frac{\\text{Côté adjacent}}{\\text{Hypoténuse}} = \\frac{AB}{BC}',
    options: [
      { ar: 'cos(B̂) = 0.5', biof: 'cos(B̂) = 0.5' },
      { ar: 'cos(B̂) = 2', biof: 'cos(B̂) = 2' },
      { ar: 'cos(B̂) = 0.8', biof: 'cos(B̂) = 0.8' },
      { ar: 'cos(B̂) = 0.25', biof: 'cos(B̂) = 0.25' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'جيب تمام زاوية حادة يساوي خارج طول الضلع المحاذي على طول الوتر، وهو دائماً محصور بين 0 و 1.',
      biof: 'Le cosinus d\'un angle aigu est le rapport du côté adjacent sur l\'hypoténuse (toujours compris entre 0 et 1).'
    },
    explanation: {
      ar: 'المثلث ABC قائم الزاوية في A، إذن الوتر هو [BC] والضلع المحاذي للزاوية B̂ هو [AB].\nومنه cos(B̂) = AB / BC = 4 / 8 = 0.5.',
      biof: 'ABC étant rectangle en A, l\'hypoténuse est [BC] et le côté adjacent à B̂ est [AB]. Donc cos(B̂) = 4 / 8 = 0.5.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تذكر أن الوتر هو أطول ضلع في المثلث القائم، لذلك يستحيل أن يكون جيب التمام أكبر من 1.',
      biof: 'Conseil de l\'Inspecteur : Le cosinus d\'un angle aigu est strictement compris entre 0 et 1. Une valeur comme 2 est impossible.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-3ac-prop-01',
    levelId: '3ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'تطبيق خاصيات الجذور المربعة والمرافق', biof: 'Propriétés des Racines Carrées & Expression Conjuguée' },
    statement: {
      ar: 'بتطبيق خاصية المرافق والمتطابقة الهامة الثالثة (a-b)(a+b) = a² - b²، اجعل مقام الكسر التالي عدداً جذرياً صحيحاً:',
      biof: 'En utilisant l\'expression conjuguée et l\'identité remarquable (a-b)(a+b) = a² - b², rendre rationnel le dénominateur de :'
    },
    formula: 'E = \\frac{2}{\\sqrt{5} - \\sqrt{3}}',
    options: [
      { ar: '√5 + √3', biof: '√5 + √3' },
      { ar: '√5 - √3', biof: '√5 - √3' },
      { ar: '2(√5 + √3)', biof: '2(√5 + √3)' },
      { ar: '(√5 + √3) / 2', biof: '(√5 + √3) / 2' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'اضرب البسط والمقام في مرافق المقام وهو (√5 + √3).',
      biof: 'Multipliez le numérateur et le dénominateur par le conjugué (√5 + √3).'
    },
    explanation: {
      ar: 'نضرب البسط والمقام في المرافق (√5 + √3):\nE = 2(√5 + √3) / [(√5)² - (√3)²] = 2(√5 + √3) / (5 - 3) = 2(√5 + √3) / 2 = √5 + √3.',
      biof: 'En multipliant par le conjugué (√5 + √3) :\nE = 2(√5 + √3) / (5 - 3) = 2(√5 + √3) / 2 = √5 + √3.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: حذف الجذر المربع من المقام باستعمال المرافق سؤال كلاسيكي قار في التمرين الأول من الامتحان الجهوي الموحد (3AC).',
      biof: 'Conseil de l\'Inspecteur : La rationalisation du dénominateur par le conjugué est une question incontournable du Brevet Régional (3AC).'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-3ac-prop-02',
    levelId: '3ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'تطبيق العلاقة المثلثية الأساسية cos²x + sin²x = 1', biof: 'Relation Fondamentale de la Trigonométrie' },
    statement: {
      ar: 'ليكن x قياس زاوية حادة بحيث cos(x) = 3/5. بتطبيق الخاصية المثلثية الأساسية cos²(x) + sin²(x) = 1، احسب قيمة sin(x):',
      biof: 'Soit x la mesure d\'un angle aigu tel que cos(x) = 3/5. En appliquant la propriété cos²(x) + sin²(x) = 1, calculer sin(x) :'
    },
    formula: '\\cos^2(x) + \\sin^2(x) = 1',
    options: [
      { ar: 'sin(x) = 4/5', biof: 'sin(x) = 4/5' },
      { ar: 'sin(x) = 2/5', biof: 'sin(x) = 2/5' },
      { ar: 'sin(x) = 16/25', biof: 'sin(x) = 16/25' },
      { ar: 'sin(x) = 3/4', biof: 'sin(x) = 3/4' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'احسب sin²(x) = 1 - cos²(x) ثم خذ الجذر المربع الموجب لأن الزاوية حادة.',
      biof: 'Calculez sin²(x) = 1 - cos²(x) puis prenez la racine carrée positive.'
    },
    explanation: {
      ar: 'لدينا sin²(x) = 1 - cos²(x) = 1 - (3/5)² = 1 - 9/25 = 16/25.\nوبما أن x زاوية حادة فإن sin(x) > 0، ومنه sin(x) = √(16/25) = 4/5.',
      biof: 'On a sin²(x) = 1 - (3/5)² = 1 - 9/25 = 16/25. Comme x est aigu, sin(x) > 0, d\'où sin(x) = √(16/25) = 4/5.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: لا تنسَ أبداً أخذ الجذر المربع في المرحلة الأخيرة وتبرير إشارة sin(x) > 0 بكون الزاوية حادة.',
      biof: 'Conseil de l\'Inspecteur : N\'oubliez pas d\'extraire la racine carrée à la fin en justifiant que sin(x) > 0 car x est un angle aigu.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-3ac-prop-03',
    levelId: '3ac',
    streams: ['general'],
    domain: 'geometry_trig',
    competency: 'reasoning',
    title: { ar: 'تطبيق خاصية الزاوية المحيطية والزاوية المركزية', biof: 'Propriété de l\'Angle Inscrit et de l\'Angle au Centre' },
    statement: {
      ar: 'في دائرة (C) مركزها O، الزاوية المحيطية BÂC والزاوية المركزية BÔC تحصران نفس القوس BC. إذا كان قياس BÂC = 35°، فما هو قياس الزاوية المركزية BÔC؟',
      biof: 'Dans un cercle (C) de centre O, l\'angle inscrit BÂC et l\'angle au centre BÔC interceptent le même arc BC. Si BÂC = 35°, quelle est la mesure de BÔC ?'
    },
    formula: '\\widehat{BOC} = 2 \\times \\widehat{BAC}',
    options: [
      { ar: '70°', biof: '70°' },
      { ar: '35°', biof: '35°' },
      { ar: '17.5°', biof: '17.5°' },
      { ar: '145°', biof: '145°' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'قياس الزاوية المركزية يساوي ضعف قياس الزاوية المحيطية التي تحصر معها نفس القوس.',
      biof: 'La mesure de l\'angle au centre est le double de celle de l\'angle inscrit qui intercepte le même arc.'
    },
    explanation: {
      ar: 'بما أن الزاوية المركزية BÔC والزاوية المحيطية BÂC تحصران نفس القوس BC، فإنه حسب خاصية الزوايا في الدائرة: BÔC = 2 × BÂC = 2 × 35° = 70°.',
      biof: 'L\'angle au centre BÔC et l\'angle inscrit BÂC interceptant le même arc BC, on a BÔC = 2 × BÂC = 2 × 35° = 70°.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تحديد القوس المحصور المشترك هو الشرط الأساسي لتطبيق خاصية الزاوية المحيطية والمركزية.',
      biof: 'Conseil de l\'Inspecteur : Précisez toujours l\'arc intercepté commun avant d\'appliquer la relation du double.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-tc-prop-01',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'تطبيق خاصيات القيمة المطلقة والمتراجحات', biof: 'Propriétés de la Valeur Absolue & Inéquations' },
    statement: {
      ar: 'بتطبيق خاصية القيمة المطلقة |x - a| ≤ r ⟺ a - r ≤ x ≤ a + r، ما هي مجموعة حلول المتراجحة |x - 3| ≤ 2 في ℝ؟',
      biof: 'En appliquant la propriété |x - a| ≤ r ⟺ a - r ≤ x ≤ a + r, quel est l\'ensemble des solutions dans ℝ de |x - 3| ≤ 2 ?'
    },
    formula: '|x - 3| \\le 2 \\iff -2 \\le x - 3 \\le 2',
    options: [
      { ar: 'S = [1, 5]', biof: 'S = [1, 5]' },
      { ar: 'S = [-2, 2]', biof: 'S = [-2, 2]' },
      { ar: 'S = [-5, -1]', biof: 'S = [-5, -1]' },
      { ar: 'S = ]-∞, 1] ∪ [5, +∞[', biof: 'S = ]-∞, 1] ∪ [5, +∞[' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'المسافة بين x و 3 أصغر من أو تساوي 2، أي x محصور بين 3 - 2 و 3 + 2.',
      biof: 'La distance entre x et 3 est inférieure ou égale à 2, donc x est compris entre 3 - 2 et 3 + 2.'
    },
    explanation: {
      ar: 'لدينا |x - 3| ≤ 2 يكافئ -2 ≤ x - 3 ≤ 2.\nبإضافة 3 إلى أطراف المتفاوتة نحصل على: 3 - 2 ≤ x ≤ 3 + 2 أي 1 ≤ x ≤ 5. إذن S = [1, 5].',
      biof: '|x - 3| ≤ 2 ⟺ -2 ≤ x - 3 ≤ 2 ⟺ 1 ≤ x ≤ 5. L\'ensemble des solutions est l\'intervalle fermé S = [1, 5].'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: هندسياً، المجال [1, 5] مركزه c = 3 وشعاعه r = 2.',
      biof: 'Conseil de l\'Inspecteur : Géométriquement, l\'intervalle [1, 5] a pour centre c = 3 et pour rayon r = 2.'
    },
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'q-tc-prop-02',
    levelId: 'tc',
    streams: ['tc_sciences'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'تطبيق خاصية استقامية متجهتين (المحددة det)', biof: 'Propriété de Colinéarité de Deux Vecteurs (Déterminant)' },
    statement: {
      ar: 'في المستوى المنسوب إلى معلم متعامد ممنظم، نعتبر المتجهتين u⃗(2 ; -3) و v⃗(m ; 6). بتطبيق خاصية انعدام المحددة det(u⃗, v⃗) = 0، ما هي قيمة m لكي تكون المتجهتان مستقيميتين؟',
      biof: 'Dans le plan rapporté à un repère, on considère u⃗(2 ; -3) et v⃗(m ; 6). En appliquant la propriété det(u⃗, v⃗) = 0, pour quelle valeur de m les vecteurs sont-ils colinéaires ?'
    },
    formula: '\\det(\\vec{u}, \\vec{v}) = x y\' - x\' y = 0',
    options: [
      { ar: 'm = -4', biof: 'm = -4' },
      { ar: 'm = 4', biof: 'm = 4' },
      { ar: 'm = -9', biof: 'm = -9' },
      { ar: 'm = 9', biof: 'm = 9' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'احسب المحددة: 2 × 6 - (-3) × m = 0.',
      biof: 'Calculez le déterminant : 2 × 6 - (-3) × m = 0.'
    },
    explanation: {
      ar: 'تكون u⃗ و v⃗ مستقيميتين إذا وفقط إذا كان det(u⃗, v⃗) = 0.\nأي 2 × 6 - (-3) × m = 0 ⟺ 12 + 3m = 0 ⟺ 3m = -12 ⟺ m = -4.',
      biof: 'u⃗ et v⃗ sont colinéaires si et seulement si det(u⃗, v⃗) = 2(6) - (-3)m = 12 + 3m = 0, soit m = -4.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: خاصية المحددة det(u⃗, v⃗) = 0 هي الأداة التحليلية الأسرع لإثبات توازي مستقيمين أو استقامية ثلاث نقط.',
      biof: 'Conseil de l\'Inspecteur : La nullité du déterminant est l\'outil analytique privilégié pour prouver le parallélisme ou l\'alignement.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-tc-prop-03',
    levelId: 'tc',
    streams: ['tc_sciences'],
    domain: 'arithmetic_algebra',
    competency: 'reasoning',
    title: { ar: 'تطبيق خاصية قابلية قسمة حدودية على (x - α)', biof: 'Propriété de Divisibilité d\'un Polynôme par (x - α)' },
    statement: {
      ar: 'نعتبر الحدودية P(x) = x³ - 4x² + x + 6. نلاحظ أن P(2) = 0. بتطبيق خاصية الجذر والتعميل، ما هو تعميل الحدودية P(x)؟',
      biof: 'Soit le polynôme P(x) = x³ - 4x² + x + 6. On vérifie que P(2) = 0. En appliquant la propriété de factorisation par (x - 2), quelle est la forme factorisée de P(x) ?'
    },
    formula: 'P(\\alpha) = 0 \\iff P(x) = (x - \\alpha) Q(x)',
    options: [
      { ar: 'P(x) = (x - 2)(x² - 2x - 3)', biof: 'P(x) = (x - 2)(x² - 2x - 3)' },
      { ar: 'P(x) = (x + 2)(x² - 2x + 3)', biof: 'P(x) = (x + 2)(x² - 2x + 3)' },
      { ar: 'P(x) = (x - 2)(x² + 2x - 3)', biof: 'P(x) = (x - 2)(x² + 2x - 3)' },
      { ar: 'P(x) = (x - 2)(x² - 4x + 3)', biof: 'P(x) = (x - 2)(x² - 4x + 3)' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'بما أن 2 جذر للحدودية P(x)، فإن P(x) تقبل القسمة الإقليدية على (x - 2).',
      biof: 'Puisque 2 est racine de P(x), P(x) est divisible par (x - 2).'
    },
    explanation: {
      ar: 'بإنجاز القسمة الإقليدية لـ x³ - 4x² + x + 6 على (x - 2) أو بمطابقة المعاملات، نجد الخارج Q(x) = x² - 2x - 3 والباقي 0.\nإذن P(x) = (x - 2)(x² - 2x - 3).',
      biof: 'Par division euclidienne de P(x) par (x - 2), on obtient le quotient Q(x) = x² - 2x - 3. Ainsi P(x) = (x - 2)(x² - 2x - 3).'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تحقق دائماً من الحد الثابت في النشر: (-2) × (-3) = +6 يطابق الحد الثابت للحدودية P(x).',
      biof: 'Conseil de l\'Inspecteur : Vérifiez rapidement le terme constant : (-2) × (-3) = +6 correspond bien à celui de P(x).'
    },
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'q-1bac-prop-01',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'تطبيق خاصية مجموع حدود متتالية حسابية', biof: 'Propriété de la Somme des Termes d\'une Suite Arithmétique' },
    statement: {
      ar: 'لتكن (u_n) متتالية حسابية حدها الأول u₀ = 3 وأساسها r = 4 (حيث u₉ = 39). بتطبيق خاصية مجموع حدود متتالية حسابية، احسب المجموع S = u₀ + u₁ + ... + u₉:',
      biof: 'Soit (u_n) une suite arithmétique de premier terme u₀ = 3 et de raison r = 4 (avec u₉ = 39). Calculer la somme S = u₀ + u₁ + ... + u₉ :'
    },
    formula: 'S = (\\text{Nombre de termes}) \\times \\frac{\\text{Premier terme} + \\text{Dernier terme}}{2}',
    options: [
      { ar: 'S = 210', biof: 'S = 210' },
      { ar: 'S = 189', biof: 'S = 189' },
      { ar: 'S = 420', biof: 'S = 420' },
      { ar: 'S = 195', biof: 'S = 195' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'عدد الحدود من u₀ إلى u₉ هو 9 - 0 + 1 = 10 حدود.',
      biof: 'Le nombre de termes de u₀ à u₉ est 9 - 0 + 1 = 10 termes.'
    },
    explanation: {
      ar: 'عدد الحدود هو n = 9 - 0 + 1 = 10 حدود.\nبتطبيق خاصية المجموع: S = 10 × (u₀ + u₉) / 2 = 10 × (3 + 39) / 2 = 5 × 42 = 210.',
      biof: 'Il y a 9 - 0 + 1 = 10 termes. Par propriété : S = 10 × (u₀ + u₉) / 2 = 10 × (3 + 39) / 2 = 5 × 42 = 210.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: الخطأ الأكثر شيوعاً هو اعتبار عدد الحدود 9 بدلاً من 10؛ القاعدة العامة لعدد الحدود من u_p إلى u_n هي (n - p + 1).',
      biof: 'Conseil de l\'Inspecteur : Le nombre de termes de l\'indice p à l\'indice n est toujours (n - p + 1), jamais (n - p).'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-1bac-prop-02',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se'],
    domain: 'geometry_trig',
    competency: 'application',
    title: { ar: 'تطبيق خاصيات الجداء السلمي ومبرهنة الكاشي (Al-Kashi)', biof: 'Produit Scalaire & Théorème d\'Al-Kashi' },
    statement: {
      ar: 'في مثلث ABC لدينا AB = 4 و AC = 5 وقياس الزاوية BÂC = 60° (علماً أن cos 60° = 1/2). بتطبيق مبرهنة الكاشي، احسب المسافة BC:',
      biof: 'Dans un triangle ABC, on a AB = 4, AC = 5 et BÂC = 60° (cos 60° = 1/2). En appliquant le théorème d\'Al-Kashi, calculer BC :'
    },
    formula: 'BC^2 = AB^2 + AC^2 - 2 \\cdot AB \\cdot AC \\cdot \\cos(\\widehat{A})',
    options: [
      { ar: 'BC = √21', biof: 'BC = √21' },
      { ar: 'BC = √41', biof: 'BC = √41' },
      { ar: 'BC = √61', biof: 'BC = √61' },
      { ar: 'BC = 21', biof: 'BC = 21' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'عوض AB = 4 و AC = 5 و cos(60°) = 0.5 في صيغة الكاشي ثم خذ الجذر المربع.',
      biof: 'Remplacez AB = 4, AC = 5 et cos(60°) = 0.5 dans la formule d\'Al-Kashi puis prenez la racine carrée.'
    },
    explanation: {
      ar: 'حسب مبرهنة الكاشي: BC² = 4² + 5² - 2 × 4 × 5 × cos(60°) = 16 + 25 - 40 × (1/2) = 41 - 20 = 21.\nومنه BC = √21.',
      biof: 'D\'après Al-Kashi : BC² = 16 + 25 - 2(4)(5)(1/2) = 41 - 20 = 21. Comme BC > 0, on obtient BC = √21.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: مبرهنة الكاشي هي تعميم لمبرهنة فيثاغورس على أي مثلث كيفما كان قياس زاويته.',
      biof: 'Conseil de l\'Inspecteur : Le théorème d\'Al-Kashi généralise le théorème de Pythagore à tous les triangles quelconques.'
    },
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'q-1bac-prop-03',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se'],
    domain: 'geometry_trig',
    competency: 'reasoning',
    title: { ar: 'تطبيق الخاصية المميزة لمرجح نقطتين', biof: 'Propriété Caractéristique du Barycentre' },
    statement: {
      ar: 'لتكن G مرجح النظمة المتزنة {(A, 2) ; (B, 3)}. بتطبيق الخاصية المميزة للمرجح، ما هي العلاقة المتجهية الصحيحة التي تربط AG⃗ بـ AB⃗؟',
      biof: 'Soit G le barycentre du système pondéré {(A, 2) ; (B, 3)}. Quelle est la relation vectorielle exprimant AG⃗ en fonction de AB⃗ ?'
    },
    formula: '\\alpha \\overrightarrow{GA} + \\beta \\overrightarrow{GB} = \\vec{0} \\iff \\overrightarrow{AG} = \\frac{\\beta}{\\alpha + \\beta} \\overrightarrow{AB}',
    options: [
      { ar: 'AG⃗ = (3/5) AB⃗', biof: 'AG⃗ = (3/5) AB⃗' },
      { ar: 'AG⃗ = (2/5) AB⃗', biof: 'AG⃗ = (2/5) AB⃗' },
      { ar: 'AG⃗ = (3/2) AB⃗', biof: 'AG⃗ = (3/2) AB⃗' },
      { ar: 'AG⃗ = 5 AB⃗', biof: 'AG⃗ = 5 AB⃗' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'وزن النقطة B هو β = 3 ومجموع الوزنين هو α + β = 2 + 3 = 5.',
      biof: 'Le poids de B est β = 3 et la somme des poids est α + β = 2 + 3 = 5.'
    },
    explanation: {
      ar: 'لدينا 2GA⃗ + 3GB⃗ = 0⃗. بإدخال النقطة A بعلاقة شال: 2GA⃗ + 3(GA⃗ + AB⃗) = 0⃗ ⟺ 5GA⃗ + 3AB⃗ = 0⃗ ⟺ AG⃗ = (3/5) AB⃗.',
      biof: 'En introduisant A par la relation de Chasles dans 2GA⃗ + 3GB⃗ = 0⃗, on obtient 5GA⃗ + 3AB⃗ = 0⃗, soit AG⃗ = (3/5) AB⃗.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: هذه الخاصية هي التي تمكننا من إنشاء نقطة المرجح G هندسياً بتقسيم القطعة [AB] إلى 5 أجزاء متقايسة.',
      biof: 'Conseil de l\'Inspecteur : Cette propriété permet de construire géométriquement le barycentre G sur la droite (AB).'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-2bac-prop-01',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'تطبيق خاصيات اللوغاريتم النبيري الجبرية', biof: 'Propriétés Algébriques du Logarithme Népérien (ln)' },
    statement: {
      ar: 'بتطبيق خاصيات الدالة اللوغاريتمية النبيرية ln(ab) = ln(a) + ln(b) و ln(a^n) = n ln(a)، بسط العدد الحقيقي التالي:',
      biof: 'En appliquant les propriétés algébriques du logarithme népérien, simplifier le nombre réel suivant :'
    },
    formula: 'A = \\ln(e^3) + \\ln\\left(\\frac{1}{e^2}\\right) + 2\\ln(\\sqrt{e})',
    options: [
      { ar: 'A = 2', biof: 'A = 2' },
      { ar: 'A = 1', biof: 'A = 1' },
      { ar: 'A = 6', biof: 'A = 6' },
      { ar: 'A = 0', biof: 'A = 0' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'تذكر أن ln(e^n) = n و ln(1/e²) = -2 و ln(√e) = 1/2.',
      biof: 'Rappelez-vous que ln(e^n) = n, ln(1/e²) = -2 et ln(√e) = 1/2.'
    },
    explanation: {
      ar: 'لدينا ln(e³) = 3، و ln(1/e²) = -ln(e²) = -2، و 2 ln(√e) = 2 × (1/2) ln(e) = 1.\nإذن A = 3 - 2 + 1 = 2.',
      biof: 'On a ln(e³) = 3, ln(1/e²) = -2 et 2 ln(√e) = 2 × (1/2) = 1.\nPar conséquent A = 3 - 2 + 1 = 2.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: إتقان الخاصيات الجبرية لـ ln و exp ضروري لتبسيط التعابير وحل المعادلات قبل دراسة تغيرات الدالة في الامتحان الوطني.',
      biof: 'Conseil de l\'Inspecteur : Les propriétés algébriques de ln permettent de simplifier les expressions avant toute dérivation ou calcul de limite.'
    },
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'q-2bac-prop-02',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'تطبيق خاصيات المعيار والعمدة وصيغة موافر (Moivre)', biof: 'Propriétés du Module, Argument & Formule de Moivre' },
    statement: {
      ar: 'نعتبر العدد العقدي z = 1 + i√3. بتطبيق خاصيات الشكل المثلثي وصيغة موافر (z^n)، ما هي القيمة الجبرية للعدد z⁶؟',
      biof: 'On considère le nombre complexe z = 1 + i√3. En appliquant la forme trigonométrique et la formule de Moivre, quelle est la valeur algébrique de z⁶ ?'
    },
    formula: 'z = 2\\left(\\cos\\frac{\\pi}{3} + i\\sin\\frac{\\pi}{3}\\right) \\implies z^6 = 2^6 e^{i 6 \\frac{\\pi}{3}}',
    options: [
      { ar: 'z⁶ = 64', biof: 'z⁶ = 64' },
      { ar: 'z⁶ = -64', biof: 'z⁶ = -64' },
      { ar: 'z⁶ = 64 i', biof: 'z⁶ = 64 i' },
      { ar: 'z⁶ = 12', biof: 'z⁶ = 12' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'معيار z هو |z| = 2 وعمدته π/3. إذن |z⁶| = 2⁶ = 64 وعمدته 6 × (π/3) = 2π.',
      biof: 'Le module de z est 2 et son argument est π/3. Ainsi |z⁶| = 2⁶ = 64 et arg(z⁶) ≡ 6(π/3) = 2π.'
    },
    explanation: {
      ar: 'نكتب z على الشكل المثلثي: |z| = √(1 + 3) = 2 و z = 2 e^(iπ/3).\nبتطبيق خاصية القوى: z⁶ = 2⁶ e^(i 6π/3) = 64 e^(i 2π) = 64(cos 2π + i sin 2π) = 64.',
      biof: 'On a |z| = 2 et z = 2 e^(iπ/3). Par propriété : z⁶ = 2⁶ e^(i 2π) = 64 × 1 = 64 (z⁶ est un réel strictement positif).'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: عندما يُطلب حساب قوة عالية لعدد عقدي (مثل z⁶ أو z²⁰²⁶)، مرّ دائماً عبر الشكل المثلثي أو الأسي ولا تنشر جبرياً!',
      biof: 'Conseil de l\'Inspecteur : Pour calculer une puissance élevée d\'un complexe, passez systématiquement par la forme exponentielle.'
    },
    points: 25,
    difficulty: 'medium'
  },
  {
    id: 'q-2bac-prop-03',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'تطبيق خاصية خطية التكامل والدوال الأصلية الاعتيادية', biof: 'Propriété de Linéarité de l\'Intégrale & Primitives' },
    statement: {
      ar: 'بتطبيق خاصية الدوال الأصلية وخطية التكامل، احسب قيمة التكامل التالي:',
      biof: 'En appliquant les propriétés des primitives usuelles et la linéarité de l\'intégrale, calculer :'
    },
    formula: 'I = \\int_0^1 (3x^2 + 2e^x) \\, dx',
    options: [
      { ar: 'I = 2e - 1', biof: 'I = 2e - 1' },
      { ar: 'I = 2e + 1', biof: 'I = 2e + 1' },
      { ar: 'I = 2e', biof: 'I = 2e' },
      { ar: 'I = e² - 1', biof: 'I = e² - 1' }
    ],
    correctIndex: 0,
    hint: {
      ar: 'دالة أصلية لـ 3x² هي x³، ودالة أصلية لـ 2e^x هي 2e^x.',
      biof: 'Une primitive de 3x² est x³, et une primitive de 2e^x est 2e^x.'
    },
    explanation: {
      ar: 'الدالة الأصلية لـ f(x) = 3x² + 2e^x على [0, 1] هي F(x) = x³ + 2e^x.\nومنه I = F(1) - F(0) = (1³ + 2e¹) - (0³ + 2e⁰) = (1 + 2e) - (0 + 2) = 2e - 1.',
      biof: 'Une primitive est F(x) = x³ + 2e^x. Ainsi I = F(1) - F(0) = (1 + 2e) - (0 + 2×1) = 2e - 1.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: انتبه دائماً عند التعويض بـ x = 0 لأن e⁰ = 1 وليس 0! هذا خطأ شائع يضيع نقاطاً ثمينة في الامتحان الوطني.',
      biof: 'Conseil de l\'Inspecteur : Attention à la borne 0 : e⁰ = 1 et non 0 ! C\'est l\'oubli le plus fréquent au Baccalauréat.'
    },
    points: 25,
    difficulty: 'medium'
  },
  // ==========================================================
  // ROADMAP PHASE 1: Curriculum Balance Expansion (1AC, 2AC, TC, 1Bac Lit/Eco)
  // ==========================================================
  {
    id: 'q-1ac-08',
    levelId: '1ac',
    streams: ['general'],
    domain: 'analysis_functions',
    competency: 'problem_solving',
    title: { ar: 'معامل التناسبية والرابع المتناسب', biof: 'Coefficient de Proportionnalité & Quatrième Proportionnelle' },
    statement: {
      ar: 'تستهلك سيارة 6 لترات من الوقود لقطع مسافة 100 km بسرعة ثابتة. ما هي المسافة x التي تقطعها هذه السيارة بكمية 15 لتراً من الوقود؟',
      biof: 'Une voiture consomme 6 L de carburant pour parcourir 100 km. Quelle distance x parcourt-elle avec 15 L de carburant ?'
    },
    formula: '\\frac{6}{100} = \\frac{15}{x} \\iff x = \\frac{15 \\times 100}{6}',
    options: [
      { ar: '250 km', biof: '250 km' },
      { ar: '200 km', biof: '200 km' },
      { ar: '180 km', biof: '180 km' },
      { ar: '225 km', biof: '225 km' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'بما أن الوضعية تناسبية فإن الجداءين المتصالبين متساويان: 6 × x = 15 × 100 = 1500، ومنه x = 1500 ÷ 6 = 250 km.',
      biof: 'Par produit en croix dans un tableau de proportionnalité : x = (15 × 100) / 6 = 1500 / 6 = 250 km.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: التناسبية في الأولى إعدادي هي المدخل الأساسي لمفهوم الدالة الخطية في السنوات اللاحقة.',
      biof: 'Conseil de l\'Inspecteur : La proportionnalité en 1AC prépare directement la notion de fonction linéaire.'
    },
    points: 20,
    difficulty: 'hard'
  },
  {
    id: 'q-2ac-07',
    levelId: '2ac',
    streams: ['general'],
    domain: 'analysis_functions',
    competency: 'application',
    title: { ar: 'التناسبية والدالة الخطية في وضعيات فيزيائية', biof: 'Proportionnalité & Relation Linéaire (Vitesse Moyenne)' },
    statement: {
      ar: 'تعطى المسافة المقطوعة d(t) بدلالة الزمن t (بالساعات) بالعلاقة الخطية d(t) = 80t. ما هي المدة الزمنية اللازمة لقطع 200 km؟',
      biof: 'La distance parcourue d(t) en fonction du temps t (en heures) est donnée par d(t) = 80t. Quel temps faut-il pour parcourir 200 km ?'
    },
    formula: 'd(t) = 80t = 200 \\implies t = \\frac{200}{80}',
    options: [
      { ar: 't = 2.5 h (ساعتان و 30 دقيقة)', biof: 't = 2.5 h (2h 30min)' },
      { ar: 't = 2.3 h', biof: 't = 2.3 h' },
      { ar: 't = 3 h', biof: 't = 3 h' },
      { ar: 't = 2 h 50 min', biof: 't = 2 h 50 min' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نحل المعادلة 80t = 200 فنجد t = 200/80 = 5/2 = 2.5 ساعة، أي ساعتين ونصف (2h 30min).',
      biof: 'On a t = 200 / 80 = 2.5 heures. Attention : 0.5 heure correspond à 30 minutes et non 50 minutes.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: احذر من الخطأ الكلاسيكي: 2.5 ساعة تعني ساعتين و30 دقيقة وليست ساعتين و50 دقيقة.',
      biof: 'Conseil de l\'Inspecteur : Ne confondez pas l\'écriture décimale du temps (2.5 h) et l\'écriture sexagésimale (2h 30min).'
    },
    points: 15,
    difficulty: 'medium'
  },
  {
    id: 'q-2ac-08',
    levelId: '2ac',
    streams: ['general'],
    domain: 'probability_stats',
    competency: 'problem_solving',
    title: { ar: 'المعدل الحسابي والتردد في متسلسلة إحصائية', biof: 'Moyenne Pondérée & Fréquence Statistique' },
    statement: {
      ar: 'في فرض محروس للرياضيات، حصل 4 تلاميذ على نقطة 10، و6 تلاميذ على نقطة 15، وتلميذان (2) على نقطة 18. ما هو المعدل الحسابي m لهذا الفوج؟',
      biof: 'Lors d\'un devoir : 4 élèves ont eu 10, 6 élèves ont eu 15, et 2 élèves ont eu 18. Quelle est la moyenne pondérée m de ce groupe ?'
    },
    formula: 'm = \\frac{4 \\times 10 + 6 \\times 15 + 2 \\times 18}{4 + 6 + 2}',
    options: [
      { ar: 'm ≈ 13.83', biof: 'm ≈ 13.83' },
      { ar: 'm = 14.33', biof: 'm = 14.33' },
      { ar: 'm = 15', biof: 'm = 15' },
      { ar: 'm = 12.5', biof: 'm = 12.5' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'الحصيص الإجمالي هو N = 4 + 6 + 2 = 12.\nمجموع جداءات القيم في الحصيصات: 40 + 90 + 36 = 166.\nإذن المعدل m = 166 / 12 ≈ 13.83.',
      biof: 'L\'effectif total est N = 12. La somme pondérée vaut 40 + 90 + 36 = 166. Donc m = 166 / 12 ≈ 13.83.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: عند حساب المعدل الحسابي، نقسم دائماً على الحصيص الإجمالي N وليس على عدد القيم (3)!',
      biof: 'Conseil de l\'Inspecteur : Divisez toujours par l\'effectif total N (12) et jamais par le nombre de colonnes (3).'
    },
    points: 20,
    difficulty: 'hard'
  },
  {
    id: 'q-tc-08',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'probability_stats',
    competency: 'application',
    title: { ar: 'الإحصاء الوصفي: القيمة الوسطية والمعدل الحسابي', biof: 'Statistique Descriptive : Médiane & Moyenne' },
    statement: {
      ar: 'نعتبر المتسلسلة الإحصائية المرتبة التالية لـ 7 قيم: 8 , 10 , 11 , 13 , 15 , 16 , 25. ما هي القيمة الوسطية Me لهذه المتسلسلة؟',
      biof: 'Soit la série statistique ordonnée de 7 valeurs : 8 , 10 , 11 , 13 , 15 , 16 , 25. Quelle est la médiane Me de cette série ?'
    },
    formula: 'N = 7 \\; (\\text{impair}) \\implies \\text{Rang}(M_e) = \\frac{7 + 1}{2} = 4',
    options: [
      { ar: 'Me = 13', biof: 'Me = 13' },
      { ar: 'Me = 14', biof: 'Me = 14' },
      { ar: 'Me = 11', biof: 'Me = 11' },
      { ar: 'Me = 15', biof: 'Me = 15' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'بما أن القيم مرتبة تزايدياً والحصيص الإجمالي N = 7 فردي، فإن القيمة الوسطية هي القيمة التي تتوسط المتسلسلة (الرتبة الرابعة)، وهي Me = 13.',
      biof: 'La série étant triée par ordre croissant avec N = 7 impair, la médiane est la 4ème valeur centrale : Me = 13.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تأكد دائماً من ترتيب قيم المتسلسلة الإحصائية تزايدياً قبل استخراج القيمة الوسطية Me.',
      biof: 'Conseil de l\'Inspecteur : Vérifiez systématiquement que les valeurs sont triées par ordre croissant avant de déterminer la médiane.'
    },
    points: 15,
    difficulty: 'easy'
  },
  {
    id: 'q-tc-09',
    levelId: 'tc',
    streams: ['tc_sciences'],
    domain: 'arithmetic_algebra',
    competency: 'problem_solving',
    title: { ar: 'المعادلات البارامترية من الدرجة الثانية ومميزها Δ', biof: 'Équation Paramétrique du Second Degré & Discriminant Δ' },
    statement: {
      ar: 'نعتبر في ℝ المعادلة (E_m): x² - 4x + m = 0 حيث m بارامتر حقيقي. ما هي قيمة m التي تقبل من أجلها المعادلة حلاً مزدوجاً وحيداً؟',
      biof: 'Soit dans ℝ l\'équation (E_m) : x² - 4x + m = 0 où m ∈ ℝ. Pour quelle valeur de m l\'équation admet-elle une racine double unique ?'
    },
    formula: '\\Delta = (-4)^2 - 4(1)(m) = 16 - 4m = 0',
    options: [
      { ar: 'm = 4', biof: 'm = 4' },
      { ar: 'm = -4', biof: 'm = -4' },
      { ar: 'm = 2', biof: 'm = 2' },
      { ar: 'm = 16', biof: 'm = 16' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'تقبل المعادلة من الدرجة الثانية حلاً مزدوجاً إذا وفقط إذا كان المميز Δ = 0.\nلدينا Δ = 16 - 4m = 0 ⟺ 4m = 16 ⟺ m = 4 (وعندها تصبح المعادلة (x - 2)² = 0).',
      biof: 'Une équation du second degré admet une solution double ssi Δ = 0, soit 16 - 4m = 0 ⟺ m = 4.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: دراسة إشارة المميز Δ بدلالة البارامتر m هي مهارة أساسية للانتقال السلس نحو الأولى باكالوريا.',
      biof: 'Conseil de l\'Inspecteur : La discussion suivant le signe de Δ en fonction d\'un paramètre m est un classique incontournable du Tronc Commun.'
    },
    points: 25,
    difficulty: 'hard'
  },
  {
    id: 'q-1bac-lit-01',
    levelId: '1bac',
    streams: ['1bac_lit', '1bac_eco'],
    domain: 'arithmetic_algebra',
    competency: 'application',
    title: { ar: 'المتتاليات الهندسية وتطبيقاتها في الامتحان الجهوي', biof: 'Suites Géométriques (Examen Régional 1Bac)' },
    statement: {
      ar: 'لتكن (v_n) متتالية هندسية حدها الأول v₀ = 3 وأساسها q = 2. ما هي قيمة الحد العام v₄؟',
      biof: 'Soit (v_n) une suite géométrique de premier terme v₀ = 3 et de raison q = 2. Quelle est la valeur du terme v₄ ?'
    },
    formula: 'v_n = v_0 \\times q^n \\implies v_4 = 3 \\times 2^4',
    options: [
      { ar: 'v₄ = 48', biof: 'v₄ = 48' },
      { ar: 'v₄ = 24', biof: 'v₄ = 24' },
      { ar: 'v₄ = 11', biof: 'v₄ = 11' },
      { ar: 'v₄ = 32', biof: 'v₄ = 32' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صيغة الحد العام لمتتالية هندسية هي v_n = v₀ × q^n.\nبالتعويض بـ n = 4 نجد: v₄ = 3 × 2⁴ = 3 × 16 = 48.',
      biof: 'Par la formule du terme général d\'une suite géométrique : v₄ = v₀ × q⁴ = 3 × 16 = 48.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش (الامتحان الجهوي 1Bac): لا تخلط بين المتتالية الحسابية (u_n = u₀ + nr) والمتتالية الهندسية (v_n = v₀ × q^n).',
      biof: 'Conseil de l\'Inspecteur (Régional 1Bac) : Ne confondez pas la formule arithmétique (addition) et géométrique (puissance).'
    },
    points: 20,
    difficulty: 'easy'
  },
  {
    id: 'q-1bac-lit-02',
    levelId: '1bac',
    streams: ['1bac_lit', '1bac_eco'],
    domain: 'probability_stats',
    competency: 'problem_solving',
    title: { ar: 'التعداد: التأليفات والسحب الآني C_n^p', biof: 'Dénombrement : Tirage Simultané & Combinaisons C_n^p' },
    statement: {
      ar: 'يحتوي صندوق على 6 كرات مرقمة. نسحب تآنياً (في آن واحد) كرتين من الصندوق. ما هو عدد السحبات الممكنة C₆²؟',
      biof: 'Une urne contient 6 boules. On tire simultanément 2 boules. Quel est le nombre de tirages possibles C₆² ?'
    },
    formula: 'C_6^2 = \\frac{6 \\times 5}{2 \\times 1}',
    options: [
      { ar: '15 سحبة ممكنة', biof: '15 tirages possibles' },
      { ar: '30 سحبة ممكنة', biof: '30 tirages possibles' },
      { ar: '12 سحبة ممكنة', biof: '12 tirages possibles' },
      { ar: '36 سحبة ممكنة', biof: '36 tirages possibles' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'بما أن السحب يتم «في آن واحد» (تآنياً)، فلا أهمية للترتيب ولا يوجد إحلال، لذا نستعمل التأليفات:\nC₆² = (6 × 5) / (2 × 1) = 30 / 2 = 15.',
      biof: 'Le tirage étant simultané (sans ordre et sans remise), on utilise les combinaisons : C₆² = (6 × 5) / 2 = 15.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: كلمة «تآنياً / في آن واحد» في الامتحان الجهوي تعني دائماً استعمال التأليفات C_n^p.',
      biof: 'Conseil de l\'Inspecteur : Le mot-clé « simultanément » au Régional indique toujours l\'usage des combinaisons C_n^p.'
    },
    points: 20,
    difficulty: 'medium'
  },
  {
    id: 'q-1bac-lit-03',
    levelId: '1bac',
    streams: ['1bac_lit', '1bac_eco', '1bac_se', '1bac_sm'],
    domain: 'analysis_functions',
    competency: 'reasoning',
    title: { ar: 'نهاية دالة جذرية عند اللانهاية ومعادلة المقارب الأفقي', biof: 'Limite d\'une Fonction Rationnelle & Asymptote Horizontale' },
    statement: {
      ar: 'لتكن الدالة f(x) = (4x - 1) / (2x + 3). احسب نهاية f(x) عندما يؤول x إلى +∞ واستنتج معادلة المقارب الأفقي:',
      biof: 'Soit f(x) = (4x - 1) / (2x + 3). Calculer lim_{x→+∞} f(x) et en déduire l\'asymptote horizontale :'
    },
    formula: '\\lim_{x \\to +\\infty} \\frac{4x - 1}{2x + 3} = \\lim_{x \\to +\\infty} \\frac{4x}{2x}',
    options: [
      { ar: 'النهاية هي 2 والمقارب الأفقي y = 2', biof: 'Limite = 2 ; Asymptote y = 2' },
      { ar: 'النهاية هي -1/3 والمقارب y = -1/3', biof: 'Limite = -1/3 ; Asymptote y = -1/3' },
      { ar: 'النهاية هي +∞ ولا يوجد مقارب أفقي', biof: 'Limite = +∞ ; Pas d\'asymptote' },
      { ar: 'النهاية هي 4 والمقارب الأفقي x = 2', biof: 'Limite = 4 ; Asymptote x = 2' }
    ],
    correctIndex: 0,
    explanation: {
      ar: 'نهاية دالة جذرية عند +∞ هي نهاية خارج الحدين الأعلى درجة:\nlim (4x / 2x) = 4/2 = 2.\nبما أن النهاية عند +∞ تساوي عدداً منتهياً b = 2، فإن المنحنى يقبل مقارباً أفقياً معادلته y = 2.',
      biof: 'En +∞, la limite d\'une fonction rationnelle est celle du quotient des termes de plus haut degré : lim (4x/2x) = 2, d\'où l\'asymptote horizontale d\'équation y = 2.'
    },
    inspectorTip: {
      ar: 'توجيه المفتش: لا تخلط بين معادلة المقارب الأفقي (y = b) ومعادلة المقارب العمودي (x = a).',
      biof: 'Conseil de l\'Inspecteur : Ne confondez jamais l\'asymptote horizontale (y = b) et l\'asymptote verticale (x = a).'
    },
    points: 20,
    difficulty: 'medium'
  }
];



