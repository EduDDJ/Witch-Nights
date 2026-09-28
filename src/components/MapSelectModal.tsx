import React, { useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { getLanguage } from '../utils/i18n';
import { resolveAssetPath } from '../utils/assets';

interface MapSelectModalProps {
  onSelectMap: (mapId: string) => void;
  onClose: () => void;
  mapBestTimes?: Record<string, number>;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  onSelectMap,
  onClose,
  mapBestTimes = {},
}) => {
  const currentLang = getLanguage();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const formatBestTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Defined maps list with local assets prioritized first, backed by remote fallbacks
  const maps = [
    {
      id: 'village_outskirts',
      nameEn: "Witchs' Swamp",
      namePt: 'Pântano das Bruxas',
      localSrc: 'assets/ground_tile.png',
      fallbackSrc: 'https://i.imgur.com/qe0cqr1.png'
    },
    {
      id: 'black_honey_forest',
      nameEn: 'Black Honey Forest',
      namePt: 'Floresta do Mel Negro',
      localSrc: 'assets/black_honey_tile.png',
      fallbackSrc: 'https://i.imgur.com/ZrLFBRE.png'
    },
    {
      id: 'mathematical_realm',
      nameEn: 'Mathematical Realm',
      namePt: 'Reino Matemático',
      localSrc: 'assets/math_tile_1.png',
      fallbackSrc: 'https://i.imgur.com/w1wX8hT.png'
    }
  ];

  const getTileSrc = (mapId: string, localSrc: string, fallbackSrc: string) => {
    return imgErrors[mapId]
      ? fallbackSrc
      : resolveAssetPath(localSrc);
  };

  const handleImgError = (mapId: string) => {
    setImgErrors((prev) => ({ ...prev, [mapId]: true }));
  };

  // Local translations for UI texts
  const mapSelectText = currentLang === 'en' ? 'Select Map' : 'Selecionar Mapa';
  const backText = currentLang === 'en' ? 'Back' : 'Voltar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-950 via-purple-950/60 to-slate-950 border-2 border-purple-500/70 rounded-3xl p-6 sm:p-8 pt-12 sm:pt-14 shadow-2xl shadow-purple-950/80 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors cursor-pointer z-10"
          title={backText}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-200 tracking-tight">
            {mapSelectText}
          </h2>
        </div>

        {/* Map selection list/cards */}
        <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto p-1 pr-1.5">
          {maps.map((mapItem) => {
            const mapName = currentLang === 'en' ? mapItem.nameEn : mapItem.namePt;
            const src = getTileSrc(mapItem.id, mapItem.localSrc, mapItem.fallbackSrc);
            const bestSec = mapBestTimes[mapItem.id] || 0;

            return (
              <button
                key={mapItem.id}
                id={`select-${mapItem.id}-card`}
                onClick={() => onSelectMap(mapItem.id)}
                className="group relative flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 border-2 border-purple-500/40 hover:border-purple-400 shadow-lg hover:shadow-purple-700/10 hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer overflow-hidden w-full animate-in fade-in duration-300"
              >
                {/* The 80px x 80px floor tile icon */}
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-purple-500/30 bg-[#140c24] flex items-center justify-center shadow-inner">
                  <img
                    src={src}
                    alt={`${mapName} Tile`}
                    className="w-full h-full object-cover select-none"
                    onError={() => handleImgError(mapItem.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                    {mapName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-300 font-mono">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-stone-300 font-semibold">
                      {currentLang === 'en' ? 'Best Time:' : 'Melhor Tempo:'}
                    </span>
                    <span className="text-amber-300 font-bold drop-shadow">
                      {formatBestTime(bestSec)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-stone-300 hover:text-white text-sm font-bold transition-all cursor-pointer"
          >
            {backText}
          </button>
        </div>
      </div>
    </div>
  );
};
