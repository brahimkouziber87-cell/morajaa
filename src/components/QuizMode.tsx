import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  Question,
  DOMAINS,
  LESSONS_DATABASE,
  PEDAGOGICAL_GUIDELINES_BY_LEVEL,
  Competency,
  UserStats,
  LEVELS,
  STREAMS
} from '../constants/dataStructure';
import {
  filterQuestions,
  generateProceduralQuestion,
  getWeakestDomain,
  getSmartQuizRecommendation,
  generateMockExamPaper
} from '../game/engine';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { RecentQuestionsHistory, SolvedQuestionHistoryItem } from './RecentQuestionsHistory';
import { SocraticAiMentorModal } from './SocraticAiMentorModal';
import { Clock, Volume2, VolumeX } from 'lucide-react';
import { soundFeedback } from '../utils/feedbackSounds';

interface QuizModeProps {
  playerName: string;
  levelId: LevelId;
  streamId: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  stats: UserStats;
  initialDomain?: MathDomain | 'all';
  onAnswerSubmitted: (question: Question, isCorrect: boolean, timeSpent: number) => void;
}

const COMPETENCY_LABELS: Record<Competency, { ar: string; biof: string }> = {
  restitution: { ar: 'استرداد المعارف (20%)', biof: 'Restitution (20%)' },
  application: { ar: 'تطبيق القواعد (40%)', biof: 'Application directe (40%)' },
  reasoning: { ar: 'الاستدلال والبرهان (25%)', biof: 'Raisonnement (25%)' },
  problem_solving: { ar: 'حل المسائل المركبة (15%)', biof: 'Résolution de problèmes (15%)' }
};

