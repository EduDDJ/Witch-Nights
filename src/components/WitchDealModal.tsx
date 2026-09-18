import React, { useEffect } from 'react';
import { CurseChoice } from '../types/game';
import { Sparkles, Sword, Skull, Flame, Wind, AlertTriangle, RotateCcw, ShieldOff } from 'lucide-react';
import { getLanguage, t, translateCurseTitle, translateCurseSubtitle, translateCurseDescription } from '../utils/i18n';

interface WitchDealModalProps {
  curses: CurseChoice[];
  mobileMode?: boolean;
  onSelectCurse: (curse: CurseChoice | null) => void;
}

const CURSE_ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Sword,
  Skull,
  Flame,
  Wind,
  RotateCcw,
};

export const WitchDealModal: React.FC<WitchDealModalProps> = ({ curses, mobileMode = false, onSelectCurse }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === '1' && curses[0]) onSelectCurse(curses[0]);
      if (key === '2') {
        if (curses.length >= 2 && curses[1]) {
          onSelectCurse(curses[1]);
        } else if (curses.length === 1) {
          onSelectCurse(null);
        }
      }
      if (key === '3' && curses.length >= 2) {
        onSelectCurse(null);
      }
      if (key === 'd' || key === 'escape') {
        onSelectCurse(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [curses, onSelectCurse]);

  const hasMultipleDeals = curses.length >= 2;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 ${
      mobileMode ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
    }`}>
      {/* Compact container to prevent any off-screen text */}
      <div className={`w-full max-h-[90vh] overflow-y-auto bg-gradient-to-b from-stone-950 via-rose-950/40 to-stone-950 border-2 border-rose-600/80 shadow-2xl shadow-rose-950/80 relative text-center ${
        mobileMode
          ? 'max-w-lg rounded-xl p-3 sm:p-4'
          : hasMultipleDeals ? 'max-w-3xl rounded-2xl p-4 sm:p-5' : 'max-w-xl rounded-2xl p-4 sm:p-5'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-center gap-2 ${mobileMode ? 'mb-1' : 'mb-1.5'}`}>
          <div className={`rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/50 ${
            mobileMode ? 'w-6 h-6' : 'w-8 h-8'
          }`}>
            <Skull className={mobileMode ? 'w-3.5 h-3.5 text-stone-950' : 'w-4 h-4 text-stone-950'} />
          </div>
          <h2 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-amber-200 to-rose-300 font-serif tracking-wide ${
            mobileMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          }`}>
            {t('witch_deal', getLanguage()).toUpperCase()}
          </h2>
        </div>

        <div className={`inline-flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 font-bold uppercase tracking-wider ${
          mobileMode ? 'px-2 py-0.2 text-[10px] mb-1.5' : 'px-2.5 py-0.5 text-[11px] mb-2'
        }`}>
          <AlertTriangle className="w-3 h-3 text-amber-400" /> {t('minute_epoch', getLanguage())}
        </div>

        <p className={`text-stone-300 max-w-md mx-auto leading-snug ${
          mobileMode ? 'text-[11px] sm:text-xs mb-2.5' : 'text-xs sm:text-sm mb-3.5'
        }`}>
          {hasMultipleDeals
            ? (getLanguage() === 'en' ? "The Blood Moon reaches its zenith. Destiny Control grants 2 Witch Deals. Choose an offer or Deny Both:" : "A Lua de Sangue atinge seu zênite. O Controle do Destino concede 2 Acordos da Bruxa. Escolha uma oferta ou Recuse Ambos:")
            : (getLanguage() === 'en' ? "The Blood Moon reaches its zenith. A Witch offers a forbidden bargain. Choose to Accept or Deny:" : "A Lua de Sangue atinge seu zênite. Uma Bruxa oferece um pacto proibido. Escolha Aceitar ou Recusar:")}
        </p>

        {/* Options Grid */}
        <div className={`grid grid-cols-1 ${hasMultipleDeals ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} text-left ${mobileMode ? 'gap-2' : 'gap-3'}`}>
          {curses.map((curse, idx) => {
            const IconComp = CURSE_ICONS[curse.icon] || Skull;
            const acceptText = t('accept_deal', getLanguage());
            const dealLabel = hasMultipleDeals ? `${acceptText} [Deal ${idx + 1}]` : acceptText;
            return (
              <button
                key={curse.id}
                id={`curse-deal-choice-${idx}`}
                onClick={() => onSelectCurse(curse)}
                className={`group relative flex flex-col justify-between rounded-xl bg-stone-900/90 hover:bg-rose-950/60 border-2 border-rose-900/70 hover:border-rose-400 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-950/60 cursor-pointer pointer-events-auto ${
                  mobileMode ? 'p-2.5 sm:p-3' : 'p-3.5'
                }`}
              >
                <div className="pointer-events-none">
                  <div className={`flex items-center justify-between gap-2 ${mobileMode ? 'mb-1.5' : 'mb-2'}`}>
                    <div
                      className={`rounded-lg flex items-center justify-center border group-hover:scale-105 transition-transform ${
                        mobileMode ? 'w-7 h-7' : 'w-9 h-9'
                      }`}
                      style={{
                        backgroundColor: `${curse.color}22`,
                        borderColor: `${curse.color}88`,
                      }}
                    >
                      <IconComp className={mobileMode ? 'w-3.5 h-3.5' : 'w-4 h-4'} style={{ color: curse.color }} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300">
                      DEAL #{idx + 1}
                    </span>
                  </div>

                  <h3 className={`font-bold text-slate-100 group-hover:text-rose-200 transition-colors font-serif leading-tight ${
                    mobileMode ? 'text-xs sm:text-sm mb-0.5' : 'text-sm sm:text-base mb-1'
                  }`}>
                    {translateCurseTitle(curse.id, curse.title, getLanguage())}
                  </h3>

                  {curse.subtitle || translateCurseSubtitle(curse.id, '', getLanguage()) ? (
                    <div className={`font-medium text-rose-400/90 italic leading-tight ${
                      mobileMode ? 'text-[10px] mb-1.5' : 'text-[11px] mb-2'
                    }`}>
                      "{translateCurseSubtitle(curse.id, curse.subtitle, getLanguage())}"
                    </div>
                  ) : null}

                  <p className={`text-stone-200 leading-relaxed bg-black/50 rounded-lg border border-stone-800 ${
                    mobileMode ? 'text-[10px] sm:text-[11px] p-2 leading-snug' : 'text-[11px] sm:text-xs p-2.5'
                  }`}>
                    {translateCurseDescription(curse.id, curse.description, getLanguage())}
                  </p>
                </div>

                <div className={`border-t border-rose-950/80 flex items-center justify-between pointer-events-none ${
                  mobileMode ? 'mt-2 pt-1.5 text-[10px]' : 'mt-3 pt-2 text-[11px]'
                }`}>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    {dealLabel} &rarr;
                  </span>
                  <span className="text-stone-500 text-[10px]">Press <kbd className="px-1 py-0.5 bg-stone-800 rounded font-mono">{idx + 1}</kbd></span>
                </div>
              </button>
            );
          })}

          {/* Deny / Deny Both Option Card */}
          <button
            id="curse-deal-choice-deny"
            onClick={() => onSelectCurse(null)}
            className={`group relative flex flex-col justify-between rounded-xl bg-stone-900/90 hover:bg-stone-800/90 border-2 border-stone-700/80 hover:border-amber-400 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-950/60 cursor-pointer pointer-events-auto ${
              mobileMode ? 'p-2.5 sm:p-3' : 'p-3.5'
            }`}
          >
            <div className="pointer-events-none">
              <div className={`flex items-center justify-between gap-2 ${mobileMode ? 'mb-1.5' : 'mb-2'}`}>
                <div className={`rounded-lg flex items-center justify-center border bg-stone-800/80 border-amber-500/50 group-hover:scale-105 transition-transform ${
                  mobileMode ? 'w-7 h-7' : 'w-9 h-9'
                }`}>
                  <ShieldOff className={mobileMode ? 'w-3.5 h-3.5 text-amber-400' : 'w-4 h-4 text-amber-400'} />
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-stone-800 border border-stone-700 text-amber-300">
                  REFUSAL
                </span>
              </div>

              <h3 className={`font-bold text-slate-100 group-hover:text-amber-200 transition-colors font-serif leading-tight ${
                mobileMode ? 'text-xs sm:text-sm mb-0.5' : 'text-sm sm:text-base mb-1'
              }`}>
                {hasMultipleDeals ? t('deny_both', getLanguage()) : t('deny_deal', getLanguage())}
              </h3>

              <div className={`font-medium text-amber-400/80 italic leading-tight ${
                mobileMode ? 'text-[10px] mb-1.5' : 'text-[11px] mb-2'
              }`}>
                "Refuse the Witch's Bargain"
              </div>

              <p className={`text-stone-300 leading-relaxed bg-black/50 rounded-lg border border-stone-800 ${
                mobileMode ? 'text-[10px] sm:text-[11px] p-2 leading-snug' : 'text-[11px] sm:text-xs p-2.5'
              }`}>
                {hasMultipleDeals
                  ? 'Reject both forbidden offers and walk away unscathed with no curses or extra power.'
                  : 'Reject the forbidden offer and walk away unscathed with no curse or extra power.'}
              </p>
            </div>

            <div className={`border-t border-stone-800 flex items-center justify-between pointer-events-none ${
              mobileMode ? 'mt-2 pt-1.5 text-[10px]' : 'mt-3 pt-2 text-[11px]'
            }`}>
              <span className="text-amber-400 font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {hasMultipleDeals ? 'Deny Both' : 'Deny'} &rarr;
              </span>
              <span className="text-stone-500 text-[10px]">Press <kbd className="px-1 py-0.5 bg-stone-800 rounded font-mono">{hasMultipleDeals ? '3' : '2'}</kbd></span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

