import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  createInitialStats, 
  filterQuestions, 
  filterPitfalls, 
  calculateAnswerPoints, 
  getRankByXP, 
  generateInspectorReview,
  LAB_FUNCTIONS,
  permuteQuestionOptions,
  generateTimedChallengeDeck,
  calculateTimedFinalScore,
  rankLeaderboardEntries,
  INITIAL_LEADERBOARD,
  evaluateStudentBadges,
  generateProceduralQuestion,
  getWeakestDomain,
  generateMockExamPaper
} from './engine';

test('initial stats initializes with zero score and proper competency categories', () => {
  const stats = createInitialStats();
  assert.equal(stats.score, 0);
  assert.equal(stats.xp, 0);
  assert.equal(stats.streak, 0);
  assert.equal(stats.solvedCount, 0);
  assert.ok(stats.competencyScores.restitution !== undefined);
  assert.ok(stats.competencyScores.reasoning !== undefined);
});

test('filterQuestions filters correctly by level and stream and caches result', () => {
  const q1ac = filterQuestions('1ac', 'general');
  const q1acSecondCall = filterQuestions('1ac', 'general');
  assert.equal(q1ac, q1acSecondCall, 'Should return memoized array reference to avoid redundant operations');
  assert.ok(q1ac.length > 0);
  q1ac.forEach(q => {
    assert.equal(q.levelId, '1ac');
  });

  const q2bacSm = filterQuestions('2bac', '2bac_sm');
  assert.ok(q2bacSm.length >= 6);
  const smSpecific = q2bacSm.find(q => q.id === 'q-2bac-sm-01');
  assert.ok(smSpecific !== undefined, 'Should include 2Bac SM questions');
});

test('permuteQuestionOptions rotates options deterministically while preserving correct option value', () => {
  const original = filterQuestions('2bac', '2bac_pc')[0];
  const expectedCorrectText = original.options[original.correctIndex].ar;
  const permuted = permuteQuestionOptions(original, 3);
  assert.equal(permuted.options[permuted.correctIndex].ar, expectedCorrectText);
});

test('generateTimedChallengeDeck returns exactly 10 unique non-repeating questions', () => {
  const deck = generateTimedChallengeDeck('2bac', '2bac_pc', 10, 1);
  assert.equal(deck.length, 10);
  const uniqueIds = new Set(deck.map(q => q.id));
  assert.equal(uniqueIds.size, 10, 'All 10 questions in timed challenge deck must be unique');
});

test('calculateTimedFinalScore and rankLeaderboardEntries compute and sort properly', () => {
  const res = calculateTimedFinalScore(200, 8, 10, 30);
  assert.equal(res.accuracyPct, 80);
  assert.ok(res.timeBonus > 0);
  assert.equal(res.finalScore, 200 + res.timeBonus);

  const ranked = rankLeaderboardEntries([
    ...INITIAL_LEADERBOARD,
    {
      id: 'lb-test-top',
      studentName: 'Test Champion',
      levelId: '2bac',
      streamId: '2bac_sm',
      score: 999,
      correctCount: 10,
      totalQuestions: 10,
      timeRemainingSec: 60,
      dateISO: '2026-11-08'
    }
  ]);
  assert.equal(ranked[0].id, 'lb-test-top');
});

test('evaluateStudentBadges unlocks سيد المعادلات وخبير الدوال وسريع الحساب based on UserStats score and domain mastery', () => {
  const stats = createInitialStats();
  const initialBadges = evaluateStudentBadges(stats);
  assert.equal(initialBadges.length, 8);
  assert.equal(initialBadges.find(b => b.id === 'badge-equations-master')?.title.ar, 'سيد المعادلات');
  assert.equal(initialBadges.find(b => b.id === 'badge-functions-expert')?.title.ar, 'خبير الدوال');
  assert.equal(initialBadges.find(b => b.id === 'badge-speed-calculator')?.title.ar, 'سريع الحساب');
  assert.equal(initialBadges.every(b => !b.unlocked), true);

  stats.score = 110;
  const unlockedBadges = evaluateStudentBadges(stats);
  assert.equal(unlockedBadges.find(b => b.id === 'badge-equations-master')?.unlocked, true);
  assert.equal(unlockedBadges.find(b => b.id === 'badge-functions-expert')?.unlocked, true);
  assert.equal(unlockedBadges.find(b => b.id === 'badge-speed-calculator')?.unlocked, true);
});

