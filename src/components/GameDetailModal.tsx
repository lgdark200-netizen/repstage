/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Game, PlayStatus, UserTrackedGame } from '../types';
import { X, Star, Calendar, User, Clock, Flame, CheckCircle, Heart, Tag, Edit3, Trash2, ShieldQuestion } from 'lucide-react';

interface GameDetailModalProps {
  game: Game;
  trackedState?: UserTrackedGame;
  onClose: () => void;
  onUpdateTrack: (gameId: string, status: PlayStatus, personalRating?: number, personalNotes?: string) => void;
  onRemoveTrack: (gameId: string) => void;
}

export function GameDetailModal({
  game,
  trackedState,
  onClose,
  onUpdateTrack,
  onRemoveTrack,
}: GameDetailModalProps) {
  const [personalNotes, setPersonalNotes] = useState(trackedState?.personalNotes || '');
  const [personalRating, setPersonalRating] = useState<number>(trackedState?.personalRating || 0);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Sync state if trackedState changes
  useEffect(() => {
    setPersonalNotes(trackedState?.personalNotes || '');
    setPersonalRating(trackedState?.personalRating || 0);
  }, [trackedState]);

  const handleSaveTrackDetails = () => {
    if (trackedState) {
      onUpdateTrack(game.id, trackedState.status, personalRating > 0 ? personalRating : undefined, personalNotes);
      setIsEditingNotes(false);
    }
  };

  const handleStatusClick = (status: PlayStatus) => {
    onUpdateTrack(game.id, status, personalRating > 0 ? personalRating : undefined, personalNotes);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'facile':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'moyen':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'difficile':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div id="game-detail-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="game-detail-content-container" 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Close target */}
        <div className="relative h-48 sm:h-64 bg-slate-950">
          <img
            src={game.imageUrl}
            alt={game.title}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            id="close-modal-btn"
            className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-all"
            aria-label="Fermer la modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and Release Details Overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {game.isCustom && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-fuchsia-500 text-slate-950 rounded">
                  IA Explorée
                </span>
              )}
              {trackedState && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-violet-600 text-white rounded">
                  Suivi actif
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-tight">
              {game.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-violet-400" /> {game.developer}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {game.releaseYear}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content section */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Main Stats Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500 leading-none">Presse moyenne</div>
                <div className="text-lg font-bold font-mono text-yellow-400">{game.rating.toFixed(1)} <span className="text-xs text-slate-500">/10</span></div>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500 leading-none">Durée de vie</div>
                <div className="text-lg font-bold font-mono text-slate-200">
                  {game.playTimeHours ? `${game.playTimeHours}h` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <ShieldQuestion className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500 leading-none">Difficulté</div>
                <div className="mt-0.5">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty || 'Moyen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Description du jeu</h4>
            <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800/50 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {game.description}
            </div>
          </div>

          {/* System Details (Genres, Platforms) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Genres</h4>
              <div className="flex flex-wrap gap-1.5">
                {game.genres.map((genre) => (
                  <span key={genre} className="px-2.5 py-1 text-xs bg-black-800/80 text-purple-300 rounded-lg border border-slate-700/80">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Plateformes d'accueil</h4>
              <div className="flex flex-wrap gap-1.5">
                {game.platforms.map((platform) => (
                  <span key={platform} className="px-2.5 py-1 text-xs bg-black-800/80 text-cyan-600 rounded-lg border border-slate-700/80">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tracking Hub Container */}
          <div className="border-t border-slate-800/80 pt-6">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-400" />
              Votre statut de repérage personnel
            </h4>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-850 space-y-4">
              {/* Select Status Buttons */}
              <div>
                <p className="text-xs text-slate-400 font-mono mb-2">Classer ce jeu dans votre collection :</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleStatusClick('en_cours')}
                    id="modal-status-playing"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 justify-center transition-all ${
                      trackedState?.status === 'en_cours'
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    En cours
                  </button>

                  <button
                    onClick={() => handleStatusClick('backlog')}
                    id="modal-status-backlog"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 justify-center transition-all ${
                      trackedState?.status === 'backlog'
                        ? 'bg-amber-600 border-amber-500 text-white font-bold shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    À Jouer
                  </button>

                  <button
                    onClick={() => handleStatusClick('termine')}
                    id="modal-status-completed"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 justify-center transition-all ${
                      trackedState?.status === 'termine'
                        ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Terminé
                  </button>

                  <button
                    onClick={() => handleStatusClick('envie_de_jouer')}
                    id="modal-status-wishlist"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 justify-center transition-all ${
                      trackedState?.status === 'envie_de_jouer'
                        ? 'bg-purple-600 border-purple-500 text-white font-bold shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    En envie
                  </button>
                </div>
              </div>

              {/* Personal Rating and Notes (Only visible if the game is tracked) */}
              {trackedState ? (
                <div className="space-y-4 pt-3 border-t border-slate-800/50">
                  {/* Rating Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-300 font-mono block">Votre note sur ce jeu :</span>
                      <span className="text-[10px] text-slate-500 font-mono">Notez votre expérience sur 5 étoiles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => {
                            setPersonalRating(star);
                            onUpdateTrack(game.id, trackedState.status, star, personalNotes);
                          }}
                          id={`star-btn-${star}`}
                          className="p-1 text-slate-500 hover:text-yellow-400 transition-colors"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= personalRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-600 hover:text-slate-400'
                            }`} 
                          />
                        </button>
                      ))}
                      {personalRating > 0 && (
                        <button
                          onClick={() => {
                            setPersonalRating(0);
                            onUpdateTrack(game.id, trackedState.status, undefined, personalNotes);
                          }}
                          id="clear-star-rating"
                          className="text-[11px] text-red-400 hover:underline font-mono ml-2"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-mono">Vos notes de session :</span>
                      {!isEditingNotes ? (
                        <button
                          onClick={() => setIsEditingNotes(true)}
                          id="edit-notes-btn"
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                        >
                          <Edit3 className="w-3 h-3" /> Modifier
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveTrackDetails}
                          id="save-notes-btn"
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold font-mono"
                        >
                          Enregistrer
                        </button>
                      )}
                    </div>

                    {isEditingNotes ? (
                      <textarea
                        value={personalNotes}
                        onChange={(e) => setPersonalNotes(e.target.value)}
                        placeholder="Rédigez vos impressions, boss vaincus, build favoris ou progression..."
                        className="w-full text-xs font-sans text-slate-200 bg-slate-905 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none h-24"
                      />
                    ) : (
                      <div className="text-xs font-sans text-slate-400 bg-slate-905 border border-slate-850 rounded-lg p-3 min-h-12 italic">
                        {personalNotes ? personalNotes : "Aucune note consignée. Cliquez sur modifier pour écrire ou sauvegarder vos impressions."}
                      </div>
                    )}
                  </div>

                  {/* Remove tracking action */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        onRemoveTrack(game.id);
                        onClose();
                      }}
                      id="remove-tracking-btn"
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Retirer de ma liste
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

        </div>

        {/* Footer Area */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-850 flex items-center justify-between">
          <p className="text-[10px] font-mono text-slate-500 text-center sm:text-left">
            Identifiant jeu : <span className="text-slate-400">{game.id}</span>
          </p>
          <button
            onClick={onClose}
            id="modal-footer-close"
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Fermer l'analyse
          </button>
        </div>
      </div>
    </div>
  );
}
