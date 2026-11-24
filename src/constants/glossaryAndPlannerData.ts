import { LevelId, StreamId, MathDomain, LocalizedString } from '../types/curriculum';

export interface GlossaryConcept {
  id: string;
  term: LocalizedString;
  symbol: string;
  category: 'definition' | 'theorem' | 'symbol' | 'property';
  domain: MathDomain;
  levels: LevelId[];
  streams: StreamId[];
  definition: LocalizedString;
  formula: string;
  example: LocalizedString;
  inspectorTip: LocalizedString;
  keywords: string[];
}

export interface CurriculumTopicTemplate {
  id: string;
  levelId: LevelId;
  streams: StreamId[];
  domain: MathDomain;
  title: LocalizedString;
  recommendedDurationMin: number;
  sessionType: 'course' | 'exercises' | 'exam_prep' | 'remediation';
  examWeightNote: LocalizedString;
}

export type DayOfWeekId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface StudyPlanItem {
  id: string;
  dayId: DayOfWeekId;
  levelId: LevelId;
  streamId: StreamId;
  domain: MathDomain;
  title: LocalizedString;
  sessionType: 'course' | 'exercises' | 'exam_prep' | 'remediation';
  durationMin: number;
  priority: 'high' | 'medium' | 'normal';
  completed: boolean;
  notes?: string;
}

export const DAYS_OF_WEEK: { id: DayOfWeekId; name: LocalizedString; shortName: LocalizedString }[] = [
  { id: 'mon', name: { ar: 'الإثنين', biof: 'Lundi' }, shortName: { ar: 'إثنين', biof: 'Lun' } },
  { id: 'tue', name: { ar: 'الثلاثاء', biof: 'Mardi' }, shortName: { ar: 'ثلاثاء', biof: 'Mar' } },
  { id: 'wed', name: { ar: 'الأربعاء', biof: 'Mercredi' }, shortName: { ar: 'أربعاء', biof: 'Mer' } },
  { id: 'thu', name: { ar: 'الخميس', biof: 'Jeudi' }, shortName: { ar: 'خميس', biof: 'Jeu' } },
  { id: 'fri', name: { ar: 'الجمعة', biof: 'Vendredi' }, shortName: { ar: 'جمعة', biof: 'Ven' } },
  { id: 'sat', name: { ar: 'السبت', biof: 'Samedi' }, shortName: { ar: 'سبت', biof: 'Sam' } },
  { id: 'sun', name: { ar: 'الأحد', biof: 'Dimanche' }, shortName: { ar: 'أحد', biof: 'Dim' } }
];

export const SESSION_TYPES: Record<
  StudyPlanItem['sessionType'],
  { label: LocalizedString; badgeColor: string }
> = {
  course: {
    label: { ar: 'ضبط الدرس والقواعد', biof: 'Cours & Synthèse' },
    badgeColor: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/40'
  },
  exercises: {
    label: { ar: 'سلسلة تمارين تطبيقية', biof: 'Série d\'Exercices' },
    badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40'
  },
  exam_prep: {
    label: { ar: 'امتحان إشهادي / فرض محروس', biof: 'Examen / Devoir Surveillé' },
    badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-950/40'
  },
  remediation: {
    label: { ar: 'معالجة الأخطاء والثغرات', biof: 'Remédiation & Erreurs' },
    badgeColor: 'text-rose-300 border-rose-500/40 bg-rose-950/40'
  }
};