test('generateProceduralQuestion generates valid unique questions for both Collège and Lycée', () => {
  const qCol = generateProceduralQuestion('2ac', 'general', 4);
  assert.ok(qCol.formula && qCol.formula.includes('x'));
  assert.equal(qCol.options.length, 4);

  const qLyc = generateProceduralQuestion('2bac', '2bac_pc', 7);
  assert.ok(qLyc.formula && qLyc.formula.includes('f(x)'));
  assert.equal(qLyc.options.length, 4);
});

test('getWeakestDomain identifies lowest-accuracy domain and generateMockExamPaper totals 20 points', () => {
  const stats = createInitialStats();
  stats.domainScores.arithmetic_algebra = { correct: 5, total: 5 };
  stats.domainScores.analysis_functions = { correct: 1, total: 5 };
  stats.domainScores.geometry_trig = { correct: 4, total: 5 };
  stats.domainScores.probability_stats = { correct: 4, total: 5 };
  assert.equal(getWeakestDomain(stats), 'analysis_functions');

  const paper = generateMockExamPaper('2bac', '2bac_pc', 1);
  assert.equal(paper.length, 4);
  const totalExamPoints = paper.reduce((acc, s) => acc + s.allocatedPointsOn20, 0);
  assert.equal(totalExamPoints, 20);
});

test('filterPitfalls retrieves relevant pedagogical pitfalls', () => {
  const pitfalls = filterPitfalls('3ac', 'general');
  assert.ok(pitfalls.length > 0);
  const rootPitfall = pitfalls.find(p => p.id === 'pitfall-03');
  assert.ok(rootPitfall !== undefined, 'Should have root pitfall');
  assert.ok(rootPitfall.steps.some(s => s.isError), 'Must have an error step to detect');
});

test('calculateAnswerPoints applies streak and time multipliers correctly', () => {
  const res1 = calculateAnswerPoints(20, true, 0, 10, 45);
  assert.ok(res1.points >= 20);
  assert.equal(res1.newStreak, 1);
  assert.ok(res1.xp > 0);

  const res2 = calculateAnswerPoints(20, true, 5, 10, 45);
  assert.ok(res2.points > res1.points, 'Higher streak should yield more points');
  assert.equal(res2.newStreak, 6);

  const resFail = calculateAnswerPoints(20, false, 5, 20, 45);
  assert.equal(resFail.points, 0);
  assert.equal(resFail.newStreak, 0);
});

test('getRankByXP maps XP to pedagogical inspector ranks', () => {
  const rank0 = getRankByXP(0);
  assert.equal(rank0.levelNumber, 1);

  const rankHigh = getRankByXP(1200);
  assert.ok(rankHigh.levelNumber >= 5);
});

test('generateInspectorReview calculates grade out of 20 and pedagogical feedback', () => {
  const stats = createInitialStats();
  stats.solvedCount = 10;
  stats.correctCount = 8;
  stats.competencyScores.application.total = 5;
  stats.competencyScores.application.correct = 5;
  stats.competencyScores.reasoning.total = 5;
  stats.competencyScores.reasoning.correct = 3;

  const review = generateInspectorReview(stats);
  assert.equal(review.diagnosticGrade, 16);
  assert.ok(review.overallRankTitle.ar.length > 0);
  assert.ok(review.pedagogicalObservation.ar.length > 0);
  assert.ok(review.strengths.length > 0);
  assert.ok(review.officialInspectorAdvice.ar.length > 0);
});

test('LAB_FUNCTIONS provides valid mathematical evaluation and derivatives', () => {
  const poly = LAB_FUNCTIONS.find(f => f.id === 'poly2')!;
  assert.ok(poly);
  assert.equal(poly.fn(1), 0);
  assert.equal(poly.fn(2), -1);
  assert.equal(poly.fn(3), 0);
  assert.equal(poly.derivative(2), 0);
  assert.equal(poly.derivative(0), -4);
});

