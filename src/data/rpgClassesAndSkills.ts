import { PlayerClassConfig, SkillNode, LevelId } from '../types/curriculum';

export const PLAYER_CLASSES: PlayerClassConfig[] = [
  {
    id: 'algebraist',
    name: { ar: 'فارس الجبر (L\'Algébriste)', biof: 'L\'Algébriste' },
    title: { ar: 'سيد الحساب والمعادلات والنظمات', biof: 'Maître du Calcul & des Équations' },
    icon: '⚡',
    perk: {
      ar: 'مضاعف +20% XP في مجال الحساب والجبر وسرعة بديهة في المتطابقات',
      biof: 'Bonus +20% XP en Arithmétique & Algèbre et calcul rapide'
    },
    bonusDomain: 'arithmetic_algebra',
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'geometer',
    name: { ar: 'مهندس الفضاء (Le Géomètre)', biof: 'Le Géomètre' },
    title: { ar: 'خبير المبرهنات والهندسة الفضائية والمثلثات', biof: 'Expert des Théorèmes & de l\'Espace' },
    icon: '📐',
    perk: {
      ar: 'مضاعف +20% XP في الهندسة والحساب المثلثي مع تلميحات شكلية دقيقة',
      biof: 'Bonus +20% XP en Géométrie & Trigonométrie avec indices visuels'
    },
    bonusDomain: 'geometry_trig',
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'analyst',
    name: { ar: 'مستكشف الدوال (L\'Analyste)', biof: 'L\'Analyste' },
    title: { ar: 'مروض النهايات والاشتقاق والتكامل', biof: 'Dompteur des Limites & Intégrales' },
    icon: '📈',
    perk: {
      ar: 'مضاعف +20% XP في التحليل ودراسة الدوال مع كشف خطوات المشتقة',
      biof: 'Bonus +20% XP en Analyse & Fonctions avec décomposition'
    },
    bonusDomain: 'analysis_functions',
    color: 'from-indigo-600 to-blue-700'
  },
  {
    id: 'statistician',
    name: { ar: 'حكيم الاحتمالات (Le Statisticien)', biof: 'Le Statisticien' },
    title: { ar: 'عبقري التعداد والإحصاء والمتغيرات العشوائية', biof: 'Génie du Dénombrement & Aléatoire' },
    icon: '🎲',
    perk: {
      ar: 'مضاعف +20% XP في الاحتمالات مع إمكانية تحييد خيار خاطئ في التحديات',
      biof: 'Bonus +20% XP en Probabilités & Statistiques'
    },
    bonusDomain: 'probability_stats',
    color: 'from-purple-600 to-fuchsia-700'
  }
];

