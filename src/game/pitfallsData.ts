import { StepErrorPitfall } from '../types/curriculum';

export const PITFALLS_DATABASE: StepErrorPitfall[] = [
  {
    id: 'pitfall-01',
    levelId: '1ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: {
      ar: 'فخ الإشارات عند إزالة الأقواس المسبوقة بإشارة ناقص',
      biof: 'Piège des Parenthèses Précédées du Signe Moins'
    },
    context: {
      ar: 'تمرين تبسيط تعبير جبري لتلميذ في السنة الأولى إعدادي.',
      biof: 'Exercice de simplification d\'expression algébrique pour un élève de 1AC.'
    },
    problem: {
      ar: 'المطلوب تبسيط التعبير: A = 8x - (3x - 5) + 2',
      biof: 'Consigne : Simplifier l\'expression A = 8x - (3x - 5) + 2'
    },
    steps: [
      {
        line: 1,
        text: { ar: 'كتابة التعبير الأصلي', biof: 'Écriture de l\'expression originale' },
        formula: 'A = 8x - (3x - 5) + 2',
        isError: false
      },
      {
        line: 2,
        text: { ar: 'إزالة الأقواس', biof: 'Suppression des parenthèses' },
        formula: 'A = 8x - 3x - 5 + 2',
        isError: true,
        inspectorObservation: {
          ar: 'خطأ ديداكتيكي فادح: عند إزالة قوسين مسبوقين بإشارة (-) يجب تغيير إشارة جميع الحدود داخل القوسين! إذن -(-5) تصبح +5.',
          biof: 'Erreur didactique majeure : Lors de la suppression d\'une parenthèse précédée du signe (-), on doit inverser les signes de TOUS les termes intérieurs. Donc -(-5) = +5.'
        }
      },
      {
        line: 3,
        text: { ar: 'تجميع الحدود المتشابهة', biof: 'Regroupement des termes semblables' },
        formula: 'A = 5x - 3',
        isError: false
      }
    ],
    misconceptionExplanation: {
      ar: 'العائق الإبستمولوجي: التلميذ يطبق إشارة الناقص على الحد الأول فقط (3x) وينسى تطبيقها على الحد الثاني (-5).',
      biof: 'Obstacle épistémologique : L\'élève applique le signe moins au premier terme uniquement (3x) et oublie de distribuer sur le deuxième terme (-5).'
    },
    correctCorrection: {
      ar: 'الحل الصحيح: A = 8x - 3x + 5 + 2 = 5x + 7.',
      biof: 'Correction exacte : A = 8x - 3x + 5 + 2 = 5x + 7.'
    },
    didacticRecommendation: {
      ar: 'توصية التفتيش التربوي: ينبغي تدريب المتعلم على قاعدة التوزيع: -(a - b) = -1 × (a - b) = -a + b.',
      biof: 'Recommandation de l\'Inspection : Faire assimiler la règle comme une distributivité de -1 : -(a - b) = -1 × (a - b) = -a + b.'
    }
  },
  {
    id: 'pitfall-02',
    levelId: '2ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: {
      ar: 'فخ مربع مجموع: هل (a + b)² = a² + b²؟',
      biof: 'Piège du Carré d\'une Somme : (a + b)² ≠ a² + b²'
    },
    context: {
      ar: 'نشر متطابقة هامة في فرض محروس للسنة الثانية إعدادي.',
      biof: 'Développement d\'une identité remarquable lors d\'un devoir surveillé de 2AC.'
    },
    problem: {
      ar: 'المطلوب نشر وتبسيط: B = (3x + 4)²',
      biof: 'Consigne : Développer et réduire B = (3x + 4)²'
    },
    steps: [
      {
        line: 1,
        text: { ar: 'كتابة المتطابقة الهامة', biof: 'Écriture de l\'identité' },
        formula: 'B = (3x + 4)^2',
        isError: false
      },
      {
        line: 2,
        text: { ar: 'تطبيق التربيع على كل حد', biof: 'Application du carré à chaque terme' },
        formula: 'B = (3x)^2 + 4^2',
        isError: true,
        inspectorObservation: {
          ar: 'نسيان الجداء المزدوج (2ab)! المتطابقة الأولى هي (a + b)² = a² + 2ab + b².',
          biof: 'Omission critique du double produit (2ab) ! La règle fondamentale est (a + b)² = a² + 2ab + b².'
        }
      },
      {
        line: 3,
        text: { ar: 'حساب النتائج', biof: 'Calcul du résultat' },
        formula: 'B = 9x^2 + 16',
        isError: false
      }
    ],
    misconceptionExplanation: {
      ar: 'التعميم الخاطئ للخطية: يعتقد التلميذ خطأً أن التربيع عملية خطية تتوزع على الجمع مثل الضرب.',
      biof: 'Sur-généralisation de la linéarité : L\'élève suppose à tort que l\'élévation au carré est distributive sur l\'addition.'
    },
    correctCorrection: {
      ar: 'الحل الصحيح: B = (3x)² + 2(3x)(4) + 4² = 9x² + 24x + 16.',
      biof: 'Correction exacte : B = (3x)² + 2(3x)(4) + 4² = 9x² + 24x + 16.'
    },
    didacticRecommendation: {
      ar: 'توصية التفتيش التربوي: الاستعانة بالتمثيل الهندسي للمساحات (مربع كبير مقسم إلى مربعين ومستطيلين) لتثبيت الحد 2ab بصرياً.',
      biof: 'Recommandation de l\'Inspection : Utiliser la preuve géométrique d\'aire (carré de côté a+b décomposé en 2 carrés et 2 rectangles d\'aire ab).'
    }
  },
  {
    id: 'pitfall-03',
    levelId: '3ac',
    streams: ['general'],
    domain: 'arithmetic_algebra',
    title: {
      ar: 'فخ جذر المربع: جذر x² لا يساوي دائماً x!',
      biof: 'Piège de la Racine Carrée : √(x²) n\'est pas toujours égal à x'
    },
    context: {
      ar: 'تبسيط تعبير جذري لتلميذ في السنة الثالثة إعدادي المقبل على الموحد الجهوي.',
      biof: 'Simplification d\'expression avec radicaux pour un candidat au Brevet Régional.'
    },
    problem: {
      ar: 'المطلوب حساب وتبسيط التعبير C = √( (1 - √5)² )',
      biof: 'Consigne : Calculer et simplifier l\'expression C = √( (1 - √5)² )'
    },
    steps: [
      {
        line: 1,
        text: { ar: 'ملاحظة مربع داخل الجذر', biof: 'Observation du carré sous le radical' },
        formula: 'C = \\sqrt{(1 - \\sqrt{5})^2}',
        isError: false
      },
      {
        line: 2,
        text: { ar: 'إلغاء الجذر مع المربع مباشرة', biof: 'Simplification directe de la racine avec le carré' },
        formula: 'C = 1 - \\sqrt{5}',
        isError: true,
        inspectorObservation: {
          ar: 'خطأ منطقي وديداكتيكي! الجذر المربع لعدد هو دائماً عدد موجب قطعا أو منعدم، بينما 1 - √5 هو عدد سالب لأن 1 < √5! إذن √(A²) = |A|.',
          biof: 'Erreur logique majeure ! Une racine carrée est TOUJOURS positive ou nulle, or 1 - √5 est strictement négatif ! La règle universelle est √(A²) = |A|.'
        }
      },
      {
        line: 3,
        text: { ar: 'كتابة النتيجة النهائية', biof: 'Écriture du résultat final' },
        formula: 'C \\approx -1.236 < 0 \\quad (\\text{impossible})',
        isError: false
      }
    ],
    misconceptionExplanation: {
      ar: 'الخلط بين الخاصية √(a)² = a (حيث a موجباً مسبقاً) والخاصية √(a²) = |a| (حيث a يمكن أن يكون سالباً).',
      biof: 'Confusion entre (√a)² = a (avec a déjà positif) et √(a²) = |a| (où a peut être négatif).'
    },
    correctCorrection: {
      ar: 'بما أن 1 < √5 فإن 1 - √5 < 0، وبالتالي:\nC = |1 - √5| = -(1 - √5) = √5 - 1.',
      biof: 'Puisque 1 - √5 < 0, on a : C = |1 - √5| = -(1 - √5) = √5 - 1 > 0.'
    },
    didacticRecommendation: {
      ar: 'توجيه المفتش: تذكير التلاميذ دائماً: "الجذر دائماً موجب! إذا خرج لك عدد سالب، فاعلم أنك أخطأت في القيمة المطلقة".',
      biof: 'Conseil de l\'Inspecteur : Règle d\'or pour les examens : une racine carrée ne donne JAMAIS un résultat négatif. Passer impérativement par la valeur absolue.'
    }
  },
  {
    id: 'pitfall-04',
    levelId: 'tc',
    streams: ['tc_sciences', 'tc_lettres'],
    domain: 'analysis_functions',
    title: {
      ar: 'فخ القسمة على تعبير قد ينعدم واختزال الحلول',
      biof: 'Piège de la Division par une Expression s\'Annulant'
    },
    context: {
      ar: 'حل معادلة من الدرجة الثانية في الجذع المشترك.',
      biof: 'Résolution d\'équation du second degré en Tronc Commun.'
    },
    problem: {
      ar: 'حل المعادلة: (x - 3)(2x + 1) = (x - 3)(x + 5)',
      biof: 'Résoudre l\'équation : (x - 3)(2x + 1) = (x - 3)(x + 5)'
    },
    steps: [
      {
        line: 1,
        text: { ar: 'كتابة المعادلة الأصلية', biof: 'Écriture de l\'équation' },
        formula: '(x - 3)(2x + 1) = (x - 3)(x + 5)',
        isError: false
      },
      {
        line: 2,
        text: { ar: 'القسمة على (x - 3) في الطرفين للاختزال', biof: 'Division par (x - 3) des deux côtés pour simplifier' },
        formula: '2x + 1 = x + 5',
        isError: true,
        inspectorObservation: {
          ar: 'كارثة ديداكتيكية: القسمة على (x - 3) تفترض ضمناً أن x - 3 ≠ 0، وبالتالي أضاع التلميذ الحل x = 3!',
          biof: 'Erreur didactique critique : Diviser par (x - 3) suppose illégalement x ≠ 3, ce qui élimine la solution x = 3 !'
        }
      },
      {
        line: 3,
        text: { ar: 'حل المعادلة الناتجة', biof: 'Résolution de l\'équation simplifiée' },
        formula: 'x = 4 \\implies S = \\{4\\}',
        isError: false
      }
    ],
    misconceptionExplanation: {
      ar: 'الرغبة في التبسيط السريع تؤدي إلى القسمة على مجهول قد ينعدم، مما يحذف حلولاً جذرية.',
      biof: 'Vouloir simplifier trop vite en divisant par une expression contenant l\'inconnue fait perdre des solutions.'
    },
    correctCorrection: {
      ar: 'الطريقة السليمة هي نقل جميع الحدود إلى طرف والتعميل بالعامل المشترك:\n(x - 3)[(2x + 1) - (x + 5)] = 0 => (x - 3)(x - 4) = 0 => x = 3 أو x = 4. إذن S = {3, 4}.',
      biof: 'Méthode correcte par factorisation :\n(x - 3)[(2x + 1) - (x + 5)] = 0 => (x - 3)(x - 4) = 0 => S = {3, 4}.'
    },
    didacticRecommendation: {
      ar: 'توجيه المفتش: القاعدة البيداغوجية: "في المعادلات، لا تقسم على تعبير يحتوي على x؛ بل اجمع كل شيء في طرف واحد وعمّل!".',
      biof: 'Conseil de l\'Inspecteur : Règle pédagogique impérative : Ne jamais diviser par une expression en x ; transposer et factoriser.'
    }
  },
  {
    id: 'pitfall-05',
    levelId: '2bac',
    streams: ['2bac_sm', '2bac_pc', '2bac_svt'],
    domain: 'analysis_functions',
    title: {
      ar: 'فخ نهاية مركب دالتين واستنتاج 0 × ∞',
      biof: 'Piège de la Limite d\'un Produit sous Forme Indéterminée'
    },
    context: {
      ar: 'حساب نهاية دراسة دالة لوغاريتمية في الامتحان الوطني للبكالوريا.',
      biof: 'Calcul de limite pour l\'étude d\'une fonction avec ln au Baccalauréat.'
    },
    problem: {
      ar: 'المطلوب حساب النهاية: L = lim_{x -> 0⁺} [ x² × ln(x) ]',
      biof: 'Consigne : Calculer la limite L = lim_{x -> 0⁺} [ x² × ln(x) ]'
    },
    steps: [
      {
        line: 1,
        text: { ar: 'تعويض مباشر في النهاية', biof: 'Remplacement direct dans la limite' },
        formula: '\\lim_{x \\to 0^+} x^2 = 0 \\quad \\text{et} \\quad \\lim_{x \\to 0^+} \\ln(x) = -\\infty',
        isError: false
      },
      {
        line: 2,
        text: { ar: 'استنتاج النتيجة عبر ضرب 0 في ما لا نهاية', biof: 'Conclusion hâtive : 0 fois l\'infini donne 0' },
        formula: 'L = 0 \\times (-\\infty) = 0 \\quad (\\text{car } 0 \\cdot a = 0)',
        isError: true,
        inspectorObservation: {
          ar: 'خطأ تحليلي شنيع: 0 × ∞ هو شكل غير محدد (Forme Indéterminée)! لا يمكن الجزم بأنه يساوي 0 دون تبرير بالتزايد المقارن!',
          biof: 'Faute de rigueur impardonnable : 0 × ∞ est une FORME INDÉTERMINÉE ! On ne peut conclure sans invoquer les croissances comparées.'
        }
      },
      {
        line: 3,
        text: { ar: 'إعطاء الجواب بدون تبرير', biof: 'Réponse finale sans justification' },
        formula: 'L = 0',
        isError: false
      }
    ],
    misconceptionExplanation: {
      ar: 'التلميذ يعامل 0 في حساب النهايات كصفر حسابي قطعي (0 × a = 0)، بينما في النهايات 0 يعني كمية صغيرة تؤول إلى الصفر و∞ كمية تؤول إلى اللانهاية، والصراع بينهما يتطلب نهايات اعتيادية.',
      biof: 'Confusion entre le zéro arithmétique absorbant et le 0 infinitésimal en analyse face à l\'infini.'
    },
    correctCorrection: {
      ar: 'النهاية تساوي بالفعل 0، لكن التبرير الوحيد المقبول رسمياً هو: نهاية اعتيادية للتزايد المقارن:\nlim_{x -> 0⁺} xⁿ ln(x) = 0 (مع n ≥ 1).',
      biof: 'Bien que le résultat soit 0, la seule justification acceptée est la limite usuelle de croissance comparée : lim_{x -> 0⁺} x^n ln(x) = 0.'
    },
    didacticRecommendation: {
      ar: 'توجيه المفتش: في البكالوريا، الجواب الصحيح بدون تعليل دقيق يستحق صفراً في سلم التنقيط. التبرير هو لب الرياضيات.',
      biof: 'Conseil de l\'Inspecteur : Au Baccalauréat, un résultat juste sans justification rigoureuse reçoit 0 point au barème. La rigueur fait la note.'
    }
  },
  {
    id: 'pitfall-06',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco', '1bac_lit'],
    domain: 'arithmetic_algebra',
    title: {
      ar: 'فخ المتراجحة من الدرجة الثانية وإشارة ثلاثية الحدود',
      biof: 'Piège de l\'Inéquation du Second Degré et Signe du Trinôme'
    },
    context: {
      ar: 'حل متراجحة من الدرجة الثانية بدون جذور حقيقية في الأولى باكالوريا.',
      biof: 'Résolution d\'une inéquation du second degré à discriminant négatif en 1ère Bac.'
    },
    problem: {
      ar: 'حل في ℝ المتراجحة: -2x² + 3x - 5 > 0',
      biof: 'Résoudre dans ℝ l\'inéquation : -2x² + 3x - 5 > 0'
    },
    steps: [
      {
        line: 1,
        text: { ar: 'حساب المميز Δ للثلاثية الحدودية', biof: 'Calcul du discriminant Δ du trinôme' },
        formula: '\\Delta = 3^2 - 4(-2)(-5) = 9 - 40 = -31 < 0',
        isError: false
      },
      {
        line: 2,
        text: { ar: 'استنتاج مجموعة الحلول انطلاقاً من إشارة Δ فقط', biof: 'Conclusion directe sur S à partir du signe de Δ' },
        formula: '\\Delta < 0 \\implies S = \\mathbb{R}',
        isError: true,
        inspectorObservation: {
          ar: 'خطأ منهجي قاتل: عندما يكون Δ < 0، تأخذ ثلاثية الحدود إشارة المعامل a دائماً! هنا a = -2 < 0، أي أن التعبير سالب قطعاً لكل x ∈ ℝ وليس موجباً!',
          biof: 'Erreur grave de signe : Quand Δ < 0, le trinôme a toujours le signe de a ! Ici a = -2 < 0, donc -2x² + 3x - 5 est strictement négatif sur ℝ.'
        }
      },
      {
        line: 3,
        text: { ar: 'كتابة مجموعة الحلول النهائية', biof: 'Écriture de l\'ensemble des solutions' },
        formula: 'S = ]-\\infty, +\\infty[',
        isError: false
      }
    ],
    misconceptionExplanation: {
      ar: 'الخلط الشائع لدى تلاميذ 1 باكالوريا: حفظ قاعدة «Δ < 0 تعني S = ℝ أو S = ∅» بشكل آلي دون فحص إشارة المعامل a واتجاه المتراجحة.',
      biof: 'Mémorisation mécanique sans vérifier le signe du coefficient dominant a ni le sens de l\'inégalité.'
    },
    correctCorrection: {
      ar: 'بما أن Δ = -31 < 0 و a = -2 < 0، فإن -2x² + 3x - 5 < 0 لجميع قيم x في ℝ. وبالتالي المتراجحة (> 0) ليس لها حل: S = ∅.',
      biof: 'Comme Δ < 0 et a = -2 < 0, le trinôme est strictement négatif pour tout x ∈ ℝ. Donc l\'inéquation > 0 n\'a aucune solution : S = ∅.'
    },
    didacticRecommendation: {
      ar: 'توصية التفتيش التربوي: إلزام المتعلمين بوضع سطر إشارة ax² + bx + c قبل قراءة حلول المتراجحة حتى في حالة Δ < 0.',
      biof: 'Recommandation de l\'Inspection : Toujours dresser le tableau de signe explicite de a avant de conclure S.'
    }
  },
  {
    id: 'pitfall-07',
    levelId: '1bac',
    streams: ['1bac_sm', '1bac_se', '1bac_eco'],
    domain: 'analysis_functions',
    title: {
      ar: 'فخ اختزال حدود المجموع في حساب النهاية 0/0',
      biof: 'Piège de la Simplification Illicite sur Forme Indéterminée 0/0 en 1Bac'
    },
    context: {
      ar: 'حساب نهاية دالة جذرية في فرض محروس للأولى باكالوريا علوم.',
      biof: 'Calcul de la limite d\'une fonction rationnelle en un point en 1ère Bac Sciences.'
    },
    problem: {
      ar: 'احسب النهاية: lim_{x -> 3} (x² - 9) / (x² - 2x - 3)',
      biof: 'Calculer la limite : lim_{x -> 3} (x² - 9) / (x² - 2x - 3)'
    },
    steps: [
      {
        line: 1,
        text: { ar: 'ملاحظة الشكل عند التعويض المباشر بـ x = 3', biof: 'Substitution directe en x = 3' },
        formula: '\\frac{3^2 - 9}{3^2 - 2(3) - 3} = \\frac{0}{0}',
        isError: false
      },
      {
        line: 2,
        text: { ar: 'اختزال x² في البسط والمقام مباشرة', biof: 'Simplification abusive de x² au numérateur et dénominateur' },
        formula: '\\lim_{x \\to 3} \\frac{-9}{-2x - 3} = \\frac{-9}{-9} = 1',
        isError: true,
        inspectorObservation: {
          ar: 'خطأ جبري فادح! لا يمكن أبداً اختزال حد مضاف أو مطروح (x²) من البسط والمقام؛ الاختزال يقع فقط على العوامل المشتركة بعد التعميل بـ (x - 3)!',
          biof: 'Faute algébrique interdite ! On ne simplifie jamais un terme d\'une somme : seule la factorisation par (x - 3) permet de simplifier.'
        }
      },
      {
        line: 3,
        text: { ar: 'استنتاج قيمة النهاية', biof: 'Conclusion de la limite' },
        formula: 'L = 1',
        isError: false
      }
    ],
    misconceptionExplanation: {
      ar: 'الخلط بين الاختزال في الضرب (a·c / b·c = a/b) والاختزال غير المشروع في الجمع ((a + c) / (b + c)).',
      biof: 'Confusion classique entre simplification d\'un facteur commun et suppression illicite d\'un terme commun.'
    },
    correctCorrection: {
      ar: 'نعمّل البسط والمقام بـ (x - 3):\n(x - 3)(x + 3) / [(x - 3)(x + 1)] = (x + 3) / (x + 1).\nعند x → 3 نحصل على (3 + 3)/(3 + 1) = 6/4 = 3/2.',
      biof: 'Factorisation par (x - 3) : (x - 3)(x + 3) / [(x - 3)(x + 1)] = (x + 3)/(x + 1) → 6/4 = 3/2.'
    },
    didacticRecommendation: {
      ar: 'توصية التفتيش التربوي: تذكير التلاميذ بأن كل حدودية تنعدم في a تقبل القسمة على (x - a) وتُعمّل قبل أي اختزال.',
      biof: 'Conseil de l\'Inspection : Si P(a) = 0, factoriser systématiquement par (x - a) avant toute simplification.'
    }
  }
];