test('SKILL_TREE_DATABASE covers all 6 curriculum levels with valid prerequisite references', async () => {
  const { SKILL_TREE_DATABASE, PLAYER_CLASSES } = await import('../data/rpgClassesAndSkills');
  const { LEVELS } = await import('./curriculumData');

  assert.equal(PLAYER_CLASSES.length, 4, 'Must define all 4 RPG specializations');
  const allSkillIds = new Set(SKILL_TREE_DATABASE.map(s => s.id));

  for (const level of LEVELS) {
    const levelNodes = SKILL_TREE_DATABASE.filter(n => n.levelId === level.id);
    assert.ok(levelNodes.length >= 3, `Level ${level.id} must have at least 3 skill tree nodes`);
    for (const node of levelNodes) {
      for (const prereqId of node.prerequisites) {
        assert.ok(allSkillIds.has(prereqId), `Prerequisite ${prereqId} for ${node.id} must exist in SKILL_TREE_DATABASE`);
      }
    }
  }
});

test('Every question in QUESTIONS_DATABASE has valid options, correctIndex, and bilingual content', async () => {
  const { QUESTIONS_DATABASE } = await import('./curriculumData');
  assert.ok(QUESTIONS_DATABASE.length >= 50, 'Database should contain comprehensive question bank');

  for (const q of QUESTIONS_DATABASE) {
    assert.ok(q.options.length >= 2, `Question ${q.id} must have options`);
    assert.ok(
      q.correctIndex >= 0 && q.correctIndex < q.options.length,
      `Question ${q.id} has invalid correctIndex ${q.correctIndex}`
    );
    assert.ok(q.statement.ar.trim().length > 0 && q.statement.biof.trim().length > 0, `Question ${q.id} missing bilingual statement`);
    assert.ok(q.explanation.ar.trim().length > 0 && q.explanation.biof.trim().length > 0, `Question ${q.id} missing bilingual explanation`);
  }
});

test('Friendly Duel generates shareable URL with specific question IDs and decodes faithfully', async () => {
  const { buildShareableDuelUrl, decodeDuelPayload } = await import('./duelUtils');
  const payload = {
    duelId: 'duel-test-123',
    levelId: '2bac' as const,
    streamId: '2bac_pc' as const,
    domain: 'analysis_functions' as const,
    questionIds: ['q-2bac-01', 'q-2bac-02', 'q-2bac-03'],
    creatorName: 'أمينة العلمي',
    createdAtISO: '2026-11-13',
    creatorResult: {
      playerName: 'أمينة العلمي',
      score: 90,
      correctCount: 3,
      totalQuestions: 3,
      timeSeconds: 42,
      questionOutcomes: [true, true, true]
    }
  };

  const url = buildShareableDuelUrl(payload, 'https://mathinspector.example.com/');
  assert.ok(url.startsWith('https://mathinspector.example.com/?duel='));
  const decoded = decodeDuelPayload(url);
  assert.ok(decoded !== null, 'Shareable duel URL should decode cleanly');
  assert.deepEqual(decoded!.questionIds, ['q-2bac-01', 'q-2bac-02', 'q-2bac-03']);
  assert.equal(decoded!.creatorName, 'أمينة العلمي');
  assert.equal(decoded!.creatorResult?.score, 90);
});

test('upsertDuelParticipantInLeaderboard inserts new peers and updates existing peers upon duel completion', async () => {
  const { upsertDuelParticipantInLeaderboard } = await import('./duelUtils');
  const { INITIAL_CUMULATIVE_LEADERBOARD, rankCumulativeLeaderboard } = await import('./engine');

  // 1. Insert brand new peer
  const afterNewPeer = upsertDuelParticipantInLeaderboard(INITIAL_CUMULATIVE_LEADERBOARD, {
    playerName: 'عمر بوزيان',
    levelId: '2bac',
    streamId: '2bac_pc',
    score: 120,
    xpEarned: 160,
    correctCount: 4,
    totalQuestions: 5,
    dateISO: '2026-11-13'
  });

  const peerEntry = afterNewPeer.find(e => e.studentName === 'عمر بوزيان');
  assert.ok(peerEntry !== undefined, 'New peer should be added to leaderboard');
  assert.equal(peerEntry!.cumulativeScore, 120);
  assert.equal(peerEntry!.correctCount, 4);
  assert.equal(peerEntry!.solvedCount, 5);
  assert.ok(peerEntry!.unlockedBadgeTitles.includes('مبارز ودي'));

  // 2. Update same peer after completing another duel
  const afterSecondDuel = upsertDuelParticipantInLeaderboard(afterNewPeer, {
    playerName: 'عمر بوزيان',
    levelId: '2bac',
    streamId: '2bac_pc',
    score: 2000,
    xpEarned: 2100,
    correctCount: 5,
    totalQuestions: 5,
    dateISO: '2026-11-13'
  });

  const ranked = rankCumulativeLeaderboard(afterSecondDuel, 'score');
  assert.equal(ranked[0].studentName, 'عمر بوزيان');
  assert.equal(ranked[0].cumulativeScore, 2120);
  assert.equal(ranked[0].solvedCount, 10);
});

