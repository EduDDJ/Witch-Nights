import React, { useEffect, useRef } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { getLanguage, t, translateAchievement } from '../utils/i18n';

export interface AchievementNotificationData {
  id: string;
  achievementId?: string;
  achievementTitle: string;
  unlockText: string;
}

interface AchievementBannerProps {
  notification: AchievementNotificationData | null;
  onDismiss: () => void;
}

export const AchievementBanner: React.FC<AchievementBannerProps> = ({
  notification,
  onDismiss,
}) => {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismissRef.current();
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification?.id]);

  if (!notification) return null;

  const currentLang = getLanguage();
  const displayTitle = notification.achievementId
    ? translateAchievement(notification.achievementId, 'title', notification.achievementTitle, currentLang)
    : notification.achievementTitle;
  const displayUnlock = notification.achievementId
    ? translateAchievement(notification.achievementId, 'unlockText', notification.unlockText, currentLang)
    : notification.unlockText;

  return (
    <aside
      key={notification.id}
      id="achievement-top-banner"
      role="status"
      aria-live="polite"
      aria-label={t('achievement_notification', currentLang)}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto max-w-[92vw] sm:max-w-xl w-full animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div className="relative flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-stone-950 via-purple-950/95 to-stone-950 border-2 border-amber-400/80 shadow-[0_10px_35px_rgba(245,158,11,0.35),0_0_15px_rgba(168,85,247,0.3)] text-left backdrop-blur-md">
        {/* Left Glowing Trophy Icon */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500/30 via-purple-600/30 to-amber-600/20 border border-amber-400/70 flex items-center justify-center shrink-0 shadow-inner">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-400/30 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>

        {/* Message Content: [Achievement] Complete! Unlocked: [Unlock] */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{t('achievement_complete', currentLang)}</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white font-serif tracking-wide truncate">
            {displayTitle} {currentLang === 'pt-BR' ? 'Concluída!' : 'Complete!'}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-cyan-300 flex items-center gap-1 truncate">
            <span className="text-purple-300/80">{t('unlocked_label', currentLang)}</span>
            <span className="text-amber-200 drop-shadow">{displayUnlock}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          id="close-achievement-banner-button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-900/40 transition-colors cursor-pointer shrink-0"
          title={t('dismiss_notification', currentLang)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
