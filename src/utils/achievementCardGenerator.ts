import { StudentBadge } from '../game/engine';
import { LevelId, StreamId, LanguageOption, LEVELS, STREAMS } from '../constants/dataStructure';

export interface CardExportOptions {
  studentName: string;
  levelId: LevelId;
  streamId: StreamId;
  score: number;
  xp: number;
  accuracyPct: number;
  unlockedBadges: StudentBadge[];
  lang: LanguageOption;
}

/**
 * Draws a high-resolution social share card onto an HTML5 canvas.
 * Dimensions: 1200 x 675 (Standard 16:9 Landscape Social Card for WhatsApp, X, Facebook, Instagram Stories).
 */
export function drawAchievementCard(
  canvas: HTMLCanvasElement,
  options: CardExportOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1200;
  const height = 675;
  canvas.width = width;
  canvas.height = height;

  const isAr = options.lang === 'ar';
  const levelName = LEVELS.find(l => l.id === options.levelId)?.name[options.lang] || options.levelId;
  const streamName = STREAMS[options.streamId]?.name[options.lang] || options.streamId;

  // 1. Sleek Deep Background Gradient
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 700);
  bgGrad.addColorStop(0, '#1e1b4b'); // deep indigo
  bgGrad.addColorStop(0.5, '#0f172a'); // slate 900
  bgGrad.addColorStop(1, '#020617'); // slate 950
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative Mathematical Watermarks in Background
  ctx.save();
  ctx.fillStyle = 'rgba(99, 102, 241, 0.07)';
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.fillText('∫[a→b] f(x)dx = F(b) - F(a)', 80, 110);
  ctx.fillText('e^(iπ) + 1 = 0', 880, 120);
  ctx.fillText('cos²θ + sin²θ = 1', 920, 560);
  ctx.fillText('BC² = AB² + AC²', 90, 570);
  ctx.fillText('lim (e^x - 1)/x = 1', 500, 80);
  ctx.fillText('f\'(x₀) = lim (f(x) - f(x₀))/(x - x₀)', 380, 620);
  ctx.restore();

  // 3. Double Golden Border with Rounded Corners
  ctx.save();
  ctx.strokeStyle = '#d97706'; // amber-600
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = '#f59e0b'; // amber-500
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Corner Ornaments
  const corners = [
    [40, 40],
    [width - 40, 40],
    [40, height - 40],
    [width - 40, height - 40]
  ];
  ctx.fillStyle = '#fbbf24';
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 4. Header Bar: MathInspector Wordmark & Flag Accent
  ctx.save();
  ctx.fillStyle = '#6366f1'; // indigo-500
  ctx.beginPath();
  ctx.arc(85, 95, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('∑', 85, 95);

  ctx.textAlign = 'left';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('MathInspector · رياضيات المغرب', 125, 90);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    isAr ? 'بطاقة التميز والتفوق في الرياضيات · السلكين الإعدادي والتأهيلي' : 'Carte d\'Excellence en Mathématiques · Collège & Lycée',
    125,
    115
  );

  // Official Seal Stamp on top right
  ctx.textAlign = 'right';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(isAr ? '🏆 بطاقة إنجاز موثقة رسمياً' : '🏆 Certificat d\'Accomplissement Officiel', width - 80, 95);
  ctx.restore();

  // 5. Hero Student Identity Section (Center Banner)
  ctx.save();
  const studentDisplayName = options.studentName.trim() || (isAr ? 'التلميذ(ة) المتفوق(ة)' : 'Élève Brillant');
  
  // Student Card Background
  const cardGrad = ctx.createLinearGradient(80, 160, width - 160, 290);
  cardGrad.addColorStop(0, 'rgba(30, 41, 59, 0.85)');
  cardGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
  ctx.fillStyle = cardGrad;
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(70, 155, width - 140, 130, 16);
  ctx.fill();
  ctx.stroke();

  // Student Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(studentDisplayName, width / 2, 205);

  // Level & Stream Pill
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#a5b4fc';
  ctx.fillText(`${levelName}  ·  ${streamName}`, width / 2, 248);
  ctx.restore();

  // 6. Metrics Strip (3 KPI Cards)
  ctx.save();
  const kpiY = 305;
  const kpiHeight = 95;
  const kpiWidth = (width - 140 - 40) / 3;

  // KPI 1: Score
  drawKpiBox(
    ctx,
    70,
    kpiY,
    kpiWidth,
    kpiHeight,
    isAr ? 'النقاط التراكمية' : 'Points Cumulés',
    `${options.score} pts`,
    '#34d399' // emerald-400
  );

  // KPI 2: XP
  drawKpiBox(
    ctx,
    70 + kpiWidth + 20,
    kpiY,
    kpiWidth,
    kpiHeight,
    isAr ? 'نقاط الخبرة XP' : 'Expérience XP',
    `${options.xp} XP`,
    '#818cf8' // indigo-400
  );

  // KPI 3: Accuracy or Badges Count
  drawKpiBox(
    ctx,
    70 + (kpiWidth + 20) * 2,
    kpiY,
    kpiWidth,
    kpiHeight,
    isAr ? 'الأوسمة المحققة' : 'Badges Débloqués',
    `${options.unlockedBadges.length} / 8`,
    '#fbbf24' // amber-400
  );
  ctx.restore();

  // 7. Badges Showcase Banner (Bottom Section)
  ctx.save();
  const badgesY = 425;
  const badgesHeight = 155;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(70, badgesY, width - 140, badgesHeight, 16);
  ctx.fill();
  ctx.stroke();

  // Badges Title
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    isAr ? '🎖️ أوسمة الإنجاز المحققة (خبير الدوال، سريع الحساب، سيد المعادلات...):' : '🎖️ Badges d\'Excellence Débloqués :',
    95,
    badgesY + 30
  );

  // Draw Badge Emblems
  const badgesToDisplay = options.unlockedBadges.slice(0, 4);
  if (badgesToDisplay.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isAr ? 'واصل المراجعة وحل التحديات لفتح أوسمة التميز الرياضي!' : 'Continuez à résoudre des exercices pour débloquer vos badges !',
      width / 2,
      badgesY + 95
    );
  } else {
    const badgeBoxWidth = (width - 190) / badgesToDisplay.length;
    badgesToDisplay.forEach((badge, idx) => {
      const bx = 95 + idx * badgeBoxWidth;
      const by = badgesY + 48;

      // Inner Badge Box
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeBoxWidth - 15, 85, 12);
      ctx.fill();
      ctx.stroke();

      // Badge Icon Circle
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.beginPath();
      ctx.arc(bx + 40, by + 42, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badge.icon, bx + 40, by + 42);

      // Badge Title
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(badge.title[options.lang], bx + 72, by + 38);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('✓ ' + (isAr ? 'مُحقق' : 'Débloqué'), bx + 72, by + 60);
    });
  }
  ctx.restore();

  // 8. Footer Endorsement Stamp
  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MathInspector Morocco · التوجيهات التربوية الرسمية لوزارة التربية الوطنية', 75, 615);

  ctx.textAlign = 'right';
  const todayStr = new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  ctx.fillText(todayStr, width - 75, 615);
  ctx.restore();
}

function drawKpiBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  valueColor: string
) {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 32);

  ctx.fillStyle = valueColor;
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText(value, x + w / 2, y + 70);
}