test('getSmartQuizRecommendation suggests next best topic and adaptive deck based on lowest stats.domainScores', async () => {
  const { getSmartQuizRecommendation } = await import('./engine');
  const stats = createInitialStats();

  // Case 1: Geometry has lowest score (20%), Probability has second lowest (50%)
  stats.domainScores.arithmetic_algebra = { correct: 9, total: 10 }; // 90%
  stats.domainScores.analysis_functions = { correct: 8, total: 10 }; // 80%
  stats.domainScores.geometry_trig = { correct: 1, total: 5 };       // 20% (Lowest)
  stats.domainScores.probability_stats = { correct: 2, total: 4 };   // 50% (Second lowest)

  const rec = getSmartQuizRecommendation(stats, '2bac', '2bac_pc', 1);
  assert.equal(rec.recommendedDomain, 'geometry_trig', 'Should prioritize geometry_trig as lowest domain score');
  assert.equal(rec.secondaryDomain, 'probability_stats', 'Should identify probability_stats as secondary domain');
  assert.equal(rec.rankedDomains.length, 4);
  assert.equal(rec.rankedDomains[0].domain, 'geometry_trig');
  assert.equal(rec.rankedDomains[0].accuracyPct, 20);
  assert.equal(rec.rankedDomains[0].status, 'critical');
  assert.ok(rec.recommendedTopicTitle.ar.length > 0 && rec.recommendedTopicTitle.biof.length > 0);
  assert.ok(rec.pedagogicalReason.ar.includes('20%'));
  assert.equal(rec.smartDeck.length, 6, 'Smart Quiz deck should contain 6 adaptive questions');

  // Case 2: When student masters geometry_trig, recommendation shifts automatically to probability_stats
  stats.domainScores.geometry_trig = { correct: 19, total: 20 }; // 95%
  const updatedRec = getSmartQuizRecommendation(stats, '2bac', '2bac_pc', 2);
  assert.equal(updatedRec.recommendedDomain, 'probability_stats');
  assert.equal(updatedRec.rankedDomains[0].accuracyPct, 50);
});

test('Proposal 1: Leitner Spaced Repetition advances boxes, resets on lapse, and computes due cards', async () => {
  const { evaluateLeitnerReview, isLeitnerCardDue, computeLeitnerDeckStats } = await import('./engine');
  const today = '2026-11-14';

  // New card rated 'good' -> enters Box 2 (interval 3 days -> 2026-11-17)
  const s1 = evaluateLeitnerReview(undefined, 'card-1', 'good', today);
  assert.equal(s1.box, 2);
  assert.equal(s1.nextReviewISO, '2026-11-17');
  assert.equal(isLeitnerCardDue(s1, today), false);
  assert.equal(isLeitnerCardDue(s1, '2026-11-17'), true);

  // Rated 'easy' -> jumps +2 boxes to Box 4 (interval 14 days -> 2026-11-28)
  const s2 = evaluateLeitnerReview(s1, 'card-1', 'easy', today);
  assert.equal(s2.box, 4);
  assert.equal(s2.nextReviewISO, '2026-11-28');

  // Rated 'again' -> resets to Box 1 (interval 1 day -> 2026-11-15) and increments lapses
  const s3 = evaluateLeitnerReview(s2, 'card-1', 'again', today);
  assert.equal(s3.box, 1);
  assert.equal(s3.lapses, 1);
  assert.equal(s3.nextReviewISO, '2026-11-15');

  const deckStats = computeLeitnerDeckStats(['card-1', 'card-2', 'card-3'], {
    'card-1': s2, // Box 4, not due today
    'card-2': { ...s3, nextReviewISO: today } // Box 1, due today
  }, today);

  assert.equal(deckStats.unseenCount, 1); // card-3
  assert.equal(deckStats.dueTodayCount, 2); // card-2 + unseen card-3
  assert.equal(deckStats.boxCounts[4], 1);
});