export const GLOSSARY_DATABASE: GlossaryConcept[] = [
  // ==================== COLLÈGE (1AC, 2AC, 3AC) ====================
  {
    id: 'gloss-distributivite',
    term: { ar: 'النشر والتعميل (توزيعية الضرب)', biof: 'Développement et Factorisation (Distributivité)' },
    symbol: 'k(a + b)',
    category: 'property',
    domain: 'arithmetic_algebra',
    levels: ['1ac', '2ac', '3ac'],
    streams: ['general'],
    definition: {
      ar: 'النشر هو تحويل جداء إلى مجموع أو فرق، بينما التعميل هو العملية العكسية التي تحول مجموعاً أو فرقاً إلى جداء باستخراج العامل المشترك أو المتطابقات الهامة.',
      biof: 'Développer consiste à transformer un produit en somme ou différence. Factoriser est l\'opération inverse qui transforme une somme en produit via un facteur commun ou une identité remarquable.'
    },
    formula: 'k(a + b) = ka + kb  |  a² - b² = (a - b)(a + b)',
    example: {
      ar: 'تعميل التعبير: 3x² - 12 = 3(x² - 4) = 3(x - 2)(x + 2).',
      biof: 'Factorisation de : 3x² - 12 = 3(x² - 4) = 3(x - 2)(x + 2).'
    },
    inspectorTip: {
      ar: 'احذر من نسيان الأقواس عند سبق التعبير بإشارة ناقص (-) قبل النشر.',
      biof: 'Attention aux signes lors de la suppression des parenthèses précédées d\'un signe moins (-).'
    },
    keywords: ['نشر', 'تعميل', 'توزيعية', 'متطابقات هامة', 'developpement', 'factorisation', 'identites remarquables']
  },
  {
    id: 'gloss-nombres-relatifs',
    term: { ar: 'الأعداد العشرية النسبية', biof: 'Nombres Décimaux Relatifs' },
    symbol: 'ℤ / ID',
    category: 'definition',
    domain: 'arithmetic_algebra',
    levels: ['1ac', '2ac'],
    streams: ['general'],
    definition: {
      ar: 'الأعداد النسبية تشمل الأعداد الموجبة (+) والأعداد السالبة (-) والصفر. مسافة عدد نسبي عن الصفر تسمى قيمته المطلقة وهي دائماً موجبة.',
      biof: 'Les nombres relatifs regroupent les nombres positifs (+), négatifs (-) et zéro. La distance à zéro d\'un nombre est toujours positive.'
    },
    formula: '(-a) × (-b) = +ab  |  (-a) × (+b) = -ab',
    example: {
      ar: 'مجموع عددين مختلفي الإشارة يأخذ إشارة الأبعد عن الصفر: (-8) + (+5) = -3.',
      biof: 'Somme de deux nombres de signes contraires : (-8) + (+5) = -3.'
    },
    inspectorTip: {
      ar: 'لا تخلط بين قاعدة إشارات الجداء (سالب × سالب = موجب) وقاعدة جمع عددين سالبين (سالب + سالب = سالب).',
      biof: 'Ne confondez jamais la règle des signes du produit avec l\'addition de deux nombres négatifs : (-3) + (-4) = -7.'
    },
    keywords: ['نسبي', 'إشارة', 'سالب', 'موجب', 'relatifs', 'signe', 'addition', 'produit']
  },
  {
    id: 'gloss-pythagore',
    term: { ar: 'مبرهنة فيثاغورس المباشرة والعكسية', biof: 'Théorème de Pythagore (Direct et Réciproque)' },
    symbol: 'BC² = AB² + AC²',
    category: 'theorem',
    domain: 'geometry_trig',
    levels: ['2ac', '3ac'],
    streams: ['general'],
    definition: {
      ar: 'في كل مثلث قائم الزاوية، مربع طول الوتر يساوي مجموع مربعي طولي ضلعي الزاوية القائمة. وتستعمل المبرهنة العكسية لإثبات أن المثلث قائم الزاوية.',
      biof: 'Dans un triangle rectangle, le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés. La réciproque permet de démontrer qu\'un triangle est rectangle.'
    },
    formula: 'ABC rectangle en A ⟺ BC² = AB² + AC²',
    example: {
      ar: 'إذا كان AB = 3 و AC = 4 في مثلث قائم في A، فإن BC² = 9 + 16 = 25 ومنه BC = 5.',
      biof: 'Si AB = 3 et AC = 4 dans un triangle rectangle en A, alors BC² = 9 + 16 = 25 d\'où BC = 5.'
    },
    inspectorTip: {
      ar: 'في البرهان بالمبرهنة العكسية، احسب BC² وحدها و AB² + AC² وحدها قبل المقارنة، ولا تكتب المساواة منذ البداية.',
      biof: 'Pour la réciproque, calculez séparément BC² d\'une part et AB² + AC² d\'autre part avant de conclure à l\'égalité.'
    },
    keywords: ['فيثاغورس', 'وتر', 'قائم الزاوية', 'pythagore', 'hypotenuse', 'triangle rectangle']
  },
  {
    id: 'gloss-thales',
    term: { ar: 'مبرهنة طاليس والتناسبية الهندسية', biof: 'Théorème de Thalès (Direct et Réciproque)' },
    symbol: 'AM/AB = AN/AC',
    category: 'theorem',
    domain: 'geometry_trig',
    levels: ['3ac', 'tc'],
    streams: ['general', 'tc_sciences'],
    definition: {
      ar: 'إذا قطع مستقيمان متوازيان ساقي زاوية، فإنهما يحددان مثلثين أضلاعهما متناسبة. تستعمل المباشرة لحساب الأطوال، والعكسية للبرهنة على التوازي.',
      biof: 'Si deux droites parallèles coupent deux droites sécantes, elles déterminent deux triangles aux côtés proportionnels. La réciproque sert à prouver le parallélisme.'
    },
    formula: '(MN) ∥ (BC) ⟹ AM / AB = AN / AC = MN / BC',
    example: {
      ar: 'إذا كان AM/AB = 2/5 و BC = 10 مع (MN)//(BC)، فإن MN = (2 × 10)/5 = 4.',
      biof: 'Si AM/AB = 2/5 et BC = 10 avec (MN)//(BC), alors MN = (2 × 10)/5 = 4.'
    },
    inspectorTip: {
      ar: 'في طاليس العكسية، شرط ترتيب النقط (نفس الترتيب على المستقيمين) ضروري جداً ولا يكتمل البرهان بدونه.',
      biof: 'Dans la réciproque de Thalès, mentionner l\'alignement des points dans le même ordre est obligatoire.'
    },
    keywords: ['طاليس', 'توازي', 'تناسب', 'thales', 'parallelisme', 'proportionnalite']
  },
  {
    id: 'gloss-racine-carree',
    term: { ar: 'الجذر المربع والمرافق', biof: 'Racine Carrée et Expression Conjuguée' },
    symbol: '√a',
    category: 'symbol',
    domain: 'arithmetic_algebra',
    levels: ['3ac', 'tc'],
    streams: ['general', 'tc_sciences', 'tc_lettres'],
    definition: {
      ar: 'الجذر المربع لعدد موجب a هو العدد الموجب الذي مربعه يساوي a. لحذف الجذر من المقام نضرب البسط والمقام في المرافق.',
      biof: 'La racine carrée d\'un réel positif a est l\'unique réel positif dont le carré vaut a. Pour rendre rationnel un dénominateur, on multiplie par le conjugué.'
    },
    formula: '√(a²) = |a|  |  1 / (√a - √b) = (√a + √b) / (a - b)',
    example: {
      ar: 'تبسيط: √75 = √(25 × 3) = 5√3.',
      biof: 'Simplification : √75 = √(25 × 3) = 5√3.'
    },
    inspectorTip: {
      ar: 'انتبه: √(a + b) لا يساوي أبداً √a + √b! الجذر يتوزع على الضرب والقسمة فقط.',
      biof: 'Piège classique : √(a + b) ≠ √a + √b ! La racine ne se distribue que sur le produit et le quotient.'
    },
    keywords: ['جذر مربع', 'مرافق', 'تبسيط', 'racine carree', 'conjugue', 'radical']
  },
  {
    id: 'gloss-fonction-affine',
    term: { ar: 'الدالة الخطية والدالة التآلفية', biof: 'Fonction Linéaire et Fonction Affine' },
    symbol: 'f(x) = ax + b',
    category: 'definition',
    domain: 'analysis_functions',
    levels: ['3ac', 'tc'],
    streams: ['general', 'tc_sciences', 'tc_lettres'],
    definition: {
      ar: 'الدالة التآلفية تكتب على شكل f(x) = ax + b حيث a هو المعامل الموجه (الميل) و b الأرتوب عند الأصل. إذا كان b = 0 تسمى دالة خطية ويمر تمثيلها من أصل المعلم.',
      biof: 'Une fonction affine s\'écrit f(x) = ax + b où a est le coefficient directeur et b l\'ordonnée à l\'origine. Si b = 0, elle est linéaire et sa droite passe par l\'origine O.'
    },
    formula: 'a = (f(x₂) - f(x₁)) / (x₂ - x₁)',
    example: {
      ar: 'إذا كان f(1) = 3 و f(3) = 7 فإن المعامل a = (7 - 3)/(3 - 1) = 2 ومنه f(x) = 2x + 1.',
      biof: 'Si f(1) = 3 et f(3) = 7 alors a = (7 - 3)/(3 - 1) = 2 d\'où f(x) = 2x + 1.'
    },
    inspectorTip: {
      ar: 'مستقيمان متوازيان لهما نفس الميل (a = a\')، ومستقيمان متعامدان جداء ميليهما يساوي -1 (a × a\' = -1).',
      biof: 'Deux droites parallèles ont le même coefficient directeur (a = a\'), et deux droites perpendiculaires vérifient a × a\' = -1.'
    },
    keywords: ['دالة خطية', 'دالة تآلفية', 'ميل', 'معامل موجه', 'affine', 'lineaire', 'pente', 'droite']
  },

  // ==================== TRONC COMMUN & 1BAC ====================
  {
    id: 'gloss-valeur-absolue',
    term: { ar: 'القيمة المطلقة والمسافة على مستقيم مدرج', biof: 'Valeur Absolue et Distance sur la Droite Réelle' },
    symbol: '|x - a| ≤ r',
    category: 'symbol',
    domain: 'arithmetic_algebra',
    levels: ['tc', '1bac', '2bac'],
    streams: ['tc_sciences', '1bac_sm', '1bac_se', '2bac_sm', '2bac_pc', '2bac_svt'],
    definition: {
      ar: 'القيمة المطلقة لعدد حقيقي x، ونرمز لها بـ |x|، هي المسافة بين النقطة التي أفصولها x وأصل المعلم O. المتفاوتة |x - a| ≤ r تعبر عن المجال المغلق [a - r, a + r].',
      biof: 'La valeur absolue d\'un réel x, notée |x|, mesure la distance entre x et 0. L\'inégalité |x - a| ≤ r équivaut à x ∈ [a - r, a + r].'
    },
    formula: '|x| = x (si x ≥ 0) ; -x (si x < 0)  |  |x| ≤ r ⟺ -r ≤ x ≤ r',
    example: {
      ar: 'حل المتراجحة |x - 3| ≤ 2 هو -2 ≤ x - 3 ≤ 2 أي x ∈ [1, 5].',
      biof: 'La solution de |x - 3| ≤ 2 est -2 ≤ x - 3 ≤ 2 soit x ∈ [1, 5].'
    },
    inspectorTip: {
      ar: 'عند إزالة القيمة المطلقة من تعبير جبري، ادرس إشارة ما بداخل القيمة المطلقة في جدول إشارات أولاً.',
      biof: 'Pour écrire une expression sans valeur absolue, dressez d\'abord le tableau de signe de l\'expression intérieure.'
    },
    keywords: ['قيمة مطلقة', 'مجال', 'مسافة', 'متراجحة', 'valeur absolue', 'intervalle', 'distance']
  },
  {
    id: 'gloss-discriminant',
    term: { ar: 'مميز ثلاثية الحدود من الدرجة الثانية', biof: 'Discriminant du Trinôme du Second Degré' },
    symbol: 'Δ = b² - 4ac',
    category: 'definition',
    domain: 'arithmetic_algebra',
    levels: ['tc', '1bac', '2bac'],
    streams: ['tc_sciences', 'tc_lettres', '1bac_sm', '1bac_se', '1bac_eco', '2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'يحدد المميز Δ عدد حلول المعادلة ax² + bx + c = 0 وإشارة ثلاثية الحدود. إذا كان Δ > 0 تقبل حلين مختلفين، وإذا كان Δ = 0 حلاً مزدوجاً، وإذا كان Δ < 0 لا تقبل حلاً في ℝ (وتقبل حلين عقديين مترافقين في ℂ).',
      biof: 'Le discriminant Δ détermine les racines et le signe de ax² + bx + c. Si Δ > 0 : deux racines réelles ; si Δ = 0 : racine double ; si Δ < 0 : pas de racine réelle (deux racines complexes conjuguées dans ℂ).'
    },
    formula: 'Δ = b² - 4ac  |  x₁,₂ = (-b ± √Δ) / (2a)',
    example: {
      ar: 'للمعادلة x² - 5x + 6 = 0 لدينا Δ = 25 - 24 = 1 > 0، الحلان هما x₁ = 2 و x₂ = 3.',
      biof: 'Pour x² - 5x + 6 = 0, Δ = 25 - 24 = 1 > 0, les racines sont x₁ = 2 et x₂ = 3.'
    },
    inspectorTip: {
      ar: 'قاعدة الإشارة: ثلاثية الحدود تأخذ إشارة a خارج الجذرين، وعكس إشارة a بين الجذرين.',
      biof: 'Règle du signe : le trinôme est du signe de a à l\'extérieur des racines, et du signe de (-a) entre les racines.'
    },
    keywords: ['مميز', 'معادلة الدرجة الثانية', 'ثلاثية الحدود', 'جذور', 'discriminant', 'trinome', 'delta']
  },
  {
    id: 'gloss-produit-scalaire',
    term: { ar: 'الجداء السلمي في المستوى والفضاء', biof: 'Produit Scalaire (Plan et Espace)' },
    symbol: 'u⃗ · v⃗',
    category: 'definition',
    domain: 'geometry_trig',
    levels: ['tc', '1bac', '2bac'],
    streams: ['tc_sciences', '1bac_sm', '1bac_se', '2bac_sm', '2bac_pc', '2bac_svt'],
    definition: {
      ar: 'الجداء السلمي لمتجهتين هو عدد حقيقي يربط بين المنظمين وجيب تمام الزاوية بينهما. انعدام الجداء السلمي يكافئ تعامد المتجهتين.',
      biof: 'Le produit scalaire de deux vecteurs est un nombre réel lié à leurs normes et au cosinus de leur angle. Sa nullité caractérise l\'orthogonalité des deux vecteurs.'
    },
    formula: 'u⃗ · v⃗ = ‖u⃗‖ × ‖v⃗‖ × cos(u⃗, v⃗) = xx\' + yy\' + zz\'',
    example: {
      ar: 'إذا كان u⃗(2, -1, 3) و v⃗(1, 5, 1) فإن u⃗ · v⃗ = 2 - 5 + 3 = 0 وبالتالي u⃗ ⊥ v⃗.',
      biof: 'Si u⃗(2, -1, 3) et v⃗(1, 5, 1) alors u⃗ · v⃗ = 2 - 5 + 3 = 0 donc u⃗ ⊥ v⃗.'
    },
    inspectorTip: {
      ar: 'تذكر أن نتيجة الجداء السلمي u⃗ · v⃗ هي عدد حقيقي (Scalaire)، بينما الجداء المتجهي u⃗ ∧ v⃗ يعطي متجهة عمودية.',
      biof: 'Le produit scalaire u⃗ · v⃗ donne un nombre réel, tandis que le produit vectoriel u⃗ ∧ v⃗ donne un vecteur.'
    },
    keywords: ['جداء سلمي', 'تعامد', 'منظم', 'متجهة', 'produit scalaire', 'orthogonalite', 'vecteur']
  },
  {
    id: 'gloss-quantificateurs',
    term: { ar: 'المكممات المنطقية (الكوني والوجودي)', biof: 'Quantificateurs Logiques (Universel et Existentiel)' },
    symbol: '∀ / ∃ / ∃!',
    category: 'symbol',
    domain: 'arithmetic_algebra',
    levels: ['1bac', '2bac'],
    streams: ['1bac_sm', '1bac_se', '2bac_sm', '2bac_pc', '2bac_svt'],
    definition: {
      ar: 'الرمز ∀ يعني «مهما يكن» (المكمم الكوني)، والرمز ∃ يعني «يوجد على الأقل» (المكمم الوجودي)، والرمز ∃! يعني «يوجد عنصر وحيد». عند نفي عبارة مكممة نقلب ∀ إلى ∃ مع نفي الخاصية.',
      biof: '∀ signifie « pour tout » (universel), ∃ signifie « il existe au moins un » (existentiel), et ∃! signifie « il existe un unique ». La négation permute ∀ et ∃.'
    },
    formula: '¬(∀x ∈ E, P(x)) ⟺ (∃x ∈ E, ¬P(x))',
    example: {
      ar: 'نفي العبارة (∀x ∈ ℝ, x² ≥ 0) هو (∃x ∈ ℝ, x² < 0).',
      biof: 'La négation de (∀x ∈ ℝ, x² ≥ 0) est (∃x ∈ ℝ, x² < 0).'
    },
    inspectorTip: {
      ar: 'ترتيب المكممين المختلفين مهم جداً: (∀x ∃y) لا تكافئ أبداً (∃y ∀x).',
      biof: 'L\'ordre de deux quantificateurs de natures différentes est fondamental : (∀x ∃y) ≠ (∃y ∀x).'
    },
    keywords: ['منطق', 'مكمم', 'مهما يكن', 'يوجد', 'نفي', 'logique', 'quantificateur', 'negation']
  },
  {
    id: 'gloss-recurrence',
    term: { ar: 'البرهان بالترجع', biof: 'Raisonnement par Récurrence' },
    symbol: 'P(n) ⟹ P(n+1)',
    category: 'theorem',
    domain: 'arithmetic_algebra',
    levels: ['1bac', '2bac'],
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'مبدأ برهاني يعتمد على 3 مراحل لإثبات صحة خاصية P(n) لكل عدد صحيح طبيعي n ≥ n₀: التحقق من أجل n₀، افتراض صحة P(n)، والبرهنة على صحة P(n+1)، ثم الاستنتاج.',
      biof: 'Principe de démonstration en 3 étapes pour prouver P(n) pour tout entier n ≥ n₀ : Initialisation (en n₀), Hérédité (supposer P(n) vraie et montrer P(n+1)), et Conclusion.'
    },
    formula: '[P(n₀) vraie  ∧  (∀n ≥ n₀, P(n) ⟹ P(n+1))] ⟹ (∀n ≥ n₀, P(n))',
    example: {
      ar: 'يستعمل بكثرة في المتتاليات لإثبات أن المتتالية مكبورة أو مصغورة (مثلاً: ∀n ∈ ℕ, u_n > 2).',
      biof: 'Très utilisé dans les suites numériques pour prouver qu\'une suite est majorée ou minorée (ex: ∀n ∈ ℕ, u_n > 2).'
    },
    inspectorTip: {
      ar: 'لا تكتب في افتراض الترجع «نفترض أنه لكل n لدينا P(n)»، بل اكتب «ليكن n عدداً مثبتاً، نفترض أن P(n) صحيحة».',
      biof: 'Rédaction : n\'écrivez jamais « supposons que pour tout n, P(n) est vraie », mais « soit n fixé, supposons P(n) vraie ».'
    },
    keywords: ['ترجع', 'برهان', 'متتالية', 'افتراض', 'recurrence', 'heredite', 'initialisation', 'suite']
  },
  {
    id: 'gloss-suites-arith-geom',
    term: { ar: 'المتتاليات الحسابية والهندسية', biof: 'Suites Arithmétiques et Géométriques' },
    symbol: '(u_n)_{n∈ℕ}',
    category: 'definition',
    domain: 'analysis_functions',
    levels: ['1bac', '2bac'],
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '1bac_lit', '2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'في المتتالية الحسابية ننتقل من حد لآخر بإضافة نفس العدد r (الأساس)، وفي المتتالية الهندسية ننتقل بالضرب في نفس العدد q (الأساس).',
      biof: 'Dans une suite arithmétique on passe d\'un terme au suivant en ajoutant la raison r. Dans une suite géométrique on multiplie par la raison q.'
    },
    formula: 'Arith: u_n = u_p + (n - p)r  |  Géom: u_n = u_p × q^(n - p)',
    example: {
      ar: 'إذا كانت (v_n) هندسية أساسها q = 1/2 وحدها الأول v₀ = 4، فإن v_n = 4 × (1/2)^n ونهايتها 0 لأن -1 < q < 1.',
      biof: 'Si (v_n) est géométrique de raison q = 1/2 et v₀ = 4, alors v_n = 4 × (1/2)^n et lim v_n = 0 car |q| < 1.'
    },
    inspectorTip: {
      ar: 'عدد الحدود في المجموع من u_p إلى u_n هو دائماً (n - p + 1) وليس (n - p).',
      biof: 'Le nombre de termes d\'une somme allant de l\'indice p à l\'indice n est toujours (n - p + 1).'
    },
    keywords: ['متتالية حسابية', 'متتالية هندسية', 'أساس', 'حد عام', 'suite arithmetique', 'suite geometrique', 'raison']
  },
  {
    id: 'gloss-derivation',
    term: { ar: 'العدد المشتق ومعادلة المماس', biof: 'Nombre Dérivé et Équation de la Tangente' },
    symbol: "f'(x₀)",
    category: 'definition',
    domain: 'analysis_functions',
    levels: ['1bac', '2bac'],
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'العدد المشتق f\'(x₀) هو نهاية معدل تغير الدالة عندما يؤول x إلى x₀، ويمثل هندسياً المعامل الموجه للمماس (T) لمنحنى الدالة في النقطة A(x₀, f(x₀)).',
      biof: 'Le nombre dérivé f\'(x₀) est la limite du taux de variation en x₀. Géométriquement, c\'est le coefficient directeur de la tangente (T) à la courbe au point d\'abscisse x₀.'
    },
    formula: "f'(x₀) = lim_{x→x₀} (f(x) - f(x₀))/(x - x₀)  |  (T): y = f'(x₀)(x - x₀) + f(x₀)",
    example: {
      ar: 'إذا كان f\'(x) > 0 قطعا على مجال I فإن الدالة f تزايدية قطعا على I.',
      biof: 'Si f\'(x) > 0 sur un intervalle I, alors f est strictement croissante sur I.'
    },
    inspectorTip: {
      ar: 'إذا كانت النهاية في x₀ تساوي ±∞، فإن الدالة غير قابلة للاشتقاق في x₀ والمنحنى يقبل نصف مماس عمودي.',
      biof: 'Si la limite du taux d\'accroissement vaut ±∞, f n\'est pas dérivable en x₀ et la courbe admet une demi-tangente verticale.'
    },
    keywords: ['اشتقاق', 'مشتقة', 'مماس', 'رتابة', 'derivation', 'derivee', 'tangente', 'variations']
  },

  // ==================== 2BAC (NATIONAL EXAM) ====================
  {
    id: 'gloss-tvi',
    term: { ar: 'مبرهنة القيم الوسيطية (TVI)', biof: 'Théorème des Valeurs Intermédiaires (TVI)' },
    symbol: 'f(a) × f(b) < 0',
    category: 'theorem',
    domain: 'analysis_functions',
    levels: ['2bac'],
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'إذا كانت f دالة متصلة على القطعة [a, b] وكان f(a) × f(b) < 0، فإن المعادلة f(x) = 0 تقبل على الأقل حلاً α في المجال المفتوح ]a, b[. وإذا أضفنا الرتابة القطعية يصبح الحل وحيداً.',
      biof: 'Si f est continue sur [a, b] et f(a) × f(b) < 0, alors l\'équation f(x) = 0 admet au moins une solution α dans ]a, b[. Si f est en plus strictement monotone, la solution α est unique.'
    },
    formula: 'f continue et strictement monotone + f(a)×f(b) < 0 ⟹ ∃! α ∈ ]a, b[, f(α) = 0',
    example: {
      ar: 'تأطير الحل α بالتفرع الثنائي (Dichotomie) عبر حساب صورة مركز المجال (a+b)/2 ومقارنة إشارتها.',
      biof: 'Encadrement de α par dichotomie en calculant l\'image du centre (a+b)/2 et en comparant son signe.'
    },
    inspectorTip: {
      ar: 'للحصول على النقطة الكاملة في الامتحان الوطني، اذكر الشروط الثلاثة بوضوح: الاتصال، الرتابة القطعية، وشرط الجداء f(a)×f(b) < 0.',
      biof: 'Pour avoir la note complète au Bac, citez explicitement les 3 conditions : continuité, stricte monotonie et f(a)×f(b) < 0.'
    },
    keywords: ['قيم وسيطية', 'اتصال', 'رتابة', 'حل وحيد', 'tvi', 'continuite', 'monotonie', 'solution unique']
  },
  {
    id: 'gloss-fonction-reciproque',
    term: { ar: 'الدالة العكسية وتمثيلها المبياني', biof: 'Fonction Réciproque et Courbe Symétrique' },
    symbol: 'f⁻¹(x)',
    category: 'theorem',
    domain: 'analysis_functions',
    levels: ['2bac'],
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'كل دالة متصلة ورتيبة قطعاً على مجال I تقبل دالة عكسية f⁻¹ معرفة على المجال J = f(I). منحناها (C_{f⁻¹}) مماثل لمنحنى (C_f) بالنسبة للمنصف الأول ذي المعادلة y = x.',
      biof: 'Toute fonction continue et strictement monotone sur I réalise une bijection vers J = f(I) et admet une réciproque f⁻¹. Sa courbe est symétrique à (C_f) par rapport à la première bissectrice y = x.'
    },
    formula: "(f⁻¹)'(y₀) = 1 / f'(x₀)   avec   y₀ = f(x₀) et f'(x₀) ≠ 0",
    example: {
      ar: 'لحساب (f⁻¹)\'(2) علماً أن f(1) = 2 و f\'(1) = 4، نكتب مباشرة: (f⁻¹)\'(2) = 1 / f\'(1) = 1/4 دون تحديد صيغة f⁻¹(x).',
      biof: 'Si f(1) = 2 et f\'(1) = 4, alors (f⁻¹)\'(2) = 1 / f\'(1) = 1/4 sans avoir besoin d\'expliciter f⁻¹(x).'
    },
    inspectorTip: {
      ar: 'لا تضيع الوقت في البحث عن صيغة f⁻¹(x) لحساب مشتقتها في نقطة؛ استعمل العلاقة المباشرة 1 / f\'(x₀).',
      biof: 'Ne cherchez pas l\'expression de f⁻¹(x) pour calculer (f⁻¹)\'(y₀) : utilisez directement 1 / f\'(x₀).'
    },
    keywords: ['دالة عكسية', 'تقابل', 'مشتقة الدالة العكسية', 'منصف أول', 'reciproque', 'bijection', 'symetrie']
  },
  {
    id: 'gloss-ln-exp',
    term: { ar: 'الدالة اللوغاريتمية النبيرية والدالة الأسية', biof: 'Fonctions Logarithme Népérien (ln) et Exponentielle (exp)' },
    symbol: 'ln(x) / e^x',
    category: 'definition',
    domain: 'analysis_functions',
    levels: ['2bac'],
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'الدالة ln هي الدالة الأصلية لـ 1/x على ]0, +∞[ التي تنعدم في 1، وتحول الجداء إلى مجموع. الدالة الأسية exp هي الدالة العكسية لـ ln وهي موجبة قطعاً على ℝ وتحول المجموع إلى جداء.',
      biof: 'La fonction ln est la primitive de 1/x sur ]0, +∞[ qui s\'annule en 1. La fonction exponentielle e^x est sa bijection réciproque définie et strictement positive sur ℝ.'
    },
    formula: 'ln(ab) = ln(a) + ln(b)  |  (ln u)\' = u\'/u  |  (e^u)\' = u\' e^u',
    example: {
      ar: 'النهايات الاعتيادية الأساسية: lim_{x→+∞} ln(x)/x = 0 و lim_{x→+∞} e^x/x = +∞ و lim_{x→0} ln(1+x)/x = 1.',
      biof: 'Limites de référence : lim_{x→+∞} ln(x)/x = 0, lim_{x→+∞} e^x/x = +∞ et lim_{x→0} (e^x - 1)/x = 1.'
    },
    inspectorTip: {
      ar: 'لإزالة الشكل غير المحدد في تعابير تشمل x و e^x أو ln(x)، فكر في التعميل بالحد الأقوى نمواً (e^x يغلب x، و x يغلب ln x عند +∞).',
      biof: 'Croissances comparées en +∞ : l\'exponentielle l\'emporte sur les puissances de x, qui l\'emportent sur le logarithme.'
    },
    keywords: ['لوغاريتم', 'أسية', 'نهايات اعتيادية', 'نبيري', 'logarithme', 'exponentielle', 'ln', 'exp']
  },
  {
    id: 'gloss-integration-parties',
    term: { ar: 'حساب التكامل والمكاملة بالأجزاء', biof: 'Calcul Intégral et Intégration par Parties (IPP)' },
    symbol: '∫_a^b f(x)dx',
    category: 'theorem',
    domain: 'analysis_functions',
    levels: ['2bac'],
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'تكامل دالة متصلة من a إلى b يساوي فرق صورتي b و a بواسطة دالة أصلية F. المكاملة بالأجزاء تسمح بحساب تكامل جداء دالتين مثل x·e^x أو x·ln(x).',
      biof: 'L\'intégrale d\'une fonction continue sur [a, b] vaut F(b) - F(a) où F est une primitive de f. L\'intégration par parties permet d\'intégrer des produits comme x·ln(x) ou x·e^x.'
    },
    formula: '∫_a^b u(x)v\'(x)dx = [u(x)v(x)]_a^b - ∫_a^b u\'(x)v(x)dx',
    example: {
      ar: 'مساحة الحيز المحصور بين (C_f) والمستقيم (D): y = ax + b والمستقيمين x=a و x=b هي: ∫_a^b |f(x) - y| dx × ‖i⃗‖ × ‖j⃗‖.',
      biof: 'Aire du domaine délimité par (C_f) et la droite y = ax + b entre a et b : A = ∫_a^b |f(x) - (ax+b)| dx (en unités d\'aire).'
    },
    inspectorTip: {
      ar: 'قاعدة ALPES لاختيار الدالة u(x) التي نشتقها في المكاملة بالأجزاء: اللوغاريتم (L) يسبق الحدودية (P)، والحدودية تسبق الأسية (E).',
      biof: 'Règle ALPES pour choisir u(x) à dériver lors d\'une IPP : Logarithme avant Polynôme, et Polynôme avant Exponentielle.'
    },
    keywords: ['تكامل', 'أصلية', 'مكاملة بالأجزاء', 'مساحة الحيز', 'integrale', 'primitive', 'ipp', 'aire']
  },
  {
    id: 'gloss-nombres-complexes',
    term: { ar: 'الأعداد العقدية (المعيار، العمدة، الترميز الأسّي)', biof: 'Nombres Complexes (Module, Argument, Forme Exponentielle)' },
    symbol: 'z = re^(iθ)',
    category: 'definition',
    domain: 'arithmetic_algebra',
    levels: ['2bac'],
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    definition: {
      ar: 'كل عدد عقدي غير منعدم z = a + ib يكتب على الشكل المثلثي أو الأسّي z = r e^(iθ) حيث r = |z| هو المعيار (المسافة) و θ = arg(z) هو العمدة (الزاوية).',
      biof: 'Tout complexe non nul z = a + ib s\'écrit sous forme exponentielle z = r e^(iθ) où r = |z| = √(a²+b²) est le module et θ ≡ arg(z) [2π] est l\'argument.'
    },
    formula: '|z_B - z_A| = AB  |  arg((z_C - z_A)/(z_B - z_A)) ≡ (AB⃗, AC⃗) [2π]',
    example: {
      ar: 'الكتابة العقدية للدوران R الذي مركزه Ω(ω) وزاويته θ هي: z\' - ω = e^(iθ)(z - ω).',
      biof: 'Écriture complexe de la rotation R de centre Ω(ω) et d\'angle θ : z\' - ω = e^(iθ)(z - ω).'
    },
    inspectorTip: {
      ar: 'لإثبات أن المثلث ABC متساوي الأضلاع، يكفي إثبات أن (z_C - z_A)/(z_B - z_A) = e^(±iπ/3).',
      biof: 'Pour démontrer que ABC est équilatéral, montrez que (z_C - z_A)/(z_B - z_A) = e^(±iπ/3).'
    },
    keywords: ['أعداد عقدية', 'معيار', 'عمدة', 'دوران', 'complexes', 'module', 'argument', 'rotation', 'affixe']
  },
  {
    id: 'gloss-geometrie-espace',
    term: { ar: 'الهندسة الفضائية (المستوى، الفلكة، والجداء المتجهي)', biof: 'Géométrie dans l\'Espace (Plan, Sphère et Produit Vectoriel)' },
    symbol: 'd(Ω, (P))',
    category: 'theorem',
    domain: 'geometry_trig',
    levels: ['2bac'],
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    definition: {
      ar: 'يتحدد المستوى (P) بمعادلة ديكارتية ax + by + cz + d = 0 حيث n⃗(a, b, c) متجهة منظمية عليه. لتحديد الوضع النسبي لفلكة (S) ومستوى (P) نقارن مسافة مركز الفلكة d(Ω, (P)) مع الشعاع R.',
      biof: 'Un plan (P) d\'équation ax + by + cz + d = 0 admet n⃗(a, b, c) pour vecteur normal. La position relative d\'une sphère (S) et d\'un plan (P) dépend de la comparaison entre d(Ω, (P)) et le rayon R.'
    },
    formula: 'd(Ω, (P)) = |ax_Ω + by_Ω + cz_Ω + d| / √(a² + b² + c²)',
    example: {
      ar: 'إذا كان d(Ω, (P)) < R فإن المستوى يقطع الفلكة وفق دائرة شعاعها r = √(R² - d²).',
      biof: 'Si d(Ω, (P)) < R, le plan coupe la sphère selon un cercle de rayon r = √(R² - d²).'
    },
    inspectorTip: {
      ar: 'الجداء المتجهي AB⃗ ∧ AC⃗ يعطي متجهة منظمية على المستوى (ABC)، ومساحة المثلث ABC هي 1/2 ‖AB⃗ ∧ AC⃗‖.',
      biof: 'Le produit vectoriel AB⃗ ∧ AC⃗ fournit un vecteur normal au plan (ABC), et l\'aire du triangle ABC vaut ½ ‖AB⃗ ∧ AC⃗‖.'
    },
    keywords: ['هندسة فضائية', 'فلكة', 'مستوى', 'متجهة منظمية', 'جداء متجهي', 'sphere', 'plan', 'vecteur normal']
  },
  {
    id: 'gloss-probabilites',
    term: { ar: 'الاحتمال الشرطي، الاستقلالية، والتوزيع الحداني', biof: 'Probabilité Conditionnelle, Indépendance et Loi Binomiale' },
    symbol: 'P_A(B) / C_n^k',
    category: 'definition',
    domain: 'probability_stats',
    levels: ['2bac'],
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    definition: {
      ar: 'الاحتمال الشرطي P_A(B) هو احتمال وقوع الحدث B علماً أن الحدث A قد تحقق. إذا تكررت تجربة عشوائية n مرة بصفة مستقلة وكان احتمال النجاح هو p، فإن المتغير العشوائي X يتبع القانون الحداني B(n, p).',
      biof: 'P_A(B) est la probabilité que B se réalise sachant que A est réalisé. Lors de la répétition de n épreuves indépendantes de paramètre p, X suit la loi binomiale B(n, p).'
    },
    formula: 'P_A(B) = P(A ∩ B)/P(A)  |  P(X = k) = C_n^k × p^k × (1 - p)^(n - k)',
    example: {
      ar: 'نوعا السحب الأساسيان: السحب في آن واحد نستعمل التأليفات C_n^p، والسحب بالتتابع وبدون إحلال نستعمل الترتيبات A_n^p.',
      biof: 'Tirage simultané : combinaisons C_n^p. Tirage successif sans remise : arrangements A_n^p. Avec remise : n^p.'
    },
    inspectorTip: {
      ar: 'تأكد دائماً عند تحديد قانون احتمال متغير عشوائي X أن مجموع احتمالات جميع قيمه يساوي 1 تماماً: ∑ P(X = x_i) = 1.',
      biof: 'Vérifiez systématiquement que la somme des probabilités de la loi de X est égale à 1 : ∑ P(X = x_i) = 1.'
    },
    keywords: ['احتمالات', 'احتمال شرطي', 'متغير عشوائي', 'تأليفات', 'حداني', 'probabilite', 'binomiale', 'tirage']
  }
];

