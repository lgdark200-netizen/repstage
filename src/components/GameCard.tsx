/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Game, PlayStatus, UserTrackedGame } from '../types';
import { Star, ShieldAlert, Clock, Shuffle, Eye, CheckCircle, Flame, Heart } from 'lucide-react';

interface GameCardProps {
  key?: string;
  game: Game;
  trackedState?: UserTrackedGame;
  onStatusChange: (gameId: string, status: PlayStatus) => void;
  onRemoveTrack: (gameId: string) => void;
  onOpenDetails?: (game: Game) => void;   // Optionnel pour éviter l'erreur dans App
  onSelectDetail?: (game: Game) => void;  // Ajouté aussi au cas où App l'appelle ainsi
  isComparing: boolean;
  onToggleCompare: (gameId: string) => void;
  onViewDetails: (game: any) => void;
}

export function GameCard({ 
  game,
  trackedState,
  onStatusChange,
  onRemoveTrack,
  onOpenDetails,
  onSelectDetail,
  isComparing,
  onToggleCompare,
  onViewDetails
}: GameCardProps) {
  
  const handleOpen = () => {
    if (onSelectDetail) {
      onSelectDetail(game);
    } else if (onOpenDetails) {
      onOpenDetails(game);
    }
  };

  const renderPlatformBadge = (platformString: string) => {
    const p = platformString.toLowerCase();
    if (p.includes('ps5')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-white-300 rounded border border-white-800 flex items-center gap-0.5">PS5</span>;
    }
    if (p.includes('ps4')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-black-300 rounded border border-blue-800 flex items-center gap-0.5">PS4</span>;
    }
    if (p.includes('ps3')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-gray-200 rounded border border-gray-800 flex items-center gap-0.5">PS3</span>;
    }
    if (p.includes('xbox 360') ) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-emerald-500 rounded border border-emerald-800 flex items-center gap-0.5">Xbox 360</span>;
    }
        if (p.includes('xbox one') ) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-emerald-500 rounded border border-emerald-800 flex items-center gap-0.5">Xbox One</span>;
    }
    if (p.includes('xbox series') ) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-emerald-500 rounded border border-emerald-800 flex items-center gap-0.5">Xbox Series</span>;
    }
    if (p.includes('xbox') ) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-emerald-500 rounded border border-emerald-800 flex items-center gap-0.5">Xbox</span>;
    }

    if (p.includes('switch') || p.includes('nintendo')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-red-300 rounded border border-red-800 flex items-center gap-0.5">Switch</span>;
    }
    if (p.includes('linux')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-yellow-300 rounded border border-yellow-800 flex items-center gap-0.5">Linux</span>;
    }
    if (p.includes('windows') || p.includes('pc')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-950 text-black-300 rounded border border-blue-800 flex items-center gap-0.5">Windows</span>;
    }
    if (p.includes('mac') || p.includes('macos')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-500 text-black-300 rounded border border-abyss-800 flex items-center gap-0.5">MacOS</span>;
    }
    if (p.includes('ios')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-500 text-gray-300 rounded border border-gray-800 flex items-center gap-0.5">IOS</span>;
    }
    if (p.includes('android')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-500 text-lime-300 rounded border border-lime-800 flex items-center gap-0.5">Android</span>;
    }
    if (p.includes('wii')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-white-500 text-black-300 rounded border border-white-800 flex items-center gap-0.5">Wii</span>;
    }
    if (p.includes('wii-u')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-500 text-black-300 rounded border border-black-800 flex items-center gap-0.5">Wii-U</span>;
    }
    if (p.includes('ps-vita')) {
      return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-black-500 text-purple-400 rounded border border-diamond-800 flex items-center gap-0.5">PS-vita</span>;
    }
    return <span key={platformString} className="px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded border border-slate-800">{platformString}</span>;
  };

  return (
    <div className="bg-[#0b130e] rounded-xl p-5 border border-cyber-amber/20 shadow-[0_0_15px_rgba(255,179,0,0.05)] transition-all duration-300 hover:border-cyber-amber hover:shadow-[0_0_25px_rgba(255,179,0,0.35)] cursor-pointer">
      
      {/* CARD IMAGE */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img 
          src={game.imageUrl} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Rating Floating badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-800 text-amber-400 font-mono text-xs font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{game.rating.toFixed(1)}</span>
        </div>

        {/* Custom Matrix Toggle */}
        <button
          onClick={() => onToggleCompare(game.id)}
          title={isComparing ? "Retirer de la comparaison" : "Comparer ce jeu"}
          id={`compare-btn-${game.id}`}
          className={`absolute top-3 left-3 p-1.5 rounded-lg border backdrop-blur transition-all shadow-md ${
            isComparing
              ? 'bg-blac-600 border-blue-500 text-white animate-pulse'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>

        {/* Developer Info Overlay */}
        <div className="absolute bottom-3 left-3 text-[11px] font-medium text-slate-300 bg-slate-950/60 backdrop-blur px-2 py-0.5 rounded border border-slate-800/40">
          {game.developer}
        </div>
      </div>

      {/* CARD CONTENTS */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold font-display text-white line-clamp-2 whitespace-normal mb-2">
              {game.title}
            </h2>
            <span className="text-[11px] font-mono text-slate-500 shrink-0">{game.releaseYear}</span>
          </div>
          
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
            {game.shortDescription}
          </p>
        </div>

        {/* METRICS & GENRES */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 border-t border-slate-850/60 pt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{game.playTimeHours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-purple-400" />
              <span>{game.difficulty}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 items-center">
            {game.genres.slice(0, 2).map((g) => {
              const colorCombinations = [
                "bg-black-950/40 text-blue-400 border-blue-900/50",
                "bg-black-950/40 text-cyan-400 border-cyan-900/50",
                "bg-black-950/40 text-sky-400 border-sky-900/50",
                "bg-black-950/40 text-indigo-400 border-indigo-900/50",
                "bg-black-950/40 text-violet-400 border-violet-900/50",
                "bg-black-950/40 text-purple-400 border-purple-900/50",
                "bg-black-950/40 text-fuchsia-400 border-fuchsia-900/50",
                "bg-black-950/40 text-pink-400 border-pink-900/50",
                "bg-black-950/40 text-rose-400 border-rose-900/50",
                "bg-black-950/40 text-red-400 border-red-900/50",
                "bg-black-950/40 text-orange-400 border-orange-900/50",
                "bg-black-950/40 text-amber-400 border-amber-900/50",
                "bg-black-950/40 text-yellow-400 border-yellow-900/50",
                "bg-black-950/40 text-lime-400 border-lime-900/50",
                "bg-black-950/40 text-green-400 border-green-900/50",
                "bg-black-950/40 text-emerald-400 border-emerald-900/50",
                "bg-black-950/40 text-teal-400 border-teal-900/50",
                "bg-black-950/40 text-slate-400 border-slate-900/50",
                "bg-black-950/40 text-zinc-400 border-zinc-900/50",
                "bg-black-950/40 text-neutral-400 border-neutral-900/50",
                "bg-black-950/40 text-stone-400 border-stone-900/50",
                "bg-black-950/40 text-gray-400 border-gray-900/50",
                "bg-black-950/40 text-cyan-500 border-cyan-900/50",     
                "bg-black-950/40 text-sky-500 border-sky-900/50",        
                "bg-black-950/40 text-brown-400 border-brown-900/50",    
                "bg-black-950/40 text-yellow-500 border-yellow-900/50", 
                "bg-black-950/40 text-purple-500 border-purple-900/50",  
                "bg-black-950/40 text-blue-500 border-blue-900/50",     
                "bg-black-950/40 text-green-500 border-green-900/50",   
                "bg-black-950/40 text-red-500 border-red-900/50",        
                "bg-black-950/40 text-white border-white/25",            
                "bg-black-950/40 text-violet-500 border-violet-900/50",  
                "bg-black-950/40 text-fuchsia-500 border-fuchsia-900/50",
                "bg-black-950/40 text-pink-500 border-pink-900/50",
                "bg-black-950/40 text-emerald-500 border-emerald-900/50",
                "bg-black-950/40 text-lime-500 border-lime-900/50",
                "bg-black-950/40 text-orange-500 border-orange-900/50",
                "bg-black-950/40 text-blue-300 border-blue-900/40",
                "bg-black-950/40 text-cyan-300 border-cyan-900/40",
                "bg-black-950/40 text-indigo-300 border-indigo-900/40",
                "bg-black-950/40 text-violet-300 border-violet-900/40",
                "bg-black-950/40 text-purple-300 border-purple-900/40",
                "bg-black-950/40 text-pink-300 border-pink-900/40",
                "bg-black-950/40 text-red-300 border-red-900/40",
                "bg-black-950/40 text-orange-300 border-orange-900/40",
                "bg-black-950/40 text-amber-300 border-amber-900/40",
                "bg-black-950/40 text-yellow-300 border-yellow-900/40",
                "bg-black-950/40 text-lime-300 border-lime-900/40",
                "bg-black-950/40 text-green-300 border-green-900/40",
                "bg-black-950/40 text-emerald-300 border-emerald-900/40",
                "bg-black-950/40 text-teal-300 border-teal-900/40"
              ];

              const randomColor = colorCombinations[Math.floor(Math.random() * colorCombinations.length)];

              return (
                <span 
                  key={g} 
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded border flex items-center gap-0.5 ${randomColor}`}
                >
                  {g}
                </span>
              );
            })}
            {game.platforms.map(renderPlatformBadge)}
          </div>
        </div>

        {/* USER INTERACTIVE ACTIONS AREA */}
        <div className="pt-2 border-t border-slate-850/50 flex flex-col gap-2">
          
          {/* Quick status button bars */}
          {/* Nettoyage du conteneur : w-full pour occuper tout l'espace disponible proprement */}
          <div className="w-full mt-4">
            <div className="flex flex-row items-center gap-1.5 w-full">
              
              {/* Bouton En Cours */}
              <button 
                onClick={() => onStatusChange(game.id, 'en_cours')}
                type="button"
                className={`flex-1 flex flex-col items-center justify-center h-16 p-1 rounded-xl bg-black/40 border transition-all text-[10px] font-mono leading-none active:scale-95 cursor-pointer ${
                  trackedState?.status === 'en_cours'
                    ? 'border-cyber-amber text-cyber-amber shadow-[0_0_10px_rgba(255,179,0,0.2)]'
                    : 'border-cyber-darkgreen/40 hover:border-cyber-green text-slate-200 hover:text-cyber-green'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 mb-1 ${trackedState?.status === 'en_cours' ? 'animate-pulse' : ''}`} />
                <span className="text-center block truncate w-full tracking-tighter">En Cours</span>
              </button>

              {/* Bouton À Jouer */}
              <button 
                onClick={() => onStatusChange(game.id, 'backlog')}
                type="button"
                className={`flex-1 flex flex-col items-center justify-center h-16 p-1 rounded-xl bg-black/40 border transition-all text-[10px] font-mono leading-none active:scale-95 cursor-pointer ${
                  trackedState?.status === 'backlog'
                    ? 'border-cyber-amber text-cyber-amber shadow-[0_0_10px_rgba(255,179,0,0.2)]'
                    : 'border-cyber-darkgreen/40 hover:border-cyber-green text-slate-200 hover:text-cyber-green'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 mb-1 ${trackedState?.status === 'backlog' ? 'animate-pulse' : ''}`} />
                <span className="text-center block truncate w-full tracking-tighter">À Jouer</span>
              </button>

              {/* Bouton Terminé */}
              <button 
                onClick={() => onStatusChange(game.id, 'termine')}
                type="button"
                className={`flex-1 flex flex-col items-center justify-center h-16 p-1 rounded-xl bg-black/40 border transition-all text-[10px] font-mono leading-none active:scale-95 cursor-pointer ${
                  trackedState?.status === 'termine'
                    ? 'border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : 'border-cyber-darkgreen/40 hover:border-cyber-green text-slate-200 hover:text-cyber-green'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 mb-1" />
                <span className="text-center block truncate w-full tracking-tighter">Terminé</span>
              </button>

              {/* Bouton Envie */}
              <button 
                onClick={() => onStatusChange(game.id, 'envie_de_jouer')}
                type="button"
                className={`flex-1 flex flex-col items-center justify-center h-16 p-1 rounded-xl bg-black/40 border transition-all text-[10px] font-mono leading-none active:scale-95 cursor-pointer ${
                  trackedState?.status === 'envie_de_jouer'
                    ? 'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'border-cyber-darkgreen/40 hover:border-cyber-green text-slate-200 hover:text-cyber-green'
                }`}
              >
                <Heart className="w-3.5 h-3.5 mb-1" />
                <span className="text-center block truncate w-full tracking-tighter">Envie</span>
              </button>

            </div>
          </div>
          {/* Bouton de consultation des détails */}
            <button
              onClick={() => onViewDetails(game)}
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-cyber-green bg-black/20 hover:bg-cyber-green/10 text-cyber-green font-orbitron tracking-wider text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.05)] hover:shadow-[0_0_20px_rgba(0,255,102,0.2)]"
            >
              <Eye className="w-4 h-4 animate-pulse" />
              <span>Consulter votre {trackedState?.status === 'en_cours' ? 'session' :trackedState?.status === 'backlog' ? 'avis' : trackedState?.status === 'termine' ? 'avis' : 'envie'}</span>
            </button>
        </div>

      </div>

    </div>
  );
}