export const SKILL_TREE_DATABASE: SkillNode[] = [
  // ================= 2BAC (Deuxième Baccalauréat) =================
  {
    id: 'skill-2bac-limits',
    levelId: '2bac',
    domain: 'analysis_functions',
    title: { ar: 'النهايات والاتصال', biof: 'Limites et Continuité' },
    description: {
      ar: 'الاتصال في نقطة وعلى مجال، مبرهنة القيم الوسيطية (TVI)، وطرق إزالة الأشكال غير المحددة.',
      biof: 'Continuité ponctuelle, Théorème des Valeurs Intermédiaires (TVI) et formes indéterminées.'
    },
    prerequisites: [],
    icon: '🎯',
    minMasteryStars: 0,
    formulaSample: '\\lim_{x \\to x_0} f(x) = f(x_0)'
  },
  {
    id: 'skill-2bac-derivation',
    levelId: '2bac',
    domain: 'analysis_functions',
    title: { ar: 'الاشتقاق ودراسة الدوال', biof: 'Dérivation & Étude de Fonctions' },
    description: {
      ar: 'حساب المشتقات الاعتيادية، دراسة الرتابة وجدول التغيرات، وتحديد الفروع اللانهائية والمماسات.',
      biof: 'Calcul dérivé, monotonie, branches infinies, concavité et points d\'inflexion.'
    },
    prerequisites: ['skill-2bac-limits'],
    icon: '📈',
    minMasteryStars: 1,
    formulaSample: 'f\'(x_0) = \\lim_{x \\to x_0} \\frac{f(x) - f(x_0)}{x - x_0}'
  },
  {
    id: 'skill-2bac-ln',
    levelId: '2bac',
    domain: 'analysis_functions',
    title: { ar: 'الدالة اللوغاريتمية النبيرية', biof: 'Fonction Logarithme Népérien (ln)' },
    description: {
      ar: 'الخاصيات الجبرية للوغاريتم، النهايات الأساسية، حل المعادلات والمتراجحات، ودراسة الدوال المركبة.',
      biof: 'Propriétés algébriques, limites usuelles, équations ln(x)=k et étude des composées.'
    },
    prerequisites: ['skill-2bac-derivation'],
    icon: '🌿',
    minMasteryStars: 1,
    formulaSample: '\\ln(ab) = \\ln(a) + \\ln(b) \\quad ; \\quad (\\ln u)\' = \\frac{u\'}{u}'
  },
  {
    id: 'skill-2bac-exp',
    levelId: '2bac',
    domain: 'analysis_functions',
    title: { ar: 'الدالة الأسية النبيرية', biof: 'Fonction Exponentielle (exp)' },
    description: {
      ar: 'الدالة العكسية لـ ln، النهايات الاعتيادية للنمو المقارن، وحل المسائل المرتبطة بالدالة الأسية.',
      biof: 'Bijection réciproque de ln, croissances comparées, limites et étude globale.'
    },
    prerequisites: ['skill-2bac-ln'],
    icon: '⚡',
    minMasteryStars: 1,
    formulaSample: 'e^{x+y} = e^x \\cdot e^y \\quad ; \\quad \\lim_{x \\to +\\infty} \\frac{e^x}{x^n} = +\\infty'
  },
  {
    id: 'skill-2bac-integrals',
    levelId: '2bac',
    domain: 'analysis_functions',
    title: { ar: 'حساب التكامل والدوال الأصلية', biof: 'Calcul Intégral & Primitives' },
    description: {
      ar: 'تقنيات المكاملة بالأجزاء (IPP)، خطية التكامل، وحساب المساحات وحجوم مجسمات الدوران.',
      biof: 'Intégration par parties, linéarité, calcul d\'aires sous courbes et volumes.'
    },
    prerequisites: ['skill-2bac-exp'],
    icon: '∫',
    minMasteryStars: 1,
    formulaSample: '\\int_a^b u\'(x) v(x) dx = [u(x)v(x)]_a^b - \\int_a^b u(x) v\'(x) dx'
  },
  {
    id: 'skill-2bac-complex',
    levelId: '2bac',
    domain: 'arithmetic_algebra',
    title: { ar: 'الأعداد العقدية في الامتحان الوطني', biof: 'Nombres Complexes' },
    description: {
      ar: 'الشكل الجبري والمثلثي والأسي، معادلات الدرجة الثانية في ℂ، والتحويلات الهندسية (الدوران والإزاحة).',
      biof: 'Forme algébrique, trigonométrique, formule de Moivre et transformations du plan.'
    },
    prerequisites: [],
    icon: '🔮',
    minMasteryStars: 0,
    formulaSample: 'z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}'
  },
  {
    id: 'skill-2bac-spatial',
    levelId: '2bac',
    domain: 'geometry_trig',
    title: { ar: 'الهندسة الفضائية والجداء المتجهي', biof: 'Géométrie dans l\'Espace' },
    description: {
      ar: 'معادلة الفلكة، المستوى المماس، تقاطع مستو وفلكة، والجداء المتجهي والمساحات في الفضاء.',
      biof: 'Équation de la sphère, plan tangent, produit vectoriel et orthogonalité spatiale.'
    },
    prerequisites: [],
    icon: '🪐',
    minMasteryStars: 0,
    formulaSample: '(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2'
  },
  {
    id: 'skill-2bac-probabilities',
    levelId: '2bac',
    domain: 'probability_stats',
    title: { ar: 'الاحتمالات والمتغيرات العشوائية', biof: 'Probabilités & Variables Aléatoires' },
    description: {
      ar: 'تقنيات السحب (تأليفات، ترتيبات، تكرار)، الاحتمال الشرطي، قانون برنولي، وقانون الاحتمال.',
      biof: 'Tirages combinatoires, probabilité conditionnelle, loi binomiale et espérance.'
    },
    prerequisites: [],
    icon: '🎲',
    minMasteryStars: 0,
    formulaSample: 'P(A \\cap B) = P(A) \\times P_A(B) \\quad ; \\quad C_n^k = \\frac{n!}{k!(n-k)!}'
  },

  // ================= 1BAC (Première Baccalauréat) =================
  {
    id: 'skill-1bac-logic',
    levelId: '1bac',
    domain: 'arithmetic_algebra',
    title: { ar: 'مبادئ في المنطق الرياضي', biof: 'Notions de Logique' },
    description: {
      ar: 'الاستدلال بالترجع، الاستدلال بالخلف، الاستلزام العكسي، وفصل الحالات.',
      biof: 'Raisonnement par récurrence, par l\'absurde, contraposée et disjonction de cas.'
    },
    prerequisites: [],
    icon: '🧠',
    minMasteryStars: 0,
    formulaSample: 'P \\implies Q \\iff \\overline{Q} \\implies \\overline{P}'
  },
  {
    id: 'skill-1bac-suites',
    levelId: '1bac',
    domain: 'analysis_functions',
    title: { ar: 'المتتاليات العددية', biof: 'Suites Numériques' },
    description: {
      ar: 'المتتاليات الحسابية والهندسية، الحد العام، مجموع الحدود، ورتابة المتتاليات.',
      biof: 'Suites arithmétiques, géométriques, somme de termes et monotonie.'
    },
    prerequisites: ['skill-1bac-logic'],
    icon: '🪜',
    minMasteryStars: 1,
    formulaSample: 'u_n = u_p + (n-p)r \\quad ; \\quad v_n = v_p \\cdot q^{n-p}'
  },
  {
    id: 'skill-1bac-barycentre',
    levelId: '1bac',
    domain: 'geometry_trig',
    title: { ar: 'المرجح في المستوى والجداء السلمي', biof: 'Barycentre & Produit Scalaire' },
    description: {
      ar: 'مرجح نقطتين وثلاث نقط، الخاصية المميزة، ومبرهنة الكاشي (Al-Kashi).',
      biof: 'Barycentre de points pondérés, théorème d\'Al-Kashi et relations métriques.'
    },
    prerequisites: [],
    icon: '⚖️',
    minMasteryStars: 0,
    formulaSample: '\\overrightarrow{AG} = \\frac{\\beta}{\\alpha + \\beta} \\overrightarrow{AB}'
  },

  // ================= 3AC (Troisième Année Collège) =================
  {
    id: 'skill-3ac-thales',
    levelId: '3ac',
    domain: 'geometry_trig',
    title: { ar: 'مبرهنة طاليس المباشرة والعكسية', biof: 'Théorème de Thalès' },
    description: {
      ar: 'حساب الأطوال وإثبات توازي المستقيمات في الوضعيتين المألوفتين (المثلث وشكل الفراشة).',
      biof: 'Calcul de longueurs et démonstration du parallélisme dans le triangle et configuration sablier.'
    },
    prerequisites: [],
    icon: '📐',
    minMasteryStars: 0,
    formulaSample: '\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}'
  },
  {
    id: 'skill-3ac-pythagore-trig',
    levelId: '3ac',
    domain: 'geometry_trig',
    title: { ar: 'فيثاغورس والحساب المثلثي', biof: 'Pythagore & Trigonométrie' },
    description: {
      ar: 'مبرهنة فيثاغورس، جيب وجيب تمام وظل زاوية حادة، والعلاقة الأساسية cos²x + sin²x = 1.',
      biof: 'Théorème de Pythagore, cos, sin, tan et la relation fondamentale de trigonométrie.'
    },
    prerequisites: ['skill-3ac-thales'],
    icon: '📐',
    minMasteryStars: 1,
    formulaSample: 'BC^2 = AB^2 + AC^2 \\quad ; \\quad \\cos^2(x) + \\sin^2(x) = 1'
  },
  {
    id: 'skill-3ac-equations-systems',
    levelId: '3ac',
    domain: 'arithmetic_algebra',
    title: { ar: 'المعادلات والمتراجحات والنظمات', biof: 'Équations & Systèmes' },
    description: {
      ar: 'حل معادلات الجداء المنعدم، نظمة معادلتين بالتعويض والتأليفية الخطية، وحل المسائل الواقعية.',
      biof: 'Équations produits, résolution de systèmes 2x2 par substitution et combinaison, problèmes.'
    },
    prerequisites: [],
    icon: '⚖️',
    minMasteryStars: 0,
    formulaSample: 'ax + by = c \\quad ; \\quad a\'x + b\'y = c\''
  },
  {
    id: 'skill-3ac-affine-functions',
    levelId: '3ac',
    domain: 'analysis_functions',
    title: { ar: 'الدوال الخطية والدوال التآلفية', biof: 'Fonctions Linéaires & Affines' },
    description: {
      ar: 'تحديد معامل الدالة، التمثيل المبياني في معلم متعامد ممنظم، وتأويل المعامل الموجه.',
      biof: 'Détermination du coefficient directeur, représentation graphique et lecture d\'images.'
    },
    prerequisites: ['skill-3ac-equations-systems'],
    icon: '📈',
    minMasteryStars: 1,
    formulaSample: 'f(x) = ax + b \\quad ; \\quad a = \\frac{f(x_2)-f(x_1)}{x_2-x_1}'
  },

  // ================= TC (Tronc Commun Scientifique) =================
  {
    id: 'skill-tc-arithmetique',
    levelId: 'tc',
    domain: 'arithmetic_algebra',
    title: { ar: 'الحسابيات في المجموعة ℕ', biof: 'Arithmétique dans ℕ' },
    description: {
      ar: 'الأعداد الزوجية والفردية، الأعداد الأولية، التفكيك إلى جداء عوامل أولية، القاسم المشترك الأكبر والمضاعف المشترك الأصغر.',
      biof: 'Parité, nombres premiers, décomposition en facteurs premiers, PGCD et PPCM.'
    },
    prerequisites: [],
    icon: '🔢',
    minMasteryStars: 0,
    formulaSample: 'a \\times b = \\text{PGCD}(a,b) \\times \\text{PPCM}(a,b)'
  },
  {
    id: 'skill-tc-ordre',
    levelId: 'tc',
    domain: 'arithmetic_algebra',
    title: { ar: 'الترتيب في المجموعة ℝ والمجالات', biof: 'Ordre dans ℝ & Intervalles' },
    description: {
      ar: 'التأطير، القيمة المطلقة، المسافة على المستقيم العددي، والتقريبات العشرية.',
      biof: 'Encadrement, valeur absolue, distance sur la droite numérique et approximations.'
    },
    prerequisites: ['skill-tc-arithmetique'],
    icon: '📏',
    minMasteryStars: 1,
    formulaSample: '|x - a| \\le r \\iff a - r \\le x \\le a + r'
  },
  {
    id: 'skill-tc-vecteurs-droite',
    levelId: 'tc',
    domain: 'geometry_trig',
    title: { ar: 'الحساب المتجهي والمستقيم في المستوى', biof: 'Calcul Vectoriel & Droite dans le Plan' },
    description: {
      ar: 'الاستقامية، محددة متجهتين، المعادلة الديكارتية والتمثيل البارامتري لمستقيم.',
      biof: 'Colinéarité, déterminant de deux vecteurs, équation cartésienne et représentation paramétrique.'
    },
    prerequisites: [],
    icon: '🧭',
    minMasteryStars: 0,
    formulaSample: '\\det(\\vec{u}, \\vec{v}) = xy\' - x\'y = 0'
  },
  {
    id: 'skill-tc-fonctions-gen',
    levelId: 'tc',
    domain: 'analysis_functions',
    title: { ar: 'عموميات حول الدوال العددية', biof: 'Généralités sur les Fonctions' },
    description: {
      ar: 'مجموعة التعريف، زوجية دالة، معدل التغير، الرتابة ومطارف دالة والجمجمة (القطع المكافئ والهذلول).',
      biof: 'Ensemble de définition, parité, taux de variation, extremums, parabole et hyperbole.'
    },
    prerequisites: ['skill-tc-ordre'],
    icon: '📊',
    minMasteryStars: 1,
    formulaSample: 'T(x_1, x_2) = \\frac{f(x_1) - f(x_2)}{x_1 - x_2}'
  },

  // ================= 2AC (Deuxième Année Collège) =================
  {
    id: 'skill-2ac-rationnels',
    levelId: '2ac',
    domain: 'arithmetic_algebra',
    title: { ar: 'الأعداد الجذرية: العمليات والقوى', biof: 'Nombres Rationnels & Puissances' },
    description: {
      ar: 'جمع وطرح وضرب وقسمة الأعداد الجذرية، قوى عدد جذري، والكتابة العلمية.',
      biof: 'Opérations sur les nombres rationnels, puissances à exposant négatif et notation scientifique.'
    },
    prerequisites: [],
    icon: '➗',
    minMasteryStars: 0,
    formulaSample: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd} \\quad ; \\quad a^n \\times a^m = a^{n+m}'
  },
  {
    id: 'skill-2ac-calcul-litteral',
    levelId: '2ac',
    domain: 'arithmetic_algebra',
    title: { ar: 'الحساب الحرفي والمعادلات', biof: 'Calcul Littéral & Équations' },
    description: {
      ar: 'النشر والتعميل، المتطابقات الهامة، وحل المعادلات من الدرجة الأولى بمجهول واحد.',
      biof: 'Développement, factorisation, identités remarquables et équations du 1er degré.'
    },
    prerequisites: ['skill-2ac-rationnels'],
    icon: '⚡',
    minMasteryStars: 1,
    formulaSample: '(a+b)^2 = a^2 + 2ab + b^2 \\quad ; \\quad a^2 - b^2 = (a-b)(a+b)'
  },
  {
    id: 'skill-2ac-symetrie-triangle',
    levelId: '2ac',
    domain: 'geometry_trig',
    title: { ar: 'التماثل المحوري والمثلث القائم والدائرة', biof: 'Symétrie Axiale & Triangle Rectangle' },
    description: {
      ar: 'مماثل نقطة وقطعة ومستقيم، المستقيمات الهامة في المثلث، ومبرهنة فيثاغورس المباشرة.',
      biof: 'Conservation des distances, droites remarquables, théorème de Pythagore et cosinus.'
    },
    prerequisites: [],
    icon: '📐',
    minMasteryStars: 0,
    formulaSample: 'BC^2 = AB^2 + AC^2 \\quad ; \\quad \\cos(\\widehat{B}) = \\frac{AB}{BC}'
  },

  // ================= 1AC (Première Année Collège) =================
  {
    id: 'skill-1ac-relatifs',
    levelId: '1ac',
    domain: 'arithmetic_algebra',
    title: { ar: 'الأعداد العشرية النسبية والكسور', biof: 'Nombres Décimaux Relatifs & Fractions' },
    description: {
      ar: 'أسبقية العمليات، مقارنة الأعداد النسبية، الجمع والطرح والضرب والقسمة.',
      biof: 'Priorités opératoires, comparaison des nombres relatifs et opérations sur les fractions.'
    },
    prerequisites: [],
    icon: '🔢',
    minMasteryStars: 0,
    formulaSample: '(-a) \\times (-b) = +ab \\quad ; \\quad a - b = a + (-b)'
  },
  {
    id: 'skill-1ac-developpement',
    levelId: '1ac',
    domain: 'arithmetic_algebra',
    title: { ar: 'النشر والتعميل والمعادلات البسيطة', biof: 'Développement, Factorisation & Équations' },
    description: {
      ar: 'توزيعية الضرب على الجمع والطرح k(a+b) وحل المعادلات من الشكل x + a = b و ax = b.',
      biof: 'Distributivité simple k(a+b) = ka + kb et résolution d\'équations élémentaires.'
    },
    prerequisites: ['skill-1ac-relatifs'],
    icon: '🧩',
    minMasteryStars: 1,
    formulaSample: 'k(a + b) = ka + kb \\quad ; \\quad ax = b \\implies x = \\frac{b}{a}'
  },
  {
    id: 'skill-1ac-angles-triangles',
    levelId: '1ac',
    domain: 'geometry_trig',
    title: { ar: 'الزوايا والمثلثات والتماثل المركزي', biof: 'Angles, Triangles & Symétrie Centrale' },
    description: {
      ar: 'مجموع زوايا مثلث (180°)، المتفاوتة المثلثية، والتماثل المركزي والمستقيمات المتوازية والقاطع.',
      biof: 'Somme des angles d\'un triangle (180°), inégalité triangulaire et symétrie centrale.'
    },
    prerequisites: [],
    icon: '📏',
    minMasteryStars: 0,
    formulaSample: '\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ \\quad ; \\quad AB < AC + BC'
  }
];