export const CURRICULUM_TOPICS_DATABASE: CurriculumTopicTemplate[] = [
  // 1AC
  {
    id: 'topic-1ac-1',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'العمليات على الأعداد الصحيحة والعشرية وأسبقية الحساب', biof: 'Opérations sur les décimaux et priorités opératoires' },
    recommendedDurationMin: 45,
    sessionType: 'course',
    examWeightNote: { ar: 'أساسي لبناء مهارات الحساب الجبري', biof: 'Fondamental pour le calcul algébrique' }
  },
  {
    id: 'topic-1ac-2',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الأعداد الكسرية: التوحيد، الجمع، الطرح والجداء', biof: 'Nombres en écriture fractionnaire : opérations' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '35% من الفروض المحروسة للدورة الأولى', biof: '35% des devoirs surveillés du Semestre 1' }
  },
  {
    id: 'topic-1ac-3',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الأعداد العشرية النسبية والنشر والتعميل', biof: 'Nombres relatifs, développement et factorisation' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: 'محور جوهري في الدورة الثانية', biof: 'Axe central du Semestre 2' }
  },
  {
    id: 'topic-1ac-4',
    levelId: '1ac',
    streams: ['general'],
    domain: 'geometry_trig',
    title: { ar: 'المفاهيم الهندسية الأساسية، المثلث، والتماثل المركزي', biof: 'Triangle, inégalité triangulaire et symétrie centrale' },
    recommendedDurationMin: 45,
    sessionType: 'exam_prep',
    examWeightNote: { ar: 'تمارين البرهان الهندسي المباشر', biof: 'Initiation à la démonstration géométrique' }
  },

  // 2AC
  {
    id: 'topic-2ac-1',
    levelId: '2ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الأعداد الجذرية والقوى ذوات الأس الصحيح النسبي', biof: 'Nombres rationnels et puissances' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '30% من تنقيط فروض الجبر', biof: '30% du barème algébrique' }
  },
  {
    id: 'topic-2ac-2',
    levelId: '2ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الحساب الحرفي، المعادلات، والترتيب والعمليات', biof: 'Calcul littéral, équations et ordre' },
    recommendedDurationMin: 60,
    sessionType: 'course',
    examWeightNote: { ar: 'تهييء مباشر لمقرر الثالثة إعدادي', biof: 'Préparation directe au programme de 3AC' }
  },
  {
    id: 'topic-2ac-3',
    levelId: '2ac',
    streams: ['general'],
    domain: 'geometry_trig',
    title: { ar: 'مبرهنة فيثاغورس، جيب تمام زاوية حادة، والمتجهات', biof: 'Théorème de Pythagore, cosinus et vecteurs' },
    recommendedDurationMin: 60,
    sessionType: 'exam_prep',
    examWeightNote: { ar: 'أهم محور هندسي في السنة الثانية إعدادي', biof: 'Axe géométrique majeur de 2AC' }
  },

  // 3AC (Brevet Régional)
  {
    id: 'topic-3ac-1',
    levelId: '3ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الجذور المربعة، المتطابقات الهامة، والقوى (الموحد المحلي)', biof: 'Racines carrées, identités remarquables et puissances' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '6 إلى 8 نقط في الامتحان المحلي', biof: '6 à 8 points à l\'examen local' }
  },
  {
    id: 'topic-3ac-2',
    levelId: '3ac',
    streams: ['general'],
    domain: 'geometry_trig',
    title: { ar: 'مبرهنة طاليس، فيثاغورس، والحساب المثلثي', biof: 'Théorèmes de Thalès, Pythagore et trigonométrie' },
    recommendedDurationMin: 90,
    sessionType: 'exam_prep',
    examWeightNote: { ar: 'أساسي في الامتحان المحلي', biof: 'Pilier de l\'examen local du Semestre 1' }
  },
  {
    id: 'topic-3ac-3',
    levelId: '3ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: { ar: 'المعادلات والمتراجحات ونظمات معادلتين (الامتحان الجهوي)', biof: 'Équations, inéquations et systèmes (Examen Régional)' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '5 نقط في الامتحان الجهوي الموحد', biof: '5 points à l\'Examen Régional (3AC)' }
  },
  {
    id: 'topic-3ac-4',
    levelId: '3ac',
    streams: ['general'],
    domain: 'analysis_functions',
    title: { ar: 'الدالة الخطية والتآلفية ومعادلة مستقيم في المعلم', biof: 'Fonctions linéaires/affines et équation d\'une droite' },
    recommendedDurationMin: 90,
    sessionType: 'exam_prep',
    examWeightNote: { ar: '8 نقط في الامتحان الجهوي الموحد', biof: '8 points à l\'Examen Régional (3AC)' }
  },

  // TC
  {
    id: 'topic-tc-1',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الترتيب في ℝ، المجالات، القيمة المطلقة والمعادلات', biof: 'Ordre dans ℝ, valeur absolue, équations et trinôme' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: 'قاعدة التحليل والجبر في الثانوي التأهيلي', biof: 'Base de l\'analyse au lycée qualifiant' }
  },
  {
    id: 'topic-tc-2',
    levelId: 'tc',
    streams: ['tc_sciences'],
    domain: 'geometry_trig',
    title: { ar: 'الحساب المثلثي (الجزء 1 و 2) والجداء السلمي', biof: 'Calcul trigonométrique et produit scalaire' },
    recommendedDurationMin: 90,
    sessionType: 'course',
    examWeightNote: { ar: 'ضروري لمتابعة شعب العلوم الرياضية والتجريبية', biof: 'Indispensable pour l\'orientation SM et SE' }
  },
  {
    id: 'topic-tc-3',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'analysis_functions',
    title: { ar: 'عموميات حول الدوال العددية: مجموعة التعريف والرتابة', biof: 'Généralités sur les fonctions numériques et variations' },
    recommendedDurationMin: 60,
    sessionType: 'exam_prep',
    examWeightNote: { ar: 'يمثل 40% من فروض الدورة الثانية', biof: '40% des devoirs du Semestre 2' }
  },

  // 1BAC
  {
    id: 'topic-1bac-1',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '1bac_lit'],
    domain: 'arithmetic_algebra',
    title: { ar: 'مبادئ في المنطق الرياضي والبرهان بالترجع', biof: 'Notions de logique et raisonnement par récurrence' },
    recommendedDurationMin: 60,
    sessionType: 'course',
    examWeightNote: { ar: 'مدخل منهجي لجميع براهين الباكالوريا', biof: 'Socle méthodologique du cycle Bac' }
  },
  {
    id: 'topic-1bac-2',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '1bac_lit'],
    domain: 'analysis_functions',
    title: { ar: 'المتتاليات العددية (الحسابية والهندسية ومجموع الحدود)', biof: 'Suites numériques (arithmétiques et géométriques)' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: 'حاضر بقوة في الامتحان الجهوي والوطني', biof: 'Omniprésent aux examens régional et national' }
  },
  {
    id: 'topic-1bac-3',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco'],
    domain: 'analysis_functions',
    title: { ar: 'نهاية دالة عددية، الاشتقاق، ودراسة الدوال وتمثيلها', biof: 'Limites, dérivation et étude complète de fonctions' },
    recommendedDurationMin: 90,
    sessionType: 'exam_prep',
    examWeightNote: { ar: 'المحور الأكبر وزناً استعداداً للسنة الثانية باكالوريا', biof: 'L\'axe le plus déterminant pour la 2ème Bac' }
  },
  {
    id: 'topic-1bac-4',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se'],
    domain: 'geometry_trig',
    title: { ar: 'المرجح، الجداء السلمي التحليلي، والدوران في المستوى', biof: 'Barycentre, étude analytique du produit scalaire et rotation' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '30% من فروض الهندسة في السنة الأولى باكالوريا', biof: '30% des évaluations de géométrie en 1Bac' }
  },

  // 2BAC (National Exam)
  {
    id: 'topic-2bac-1',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    title: { ar: 'الاتصال، مبرهنة القيم الوسيطية (TVI) والدالة العكسية', biof: 'Continuité, TVI et fonction réciproque' },
    recommendedDurationMin: 60,
    sessionType: 'course',
    examWeightNote: { ar: 'الجزء الأول من مسألة الامتحان الوطني', biof: 'Première partie du problème du Bac National' }
  },
  {
    id: 'topic-2bac-2',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    title: { ar: 'الدالتان اللوغاريتمية النبيرية (ln) والأسية (exp) والفروع اللانهائية', biof: 'Fonctions logarithme népérien (ln) et exponentielle (exp)' },
    recommendedDurationMin: 90,
    sessionType: 'exam_prep',
    examWeightNote: { ar: '8 إلى 11 نقطة في الامتحان الوطني الموحد', biof: '8 à 11 points sur 20 à l\'Examen National' }
  },
  {
    id: 'topic-2bac-3',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    title: { ar: 'المتتاليات العددية المرتبطة بدالة u_{n+1} = f(u_n)', biof: 'Suites numériques récurrentes u_{n+1} = f(u_n)' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '2.5 إلى 4 نقط في الامتحان الوطني', biof: '2.5 à 4 points à l\'Examen National' }
  },
  {
    id: 'topic-2bac-4',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'analysis_functions',
    title: { ar: 'الدوال الأصلية، حساب التكامل، والمكاملة بالأجزاء (IPP)', biof: 'Primitives, calcul intégral et intégration par parties' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '2 إلى 3 نقط في مسألة التحليل بالوطني', biof: '2 à 3 points dans le problème du Bac' }
  },
  {
    id: 'topic-2bac-5',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'arithmetic_algebra',
    title: { ar: 'الأعداد العقدية: الشكل المثلثي والأسّي والتحويلات الهندسية', biof: 'Nombres complexes : module, argument et transformations' },
    recommendedDurationMin: 90,
    sessionType: 'exam_prep',
    examWeightNote: { ar: '3 إلى 5 نقط مضمونة في الامتحان الوطني', biof: '3 à 5 points décisifs à l\'Examen National' }
  },
  {
    id: 'topic-2bac-6',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'geometry_trig',
    title: { ar: 'الهندسة الفضائية: الجداء السلمي والمتجهي والفلكة', biof: 'Géométrie dans l\'espace : plan, sphère et produit vectoriel' },
    recommendedDurationMin: 60,
    sessionType: 'exercises',
    examWeightNote: { ar: '3 نقط في الامتحان الوطني الموحد', biof: '3 points à l\'Examen National' }
  },
  {
    id: 'topic-2bac-7',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt', '2bac_eco'],
    domain: 'probability_stats',
    title: { ar: 'حساب الاحتمالات: الاحتمال الشرطي والمتغير العشوائي الحداني', biof: 'Probabilités : conditionnelle, variable aléatoire et loi binomiale' },
    recommendedDurationMin: 60,
    sessionType: 'exam_prep',
    examWeightNote: { ar: '3 نقط كاملة في الامتحان الوطني', biof: '3 points à l\'Examen National' }
  }
];