test('Proposal 2: verifyAlgebraicStepsDeterministic pinpoints sign errors, identity mistakes, and valid steps', async () => {
  const { verifyAlgebraicStepsDeterministic } = await import('./engine');

  // 1. Sign transposition error on line 2
  const resErr = verifyAlgebraicStepsDeterministic([
    '3x - 5 = 10',
    '3x = 5',
    'x = 5/3'
  ]);
  assert.equal(resErr.isAllCorrect, false);
  assert.equal(resErr.errorStepNumber, 2);
  assert.equal(resErr.steps[1].status, 'error');
  assert.equal(resErr.correctedFinalStepLatex, 'x = 5');

  // 2. Remarkable identity error (missing 2ab)
  const resIdent = verifyAlgebraicStepsDeterministic(['(x+3)^2 = x^2+9']);
  assert.equal(resIdent.isAllCorrect, false);
  assert.equal(resIdent.errorStepNumber, 1);

  // 3. Valid multi-step equation
  const resValid = verifyAlgebraicStepsDeterministic([
    '4x + 2 = 2x + 10',
    '2x = 8',
    'x = 4'
  ]);
  assert.equal(resValid.isAllCorrect, true);
  assert.equal(resValid.errorStepNumber, null);
});

test('Proposal 3: computeClassAnalyticsSummary aggregates class heatmap and identifies priority group', async () => {
  const { computeClassAnalyticsSummary, DEFAULT_CLASSROOM_STUDENTS } = await import('./engine');

  const summary = computeClassAnalyticsSummary('2BAC-PC-A1', DEFAULT_CLASSROOM_STUDENTS);
  assert.equal(summary.classCode, '2BAC-PC-A1');
  assert.equal(summary.studentCount, DEFAULT_CLASSROOM_STUDENTS.length);
  assert.ok(summary.averageGradeOn20 > 0 && summary.averageGradeOn20 <= 20);
  assert.equal(summary.weakestClassDomain, 'geometry_trig');
  assert.equal(summary.weakestClassCompetency, 'problem_solving');
  assert.ok(summary.prioritySupportStudents.includes('عمر التازي'));
  assert.ok(summary.collectiveRecommendation.ar.includes('2BAC-PC-A1'));
});

test('PITFALLS_DATABASE provides at least one dedicated pitfall for every curriculum level including 1bac', async () => {
  const { PITFALLS_DATABASE } = await import('./pitfallsData');
  const { LEVELS } = await import('./curriculumData');
  for (const level of LEVELS) {
    const levelPitfalls = PITFALLS_DATABASE.filter(p => p.levelId === level.id);
    assert.ok(levelPitfalls.length >= 1, `Level ${level.id} must have at least 1 dedicated pitfall`);
  }

  const bac1SePitfalls = filterPitfalls('1bac', '1bac_se');
  assert.ok(bac1SePitfalls.length >= 2);
  assert.ok(bac1SePitfalls.every(p => p.levelId === '1bac'), 'filterPitfalls(1bac, 1bac_se) must return 1bac-specific pitfalls instead of cross-level fallback');
});

test('Roadmap Phase 1: verifyAlgebraicStepsDeterministic catches missing inequality flip on negative division and accepts valid flips', async () => {
  const { verifyAlgebraicStepsDeterministic } = await import('./engine');

  // Missing inequality direction flip when dividing by -2
  const errFlip = verifyAlgebraicStepsDeterministic([
    '-2x + 4 > 10',
    '-2x > 6',
    'x > -3'
  ]);
  assert.equal(errFlip.isAllCorrect, false);
  assert.equal(errFlip.errorStepNumber, 3);
  assert.equal(errFlip.correctedFinalStepLatex, 'x < -3');

  // Valid inequality solution with proper sign flip
  const okFlip = verifyAlgebraicStepsDeterministic([
    '-2x + 4 > 10',
    '-2x > 6',
    'x < -3'
  ]);
  assert.equal(okFlip.isAllCorrect, true);
  assert.equal(okFlip.errorStepNumber, null);
  assert.equal(okFlip.correctedFinalStepLatex, 'x < -3');
});

