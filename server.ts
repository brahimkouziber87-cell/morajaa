import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '.data');
const DB_FILE_PATH = path.join(DATA_DIR, 'math_inspector_store.json');

type LevelId = '1ac' | '2ac' | '3ac' | 'tc' | '1bac' | '2bac';
type StreamId =
  | 'general'
  | 'tc_sciences'
  | 'tc_lettres'
  | '1bac_sm'
  | '1bac_se'
  | '1bac_eco'
  | '1bac_lit'
  | '2bac_sm'
  | '2bac_pc'
  | '2bac_svt'
  | '2bac_eco';
type MathDomain =
  | 'arithmetic_algebra'
  | 'analysis_functions'
  | 'geometry_trig'
  | 'probability_stats';

interface LocalizedString {
  ar: string;
  biof: string;
}

interface Question {
  id: string;
  levelId: LevelId;
  streams: StreamId[];
  domain: MathDomain;
  competency: 'restitution' | 'application' | 'reasoning' | 'problem_solving';
  title: LocalizedString;
  statement: LocalizedString;
  formula?: string;
  options: LocalizedString[];
  correctIndex: number;
  explanation: LocalizedString;
  inspectorTip: LocalizedString;
  hint?: LocalizedString;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const LEVELS_MAP: Record<LevelId, LocalizedString> = {
  '1ac': { ar: 'الأولى ثانوي إعدادي', biof: '1ère Année Collège (1AC)' },
  '2ac': { ar: 'الثانية ثانوي إعدادي', biof: '2ème Année Collège (2AC)' },
  '3ac': { ar: 'الثالثة ثانوي إعدادي', biof: '3ème Année Collège (3AC)' },
  tc: { ar: 'الجذع المشترك العلمي والتكنولوجي', biof: 'Tronc Commun Scientifique (TCS)' },
  '1bac': { ar: 'الأولى باكالوريا', biof: '1ère Année Baccalauréat (1Bac)' },
  '2bac': { ar: 'الثانية باكالوريا', biof: '2ème Année Baccalauréat (2Bac)' }
};

const STREAMS_MAP: Record<StreamId, LocalizedString> = {
  general: { ar: 'مسار عام / دولي (BIOF)', biof: 'Parcours Général / International (BIOF)' },
  tc_sciences: { ar: 'جذع مشترك علمي (خيار فرنسية وعربي)', biof: 'Tronc Commun Scientifique (BIOF)' },
  tc_lettres: { ar: 'جذع مشترك آداب وعلوم إنسانية', biof: 'Tronc Commun Lettres & Sciences Humaines' },
  '1bac_sm': { ar: '1 باك علوم رياضية', biof: '1ère Bac Sciences Mathématiques' },
  '1bac_se': { ar: '1 باك علوم تجريبية', biof: '1ère Bac Sciences Expérimentales' },
  '1bac_eco': { ar: '1 باك علوم اقتصادية وتدبير', biof: '1ère Bac Sciences Économiques' },
  '1bac_lit': { ar: '1 باك آداب وعلوم إنسانية', biof: '1ère Bac Lettres & Sciences Humaines' },
  '2bac_sm': { ar: '2 باك علوم رياضية (أ) و (ب)', biof: '2ème Bac Sciences Mathématiques (A & B)' },
  '2bac_pc': { ar: '2 باك علوم فيزيائية', biof: '2ème Bac Sciences Physiques (PC)' },
  '2bac_svt': { ar: '2 باك علوم الحياة والأرض', biof: '2ème Bac Sciences de la Vie et de la Terre (SVT)' },
  '2bac_eco': { ar: '2 باك علوم اقتصادية وتدبير محاسباتي', biof: '2ème Bac Sciences Économiques & Gestion' }
};

const DOMAINS_MAP: Record<MathDomain, LocalizedString> = {
  arithmetic_algebra: { ar: 'الحسابيات والجبر', biof: 'Arithmétique & Algèbre' },
  analysis_functions: { ar: 'التحليل ودراسة الدوال', biof: 'Analyse & Étude de Fonctions' },
  geometry_trig: { ar: 'الهندسة والحساب المثلثي', biof: 'Géométrie & Trigonométrie' },
  probability_stats: { ar: 'الاحتمالات والإحصاء', biof: 'Probabilités & Statistiques' }
};

function permuteQuestionOptions(q: Question, seedOffset: number = 0): Question {
  const n = q.options.length;
  if (n <= 1) return q;

  let hash = seedOffset;
  for (let i = 0; i < q.id.length; i++) {
    hash = (hash * 31 + q.id.charCodeAt(i)) % 997;
  }

  const shift = hash % n;
  if (shift === 0) return q;

  const rotatedOptions: LocalizedString[] = [];
  let newCorrectIndex = 0;

  for (let i = 0; i < n; i++) {
    const oldIndex = (i + shift) % n;
    rotatedOptions.push(q.options[oldIndex]);
    if (oldIndex === q.correctIndex) {
      newCorrectIndex = i;
    }
  }

  return {
    ...q,
    options: rotatedOptions,
    correctIndex: newCorrectIndex
  };
}

function generateProceduralQuestion(levelId: LevelId, streamId: StreamId, seed: number): Question {
  const isCollege = levelId === '1ac' || levelId === '2ac' || levelId === '3ac';
  const step = Math.max(1, seed);
  const archetype = step % 4;

  if (isCollege) {
    if (archetype === 1) {
      const k = ((step * 2) % 7) + 2;
      const twoK = 2 * k;
      const kSq = k * k;
      return permuteQuestionOptions(
        {
          id: `proc-college-${levelId}-${step}`,
          levelId,
          streams: [streamId, 'general'],
          domain: 'arithmetic_algebra',
          competency: 'restitution',
          title: {
            ar: `تمرين بارامتري متجدد #${step} : النشر بالمتطابقات الهامة`,
            biof: `Exercice Paramétrique #${step} : Identités Remarquables`
          },
          statement: {
            ar: 'انشر وبسّط التعبير الجبري التالي باستعمال المتطابقة الهامة المناسبة:',
            biof: "Développer et réduire l'expression algébrique suivante :"
          },
          formula: `A(x) = (x + ${k})^2`,
          options: [
            { ar: `x² + ${twoK}x + ${kSq}`, biof: `x² + ${twoK}x + ${kSq}` },
            { ar: `x² + ${kSq}`, biof: `x² + ${kSq}` },
            { ar: `x² + ${k}x + ${kSq}`, biof: `x² + ${k}x + ${kSq}` },
            { ar: `x² - ${twoK}x + ${kSq}`, biof: `x² - ${twoK}x + ${kSq}` }
          ],
          correctIndex: 0,
          explanation: {
            ar: `(x + ${k})² = x² + 2(${k})x + ${k}² = x² + ${twoK}x + ${kSq}.`,
            biof: `(x + ${k})² = x² + ${twoK}x + ${kSq}.`
          },
          inspectorTip: {
            ar: 'توجيه المفتش: لا تنسَ الحد الأوسط (الجداء المزدوج 2ab) أثناء نشر مربع مجموع.',
            biof: "Conseil de l'Inspecteur : N'oubliez jamais le double produit 2ab."
          },
          points: 20,
          difficulty: 'easy'
        },
        step
      );
    }

    if (archetype === 2) {
      const scale = (step % 4) + 1;
      const ab = 3 * scale;
      const ac = 4 * scale;
      const bc = 5 * scale;
      return permuteQuestionOptions(
        {
          id: `proc-college-${levelId}-${step}`,
          levelId,
          streams: [streamId, 'general'],
          domain: 'geometry_trig',
          competency: 'application',
          title: {
            ar: `تمرين بارامتري متجدد #${step} : مبرهنة فيتاغورس المباشرة`,
            biof: `Exercice Paramétrique #${step} : Théorème de Pythagore`
          },
          statement: {
            ar: `ليكن ABC مثلثاً قائماً الزاوية في A بحيث AB = ${ab} و AC = ${ac}. احسب طول الوتر BC = x:`,
            biof: `Soit ABC un triangle rectangle en A tel que AB = ${ab} et AC = ${ac}. Calculer l'hypoténuse BC = x :`
          },
          formula: `BC^2 = x^2 = AB^2 + AC^2 = ${ab}^2 + ${ac}^2`,
          options: [
            { ar: `x = ${bc}`, biof: `x = ${bc}` },
            { ar: `x = ${ab + ac}`, biof: `x = ${ab + ac}` },
            { ar: `x = ${bc * bc}`, biof: `x = ${bc * bc}` },
            { ar: `x = ${bc - 1}`, biof: `x = ${bc - 1}` }
          ],
          correctIndex: 0,
          explanation: {
            ar: `x² = ${ab}² + ${ac}² = ${bc * bc} ومنه x = ${bc}.`,
            biof: `x² = ${ab * ab} + ${ac * ac} = ${bc * bc}, d'où x = ${bc}.`
          },
          inspectorTip: {
            ar: 'توجيه المفتش: تذكر دائماً أخذ الجذر المربع للحصول على طول الوتر.',
            biof: "Conseil de l'Inspecteur : N'oubliez pas d'extraire la racine carrée."
          },
          points: 20,
          difficulty: 'medium'
        },
        step
      );
    }

    const a = (step % 4) + 3;
    const c = (step % 2) + 1;
    const xSol = ((step * 3) % 9) + 2;
    const b = ((step * 5) % 11) - 5;
    const d = (a - c) * xSol + b;

    const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const dSign = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;

    const baseQuestion: Question = {
      id: `proc-college-${levelId}-${step}`,
      levelId,
      streams: [streamId, 'general'],
      domain: 'arithmetic_algebra',
      competency: 'application',
      title: {
        ar: `تمرين بارامتري متجدد #${step} : حل معادلة جبرية`,
        biof: `Exercice Paramétrique #${step} : Équation Algébrique`
      },
      statement: {
        ar: 'حل في ℝ المعادلة الجبرية المولدة آلياً التالية:',
        biof: "Résoudre dans ℝ l'équation algébrique générée dynamiquement :"
      },
      formula: `${a}x ${bSign} = ${c}x ${dSign}`,
      options: [
        { ar: `x = ${xSol}`, biof: `x = ${xSol}` },
        { ar: `x = ${xSol + 2}`, biof: `x = ${xSol + 2}` },
        { ar: `x = ${-xSol}`, biof: `x = ${-xSol}` },
        { ar: `x = ${xSol - 3}`, biof: `x = ${xSol - 3}` }
      ],
      correctIndex: 0,
      explanation: {
        ar: `نجمع المجاهيل في الطرف الأيسر والمعاليم في الطرف الأيمن:\n(${a} - ${c})x = ${d} - (${b}) => ${a - c}x = ${d - b} => x = ${d - b} / ${a - c} = ${xSol}.`,
        biof: `On isole l'inconnue x :\n(${a} - ${c})x = ${d} - (${b}) => ${a - c}x = ${d - b} => x = ${xSol}.`
      },
      inspectorTip: {
        ar: 'توجيه المفتش (التوليد البارامتري): يمكنك توليد عدد غير محدود من المعادلات لاختبار سرعتك في الحساب الحرفي.',
        biof: "Conseil de l'Inspecteur : Entraînez-vous sur une infinité de variantes paramétriques pour automatiser le calcul."
      },
      points: 20,
      difficulty: 'medium'
    };

    return permuteQuestionOptions(baseQuestion, step);
  }

  if (archetype === 1) {
    const c = (step % 3) + 1;
    const ratio = ((step * 2) % 4) + 2;
    const a = c * ratio;
    const b = (step % 5) + 1;
    return permuteQuestionOptions(
      {
        id: `proc-lycee-${levelId}-${step}`,
        levelId,
        streams: [streamId, 'general'],
        domain: 'analysis_functions',
        competency: 'application',
        title: {
          ar: `تمرين بارامتري متجدد #${step} : نهاية دالة جذرية عند +∞`,
          biof: `Exercice Paramétrique #${step} : Limite d'une Fonction Rationnelle`
        },
        statement: {
          ar: 'احسب نهاية الدالة الجذرية f(x) عندما يؤول x إلى +∞:',
          biof: 'Calculer la limite de la fonction rationnelle f(x) lorsque x tend vers +∞ :'
        },
        formula: `\\lim_{x \\to +\\infty} f(x) \\quad \\text{avec} \\quad f(x) = \\frac{${a}x^2 + ${b}x - 1}{${c}x^2 + 3}`,
        options: [
          { ar: `${ratio}`, biof: `${ratio}` },
          { ar: `+∞`, biof: `+∞` },
          { ar: `0`, biof: `0` },
          { ar: `${a}`, biof: `${a}` }
        ],
        correctIndex: 0,
        explanation: {
          ar: `lim f(x) = lim (${a}x² / ${c}x²) = ${ratio}.`,
          biof: `lim f(x) = ${a}x² / (${c}x²) = ${ratio}.`
        },
        inspectorTip: {
          ar: 'توجيه المفتش: قاعدة الحد الأعلى درجة تطبق فقط بجوار ∞±.',
          biof: "Conseil de l'Inspecteur : La règle des termes de plus haut degré ne s'applique qu'en ±∞."
        },
        points: 25,
        difficulty: 'medium'
      },
      step
    );
  }

  const a = (step % 3) + 1;
  const b = ((step * 2) % 5) + 1;
  const c = (step % 7) - 3;
  const x0 = (step % 3) + 1;
  const derivativeAtX0 = 2 * a * x0 + b;
  const wrong1 = derivativeAtX0 + a;
  const wrong2 = a * x0 * x0 + b * x0 + c;
  const wrong3 = 2 * a * x0 - b;

  const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  const aStr = a === 1 ? '' : `${a}`;

  const lyceeQuestion: Question = {
    id: `proc-lycee-${levelId}-${step}`,
    levelId,
    streams: [streamId, 'general'],
    domain: 'analysis_functions',
    competency: 'application',
    title: {
      ar: `تمرين بارامتري متجدد #${step} : العدد المشتق وميل المماس`,
      biof: `Exercice Paramétrique #${step} : Nombre Dérivé & Pente`
    },
    statement: {
      ar: `نعتبر الدالة العددية f المعرفة على ℝ بما يلي. احسب العدد المشتق f'(${x0}) (المعامل الموجه للمماس عند x₀ = ${x0}):`,
      biof: `Soit f la fonction définie sur ℝ ci-dessous. Calculer le nombre dérivé f'(${x0}) (pente de la tangente en x₀ = ${x0}) :`
    },
    formula: `f(x) = ${aStr}x^2 + ${b}x ${cStr} \\quad ; \\quad x_0 = ${x0}`,
    options: [
      { ar: `f'(${x0}) = ${derivativeAtX0}`, biof: `f'(${x0}) = ${derivativeAtX0}` },
      { ar: `f'(${x0}) = ${wrong1}`, biof: `f'(${x0}) = ${wrong1}` },
      { ar: `f'(${x0}) = ${wrong2}`, biof: `f'(${x0}) = ${wrong2}` },
      { ar: `f'(${x0}) = ${wrong3}`, biof: `f'(${x0}) = ${wrong3}` }
    ],
    correctIndex: 0,
    explanation: {
      ar: `الدالة المشتقة هي f'(x) = ${2 * a}x + ${b}.\nبالتعويض عند الأفصول x₀ = ${x0} نجد:\nf'(${x0}) = ${2 * a}(${x0}) + ${b} = ${derivativeAtX0}.`,
      biof: `La fonction dérivée est f'(x) = ${2 * a}x + ${b}.\nEn évaluant en x₀ = ${x0} :\nf'(${x0}) = ${2 * a}(${x0}) + ${b} = ${derivativeAtX0}.`
    },
    inspectorTip: {
      ar: 'توجيه المفتش: تذكر أن العدد المشتق f\'(x₀) يمثل هندسياً المعامل الموجه (الميل) للمماس (T) للمنحنى (Cf) في النقطة ذات الأفصول x₀.',
      biof: "Conseil de l'Inspecteur : Le nombre dérivé f'(x₀) est le coefficient directeur de la tangente (T) à la courbe (Cf) au point d'abscisse x₀."
    },
    points: 25,
    difficulty: 'medium'
  };

  return permuteQuestionOptions(lyceeQuestion, step);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  app.post('/api/ai/generate-question', async (req, res) => {
    const {
      levelId = '2bac',
      streamId = '2bac_pc',
      domain = 'analysis_functions',
      difficulty = 'medium',
      seed = Date.now()
    } = req.body || {};

    const safeLevelId = (levelId as LevelId) || '2bac';
    const safeStreamId = (streamId as StreamId) || '2bac_pc';
    const safeDomain = (domain as MathDomain) || 'analysis_functions';

    const levelObj = LEVELS_MAP[safeLevelId] || LEVELS_MAP['2bac'];
    const streamObj = STREAMS_MAP[safeStreamId] || STREAMS_MAP.general;
    const domainObj = DOMAINS_MAP[safeDomain] || DOMAINS_MAP.analysis_functions;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const fallbackQ = generateProceduralQuestion(safeLevelId, safeStreamId, Number(seed) % 97 + 1);
      res.json({ question: fallbackQ, source: 'procedural_fallback' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `أنت مفتش تربوي وأستاذ مبرز لمادة الرياضيات بالتعليم الثانوي المغربي.
قم بتوليد تمرين رياضي واحد دقيق ومبتكر (سؤال متعدد الخيارات من 4 خيارات) مطابق تماماً للإطار المرجعي الرسمي المغربي:
- المستوى الدراسي: ${levelObj.ar} (${levelObj.biof})
- الشعبة / المسلك: ${streamObj.ar} (${streamObj.biof})
- المجال المعرفي: ${domainObj.ar} (${domainObj.biof})
- درجة الصعوبة: ${difficulty}
- يجب أن يكون المحتوى ثنائي اللغة (العربية والفرنسية BIOF) بدقة علمية تامة، وأن تكون هناك إجابة واحدة صحيحة فقط في الخيار الأول (سيتم خلط الخيارات برمجياً).`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a Moroccan Mathematics Pedagogical Inspector. Output strictly valid JSON matching the requested schema with accurate mathematical formulas and bilingual Arabic/French (BIOF) explanations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleAr: { type: Type.STRING, description: 'Arabic title of the math question' },
              titleFr: { type: Type.STRING, description: 'French BIOF title of the math question' },
              statementAr: { type: Type.STRING, description: 'Arabic problem statement' },
              statementFr: { type: Type.STRING, description: 'French BIOF problem statement' },
              formula: { type: Type.STRING, description: 'Mathematical formula or equation in clean LaTeX notation' },
              correctOptionAr: { type: Type.STRING, description: 'The exact correct answer in Arabic/Math' },
              correctOptionFr: { type: Type.STRING, description: 'The exact correct answer in French/Math' },
              wrongOption1Ar: { type: Type.STRING, description: 'Plausible distractor 1 in Arabic/Math' },
              wrongOption1Fr: { type: Type.STRING, description: 'Plausible distractor 1 in French/Math' },
              wrongOption2Ar: { type: Type.STRING, description: 'Plausible distractor 2 in Arabic/Math' },
              wrongOption2Fr: { type: Type.STRING, description: 'Plausible distractor 2 in French/Math' },
              wrongOption3Ar: { type: Type.STRING, description: 'Plausible distractor 3 in Arabic/Math' },
              wrongOption3Fr: { type: Type.STRING, description: 'Plausible distractor 3 in French/Math' },
              explanationAr: { type: Type.STRING, description: 'Detailed step-by-step mathematical proof in Arabic' },
              explanationFr: { type: Type.STRING, description: 'Detailed step-by-step mathematical proof in French' },
              inspectorTipAr: { type: Type.STRING, description: 'Pedagogical inspector advice in Arabic' },
              inspectorTipFr: { type: Type.STRING, description: 'Pedagogical inspector advice in French' }
            },
            required: [
              'titleAr',
              'titleFr',
              'statementAr',
              'statementFr',
              'formula',
              'correctOptionAr',
              'correctOptionFr',
              'wrongOption1Ar',
              'wrongOption1Fr',
              'wrongOption2Ar',
              'wrongOption2Fr',
              'wrongOption3Ar',
              'wrongOption3Fr',
              'explanationAr',
              'explanationFr',
              'inspectorTipAr',
              'inspectorTipFr'
            ]
          }
        }
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      const constructed: Question = permuteQuestionOptions(
        {
          id: `ai-${safeLevelId}-${Date.now()}`,
          levelId: safeLevelId,
          streams: [safeStreamId, 'general'],
          domain: safeDomain,
          competency: difficulty === 'hard' ? 'problem_solving' : difficulty === 'medium' ? 'reasoning' : 'application',
          title: {
            ar: parsed.titleAr || 'تمرين مولد بالذكاء الاصطناعي',
            biof: parsed.titleFr || 'Exercice Généré par IA'
          },
          statement: {
            ar: parsed.statementAr,
            biof: parsed.statementFr
          },
          formula: parsed.formula,
          options: [
            { ar: parsed.correctOptionAr, biof: parsed.correctOptionFr },
            { ar: parsed.wrongOption1Ar, biof: parsed.wrongOption1Fr },
            { ar: parsed.wrongOption2Ar, biof: parsed.wrongOption2Fr },
            { ar: parsed.wrongOption3Ar, biof: parsed.wrongOption3Fr }
          ],
          correctIndex: 0,
          explanation: {
            ar: parsed.explanationAr,
            biof: parsed.explanationFr
          },
          inspectorTip: {
            ar: parsed.inspectorTipAr,
            biof: parsed.inspectorTipFr
          },
          points: difficulty === 'hard' ? 30 : difficulty === 'medium' ? 25 : 20,
          difficulty: difficulty === 'hard' || difficulty === 'easy' ? difficulty : 'medium'
        },
        Number(seed) % 19 + 1
      );

      res.json({ question: constructed, source: 'gemini_ai' });
    } catch (err) {
      const fallbackQ = generateProceduralQuestion(safeLevelId, safeStreamId, Number(seed) % 97 + 1);
      res.json({
        question: fallbackQ,
        source: 'procedural_fallback',
        notice: err instanceof Error ? err.message : 'Fallback generator used'
      });
    }
  });

  app.post('/api/ai/generate-document', async (req, res) => {
    const {
      docType = 'fiche_lecon',
      levelId = '2bac',
      streamId = '2bac_pc',
      lessonTitle = 'الاتصال والاشتقاق ودراسة الدوال',
      customPrompt = ''
    } = req.body || {};

    const safeLevelId = (levelId as LevelId) || '2bac';
    const safeStreamId = (streamId as StreamId) || '2bac_pc';
    const levelObj = LEVELS_MAP[safeLevelId] || LEVELS_MAP['2bac'];
    const streamObj = STREAMS_MAP[safeStreamId] || STREAMS_MAP.general;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(200).json({
        source: 'template_engine',
        generated: null
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `أنت مفتش تربوي وأستاذ مبرز لمادة الرياضيات بالتعليم الثانوي المغربي (وزارة التربية الوطنية والتعليم الأولي والرياضة).
قم بإنتاج محتوى وثيقة تربوية رسمية متكاملة ودقيقة علمياً وديداكتيكياً وفق التوجيهات التربوية والأطر المرجعية المغربية:
- نوع الوثيقة: ${docType}
- المستوى الدراسي: ${levelObj.ar} (${levelObj.biof})
- الشعبة / المسلك: ${streamObj.ar} (${streamObj.biof})
- محور / عنوان الدرس: ${lessonTitle}
${customPrompt ? `- توجيهات إضافية من الأستاذ: ${customPrompt}` : ''}
يجب أن تكون الصياغة ثنائية اللغة (العربية والفرنسية BIOF) مع كتابة الصيغ الرياضية بلغة LaTeX السليمة.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a Senior Moroccan Mathematics Pedagogical Inspector producing official Ministry of National Education documents (Fiches Pédagogiques, Devoirs Surveillés avec Barème, Séries d\'exercices). Return strictly valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              objectivesAr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 pedagogical objectives in Arabic'
              },
              objectivesFr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 pedagogical objectives in French (BIOF)'
              },
              prerequisitesAr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 prerequisites in Arabic'
              },
              prerequisitesFr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 prerequisites in French'
              },
              activityIntroAr: {
                type: Type.STRING,
                description: 'Constructivist introductory activity in Arabic'
              },
              activityIntroFr: {
                type: Type.STRING,
                description: 'Constructivist introductory activity in French'
              },
              mainTheoremFormula: {
                type: Type.STRING,
                description: 'Core theorem or property formula in clean LaTeX'
              },
              applicationExerciseAr: {
                type: Type.STRING,
                description: 'Application exercise statement and solution summary in Arabic'
              },
              applicationExerciseFr: {
                type: Type.STRING,
                description: 'Application exercise statement and solution summary in French'
              },
              didacticNoteAr: {
                type: Type.STRING,
                description: 'Pedagogical inspector note and common pitfalls to avoid in Arabic'
              },
              didacticNoteFr: {
                type: Type.STRING,
                description: 'Pedagogical inspector note and common pitfalls to avoid in French'
              }
            },
            required: [
              'objectivesAr',
              'objectivesFr',
              'prerequisitesAr',
              'prerequisitesFr',
              'activityIntroAr',
              'activityIntroFr',
              'mainTheoremFormula',
              'applicationExerciseAr',
              'applicationExerciseFr',
              'didacticNoteAr',
              'didacticNoteFr'
            ]
          }
        }
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({
        source: 'gemini_ai',
        generated: parsed
      });
    } catch (err) {
      res.status(200).json({
        source: 'template_engine',
        generated: null,
        notice: err instanceof Error ? err.message : 'Template fallback used'
      });
    }
  });

  // ========================================================
  // Gemini-Powered Mistake Diagnosis ('تشخيص الأخطاء بـ Gemini')
  // ========================================================
  app.post('/api/ai/mistake-diagnosis', async (req, res) => {
    const {
      missedQuestions = [],
      levelId = '2bac',
      streamId = '2bac_pc',
      domainScores = {},
      competencyScores = {},
      playerName = ''
    } = (req.body || {}) as {
      missedQuestions?: Array<{
        question: Question;
        wrongAttempts: number;
        lastMissedAt: string;
      }>;
      levelId?: LevelId;
      streamId?: StreamId;
      domainScores?: Record<string, { correct: number; total: number }>;
      competencyScores?: Record<string, { correct: number; total: number }>;
      playerName?: string;
    };

    if (!Array.isArray(missedQuestions) || missedQuestions.length === 0) {
      res.status(400).json({
        code: 'NO_MISSED_QUESTIONS',
        error: 'No missed questions were provided for diagnosis.'
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        code: 'MISSING_API_KEY',
        error: 'Gemini API key is not configured. Please check Settings > Secrets.'
      });
      return;
    }

    const safeLevelId = (levelId as LevelId) || '2bac';
    const safeStreamId = (streamId as StreamId) || '2bac_pc';
    const levelObj = LEVELS_MAP[safeLevelId] || LEVELS_MAP['2bac'];
    const streamObj = STREAMS_MAP[safeStreamId] || STREAMS_MAP.general;

    const topMissed = missedQuestions.slice(0, 6);
    const missedSummaryText = topMissed
      .map((item, idx) => {
        const q = item.question;
        const correctOpt = q.options?.[q.correctIndex]?.ar || '';
        const domLabel = DOMAINS_MAP[q.domain]?.ar || q.domain;
        return [
          `--- Question #${idx + 1} (ID: ${q.id}) ---`,
          `Title AR: ${q.title?.ar || ''}`,
          `Title FR: ${q.title?.biof || ''}`,
          `Domain: ${domLabel} | Competency: ${q.competency} | Difficulty: ${q.difficulty}`,
          `Wrong Attempts: ${item.wrongAttempts} | Last Missed: ${item.lastMissedAt}`,
          `Statement AR: ${q.statement?.ar || ''}`,
          `Statement FR: ${q.statement?.biof || ''}`,
          `Formula: ${q.formula || 'N/A'}`,
          `Correct Answer: ${correctOpt}`,
          `Reference Explanation: ${q.explanation?.ar || ''}`
        ].join('\n');
      })
      .join('\n\n');

    const prompt = `أنت مفتش تربوي وخبير ديداكتيك لمادة الرياضيات بالتعليم الثانوي المغربي (وزارة التربية الوطنية).
تقوم بتحليل أخطاء المتعلم(ة) ${playerName ? `(${playerName})` : ''} في:
- المستوى الدراسي: ${levelObj.ar} (${levelObj.biof})
- الشعبة / المسلك: ${streamObj.ar} (${streamObj.biof})
- حصيلة المجالات (domainScores): ${JSON.stringify(domainScores)}
- حصيلة الكفايات (competencyScores): ${JSON.stringify(competencyScores)}

فيما يلي الأسئلة التي أخطأ فيها المتعلم والمسجلة في stats.missedQuestions:
${missedSummaryText}

المطلوب:
1. قدّم تشخيصاً بيداغوجياً معمقاً ودقيقاً يشرح للمتعلم *لماذا* تعثّر تحديداً في هذه المفاهيم (تحليل السبب الجذري المعرفي والمنهجي، وليس مجرد تكرار نص التصحيح).
2. لكل سؤال في القائمة، قدّم:
   - اسم المفهوم المستهدف (conceptName) بالعربية والفرنسية.
   - تشخيص شخصي لسبب التعثر (whyStruggled) يربط بين طبيعة السؤال وعدد المحاولات الخاطئة.
   - الفخ الديداكتيكي أو الخطأ الشائع (misconceptionTrap).
   - قاعدة ذهبية مركزة للحفظ (keyTakeawayRule).
   - 3 خطوات تفاعلية للسبورة المتحركة (stepByStepWalkthrough) بصيغ LaTeX واضحة لتفسير الحل خطوة بخطوة وكأنه مقطع فيديو تعليمي مصغّر.
3. اختم بـ 3 خطوات عملية في خطة المعالجة (actionableStudyPlan).
احرص على الصياغة البيداغوجية الدقيقة ثنائية اللغة (العربية والفرنسية BIOF) وكتابة الصيغ الرياضية بصيغة LaTeX سليمة بدون علامات $.`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const runDiagnosis = async () => {
      return ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a Senior Moroccan Mathematics Pedagogical Inspector providing personalized cognitive Mistake Diagnosis. Analyze the exact missed questions provided, identify why the student struggled with those concepts, and output strictly valid bilingual Arabic/French (BIOF) JSON with clean LaTeX expressions (no outer $ delimiters in formulaLatex).',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummaryAr: { type: Type.STRING },
              executiveSummaryFr: { type: Type.STRING },
              rootCausePatternAr: { type: Type.STRING },
              rootCausePatternFr: { type: Type.STRING },
              priorityConceptAr: { type: Type.STRING },
              priorityConceptFr: { type: Type.STRING },
              questionDiagnoses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionId: { type: Type.STRING },
                    questionTitleAr: { type: Type.STRING },
                    questionTitleFr: { type: Type.STRING },
                    conceptNameAr: { type: Type.STRING },
                    conceptNameFr: { type: Type.STRING },
                    whyStruggledAr: { type: Type.STRING },
                    whyStruggledFr: { type: Type.STRING },
                    misconceptionTrapAr: { type: Type.STRING },
                    misconceptionTrapFr: { type: Type.STRING },
                    keyTakeawayRuleAr: { type: Type.STRING },
                    keyTakeawayRuleFr: { type: Type.STRING },
                    stepByStepWalkthrough: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          stepTitleAr: { type: Type.STRING },
                          stepTitleFr: { type: Type.STRING },
                          explanationAr: { type: Type.STRING },
                          explanationFr: { type: Type.STRING },
                          formulaLatex: { type: Type.STRING }
                        },
                        required: [
                          'stepTitleAr',
                          'stepTitleFr',
                          'explanationAr',
                          'explanationFr',
                          'formulaLatex'
                        ]
                      }
                    }
                  },
                  required: [
                    'questionId',
                    'questionTitleAr',
                    'questionTitleFr',
                    'conceptNameAr',
                    'conceptNameFr',
                    'whyStruggledAr',
                    'whyStruggledFr',
                    'misconceptionTrapAr',
                    'misconceptionTrapFr',
                    'keyTakeawayRuleAr',
                    'keyTakeawayRuleFr',
                    'stepByStepWalkthrough'
                  ]
                }
              },
              actionableStudyPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ar: { type: Type.STRING },
                    biof: { type: Type.STRING }
                  },
                  required: ['ar', 'biof']
                }
              }
            },
            required: [
              'executiveSummaryAr',
              'executiveSummaryFr',
              'rootCausePatternAr',
              'rootCausePatternFr',
              'priorityConceptAr',
              'priorityConceptFr',
              'questionDiagnoses',
              'actionableStudyPlan'
            ]
          }
        }
      });
    };

    try {
      let response;
      try {
        response = await runDiagnosis();
      } catch (firstErr) {
        const msg = firstErr instanceof Error ? firstErr.message : '';
        const isClientKeyErr =
          msg.includes('400') ||
          msg.includes('403') ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('PERMISSION_DENIED') ||
          msg.includes('404');
        if (isClientKeyErr) throw firstErr;
        // Brief exponential backoff retry once for transient errors
        await new Promise(resolve => setTimeout(resolve, 750));
        response = await runDiagnosis();
      }

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      res.json({
        source: 'gemini_ai',
        diagnosis: {
          analyzedCount: topMissed.length,
          generatedAtISO: new Date().toISOString(),
          model: 'gemini-4-hydrogen',
          executiveSummary: {
            ar: parsed.executiveSummaryAr || '',
            biof: parsed.executiveSummaryFr || ''
          },
          rootCausePattern: {
            ar: parsed.rootCausePatternAr || '',
            biof: parsed.rootCausePatternFr || ''
          },
          priorityConcept: {
            ar: parsed.priorityConceptAr || '',
            biof: parsed.priorityConceptFr || ''
          },
          questionDiagnoses: Array.isArray(parsed.questionDiagnoses)
            ? parsed.questionDiagnoses.map((qd: {
                questionId?: string;
                questionTitleAr?: string;
                questionTitleFr?: string;
                conceptNameAr?: string;
                conceptNameFr?: string;
                whyStruggledAr?: string;
                whyStruggledFr?: string;
                misconceptionTrapAr?: string;
                misconceptionTrapFr?: string;
                keyTakeawayRuleAr?: string;
                keyTakeawayRuleFr?: string;
                stepByStepWalkthrough?: Array<{
                  stepTitleAr?: string;
                  stepTitleFr?: string;
                  explanationAr?: string;
                  explanationFr?: string;
                  formulaLatex?: string;
                }>;
              }) => ({
                questionId: qd.questionId || '',
                questionTitle: {
                  ar: qd.questionTitleAr || '',
                  biof: qd.questionTitleFr || ''
                },
                conceptName: {
                  ar: qd.conceptNameAr || '',
                  biof: qd.conceptNameFr || ''
                },
                whyStruggled: {
                  ar: qd.whyStruggledAr || '',
                  biof: qd.whyStruggledFr || ''
                },
                misconceptionTrap: {
                  ar: qd.misconceptionTrapAr || '',
                  biof: qd.misconceptionTrapFr || ''
                },
                keyTakeawayRule: {
                  ar: qd.keyTakeawayRuleAr || '',
                  biof: qd.keyTakeawayRuleFr || ''
                },
                stepByStepWalkthrough: Array.isArray(qd.stepByStepWalkthrough)
                  ? qd.stepByStepWalkthrough.map(st => ({
                      stepTitle: {
                        ar: st.stepTitleAr || '',
                        biof: st.stepTitleFr || ''
                      },
                      explanation: {
                        ar: st.explanationAr || '',
                        biof: st.explanationFr || ''
                      },
                      formulaLatex: st.formulaLatex || ''
                    }))
                  : []
              }))
            : [],
          actionableStudyPlan: Array.isArray(parsed.actionableStudyPlan)
            ? parsed.actionableStudyPlan
            : []
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gemini Mistake Diagnosis request failed.';
      let status = 502;
      let code = 'UPSTREAM_ERROR';

      if (msg.includes('API_KEY_INVALID') || msg.includes('400')) {
        status = 400;
        code = 'API_KEY_INVALID';
      } else if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
        status = 403;
        code = 'PERMISSION_DENIED';
      } else if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
        status = 429;
        code = 'RESOURCE_EXHAUSTED';
      } else if (msg.includes('NOT_FOUND') || msg.includes('404')) {
        status = 404;
        code = 'MODEL_NOT_FOUND';
      }

      res.status(status).json({
        code,
        error: msg
      });
    }
  });

  // ========================================================
  // Friendly Duel & Shared Leaderboard API Endpoints
  // ========================================================
  interface ServerDuelPlayerResult {
    playerName: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeSeconds: number;
    questionOutcomes: boolean[];
  }

  interface ServerDuelPayload {
    duelId: string;
    levelId: LevelId;
    streamId: StreamId;
    domain: MathDomain | 'all';
    questionIds: string[];
    creatorName: string;
    createdAtISO: string;
    creatorResult?: ServerDuelPlayerResult;
    challengerResult?: ServerDuelPlayerResult;
  }

  interface ServerLeaderboardParticipant {
    id: string;
    studentName: string;
    levelId: LevelId;
    streamId: StreamId;
    cumulativeScore: number;
    xp: number;
    solvedCount: number;
    correctCount: number;
    badgesCount: number;
    unlockedBadgeTitles: string[];
    rankBadge: string;
    rankTitle: LocalizedString;
    dateISO: string;
  }

  const duelsStore = new Map<string, ServerDuelPayload>();
  const sharedLeaderboardStore = new Map<string, ServerLeaderboardParticipant>();
  const completedDuelParticipants = new Set<string>();

  const upsertServerLeaderboardParticipant = (
    playerName: string,
    levelId: LevelId,
    streamId: StreamId,
    score: number,
    xpEarned: number,
    correctCount: number,
    totalQuestions: number
  ) => {
    const cleanName = (playerName || '').trim();
    if (!cleanName) return;
    const key = cleanName.toLowerCase();
    const todayISO = new Date().toISOString().slice(0, 10);
    const existing = sharedLeaderboardStore.get(key);

    if (existing) {
      const hasDuelBadge = existing.unlockedBadgeTitles.some(
        t => t.includes('مبارز') || t.toLowerCase().includes('duel')
      );
      const nextBadges = hasDuelBadge
        ? existing.unlockedBadgeTitles
        : [...existing.unlockedBadgeTitles, 'مبارز ودي'];
      sharedLeaderboardStore.set(key, {
        ...existing,
        cumulativeScore: existing.cumulativeScore + score,
        xp: existing.xp + xpEarned,
        solvedCount: existing.solvedCount + totalQuestions,
        correctCount: existing.correctCount + correctCount,
        badgesCount: Math.max(existing.badgesCount, nextBadges.length),
        unlockedBadgeTitles: nextBadges,
        dateISO: todayISO
      });
    } else {
      const acc = totalQuestions > 0 ? correctCount / totalQuestions : 0;
      const badges = acc >= 0.8 ? ['مبارز ودي', 'دقة المبارزة'] : ['مبارز ودي'];
      sharedLeaderboardStore.set(key, {
        id: `srv-duel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        studentName: cleanName,
        levelId,
        streamId,
        cumulativeScore: score,
        xp: xpEarned,
        solvedCount: totalQuestions,
        correctCount,
        badgesCount: badges.length,
        unlockedBadgeTitles: badges,
        rankBadge: acc >= 0.8 ? '⚔️' : '📘',
        rankTitle:
          acc >= 0.8
            ? { ar: 'فارس المبارزة الودية', biof: 'Chevalier du Duel Amical' }
            : { ar: 'منافس صاعد', biof: 'Challenger Émergent' },
        dateISO: todayISO
      });
    }
  };

  app.post('/api/duels', (req, res) => {
    const payload = req.body as ServerDuelPayload;
    if (!payload || !payload.duelId || !Array.isArray(payload.questionIds)) {
      res.status(400).json({ error: 'Invalid duel payload' });
      return;
    }

    const existing = duelsStore.get(payload.duelId);
    const merged: ServerDuelPayload = {
      ...payload,
      creatorResult: payload.creatorResult || existing?.creatorResult,
      challengerResult: payload.challengerResult || existing?.challengerResult
    };
    duelsStore.set(payload.duelId, merged);

    if (merged.creatorResult && !completedDuelParticipants.has(`${merged.duelId}:creator`)) {
      completedDuelParticipants.add(`${merged.duelId}:creator`);
      upsertServerLeaderboardParticipant(
        merged.creatorResult.playerName,
        merged.levelId,
        merged.streamId,
        merged.creatorResult.score,
        merged.creatorResult.score + merged.creatorResult.correctCount * 10,
        merged.creatorResult.correctCount,
        merged.creatorResult.totalQuestions
      );
    }

    res.json({
      duel: merged,
      leaderboard: Array.from(sharedLeaderboardStore.values())
    });
  });

  app.get('/api/duels/:duelId', (req, res) => {
    const duel = duelsStore.get(req.params.duelId) || null;
    res.json({
      duel,
      leaderboard: Array.from(sharedLeaderboardStore.values())
    });
  });

  app.post('/api/duels/:duelId/complete', (req, res) => {
    const { duelId } = req.params;
    const {
      duelPayload,
      role = 'challenger',
      result,
      levelId,
      streamId
    } = req.body as {
      duelPayload?: ServerDuelPayload;
      role?: 'creator' | 'challenger';
      result?: ServerDuelPlayerResult;
      levelId?: LevelId;
      streamId?: StreamId;
    };

    if (!result || !result.playerName) {
      res.status(400).json({ error: 'Missing duel player result' });
      return;
    }

    const existing = duelsStore.get(duelId) || duelPayload;
    if (!existing) {
      res.status(404).json({ error: 'Duel not found' });
      return;
    }

    const updated: ServerDuelPayload = {
      ...existing,
      creatorResult:
        role === 'creator'
          ? result
          : existing.creatorResult || duelPayload?.creatorResult,
      challengerResult:
        role === 'challenger'
          ? result
          : existing.challengerResult || duelPayload?.challengerResult
    };
    duelsStore.set(duelId, updated);

    const participantKey = `${duelId}:${role}:${result.playerName.trim().toLowerCase()}`;
    if (!completedDuelParticipants.has(participantKey)) {
      completedDuelParticipants.add(participantKey);
      upsertServerLeaderboardParticipant(
        result.playerName,
        levelId || updated.levelId,
        streamId || updated.streamId,
        result.score,
        result.score + result.correctCount * 10,
        result.correctCount,
        result.totalQuestions
      );
    }

    // Ensure creatorResult embedded in URL is also credited if not already tracked
    if (
      updated.creatorResult &&
      !completedDuelParticipants.has(`${duelId}:creator:${updated.creatorResult.playerName.trim().toLowerCase()}`)
    ) {
      completedDuelParticipants.add(`${duelId}:creator:${updated.creatorResult.playerName.trim().toLowerCase()}`);
      upsertServerLeaderboardParticipant(
        updated.creatorResult.playerName,
        updated.levelId,
        updated.streamId,
        updated.creatorResult.score,
        updated.creatorResult.score + updated.creatorResult.correctCount * 10,
        updated.creatorResult.correctCount,
        updated.creatorResult.totalQuestions
      );
    }

    res.json({
      duel: updated,
      leaderboard: Array.from(sharedLeaderboardStore.values())
    });
  });

  app.get('/api/leaderboard', (_req, res) => {
    res.json({
      leaderboard: Array.from(sharedLeaderboardStore.values())
    });
  });

  // ========================================================
  // Proposal 2: Handwritten & Algebraic Scratchpad Verification API
  // ========================================================
  app.post('/api/ai/verify-scratchpad', async (req, res) => {
    const {
      imageBase64 = '',
      typedSteps = [],
      problemContext = ''
    } = (req.body || {}) as {
      imageBase64?: string;
      typedSteps?: string[];
      problemContext?: string;
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(200).json({
        source: 'deterministic_inspector',
        verified: null
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (imageBase64 && imageBase64.includes('base64,')) {
        const cleanData = imageBase64.split('base64,')[1];
        if (cleanData && cleanData.length > 100) {
          parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: cleanData
            }
          });
        }
      }

      const stepsText = Array.isArray(typedSteps) && typedSteps.length > 0
        ? `الخطوات الجبرية المكتوبة من طرف المتعلم:\n${typedSteps.map((s, idx) => `${idx + 1}) ${s}`).join('\n')}`
        : 'اقرأ الخطوات الرياضية المرسومة في صورة المسودة المرفقة وحللها سطراً بسطر.';

      parts.push({
        text: `أنت مفتش تربوي لمادة الرياضيات بالتعليم الثانوي المغربي.
قم بفحص خطوات الحل التي أنجزها المتعلم${problemContext ? ` في سياق التمرين: (${problemContext})` : ''}.
${stepsText}
حدد بدقة كل خطوة رياضية، واكتشف أول سطر وقع فيه خطأ حسابي أو منهجي أو منطقي (أو أكد صحة جميع الخطوات)، مع تقديم الصيغة النهائية المصححة بلغة LaTeX وتوجيه تربوي مزدوج اللغة (عربي / فرنسي BIOF).`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          systemInstruction:
            'You are a Moroccan Mathematics Pedagogical Inspector examining a student scratchpad. Verify each mathematical step for algebraic and logical equivalence, identify the exact 1-based step number of any error (or null if all steps are valid), and return strictly valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAllCorrect: { type: Type.BOOLEAN },
              errorStepNumber: {
                type: Type.INTEGER,
                description: '1-based step number where the first error occurred, or 0 if all steps are valid'
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    rawStep: { type: Type.STRING },
                    formulaLatex: { type: Type.STRING },
                    status: { type: Type.STRING, description: 'correct, error, or warning' },
                    commentAr: { type: Type.STRING },
                    commentFr: { type: Type.STRING }
                  },
                  required: ['stepNumber', 'rawStep', 'formulaLatex', 'status', 'commentAr', 'commentFr']
                }
              },
              overallVerdictAr: { type: Type.STRING },
              overallVerdictFr: { type: Type.STRING },
              correctedFinalStepLatex: { type: Type.STRING },
              inspectorAdviceAr: { type: Type.STRING },
              inspectorAdviceFr: { type: Type.STRING }
            },
            required: [
              'isAllCorrect',
              'errorStepNumber',
              'steps',
              'overallVerdictAr',
              'overallVerdictFr',
              'correctedFinalStepLatex',
              'inspectorAdviceAr',
              'inspectorAdviceFr'
            ]
          }
        }
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      res.json({
        source: 'gemini_vision',
        verified: {
          isAllCorrect: Boolean(parsed.isAllCorrect),
          errorStepNumber: parsed.errorStepNumber && parsed.errorStepNumber > 0 ? parsed.errorStepNumber : null,
          steps: (parsed.steps || []).map((st: {
            stepNumber: number;
            rawStep: string;
            formulaLatex: string;
            status: string;
            commentAr: string;
            commentFr: string;
          }) => ({
            stepNumber: st.stepNumber,
            rawStep: st.rawStep,
            formulaLatex: st.formulaLatex,
            status: st.status === 'error' || st.status === 'warning' ? st.status : 'correct',
            comment: { ar: st.commentAr, biof: st.commentFr }
          })),
          overallVerdict: {
            ar: parsed.overallVerdictAr || '',
            biof: parsed.overallVerdictFr || ''
          },
          correctedFinalStepLatex: parsed.correctedFinalStepLatex || '',
          inspectorAdvice: {
            ar: parsed.inspectorAdviceAr || '',
            biof: parsed.inspectorAdviceFr || ''
          },
          source: 'gemini_vision'
        }
      });
    } catch (err) {
      res.status(200).json({
        source: 'deterministic_inspector',
        verified: null,
        notice: err instanceof Error ? err.message : 'Deterministic inspector used'
      });
    }
  });

  // ========================================================
  // Phase 2: Teacher Analytics Portal, Live Room State & Disk-Backed Persistence
  // ========================================================
  interface ServerClassStudentRecord {
    studentId: string;
    studentName: string;
    levelId: LevelId;
    streamId: StreamId;
    solvedCount: number;
    diagnosticGradeOn20: number;
    domainMasteryPct: Record<MathDomain, number>;
    competencyMasteryPct: Record<'restitution' | 'application' | 'reasoning' | 'problem_solving', number>;
    lastActiveISO: string;
  }

  interface ServerClassroomLiveSession {
    classCode: string;
    targetDomain: MathDomain | 'all';
    status: 'lobby' | 'active' | 'finished';
    currentQuestionIndex: number;
    updatedAtISO: string;
    liveScores: Record<string, { playerName: string; score: number; streak: number; correctCount: number }>;
  }

  const classroomAnalyticsStore = new Map<string, Map<string, ServerClassStudentRecord>>();
  const classroomLiveSessionsStore = new Map<string, ServerClassroomLiveSession>();

  const loadPersistedStores = () => {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) return;
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);

      if (parsed.duels && typeof parsed.duels === 'object') {
        for (const [k, v] of Object.entries(parsed.duels)) {
          duelsStore.set(k, v as ServerDuelPayload);
        }
      }
      if (parsed.leaderboard && typeof parsed.leaderboard === 'object') {
        for (const [k, v] of Object.entries(parsed.leaderboard)) {
          sharedLeaderboardStore.set(k, v as ServerLeaderboardParticipant);
        }
      }
      if (Array.isArray(parsed.completedParticipants)) {
        for (const item of parsed.completedParticipants) {
          completedDuelParticipants.add(String(item));
        }
      }
      if (parsed.classroomAnalytics && typeof parsed.classroomAnalytics === 'object') {
        for (const [code, studentsObj] of Object.entries(parsed.classroomAnalytics)) {
          const map = new Map<string, ServerClassStudentRecord>();
          if (studentsObj && typeof studentsObj === 'object') {
            for (const [stKey, stVal] of Object.entries(studentsObj as Record<string, ServerClassStudentRecord>)) {
              map.set(stKey, stVal);
            }
          }
          classroomAnalyticsStore.set(code, map);
        }
      }
      if (parsed.classroomSessions && typeof parsed.classroomSessions === 'object') {
        for (const [code, sessionVal] of Object.entries(parsed.classroomSessions)) {
          classroomLiveSessionsStore.set(code, sessionVal as ServerClassroomLiveSession);
        }
      }
    } catch {
      // Ignore corrupt or missing initial store file
    }
  };

  const savePersistedStores = () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const analyticsObj: Record<string, Record<string, ServerClassStudentRecord>> = {};
      for (const [code, classMap] of classroomAnalyticsStore.entries()) {
        analyticsObj[code] = Object.fromEntries(classMap.entries());
      }
      const snapshot = {
        updatedAtISO: new Date().toISOString(),
        duels: Object.fromEntries(duelsStore.entries()),
        leaderboard: Object.fromEntries(sharedLeaderboardStore.entries()),
        completedParticipants: Array.from(completedDuelParticipants.values()),
        classroomAnalytics: analyticsObj,
        classroomSessions: Object.fromEntries(classroomLiveSessionsStore.entries())
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch {
      // Non-fatal if filesystem is read-only
    }
  };

  loadPersistedStores();

  app.get('/api/classroom/analytics/:classCode', (req, res) => {
    const code = (req.params.classCode || 'MATH-2026').trim().toUpperCase();
    const classMap = classroomAnalyticsStore.get(code);
    res.json({
      classCode: code,
      syncedStudents: classMap ? Array.from(classMap.values()) : []
    });
  });

  app.post('/api/classroom/analytics/:classCode/sync-student', (req, res) => {
    const code = (req.params.classCode || 'MATH-2026').trim().toUpperCase();
    const student = req.body as ServerClassStudentRecord;
    if (!student || !student.studentName) {
      res.status(400).json({ error: 'Invalid student record' });
      return;
    }

    let classMap = classroomAnalyticsStore.get(code);
    if (!classMap) {
      classMap = new Map<string, ServerClassStudentRecord>();
      classroomAnalyticsStore.set(code, classMap);
    }

    const key = student.studentName.trim().toLowerCase();
    classMap.set(key, {
      ...student,
      lastActiveISO: new Date().toISOString().slice(0, 10)
    });
    savePersistedStores();

    res.json({
      classCode: code,
      syncedStudents: Array.from(classMap.values())
    });
  });

  app.get('/api/classroom/session/:classCode', (req, res) => {
    const code = (req.params.classCode || 'MATH-2026').trim().toUpperCase();
    const session = classroomLiveSessionsStore.get(code) || {
      classCode: code,
      targetDomain: 'all',
      status: 'lobby',
      currentQuestionIndex: 0,
      updatedAtISO: new Date().toISOString(),
      liveScores: {}
    };
    res.json({ session });
  });

  app.post('/api/classroom/session/:classCode/state', (req, res) => {
    const code = (req.params.classCode || 'MATH-2026').trim().toUpperCase();
    const {
      targetDomain,
      status,
      currentQuestionIndex,
      playerUpdate
    } = (req.body || {}) as {
      targetDomain?: MathDomain | 'all';
      status?: 'lobby' | 'active' | 'finished';
      currentQuestionIndex?: number;
      playerUpdate?: { playerName: string; score: number; streak: number; correctCount: number };
    };

    const existing = classroomLiveSessionsStore.get(code) || {
      classCode: code,
      targetDomain: 'all',
      status: 'lobby',
      currentQuestionIndex: 0,
      updatedAtISO: new Date().toISOString(),
      liveScores: {}
    };

    const nextLiveScores = { ...existing.liveScores };
    if (playerUpdate && playerUpdate.playerName) {
      const pKey = playerUpdate.playerName.trim().toLowerCase();
      nextLiveScores[pKey] = playerUpdate;
    }

    const updated: ServerClassroomLiveSession = {
      classCode: code,
      targetDomain: targetDomain ?? existing.targetDomain,
      status: status ?? existing.status,
      currentQuestionIndex:
        typeof currentQuestionIndex === 'number' ? currentQuestionIndex : existing.currentQuestionIndex,
      updatedAtISO: new Date().toISOString(),
      liveScores: nextLiveScores
    };

    classroomLiveSessionsStore.set(code, updated);
    savePersistedStores();
    res.json({ session: updated });
  });

  app.get('/api/classroom/export/:classCode.csv', (req, res) => {
    const code = (req.params.classCode || 'MATH-2026').trim().toUpperCase();
    const classMap = classroomAnalyticsStore.get(code);
    const students = classMap ? Array.from(classMap.values()) : [];

    const headers = [
      'RoomCode',
      'StudentName',
      'Level',
      'Stream',
      'SolvedCount',
      'DiagnosticGradeOn20',
      'AlgebraPct',
      'AnalysisPct',
      'GeometryPct',
      'ProbStatsPct',
      'ProblemSolvingPct',
      'LastActiveISO'
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = students.map(s =>
      [
        code,
        s.studentName,
        s.levelId,
        s.streamId,
        s.solvedCount,
        s.diagnosticGradeOn20,
        s.domainMasteryPct?.arithmetic_algebra ?? 0,
        s.domainMasteryPct?.analysis_functions ?? 0,
        s.domainMasteryPct?.geometry_trig ?? 0,
        s.domainMasteryPct?.probability_stats ?? 0,
        s.competencyMasteryPct?.problem_solving ?? 0,
        s.lastActiveISO
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inspector_report_${code}.csv"`);
    res.send(csvContent);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