export function generateDefaultWeeklyPlan(levelId: LevelId, streamId: StreamId): StudyPlanItem[] {
  const relevantTopics = CURRICULUM_TOPICS_DATABASE.filter(
    t => t.levelId === levelId && (t.streams.includes(streamId) || t.streams.includes('general'))
  );

  const fallbackTopics = relevantTopics.length > 0
    ? relevantTopics
    : CURRICULUM_TOPICS_DATABASE.filter(t => t.levelId === levelId);

  const daysOrder: DayOfWeekId[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return daysOrder.map((dayId, idx) => {
    if (dayId === 'sun') {
      return {
        id: `plan-${levelId}-${streamId}-sun`,
        dayId: 'sun',
        levelId,
        streamId,
        domain: 'analysis_functions',
        title: {
          ar: 'حصيلة الأسبوع: إنجاز فرض محروس أو امتحان تجريبي شامل (/20)',
          biof: 'Bilan Hebdomadaire : Simulation d\'Examen / Devoir Surveillé (/20)'
        },
        sessionType: 'exam_prep',
        durationMin: 90,
        priority: 'high',
        completed: idx === 0
      };
    }

    const topic = fallbackTopics[idx % fallbackTopics.length];
    const sessionTypesCycle: StudyPlanItem['sessionType'][] = [
      'course',
      'exercises',
      'exercises',
      'remediation',
      'exam_prep',
      'exercises'
    ];

    return {
      id: `plan-${levelId}-${streamId}-${dayId}-${idx}`,
      dayId,
      levelId,
      streamId,
      domain: topic ? topic.domain : 'arithmetic_algebra',
      title: topic
        ? topic.title
        : { ar: 'مراجعة القواعد الأساسية وحل التمارين', biof: 'Révision des notions fondamentales' },
      sessionType: topic ? topic.sessionType : sessionTypesCycle[idx % sessionTypesCycle.length],
      durationMin: topic ? topic.recommendedDurationMin : 60,
      priority: idx < 3 ? 'high' : 'medium',
      completed: idx === 0 // First session marked completed by default as an example
    };
  });
}