test('Dynamic Curriculum Linker builds Personalized Learning Paths and 7-day schedules across Collège and Lycée', async () => {
  const { buildPersonalizedLearningPath, generatePersonalizedWeeklyPlan } = await import('./engine');
  const stats = createInitialStats();
  stats.solvedCount = 15;
  stats.correctCount = 10;
  stats.domainScores.geometry_trig = { correct: 1, total: 5 };       // 20% -> remediation
  stats.domainScores.probability_stats = { correct: 3, total: 4 };   // 75% -> consolidation
  stats.domainScores.analysis_functions = { correct: 9, total: 10 }; // 90% -> excellence
  stats.domainScores.arithmetic_algebra = { correct: 0, total: 0 };  // untested -> foundation

  const path2Bac = buildPersonalizedLearningPath(stats, '2bac', '2bac_pc');
  assert.ok(path2Bac.steps.length >= 5);
  assert.ok(path2Bac.totalLinkedResourcesCount > 10);
  assert.equal(path2Bac.steps[0].topic.domain, 'geometry_trig', 'Weakest domain (20%) must be prioritized as step #1');
  assert.equal(path2Bac.steps[0].stage, 'remediation');
  assert.equal(path2Bac.steps[0].recommendedDifficulty, 'easy');

  for (const step of path2Bac.steps) {
    assert.ok(step.linkedQuestionIds.length > 0, `Topic ${step.topic.id} must link dynamically to questions`);
    assert.ok(step.linkedLessons.length > 0, `Topic ${step.topic.id} must link dynamically to a lesson`);
    assert.ok(step.linkedPitfalls.length > 0, `Topic ${step.topic.id} must link dynamically to pitfalls`);
    assert.ok(step.linkedSkillNodes.length > 0, `Topic ${step.topic.id} must link dynamically to skill nodes`);
  }

  const excelStep = path2Bac.steps.find(s => s.topic.domain === 'analysis_functions');
  assert.equal(excelStep?.stage, 'excellence');
  assert.equal(excelStep?.recommendedDifficulty, 'hard');

  const path3Ac = buildPersonalizedLearningPath(stats, '3ac', 'general');
  assert.ok(path3Ac.steps.length >= 3);
  assert.equal(path3Ac.steps[0].topic.domain, 'geometry_trig');

  const weeklyPlan = generatePersonalizedWeeklyPlan(path2Bac);
  assert.equal(weeklyPlan.length, 7);
  assert.equal(weeklyPlan[0].domain, 'geometry_trig', 'Monday session should focus on top personalized priority');
  assert.equal(weeklyPlan[0].sessionType, 'remediation');
});

test('Roadmap Phase 1 & 3: 4-archetype procedural generator and quadratic Δ discriminant verification', async () => {
  const { verifyAlgebraicStepsDeterministic } = await import('./engine');

  // 1. Verify all 4 Collège archetypes (seeds 1..4) produce distinct valid questions
  const collegeDomains = new Set(
    [1, 2, 3, 4].map(seed => generateProceduralQuestion('3ac', 'general', seed).domain)
  );
  assert.ok(collegeDomains.has('arithmetic_algebra'));
  assert.ok(collegeDomains.has('geometry_trig'));
  assert.ok(collegeDomains.has('analysis_functions'));

  // 2. Verify all 4 Lycée archetypes (seeds 1..4) produce distinct titles
  const lyceeTitles = new Set(
    [1, 2, 3, 4].map(seed => generateProceduralQuestion('2bac', '2bac_pc', seed).title.ar)
  );
  assert.equal(lyceeTitles.size, 4, 'Lycée procedural generator must cycle across 4 distinct archetypes');

  // 3. Verify 1bac_lit stream has dedicated questions across domains
  const litQuestions = filterQuestions('1bac', '1bac_lit');
  assert.ok(litQuestions.length >= 4, '1Bac Lettres stream must have dedicated curriculum questions');

  // 4. Verify quadratic discriminant Δ error detection
  const quadErr = verifyAlgebraicStepsDeterministic([
    'x^2 - 5x + 6 = 0',
    'Δ = (-5)^2 - 4(1)(6) = 49',
    'x = 2 أو x = 3'
  ]);
  assert.equal(quadErr.isAllCorrect, false);
  assert.equal(quadErr.errorStepNumber, 2);
  assert.ok(quadErr.steps[1].comment.ar.includes('Δ ='));

  // 5. Verify valid quadratic resolution
  const quadValid = verifyAlgebraicStepsDeterministic([
    'x^2 - 5x + 6 = 0',
    'Δ = 1',
    'x = 2 أو x = 3'
  ]);
  assert.equal(quadValid.isAllCorrect, true);
  assert.equal(quadValid.errorStepNumber, null);
});
