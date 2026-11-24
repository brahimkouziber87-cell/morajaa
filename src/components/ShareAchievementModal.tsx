import React, { useRef, useEffect, useState } from 'react';
import { LevelId, StreamId, LanguageOption } from '../constants/dataStructure';
import { StudentBadge } from '../game/engine';
import { drawAchievementCard } from '../utils/achievementCardGenerator';

interface ShareAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  levelId: LevelId;
  streamId: StreamId;
  score: number;
  xp: number;
  accuracyPct: number;
  unlockedBadges: StudentBadge[];
  lang: LanguageOption;
}

export const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({
  isOpen,
  onClose,
  studentName,
  levelId,
  streamId,
  score,
  xp,
  accuracyPct,
  unlockedBadges,
  lang
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (canvas) {
      drawAchievementCard(canvas, {
        studentName,
        levelId,
        streamId,
        score,
        xp,
        accuracyPct,
        unlockedBadges,
        lang
      });
    }
  }, [isOpen, studentName, levelId, streamId, score, xp, accuracyPct, unlockedBadges, lang]);

  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const shareText = isAr
    ? `🎉 حققتُ إنجازاً متميزاً في منصة MathInspector لمراجعة الرياضيات بالمغرب! حصلت على ${score} نقطة و${unlockedBadges.length} أوسمة تفوق! 📐✨`
    : `🎉 J'ai débloqué mes badges d'excellence sur MathInspector Maroc avec ${score} points et ${unlockedBadges.length} badges ! 📐✨`;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const sanitizedName = (studentName || 'student').trim().replace(/\s+/g, '_');
      link.download = `MathInspector_Achievement_${sanitizedName}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // fallback
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  const handleWebShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'achievement.png', { type: 'image/png' })] })) {
            const file = new File([blob], 'MathInspector_Achievement.png', { type: 'image/png' });
            await navigator.share({
              title: 'MathInspector Morocco',
              text: shareText,
              files: [file]
            });
          } else {
            await navigator.share({
              title: 'MathInspector Morocco',
              text: `${shareText}\n${window.location.origin}`
            });
          }
        }, 'image/png');
      } catch {
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${originUrl}?autostart=1`)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(originUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-2xl space-y-5 animate-celebrate-pop my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-lg font-bold">
              🏆
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isAr ? 'مشاركة بطاقة الإنجازات والأوسمة' : 'Partager la Carte des Accomplissements'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'تم توليد بطاقة رقمية عالية الدقة مخصصة لوسائل التواصل الاجتماعي'
                  : 'Carte d\'excellence générée en haute définition pour les réseaux sociaux'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="bg-slate-950 rounded-xl p-2 border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[380px] object-contain rounded-lg border border-slate-800/80 shadow-md"
          />
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 text-center">
            {isAr ? 'اختر طريقة المشاركة الفورية:' : 'Choisir le mode de partage :'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Download PNG */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📥</span>
              <span>{downloading ? (isAr ? 'جاري التحميل...' : 'Téléchargement...') : (isAr ? 'تحميل كصورة PNG' : 'Télécharger PNG')}</span>
            </button>

            {/* WhatsApp */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>

            {/* X / Twitter */}
            <a
              href={twitterHref}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>𝕏</span>
              <span>Twitter / X</span>
            </a>

            {/* Native Mobile Share */}
            <button
              type="button"
              onClick={handleWebShare}
              className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📱</span>
              <span>{isAr ? 'مشاركة عبر الهاتف' : 'Partage Mobile'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span>{copiedLink ? (isAr ? '✓ تم نسخ رابط المنصة!' : '✓ Lien copié !') : (isAr ? 'نسخ رابط المنصة' : 'Copier le lien')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Fermer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