/** Normalize spoken Arabic/French number words and math terms into digits/tokens and match to an option index */
export function matchSpokenTranscriptToOption(
  transcript: string,
  options: { ar: string; biof: string }[]
): { matchedIndex: number | null; normalizedText: string } {
  const raw = transcript.trim().toLowerCase();
  if (!raw) return { matchedIndex: null, normalizedText: '' };

  // 1. Check explicit option index phrases ("الخيار الأول", "خيار 1", "option 1", "numéro 2", "الجواب أ", etc.)
  const optionPatterns: { idx: number; regex: RegExp }[] = [
    { idx: 0, regex: /(الخيار\s*الأول|الخيار\s*1|خيار\s*1|رقم\s*1|الجواب\s*الأول|الجواب\s*1|الأول|option\s*1|numéro\s*1|premier|choix\s*1|réponse\s*1)/i },
    { idx: 1, regex: /(الخيار\s*الثاني|الخيار\s*2|خيار\s*2|رقم\s*2|الجواب\s*الثاني|الجواب\s*2|الثاني|option\s*2|numéro\s*2|deuxième|second|choix\s*2|réponse\s*2)/i },
    { idx: 2, regex: /(الخيار\s*الثالث|الخيار\s*3|خيار\s*3|رقم\s*3|الجواب\s*الثالث|الجواب\s*3|الثالث|option\s*3|numéro\s*3|troisième|choix\s*3|réponse\s*3)/i },
    { idx: 3, regex: /(الخيار\s*الرابع|الخيار\s*4|خيار\s*4|رقم\s*4|الجواب\s*الرابع|الجواب\s*4|الرابع|option\s*4|numéro\s*4|quatrième|choix\s*4|réponse\s*4)/i }
  ];

  for (const pat of optionPatterns) {
    if (pat.regex.test(raw) && pat.idx < options.length) {
      return { matchedIndex: pat.idx, normalizedText: raw };
    }
  }

  // 2. Replace Arabic and French number words and mathematical symbols with normalized tokens
  let normalized = raw
    .replace(/ناقص|سالب|moins|négatif|negative/g, '-')
    .replace(/زائد|موجب|plus|positif/g, '+')
    .replace(/فاصلة|نقطة|virgule|point/g, '.')
    .replace(/على|قسمة|مقسوم على|sur|divisé par/g, '/')
    .replace(/جذر مربع|جذر|racine carrée de|racine de|racine/g, '√')
    .replace(/أس اثنان|أس اثنين|مربع|او اثنان|au carré|puissance deux/g, '^2')
    .replace(/أس ثلاثة|مكعب|au cube|puissance trois/g, '^3')
    .replace(/ما لا نهاية|لانهاية|ما لانهاية|infini|l'infini/g, '∞')
    .replace(/بي|باي|pi/g, 'π')
    .replace(/يساوي|تساوي|إكس يساوي|egal|égal à|égale/g, '=')
    .replace(/صفر|zéro|zero/g, '0')
    .replace(/واحد|وحيد|حل وحيد|un|une|unique/g, '1')
    .replace(/اثنان|اثنين|إثنان|إثنين|حلان|زوج|deux/g, '2')
    .replace(/ثلاثة|ثلاث|trois/g, '3')
    .replace(/أربعة|اربعة|أربع|quatre/g, '4')
    .replace(/خمسة|خمس|cinq/g, '5')
    .replace(/ستة|ست|six/g, '6')
    .replace(/سبعة|سبع|sept/g, '7')
    .replace(/ثمانية|ثماني|ثمان|huit/g, '8')
    .replace(/تسعة|تسع|neuf/g, '9')
    .replace(/عشرة|عشر|dix/g, '10')
    .replace(/أحد عشر|احد عشر|onze/g, '11')
    .replace(/اثنا عشر|إثنا عشر|douze/g, '12')
    .replace(/خمسة عشر|خمس عشر|quinze/g, '15')
    .replace(/عشرون|عشرين|vingt/g, '20')
    .replace(/ثلاثون|ثلاثين|trente/g, '30')
    .replace(/أربعون|أربعين|quarante/g, '40')
    .replace(/خمسون|خمسين|cinquante/g, '50')
    .replace(/ستون|ستين|soixante/g, '60')
    .replace(/سبعون|سبعين|soixante-dix/g, '70')
    .replace(/ثمانون|ثمانين|quatre-vingts|quatre-vingt/g, '80')
    .replace(/تسعون|تسعين|quatre-vingt-dix/g, '90')
    .replace(/مائة|مئة|cent/g, '100')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract numbers from normalized transcript (e.g., "-3", "60", "7", "0.5")
  const spokenNumbers: string[] = normalized.match(/-?\d+(\.\d+)?/g) ?? [];

  // 3. Match exact or substring against option text (ar & biof)
  for (let i = 0; i < options.length; i++) {
    const optAr = options[i].ar.toLowerCase();
    const optBiof = options[i].biof.toLowerCase();

    if (
      optAr.includes(raw) ||
      raw.includes(optAr) ||
      optBiof.includes(raw) ||
      raw.includes(optBiof) ||
      optAr.includes(normalized) ||
      optBiof.includes(normalized)
    ) {
      return { matchedIndex: i, normalizedText: normalized };
    }
  }

  // 4. Match extracted numeric values against numbers inside option text
  if (spokenNumbers.length > 0) {
    for (const numStr of spokenNumbers) {
      for (let i = 0; i < options.length; i++) {
        const optNumsAr: string[] = options[i].ar.match(/-?\d+(\.\d+)?/g) ?? [];
        const optNumsBiof: string[] = options[i].biof.match(/-?\d+(\.\d+)?/g) ?? [];
        if (optNumsAr.includes(numStr) || optNumsBiof.includes(numStr)) {
          return { matchedIndex: i, normalizedText: normalized };
        }
      }
    }

    // Also if user spoke "1", "2", "3", "4" and no option had that literal number, treat 1..4 as option index
    const firstNum = spokenNumbers[0];
    if (firstNum) {
      const singleInt = parseInt(firstNum, 10);
      if (singleInt >= 1 && singleInt <= options.length) {
        return { matchedIndex: singleInt - 1, normalizedText: normalized };
      }
    }
  }

  return { matchedIndex: null, normalizedText: normalized };
}

export const QuizMode: React.FC<QuizModeProps> = ({
  playerName,
  levelId,
  streamId,
  lang,
  dualLang,
  stats,
  initialDomain = 'all',
  onAnswerSubmitted
}) => {
  const [practiceSubMode, setPracticeSubMode] = useState<
    'standard' | 'smart_quiz' | 'properties' | 'ai_generator' | 'procedural' | 'mock_exam'
  >('standard');
  const [domainFilter, setDomainFilter] = useState<MathDomain | 'all'>(initialDomain);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSmartAdvisorDetails, setShowSmartAdvisorDetails] = useState<boolean>(true);

  useEffect(() => {
    if (initialDomain) {
      setDomainFilter(initialDomain);
      setCurrentIndex(0);
    }
  }, [initialDomain]);
  const [proceduralSeed, setProceduralSeed] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showLessonSheet, setShowLessonSheet] = useState(false);
  const [showSocraticMentor, setShowSocraticMentor] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Voice Input (SpeechRecognition) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string>('');
  const [showVoicePanel, setShowVoicePanel] = useState<boolean>(false);
  const [voiceDialect, setVoiceDialect] = useState<'ar-MA' | 'ar-SA' | 'fr-FR'>(lang === 'ar' ? 'ar-MA' : 'fr-FR');
  const recognitionRef = useRef<any>(null);

  // AI Question Generation State
  const [aiDomain, setAiDomain] = useState<MathDomain>('analysis_functions');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiQuestion, setAiQuestion] = useState<Question | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // Mock Exam (20/20) state
  const [examSeed, setExamSeed] = useState(1);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  const questions = useMemo(
    () => filterQuestions(levelId, streamId, domainFilter),
    [levelId, streamId, domainFilter]
  );

  const propertyQuestions = useMemo(() => {
    const propList = questions.filter(
      q => q.id.includes('-prop-') || q.competency === 'application'
    );
    return propList.length > 0 ? propList : questions;
  }, [questions]);

  const smartRecommendation = useMemo(
    () => getSmartQuizRecommendation(stats, levelId, streamId, proceduralSeed),
    [stats, levelId, streamId, proceduralSeed]
  );

  const activeDeck =
    practiceSubMode === 'smart_quiz'
      ? smartRecommendation.smartDeck
      : practiceSubMode === 'properties'
      ? propertyQuestions
      : questions;

  const proceduralQuestion = useMemo(
    () => generateProceduralQuestion(levelId, streamId, proceduralSeed),
    [levelId, streamId, proceduralSeed]
  );

  const mockExamPaper = useMemo(
    () => generateMockExamPaper(levelId, streamId, examSeed),
    [levelId, streamId, examSeed]
  );

  const activeLessons = useMemo(
    () =>
      LESSONS_DATABASE.filter(
        l =>
          l.levelId === levelId &&
          (practiceSubMode === 'smart_quiz'
            ? l.domain === smartRecommendation.recommendedDomain
            : domainFilter === 'all' || l.domain === domainFilter)
      ),
    [levelId, domainFilter, practiceSubMode, smartRecommendation.recommendedDomain]
  );

  const levelGuideline = PEDAGOGICAL_GUIDELINES_BY_LEVEL[levelId];
  const weakestDomain = useMemo(() => getWeakestDomain(stats), [stats]);

  const handleGenerateAiQuestion = async (targetDomain = aiDomain, targetDiff = aiDifficulty) => {
    setAiLoading(true);
    setAiError('');
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
    setVoiceTranscript('');
    setVoiceStatusMessage('');
    setQuestionStartTime(Date.now());

    try {
      const response = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId,
          streamId,
          domain: targetDomain,
          difficulty: targetDiff,
          seed: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && data.question) {
        setAiQuestion(data.question);
      } else {
        setAiQuestion(generateProceduralQuestion(levelId, streamId, Date.now() % 89 + 1));
      }
    } catch {
      setAiError(
        lang === 'ar'
          ? 'تعذر الاتصال بخادم الذكاء الاصطناعي حالياً، تم توليد تمرين بديل من المحرك الرياضي.'
          : 'Connexion IA indisponible, exercice généré via le moteur mathématique local.'
      );
      setAiQuestion(generateProceduralQuestion(levelId, streamId, Date.now() % 89 + 1));
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
    setVoiceTranscript('');
    setVoiceStatusMessage('');
    setQuestionStartTime(Date.now());
    setExamAnswers({});
    setExamSubmitted(false);
    if (practiceSubMode === 'ai_generator' && (!aiQuestion || aiQuestion.levelId !== levelId)) {
      handleGenerateAiQuestion(aiDomain, aiDifficulty);
    }
  }, [levelId, streamId, domainFilter, practiceSubMode]);

  // Recent 10 Questions Interactive History State
  const QUIZ_HISTORY_STORAGE_KEY = 'math_inspector_quiz_recent_history_v2';
  const [recentHistory, setRecentHistory] = useState<SolvedQuestionHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(QUIZ_HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundFeedback.isEnabled());

  useEffect(() => {
    return soundFeedback.subscribe(enabled => {
      setSoundEnabled(enabled);
    });
  }, []);

  const handleToggleSound = useCallback(() => {
    const nextState = soundFeedback.toggle();
    setSoundEnabled(nextState);
  }, []);

  const handleClearHistory = useCallback(() => {
    setRecentHistory([]);
    try {
      localStorage.removeItem(QUIZ_HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const handleRetryQuestionFromHistory = useCallback((questionId: string) => {
    const targetIdx = questions.findIndex(q => q.id === questionId);
    if (targetIdx !== -1) {
      setPracticeSubMode('standard');
      setCurrentIndex(targetIdx);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowHint(false);
      setQuestionStartTime(Date.now());
      setShowHistoryPanel(false);
    }
  }, [questions]);

  const currentQuestion =
    practiceSubMode === 'ai_generator'
      ? aiQuestion
      : practiceSubMode === 'procedural'
      ? proceduralQuestion
      : activeDeck[currentIndex] || activeDeck[0];

  const handleSelectAndSubmit = useCallback(
    (optIdx: number) => {
      if (isSubmitted || !currentQuestion) return;
      setSelectedOption(optIdx);
      setIsSubmitted(true);
      const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
      const correct = optIdx === currentQuestion.correctIndex;
      if (correct) {
        soundFeedback.playCorrectSound(stats.streak + 1);
      } else {
        soundFeedback.playIncorrectSound();
      }
      onAnswerSubmitted(currentQuestion, correct, elapsedSec);

      // Record into interactive history of last 10 questions
      const pointsEarned = correct ? (currentQuestion.points || 15) : 0;
      const xpEarned = correct ? Math.round((currentQuestion.points || 15) * 1.5) : 0;

      const historyItem: SolvedQuestionHistoryItem = {
        id: `${currentQuestion.id}-${Date.now()}`,
        questionId: currentQuestion.id,
        questionTitle: currentQuestion.title,
        questionStatement: currentQuestion.statement,
        formula: currentQuestion.formula,
        domain: currentQuestion.domain,
        competency: currentQuestion.competency,
        levelId: currentQuestion.levelId,
        streamId,
        selectedOptionIndex: optIdx,
        correctOptionIndex: currentQuestion.correctIndex,
        isCorrect: correct,
        timeSpentSec: elapsedSec,
        pointsEarned,
        xpEarned,
        timestamp: Date.now(),
        selectedOptionText: currentQuestion.options[optIdx],
        correctOptionText: currentQuestion.options[currentQuestion.correctIndex],
        explanation: currentQuestion.explanation,
        inspectorTip: currentQuestion.inspectorTip
      };

      setRecentHistory(prev => {
        const updated = [historyItem, ...prev.filter(item => item.id !== historyItem.id).slice(0, 9)];
        try {
          localStorage.setItem(QUIZ_HISTORY_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [isSubmitted, currentQuestion, questionStartTime, onAnswerSubmitted, streamId, stats.streak]
  );

  // Process a spoken or dictated transcript against currentQuestion.options
  const processSpokenAnswer = useCallback(
    (spokenText: string) => {
      if (!currentQuestion || isSubmitted) return;
      setVoiceTranscript(spokenText);
      const { matchedIndex, normalizedText } = matchSpokenTranscriptToOption(spokenText, currentQuestion.options);
      if (matchedIndex !== null) {
        const matchedOptionLabel = currentQuestion.options[matchedIndex][lang];
        setVoiceStatusMessage(
          lang === 'ar'
            ? `✅ تم التعرف على الإجابة الصوتية ("${normalizedText}") ومطابقتها مع الخيار #${matchedIndex + 1}: ${matchedOptionLabel}`
            : `✅ Réponse vocale reconnue ("${normalizedText}") → Option #${matchedIndex + 1} : ${matchedOptionLabel}`
        );
        handleSelectAndSubmit(matchedIndex);
      } else {
        setVoiceStatusMessage(
          lang === 'ar'
            ? `⚠️ تم سماع "${spokenText}"، لكن لم نتمكن من مطابقته تلقائياً مع أحد الخيارات. حاول نطق العدد أو رقم الخيار (1 إلى 4).`
            : `⚠️ Entendu "${spokenText}", mais aucune option correspondante trouvée. Dites le nombre ou "Option 1 à 4".`
        );
      }
    },
    [currentQuestion, isSubmitted, lang, handleSelectAndSubmit]
  );

  // Start / Stop Browser SpeechRecognition (Voice-to-Text)
  const handleToggleVoiceInput = () => {
    if (!currentQuestion || isSubmitted) return;
    setShowVoicePanel(true);

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      setVoiceStatusMessage(
        lang === 'ar'
          ? 'ℹ️ متصفحك الحالي لا يدعم واجهة SpeechRecognition المباشرة؛ يمكنك استخدام أزرار الإملاء الصوتي السريع أو كتابة النطق أدناه.'
          : 'ℹ️ Votre navigateur ne supporte pas SpeechRecognition nativement ; utilisez la dictée assistée ci-dessous.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.lang = voiceDialect;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 4;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusMessage(
          lang === 'ar'
            ? `🎙️ جاري الاستماع (${voiceDialect})... انطق الجواب مباشرة أو قل "خيار 1 / 2 / 3 / 4"`
            : `🎙️ Écoute en cours (${voiceDialect})... Dictez la réponse ou dites "Option 1 / 2 / 3 / 4"`
        );
      };

      recognition.onresult = (event: any) => {
        if (!event?.results) return;
        let interimText = '';
        let finalTranscript = '';
        const alternativesList: string[] = [];

        for (let i = event.resultIndex || 0; i < event.results.length; i++) {
          const resultItem = event.results[i];
          const primaryText = resultItem?.[0]?.transcript || '';
          if (resultItem.isFinal) {
            finalTranscript += primaryText;
            for (let altIdx = 0; altIdx < resultItem.length; altIdx++) {
              if (resultItem[altIdx]?.transcript) {
                alternativesList.push(resultItem[altIdx].transcript);
              }
            }
          } else {
            interimText += primaryText;
          }
        }

        if (interimText) {
          setVoiceTranscript(interimText);
        }

        if (finalTranscript) {
          setIsListening(false);
          setVoiceTranscript(finalTranscript);

          // Try matching across all speech recognition alternatives for higher math accuracy
          let matchedViaAlt = false;
          for (const altText of alternativesList) {
            const check = matchSpokenTranscriptToOption(altText, currentQuestion.options);
            if (check.matchedIndex !== null) {
              processSpokenAnswer(altText);
              matchedViaAlt = true;
              break;
            }
          }
          if (!matchedViaAlt) {
            processSpokenAnswer(finalTranscript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const errCode = event?.error || 'unknown';
        setVoiceStatusMessage(
          lang === 'ar'
            ? `ℹ️ تعذر التقاط الميكروفون (${errCode}). يمكنك النقر على إحدى عبارات الإملاء الصوتي أدناه أو إدخال القيمة المنطوقة.`
            : `ℹ️ Microphone non disponible (${errCode}). Utilisez les commandes vocales rapides ci-dessous.`
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatusMessage(
        lang === 'ar'
          ? 'ℹ️ تعذر تشغيل الميكروفون. استخدم لوحة الإملاء الصوتي التفاعلي أدناه.'
          : 'ℹ️ Impossible de démarrer le microphone. Utilisez le panneau de dictée ci-dessous.'
      );
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
    setVoiceTranscript('');
    setVoiceStatusMessage('');
    setQuestionStartTime(Date.now());
    if (practiceSubMode === 'ai_generator') {
      handleGenerateAiQuestion(aiDomain, aiDifficulty);
    } else if (practiceSubMode === 'procedural') {
      setProceduralSeed(prev => prev + 1);
    } else if (activeDeck.length > 0) {
      setCurrentIndex(prev => (prev + 1) % activeDeck.length);
    }
  };

  const handleTargetWeakestDomain = () => {
    soundFeedback.playClickSound();
    setPracticeSubMode('smart_quiz');
    setDomainFilter(smartRecommendation.recommendedDomain);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
  };

  const handleLaunchSmartAiTopic = () => {
    soundFeedback.playClickSound();
    const targetDom = smartRecommendation.recommendedDomain;
    setAiDomain(targetDom);
    setPracticeSubMode('ai_generator');
    handleGenerateAiQuestion(targetDom, 'medium');
  };

  const handleSubmitMockExam = () => {
    if (examSubmitted) return;
    setExamSubmitted(true);
    let earnedPoints = 0;
    mockExamPaper.forEach((sec, idx) => {
      const chosen = examAnswers[idx];
      const isCorrect = chosen === sec.question.correctIndex;
      if (isCorrect) {
        earnedPoints += sec.allocatedPointsOn20;
      }
      onAnswerSubmitted(sec.question, isCorrect, 20);
    });
    soundFeedback.playExamResultSound(earnedPoints >= 10);
  };

  const examEarnedOn20 = mockExamPaper.reduce((acc, sec, idx) => {
    return acc + (examAnswers[idx] === sec.question.correctIndex ? sec.allocatedPointsOn20 : 0);
  }, 0);

  const currentLevelName = LEVELS.find(l => l.id === levelId)?.shortName[lang] || levelId;
  const currentStreamName = STREAMS[streamId]?.name[lang] || streamId;

  return (
    <div className="space-y-6">
      {/* SMART QUIZ ADAPTIVE RECOMMENDATION PANEL (المستشار الذكي التكيفي: اقتراح الموضوع الأفضل التالي) */}
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-400 font-semibold">
              <span>🧭 {lang === 'ar' ? 'المستشار التربوي الذكي (Smart Quiz)' : 'Conseiller Adaptatif (Smart Quiz)'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300">
                {lang === 'ar'
                  ? `المجال الأضعف حالياً: ${DOMAINS[smartRecommendation.recommendedDomain].name.ar}`
                  : `Domaine prioritaire : ${DOMAINS[smartRecommendation.recommendedDomain].name.biof}`}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 font-mono tabular-nums">
                {smartRecommendation.rankedDomains[0].total > 0
                  ? `${smartRecommendation.rankedDomains[0].accuracyPct}% (${smartRecommendation.rankedDomains[0].correct}/${smartRecommendation.rankedDomains[0].total})`
                  : lang === 'ar'
                  ? '0 تمرين منجز'
                  : '0 résolu'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-white">
              {lang === 'ar' ? 'الموضوع المقترح التالي: ' : 'Prochain sujet recommandé : '}
              <span className="text-amber-300">{smartRecommendation.recommendedTopicTitle[lang]}</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {smartRecommendation.pedagogicalReason[lang]}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTargetWeakestDomain}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                practiceSubMode === 'smart_quiz'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300/60'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <span>🎯</span>
              <span>
                {practiceSubMode === 'smart_quiz'
                  ? lang === 'ar'
                    ? 'الاختبار الذكي نشط الآن'
                    : 'Smart Quiz Actif'
                  : smartRecommendation.actionCallout[lang]}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLaunchSmartAiTopic}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-fuchsia-300 border border-fuchsia-700/50 transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'ar' ? '✨ تمرين ذكاء اصطناعي في هذا المجال' : '✨ Exercice IA sur ce Domaine'}
            </button>

            <button
              type="button"
              onClick={() => setShowSmartAdvisorDetails(prev => !prev)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 cursor-pointer whitespace-nowrap"
            >
              {showSmartAdvisorDetails
                ? lang === 'ar'
                  ? 'إخفاء تشخيص الفروع'
                  : 'Masquer diagnostic'
                : lang === 'ar'
                ? 'تشخيص الفروع الـ 4'
                : 'Diagnostic 4 domaines'}
            </button>
          </div>
        </div>

        {/* 4-Domain Mastery Ranking Strip from stats.domainScores */}
        {showSmartAdvisorDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800">
            {smartRecommendation.rankedDomains.map((item, idx) => {
              const isPrimaryTarget = idx === 0;
              const isCurrentFilter =
                (practiceSubMode === 'smart_quiz' && isPrimaryTarget) ||
                (practiceSubMode === 'standard' && domainFilter === item.domain);

              return (
                <button
                  key={item.domain}
                  type="button"
                  onClick={() => {
                    soundFeedback.playClickSound();
                    setPracticeSubMode('standard');
                    setDomainFilter(item.domain);
                    setCurrentIndex(0);
                  }}
                  className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isCurrentFilter
                      ? 'bg-indigo-950/50 border-indigo-500'
                      : isPrimaryTarget
                      ? 'bg-slate-950 border-amber-500/50 hover:border-amber-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-xs font-bold text-white truncate">
                      {item.icon} {item.domainName[lang]}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-amber-300 tabular-nums shrink-0">
                      {item.total > 0 ? `${item.accuracyPct}%` : '—'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.status === 'critical'
                          ? 'bg-rose-500'
                          : item.status === 'unexplored'
                          ? 'bg-amber-500'
                          : item.status === 'mastered'
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${item.total > 0 ? Math.max(8, item.accuracyPct) : 12}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 w-full">
                    <span className="truncate">
                      {isPrimaryTarget ? (lang === 'ar' ? '★ مقترح الآن: ' : '★ Recommandé : ') : ''}
                      {item.statusLabel[lang]}
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      {item.correct}/{item.total}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mode Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPracticeSubMode('standard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              practiceSubMode === 'standard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {lang === 'ar' ? `بنك التمارين (${questions.length})` : `Banque Officielle (${questions.length})`}
          </button>

          <button
            type="button"
            onClick={handleTargetWeakestDomain}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              practiceSubMode === 'smart_quiz'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-amber-300 border border-amber-700/60 hover:text-white'
            }`}
          >
            {lang === 'ar'
              ? `🧭 الاختبار الذكي (${smartRecommendation.smartDeck.length})`
              : `🧭 Smart Quiz (${smartRecommendation.smartDeck.length})`}
          </button>

          <button
            type="button"
            onClick={() => setPracticeSubMode('properties')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              practiceSubMode === 'properties'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-amber-300 border border-amber-700/60 hover:text-white'
            }`}
          >
            {lang === 'ar'
              ? `📐 تطبيق الخاصيات (${propertyQuestions.length})`
              : `📐 Application des Propriétés (${propertyQuestions.length})`}
          </button>

          <button
            type="button"
            onClick={() => {
              setPracticeSubMode('ai_generator');
              if (!aiQuestion) {
                handleGenerateAiQuestion(aiDomain, aiDifficulty);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              practiceSubMode === 'ai_generator'
                ? 'bg-fuchsia-600 text-white shadow-sm'
                : 'bg-slate-950 text-fuchsia-300 border border-fuchsia-800/60 hover:text-white'
            }`}
          >
            {lang === 'ar' ? '✨ توليد بالذكاء الاصطناعي (AI)' : '✨ Générateur IA sur Mesure'}
          </button>

          <button
            type="button"
            onClick={() => setPracticeSubMode('procedural')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              practiceSubMode === 'procedural'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {lang === 'ar' ? '∞ المولد الجبري البارامتري' : '∞ Générateur Paramétrique'}
          </button>

          <button
            type="button"
            onClick={() => setPracticeSubMode('mock_exam')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              practiceSubMode === 'mock_exam'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'ورقة الامتحان التجريبي (/20)' : 'Examen Blanc Officiel (/20)'}
          </button>
        </div>

        {/* Lesson Sheet + History + Sound Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLessonSheet(!showLessonSheet)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border ${
              showLessonSheet
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
            }`}
          >
            {showLessonSheet
              ? (lang === 'ar' ? '📖 إخفاء ملخص الدرس' : '📖 Masquer le Cours')
              : (lang === 'ar' ? '📖 عرض ملخص الدرس' : '📖 Afficher le Cours')}
          </button>

          <button
            type="button"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              showHistoryPanel
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'سجل آخر 10 أسئلة' : 'Historique (10 Q)'}</span>
            <span className="font-mono font-bold tabular-nums">({recentHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            title={
              soundEnabled
                ? (lang === 'ar' ? 'كتم المؤثرات الصوتية التفاعلية' : 'Désactiver les effets sonores')
                : (lang === 'ar' ? 'تفعيل المؤثرات الصوتية التفاعلية' : 'Activer les effets sonores')
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
              soundEnabled
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>
              {soundEnabled
                ? (lang === 'ar' ? 'الصوت: مفعل' : 'Sons : Activés')
                : (lang === 'ar' ? 'الصوت: صامت' : 'Sons : Muet')}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive History of Last 10 Questions */}
      <RecentQuestionsHistory
        history={recentHistory}
        lang={lang}
        dualLang={dualLang}
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        onClearHistory={handleClearHistory}
        onRetryQuestion={handleRetryQuestionFromHistory}
      />

      {/* AI Custom Generator Control Bar (visible when AI mode is active) */}
      {practiceSubMode === 'ai_generator' && (
        <div className="bg-slate-900 border border-fuchsia-800/50 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <p className="text-xs font-bold text-fuchsia-400">
                {lang === 'ar'
                  ? `الذكاء الاصطناعي التربوي مخصص لـ: ${playerName || 'المتعلم'} · ${currentLevelName} (${currentStreamName})`
                  : `IA Pédagogique personnalisée pour : ${playerName || 'Élève'} · ${currentLevelName} (${currentStreamName})`}
              </p>
              <h4 className="text-base font-bold text-white mt-0.5">
                {lang === 'ar'
                  ? 'اختر المجال ودرجة الصعوبة لتوليد تمرين بالذكاء الاصطناعي حسب مستواك الدراسي:'
                  : 'Choisissez le domaine et la difficulté pour générer un exercice IA adapté à votre niveau :'}
              </h4>
            </div>
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => handleGenerateAiQuestion(aiDomain, aiDifficulty)}
              className="px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {aiLoading
                ? (lang === 'ar' ? 'جاري التوليد بالذكاء الاصطناعي...' : 'Génération IA en cours...')
                : (lang === 'ar' ? '✨ توليد تمرين ذكي جديد الآن' : '✨ Générer un Nouvel Exercice IA')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                {lang === 'ar' ? 'المجال الرياضي المستهدف:' : 'Domaine Mathématique Ciblé :'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(DOMAINS) as MathDomain[]).map(domKey => (
                  <button
                    key={domKey}
                    type="button"
                    onClick={() => setAiDomain(domKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      aiDomain === domKey
                        ? 'bg-fuchsia-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {DOMAINS[domKey].icon} {DOMAINS[domKey].name[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                {lang === 'ar' ? 'درجة الصعوبة:' : 'Niveau de Difficulté :'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy' as const, ar: 'تطبيق مباشر (سهل)', biof: 'Application (Facile)' },
                  { id: 'medium' as const, ar: 'فرض محروس (متوسط)', biof: 'Devoir (Moyen)' },
                  { id: 'hard' as const, ar: 'امتحان / تميز (صعب)', biof: 'Examen / Excellence' }
                ].map(diff => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setAiDifficulty(diff.id)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      aiDifficulty === diff.id
                        ? 'bg-fuchsia-600/25 border-fuchsia-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {aiError && (
            <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-lg px-3 py-2">
              {aiError}
            </p>
          )}
        </div>
      )}

      {/* Domain Filter Bar (visible in Standard & Properties modes) */}
      {(practiceSubMode === 'standard' || practiceSubMode === 'properties') && (
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-3">
          <button
            type="button"
            onClick={() => setDomainFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              domainFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'جميع المجالات' : 'Tous les Domaines'}
          </button>
          {(Object.keys(DOMAINS) as MathDomain[]).map(domKey => (
            <button
              key={domKey}
              type="button"
              onClick={() => setDomainFilter(domKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                domainFilter === domKey
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {DOMAINS[domKey].icon} {DOMAINS[domKey].name[lang]}
            </button>
          ))}
        </div>
      )}

      {/* Comprehensive Lesson Summary Card */}
      {showLessonSheet && activeLessons.length > 0 && (
        <div className="lesson-sheet bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6">
          {/* Official Pedagogical Guidelines Header Banner */}
          {levelGuideline && (
            <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-400">
                  {levelGuideline.officialReference[lang]}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {lang === 'ar' ? 'وفق التوجيهات التربوية الرسمية' : 'Conforme aux Orientations Pédagogiques'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {levelGuideline.didacticVision[lang]}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-amber-300">
                  {lang === 'ar' ? 'المكتسبات القبلية اللازمة:' : 'Prérequis indispensables :'}
                </span>
                {levelGuideline.prerequisites.map((pre, pIdx) => (
                  <span
                    key={pIdx}
                    className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg"
                  >
                    {pre[lang]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeLessons.map(lesson => (
            <div key={lesson.id} className="space-y-4 pt-2 border-t border-slate-800/70 first:border-t-0 first:pt-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <p className="text-xs text-indigo-400 font-semibold">
                    {lang === 'ar' ? 'ملخص المراجعة الشاملة والمهارات الأساسية' : 'Synthèse de Révision Générale & Compétences Clés'}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {lesson.title[lang]}
                  </h3>
                  {dualLang && (
                    <p className="text-xs text-slate-400 mt-0.5" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                      {lesson.title[lang === 'ar' ? 'biof' : 'ar']}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {DOMAINS[lesson.domain].name[lang]}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-6 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">
                    {lang === 'ar' ? 'الأهداف والكفايات الواجب ضبطها:' : 'Objectifs et Compétences Exigibles :'}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {lesson.objectives.map((obj, idx) => (
                      <li key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                        <p className="font-medium text-slate-200">{obj[lang]}</p>
                        {dualLang && (
                          <p className="text-xs text-slate-400 mt-1" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                            {obj[lang === 'ar' ? 'biof' : 'ar']}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">
                    {lang === 'ar' ? 'العلاقات والقواعد المرجعية:' : 'Formules et Relations de Référence :'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.keyFormulas.map((kf, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <span className="text-xs text-slate-400 block mb-1.5">{kf.label[lang]}</span>
                        <FormulaDisplay formula={kf.formula} className="text-sm py-2" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3.5 text-xs text-amber-200 leading-relaxed">
                    <p className="font-semibold">{lesson.inspectorNote[lang]}</p>
                    {dualLang && (
                      <p className="text-amber-300/80 mt-1" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                        {lesson.inspectorNote[lang === 'ar' ? 'biof' : 'ar']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-MODE: MOCK EXAM PAPER (ورقة الامتحان التجريبي الموحد على 20) */}
      {practiceSubMode === 'mock_exam' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <p className="text-xs font-semibold text-emerald-400">
                {lang === 'ar'
                  ? 'محاكاة الامتحان الإشهادي الموحد · سلم التنقيط الرسمي (20/20)'
                  : 'Simulation d\'Examen Officiel · Barème Normalisé sur 20 Points'}
              </p>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {lang === 'ar'
                  ? `الفرض الإشهادي التجريبي رقم #${examSeed} (4 تمارين مستقلة)`
                  : `Épreuve Blanche Officielle #${examSeed} (4 Exercices)`}
              </h3>
            </div>

            {examSubmitted && (
              <div className="bg-emerald-950/60 border border-emerald-500 px-4 py-2 rounded-xl font-mono text-lg font-extrabold text-emerald-300 tabular-nums">
                {lang === 'ar' ? `النقطة النهائية: ${examEarnedOn20} / 20` : `Note Finale : ${examEarnedOn20} / 20`}
              </div>
            )}
          </div>

          <div className="space-y-5">
            {mockExamPaper.map((sec, sIdx) => {
              const q = sec.question;
              const chosen = examAnswers[sIdx];

              return (
                <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <h4 className="text-sm md:text-base font-bold text-indigo-300">
                      {sec.title[lang]}
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                      ({sec.allocatedPointsOn20} / 20)
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">
                    <MathText text={q.statement[lang]} />
                  </p>
                  {q.formula && <FormulaDisplay formula={q.formula} copyable className="text-base py-2" />}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = chosen === oIdx;
                      const isCorrect = oIdx === q.correctIndex;
                      let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500/60';

                      if (!examSubmitted && isChosen) {
                        style = 'bg-indigo-600/25 border-indigo-500 text-white font-bold';
                      } else if (examSubmitted) {
                        if (isCorrect) {
                          style = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                        } else if (isChosen) {
                          style = 'bg-rose-950/50 border-rose-500 text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={examSubmitted}
                          onClick={() => setExamAnswers(prev => ({ ...prev, [sIdx]: oIdx }))}
                          className={`p-3 rounded-xl border text-start text-xs md:text-sm transition-all cursor-pointer ${style}`}
                        >
                          <MathText text={opt[lang]} />
                        </button>
                      );
                    })}
                  </div>

                  {examSubmitted && (
                    <div className="pt-2 text-xs text-slate-300 border-t border-slate-800/80">
                      <strong className="text-emerald-400">
                        {lang === 'ar' ? 'عناصر الإجابة:' : 'Éléments de corrigé :'}
                      </strong>{' '}
                      {q.explanation[lang]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {!examSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitMockExam}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'تسليم ورقة الامتحان وتصحيحها آلياً (/20)' : 'Remettre la Copie et Corriger (/20)'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setExamSeed(prev => prev + 1);
                  setExamAnswers({});
                  setExamSubmitted(false);
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'توليد نموذج امتحان تجريبي جديد ←' : 'Générer un Nouvel Examen Blanc →'}
              </button>
            )}
          </div>
        </div>
      ) : aiLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <p className="text-base font-bold text-fuchsia-300">
            {lang === 'ar'
              ? `جاري صياغة تمرين رياضي مخصص لمستوى ${currentLevelName} بالذكاء الاصطناعي...`
              : `Génération d'un exercice sur mesure pour le niveau ${currentLevelName}...`}
          </p>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'يتم إعداد المعادلات والخيارات والتعليل البيداغوجي باللغتين العربية والفرنسية.'
              : 'Préparation de l\'énoncé, des formules et de la démonstration bilingue.'}
          </p>
        </div>
      ) : currentQuestion ? (
        /* SUB-MODE: STANDARD, AI-GENERATED, OR PROCEDURAL QUESTION */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-indigo-400">
                {practiceSubMode === 'ai_generator'
                  ? (lang === 'ar' ? `✨ تمرين الذكاء الاصطناعي (${currentLevelName})` : `✨ Exercice IA (${currentLevelName})`)
                  : practiceSubMode === 'smart_quiz'
                  ? (lang === 'ar' ? `🧭 المسار الذكي التكيفي · التمرين ${currentIndex + 1} من ${activeDeck.length}` : `🧭 Smart Quiz Adaptatif · Question ${currentIndex + 1} sur ${activeDeck.length}`)
                  : practiceSubMode === 'procedural'
                  ? (lang === 'ar' ? `مولد التمارين البارامتري #${proceduralSeed}` : `Générateur Paramétrique #${proceduralSeed}`)
                  : practiceSubMode === 'properties'
                  ? (lang === 'ar' ? `📐 تمرين تطبيقي للخاصيات ${currentIndex + 1} من ${activeDeck.length}` : `📐 Application des Propriétés ${currentIndex + 1} sur ${activeDeck.length}`)
                  : (lang === 'ar' ? `التمرين ${currentIndex + 1} من ${activeDeck.length}` : `Exercice ${currentIndex + 1} sur ${activeDeck.length}`)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{DOMAINS[currentQuestion.domain].name[lang]}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-semibold">{COMPETENCY_LABELS[currentQuestion.competency][lang]}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isSubmitted && (
                <>
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    aria-label={lang === 'ar' ? 'الإدخال الصوتي للجواب' : 'Dictée vocale de la réponse'}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-md'
                        : 'bg-indigo-950/70 hover:bg-indigo-900/70 border-indigo-500/60 text-indigo-200'
                    }`}
                  >
                    <span>🎙️</span>
                    <span>
                      {isListening
                        ? lang === 'ar'
                          ? 'جاري الاستماع... (إيقاف)'
                          : 'Écoute... (Arrêter)'
                        : lang === 'ar'
                        ? 'الإدخال الصوتي (Voice Input)'
                        : 'Dictée Vocale (Voice Input)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFeedback.playHintSound();
                      setShowHint(prev => !prev);
                    }}
                    className="px-3 py-1 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/50 text-amber-300 rounded-lg font-bold cursor-pointer"
                  >
                    {showHint
                      ? (lang === 'ar' ? 'إخفاء التلميح المنهجي' : 'Masquer l\'Indice')
                      : (lang === 'ar' ? '💡 تلميح منهجي (Indice)' : '💡 Indice Pédagogique')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSocraticMentor(true)}
                    className="px-3 py-1 bg-indigo-950/70 hover:bg-indigo-900/70 border border-indigo-500/60 text-indigo-300 rounded-lg font-bold cursor-pointer flex items-center gap-1"
                    title={lang === 'ar' ? 'بناء البرهان خطوة بخطوة بالاستدلال السقراطي' : 'Tuteur socratique pas à pas'}
                  >
                    <span>🧠</span>
                    <span>{lang === 'ar' ? 'المرشد السقراطي' : 'Tuteur Socratique'}</span>
                  </button>
                </>
              )}
              {(practiceSubMode === 'procedural' || practiceSubMode === 'ai_generator') && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'توليد تمرين جديد ↻' : 'Nouvel Exercice ↻'}
                </button>
              )}
              <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                +{currentQuestion.points} {lang === 'ar' ? 'نقطة' : 'pts'}
              </span>
            </div>
          </div>

          <div className="my-5 space-y-3">
            {(practiceSubMode === 'properties' || currentQuestion.id.includes('-prop-')) && (
              <div className="bg-amber-950/35 border border-amber-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-300">
                  {lang === 'ar'
                    ? '📐 تمرين تطبيقي للخاصيات والمبرهنات: استخرج المعطيات وطبق الخاصية الرياضية المناسبة بدقة'
                    : '📐 Exercice d\'Application de Propriété : Identifiez les hypothèses et appliquez le théorème adéquat'}
                </span>
                {currentQuestion.hint && (
                  <span className="text-amber-200/90 font-medium">
                    {currentQuestion.hint[lang]}
                  </span>
                )}
              </div>
            )}
            <h3 className="text-xl font-bold text-white">
              {currentQuestion.title[lang]}
            </h3>
            {dualLang && (
              <p className="text-sm font-medium text-indigo-300" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                {currentQuestion.title[lang === 'ar' ? 'biof' : 'ar']}
              </p>
            )}

            <p className="text-base text-slate-200 leading-relaxed">
              <MathText text={currentQuestion.statement[lang]} />
            </p>
            {dualLang && (
              <p className="text-sm text-slate-400 leading-relaxed" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                <MathText text={currentQuestion.statement[lang === 'ar' ? 'biof' : 'ar']} />
              </p>
            )}

            {currentQuestion.formula && (
              <div className="pt-2">
                <FormulaDisplay formula={currentQuestion.formula} copyable />
              </div>
            )}

            {/* Didactic Scaffolding / Hint Box */}
            {showHint && !isSubmitted && (
              <div className="bg-amber-950/30 border border-amber-700/50 rounded-xl p-3.5 text-xs md:text-sm text-amber-200 space-y-1">
                <p className="font-bold text-amber-300">
                  {lang === 'ar' ? '💡 توجيه منهجي لبناء الجواب (Scaffolding):' : '💡 Indice Méthodologique (Scaffolding) :'}
                </p>
                <p>{(currentQuestion.hint || currentQuestion.inspectorTip)[lang]}</p>
                {dualLang && (
                  <p className="text-xs text-amber-300/80" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                    {(currentQuestion.hint || currentQuestion.inspectorTip)[lang === 'ar' ? 'biof' : 'ar']}
                  </p>
                )}
              </div>
            )}

            {/* Voice Dictation & SpeechRecognition Accessibility Bar */}
            {(showVoicePanel || isListening || voiceStatusMessage) && !isSubmitted && (
              <div className="bg-slate-950 border border-indigo-500/50 rounded-xl p-4 space-y-3 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isListening ? 'bg-rose-500 animate-ping' : 'bg-indigo-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-indigo-300">
                      {lang === 'ar'
                        ? '🎙️ نظام تحويل الصوت إلى نص للإجابات الرياضية (SpeechRecognition Voice-to-Text)'
                        : '🎙️ Système Voix-vers-Texte des Réponses Mathématiques (SpeechRecognition API)'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Dialect Selector */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                      {(
                        [
                          { code: 'ar-MA', label: '🇲🇦 عربي (المغرب)' },
                          { code: 'ar-SA', label: '🇸🇦 عربي فصحى' },
                          { code: 'fr-FR', label: '🇫🇷 Français BIOF' }
                        ] as const
                      ).map(d => (
                        <button
                          key={d.code}
                          type="button"
                          onClick={() => setVoiceDialect(d.code)}
                          className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors ${
                            voiceDialect === d.code
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVoicePanel(false)}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer px-1.5"
                    >
                      {lang === 'ar' ? 'إغلاق ✕' : 'Fermer ✕'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  {lang === 'ar'
                    ? 'اضغط على زر الميكروفون وتحدث بالجواب مباشرة (مثل: "7" أو "ناقص 3" أو "جذر 2" أو "خيار 1") ليتم تحويل صوتك إلى نص ومطابقته تلقائياً:'
                    : 'Cliquez sur le microphone et dictez votre réponse (ex: "7", "moins 3", "racine de 2" ou "Option 1") pour la convertir en texte et valider :'}
                </p>

                {/* Live Voice-to-Text Input + Direct Microphone Trigger + Submit */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                    }`}
                  >
                    <span>🎙️</span>
                    <span>
                      {isListening
                        ? lang === 'ar'
                          ? 'إيقاف التسجيل'
                          : 'Arrêter'
                        : lang === 'ar'
                        ? 'تحدث الآن'
                        : 'Parler'}
                    </span>
                  </button>

                  <input
                    type="text"
                    value={voiceTranscript}
                    onChange={e => setVoiceTranscript(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && voiceTranscript.trim()) {
                        processSpokenAnswer(voiceTranscript);
                      }
                    }}
                    placeholder={
                      lang === 'ar'
                        ? 'النص المحول من صوتك يظهر هنا مباشرة أثناء التحدث (أو اكتب الجواب)...'
                        : 'Votre réponse vocale convertie en texte apparaît ici en direct...'
                    }
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => voiceTranscript.trim() && processSpokenAnswer(voiceTranscript)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shrink-0"
                  >
                    {lang === 'ar' ? 'تطبيق النطق الصوتي ✓' : 'Valider la dictée ✓'}
                  </button>
                </div>

                {/* Quick Voice Simulation Chips for Accessibility & Testing */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'محاكاة سريعة للنطق الصوتي:' : 'Commandes vocales rapides :'}
                  </span>
                  {currentQuestion.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => processSpokenAnswer(opt[lang])}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-indigo-200 font-medium cursor-pointer transition-colors"
                    >
                      🗣️ &ldquo;{opt[lang]}&rdquo;
                    </button>
                  ))}
                </div>

                {voiceStatusMessage && (
                  <p className="text-xs font-semibold text-amber-300 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
                    {voiceStatusMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-6">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/70 hover:bg-slate-900';
              let statusLabel = '';

              if (isSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                  statusLabel = lang === 'ar' ? '✓ جواب صحيح' : '✓ Réponse exacte';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                  statusLabel = lang === 'ar' ? '✗ جواب خاطئ' : '✗ Réponse incorrecte';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-800/50 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleSelectAndSubmit(idx)}
                  className={`flex items-center justify-between p-4 rounded-xl border text-start transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <span className="text-sm md:text-base font-medium block" dir="auto">
                        <MathText text={option[lang]} />
                      </span>
                      {dualLang && option.ar !== option.biof && (
                        <span className="text-xs text-slate-400 block" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                          <MathText text={option[lang === 'ar' ? 'biof' : 'ar']} />
                        </span>
                      )}
                    </div>
                  </div>
                  {statusLabel && (
                    <span className="text-xs font-bold shrink-0 ms-3">
                      {statusLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
              {voiceStatusMessage && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <span>🎙️</span>
                  <span>{voiceStatusMessage}</span>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-emerald-400">
                  {lang === 'ar' ? 'التعليل الرياضي المفصل:' : 'Justification Mathématique Détaillée :'}
                </h4>
                <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  <MathText text={currentQuestion.explanation[lang]} />
                </div>
                {dualLang && (
                  <div className="text-xs text-slate-400 whitespace-pre-line pt-2 border-t border-slate-800/80" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                    <MathText text={currentQuestion.explanation[lang === 'ar' ? 'biof' : 'ar']} />
                  </div>
                )}
              </div>

              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-indigo-300">
                    {currentQuestion.inspectorTip[lang]}
                  </p>
                  {dualLang && (
                    <p className="text-xs text-indigo-400/90" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                      {currentQuestion.inspectorTip[lang === 'ar' ? 'biof' : 'ar']}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {practiceSubMode === 'ai_generator'
                    ? (lang === 'ar' ? '✨ توليد تمرين ذكي جديد ←' : '✨ Nouvel Exercice IA →')
                    : practiceSubMode === 'procedural'
                    ? (lang === 'ar' ? 'توليد تمرين بارامتري جديد ←' : 'Générer un Nouvel Exercice →')
                    : (lang === 'ar' ? 'التمرين الموالي ←' : 'Exercice Suivant →')}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-base text-slate-300">
            {lang === 'ar'
              ? 'لا توجد تمارين في هذا المجال الفرعي حالياً لهذا المستوى.'
              : 'Aucun exercice dans ce sous-domaine pour ce niveau.'}
          </p>
          <button
            type="button"
            onClick={() => setDomainFilter('all')}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            {lang === 'ar' ? 'عرض جميع المجالات' : 'Afficher tous les domaines'}
          </button>
        </div>
      )}

      {/* Socratic AI Mentor Scaffolding Modal */}
      {currentQuestion && (
        <SocraticAiMentorModal
          isOpen={showSocraticMentor}
          onClose={() => setShowSocraticMentor(false)}
          question={currentQuestion}
          lang={lang}
          dualLang={dualLang}
          onSuccessScaffolding={() => setShowHint(true)}
        />
      )}
    </div>
  );
};
