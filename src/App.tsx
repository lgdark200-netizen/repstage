/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { Game, PlayStatus, UserTrackedGame, AIRecommendation } from './types';
import { CURATED_GAMES, GENRES_LIST, PLATFORMS_LIST } from './data';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { 
  Gamepad2, 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  Plus, 
  Info, 
  AlertCircle,
  Compass, 
  Activity,
  Heart,
  FileCheck,
  TrendingUp,
  Shuffle,
  Loader,
  Clock1
} from 'lucide-react';


export default function App() {
  localStorage.removeItem('reparage_custom_games_list');
  // Local states
  const [gamesList, setGamesList] = useState<Game[]>(() => {
      const savedGames = localStorage.getItem('reparage_custom_games_list');
      if (savedGames) {
        try {
          const parsed = JSON.parse(savedGames);
          const customOnly = parsed.filter((g: Game) => g.isCustom);
          
          const combined = [...CURATED_GAMES];
          customOnly.forEach((customGame: Game) => {
            if (!combined.some(g => g.id === customGame.id)) {
              combined.push(customGame);
            }
          });
          
          return combined;
        } catch (e) {
          return CURATED_GAMES;
        }
      }
      return CURATED_GAMES;
    });

  const [trackedGames, setTrackedGames] = useState<Record<string, UserTrackedGame>>(() => {
    const savedTracks = localStorage.getItem('reparage_user_tracked_games');
    if (savedTracks) {
      try {
        return JSON.parse(savedTracks);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  // UI States
  const [selectedGenre, setSelectedGenre] = useState('Tous');
  const [selectedPlatform, setSelectedPlatform] = useState('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Game inside Detail Modal
  const [activeDetailGame, setActiveDetailGame] = useState<Game | null>(null);

  // Compare states (IDs of games to compare)
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // AI Search states
  const [aiSearchInput, setAiSearchInput] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  // AI Discover recommendations state
  const [userFavGenres, setUserFavGenres] = useState<string[]>([]);
  const [userFavPlatforms, setUserFavPlatforms] = useState<string[]>([]);
  const [customMoodInput, setCustomMoodInput] = useState('');
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [recsError, setRecsError] = useState<string | null>(null);
  const [hasAIKey, setHasAIKey] = useState<boolean | null>(null);

  // Auto-save customized lists & custom games to localStorage
  useEffect(() => {
    const customGames = gamesList.filter(g => g.isCustom);
    localStorage.setItem('reparage_custom_games_list', JSON.stringify(customGames));
  }, [gamesList]);

  useEffect(() => {
    localStorage.setItem('reparage_user_tracked_games', JSON.stringify(trackedGames));
  }, [trackedGames]);

  // Check server configuration & key on start
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setHasAIKey(data.hasAIKey);
      })
      .catch(() => {
        setHasAIKey(false);
      });
  }, []);

  // Filtered games based on selectors
  const filteredGames = gamesList.filter((game) => {
    const matchesGenre = selectedGenre === 'Tous' || game.genres.includes(selectedGenre);
    const matchesPlatform = selectedPlatform === 'Toutes' || game.platforms.includes(selectedPlatform);
    const matchesQuery = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesPlatform && matchesQuery;
  });

  // Toggle status selector
  const handleStatusChange = (gameId: string, status: PlayStatus) => {
    setTrackedGames(prev => {
      const existing = prev[gameId];
      return {
        ...prev,
        [gameId]: {
          gameId,
          status,
          personalRating: existing?.personalRating,
          personalNotes: existing?.personalNotes,
          addedAt: existing?.addedAt || new Date().toISOString()
        }
      };
    });
  };

  // Full detailed status updates
  const handleUpdateTrackDetails = (
    gameId: string, 
    status: PlayStatus, 
    personalRating?: number, 
    personalNotes?: string
  ) => {
    setTrackedGames(prev => {
      const existing = prev[gameId];
      return {
        ...prev,
        [gameId]: {
          gameId,
          status,
          personalRating,
          personalNotes,
          addedAt: existing?.addedAt || new Date().toISOString()
        }
      };
    });
  };

  // Remove tracking status
  const handleRemoveTrack = (gameId: string) => {
    setTrackedGames(prev => {
      const copy = { ...prev };
      delete copy[gameId];
      return copy;
    });
  };

  // Toggle game for technical side-by-side comparison
  const handleToggleCompare = (gameId: string) => {
    setCompareIds(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), gameId];
      }
      return [...prev, gameId];
    });
  };

  // Trigger search on AI Server
  const handleAIScoutSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchInput.trim()) return;

    setIsAiSearching(true);
    setAiSearchError(null);

    try {
      const response = await fetch('/api/search-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiSearchInput })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Une erreur serveur est survenue.");
      }

      const rawResult = await response.json();

      if (rawResult.found === false) {
        setAiSearchError(`Nous n'avons pas trouvé de jeu vidéo existant nommé "${aiSearchInput}". Veuillez spécifier un titre réel.`);
        setIsAiSearching(false);
        return;
      }

      const customId = `custom-${rawResult.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      const newCustomGame: Game = {
        id: customId,
        title: rawResult.title,
        developer: rawResult.developer,
        releaseYear: rawResult.releaseYear,
        genres: rawResult.genres || ['Action'],
        platforms: rawResult.platforms || ['PC'],
        rating: typeof rawResult.rating === 'number' ? rawResult.rating : 8.0,
        imageUrl: `https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80`,
        shortDescription: rawResult.shortDescription,
        description: rawResult.description,
        playTimeHours: rawResult.playTimeHours,
        difficulty: rawResult.difficulty,
        isCustom: true
      };

      setGamesList(prev => {
        const exists = prev.some(g => g.title.toLowerCase() === newCustomGame.title.toLowerCase());
        if (exists) {
          return prev;
        }
        return [newCustomGame, ...prev];
      });

      setAiSearchInput('');
      setAiSearchError(null);
      setActiveDetailGame(newCustomGame);

    } catch (err: any) {
      console.error(err);
      setAiSearchError(err.message || "Erreur de connexion lors de l'appel à l'IA de scouting.");
    } finally {
      setIsAiSearching(false);
    }
  };

  // Recommend AI games
  const handleAIRecommend = async () => {
    setIsGeneratingRecs(true);
    setRecsError(null);
    setAiRecommendations([]);

    const currentlyTrackedNames = Object.keys(trackedGames)
      .map(id => gamesList.find(g => g.id === id)?.title)
      .filter(Boolean)
      .join(', ');

    try {
      const response = await fetch('/api/recommend-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favoriteGenres: userFavGenres,
          favoritePlatforms: userFavPlatforms,
          trackedGamesText: currentlyTrackedNames,
          customUserRequest: customMoodInput
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Impossible de générer des recommandations.");
      }

      const recs = await response.json();
      setAiRecommendations(recs);
    } catch (err: any) {
      console.error(err);
      setRecsError(err.message || "Impossible d'obtenir des conseils de l'IA.");
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  // Ajouter un jeu recommandé au catalogue personnalisé
  const handleAddRecommendedToCatalog = (rec: AIRecommendation) => {
    const recId = `custom-rec-${rec.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    
    const newGame: Game = {
      id: recId,
      title: rec.title,
      developer: rec.developer,
      releaseYear: rec.releaseYear,
      genres: rec.genres,
      platforms: rec.platforms,
      rating: rec.rating,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      shortDescription: rec.shortDescription,
      description: rec.description,
      playTimeHours: (rec as any).playTimeHours || 20,
      difficulty: (rec as any).difficulty || 'Normale',
      isCustom: true
    };

    setGamesList(prev => {
      const exists = prev.some(g => g.title.toLowerCase() === newGame.title.toLowerCase());
      if (exists) return prev;
      return [newGame, ...prev];
    });

    setActiveDetailGame(newGame);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-mono selection:bg-cyber-green selection:text-black">
      {/* HEADER BAR */}
      <header className="border-b border-cyber-darkgreen/40 bg-black/40 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-green-700 rounded-xl shadow-lg shadow-cyber-green/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-cyber-green drop-shadow-[0_0_8px_rgba(0,255,102,0.6)] tracking-wide">
                Repérage Jeux Vidéo
              </h1>
              <p className="text-[10px] font-mono text-cyber-green/60 -mt-0.5">// SYSTEM_STATUS: OFFLINE</p>
            </div>
          </div>

            <div className="flex items-center gap-6">
            {/* Quick Overview KPI Chips */}
            <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-cyber-darkgreen/30">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">En cours:</span>
                <span className="font-bold text-white">
                  {Object.values(trackedGames).filter(t => t.status === 'en_cours').length}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-cyber-darkgreen/30">
                <Clock1 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">À Jouer:</span>
                <span className="font-bold text-white">
                  {Object.values(trackedGames).filter(t => t.status === 'backlog').length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-cyber-darkgreen/30">
                <FileCheck className="w-3.5 h-3.5 text-cyber-green" />
                <span className="text-slate-400">Terminés:</span>
                <span className="font-bold text-white">
                  {Object.values(trackedGames).filter(t => t.status === 'termine').length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-cyber-darkgreen/30">
                <Heart className="w-3.5 h-3.5 text-cyber-amber" />
                <span className="text-slate-400">Envies:</span>
                <span className="font-bold text-white">
                  {Object.values(trackedGames).filter(t => t.status === 'envie_de_jouer').length}
                </span>
              </div>
            </div>

            {/* Server key badge */}
            {hasAIKey !== null && (
              <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                hasAIKey 
                  ? 'bg-emerald-950/40 border-cyber-green/50 text-cyber-green' 
                  : 'bg-amber-950/40 border-cyber-amber/50 text-cyber-amber'
              }`}>
                {hasAIKey ? 'IA : ACTIVE' : 'IA : OFFLINE'}
              </div>
            )}
          </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-10">
        
        {/* SECTION 1: AI CORE INTELLIGENCE INTERFACES */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: SCOUT SEARCH ENGINE */}
          <div className="lg:col-span-5 bg-black/40 border border-cyber-darkgreen/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyber-green/10 rounded-lg text-cyber-green">
                    <Search className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold font-display text-slate-100 tracking-wide uppercase">Moteur de Scout IA</h2>
                </div>
                <span className="text-[10px] bg-blue-950 text-blue-400 font-mono px-2 py-0.5 rounded">Deep Scan</span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed font-mono">
                Recherche et extrait instantanément la fiche technique complète de n'importe quel jeu réel absent du catalogue standard.
              </p>

              <form onSubmit={handleAIScoutSearch} className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="cursor-help" title="Entre n'importe quel titre de jeu réel. L'IA va l'analyser et l'injecter dynamiquement dans ton application.">
                    <Info className="w-3.5 h-3.5 text-cyber-green/60" />
                  </span>
                  <label htmlFor="ai-search-field" className="text-xs font-mono text-cyber-green/70 block">Titre exact du jeu vidéo :</label>
                </div>
                <div className="flex gap-2 bg-black/60 border border-cyber-darkgreen/30 p-1 rounded-xl">
                  <input
                    id="ai-search-field"
                    type="text"
                    placeholder="Ex: Elden Ring, Baldur's Gate 3, Hades..."
                    value={aiSearchInput}
                    onChange={(e) => setAiSearchInput(e.target.value)}
                    disabled={isAiSearching}
                    className="flex-grow bg-transparent text-slate-200 outline-none px-3 py-2 font-mono text-sm placeholder:text-slate-600 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isAiSearching || !aiSearchInput.trim()}
                    className="bg-slate-900 border border-cyber-darkgreen/50 text-slate-300 hover:text-cyber-green disabled:text-slate-600 px-4 py-2 rounded-lg font-mono text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {isAiSearching ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin text-cyber-green" />
                        <span>Analyse...</span>
                      </>
                    ) : (
                      <>
                        <span>+ Injecter</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error notifications wrapper */}
            {aiSearchError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-900 text-red-400 text-xs flex gap-2 items-start animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{aiSearchError}</p>
              </div>
            )}
          </div>

          {/* RIGHT: PERSONALIZED DISCOVERY RECOMMANDATIONS MATRICES */}
          <div className="lg:col-span-7 bg-black/40 border border-cyber-darkgreen/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyber-amber/10 rounded-lg text-cyber-amber">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold font-display text-slate-100 tracking-wide uppercase">Générateur de Conseils Prédictifs</h2>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">Filtres Croisés</span>
              </div>

              {/* Custom filters triggers configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Target genres */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-mono block uppercase">Genres Préférés :</label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {GENRES_LIST.filter(g => g !== 'Tous').map(genre => {
                      const active = userFavGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => setUserFavGenres(prev => active ? prev.filter(g => g !== genre) : [...prev, genre])}
                          className={`text-xs font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                            active 
                              ? 'border-cyber-amber bg-cyber-amber/10 text-cyber-amber shadow-[0_0_8px_rgba(255,179,0,0.2)]' 
                              : 'border-slate-800 bg-transparent text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target platforms */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-mono block uppercase">Supports Cibles :</label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {PLATFORMS_LIST.filter(p => p !== 'Toutes').map(plat => {
                      const active = userFavPlatforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => setUserFavPlatforms(prev => active ? prev.filter(p => p !== plat) : [...prev, plat])}
                          className={`text-xs font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                            active 
                              ? 'border-cyber-amber bg-cyber-amber/10 text-cyber-amber shadow-[0_0_8px_rgba(255,179,0,0.2)]' 
                              : 'border-slate-800 bg-transparent text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mood context string query */}
              <div className="space-y-1.5 pt-1">
                <label htmlFor="mood-field" className="text-xs text-cyber-green/70 block font-mono uppercase">Contexte ou Humeur spécifique (Optionnel) :</label>
                <div className="flex gap-2 bg-black/60 border border-cyber-darkgreen/30 p-1 rounded-xl items-center">
                  <input
                    id="mood-field"
                    type="text"
                    placeholder="Ex: Un jeu court avec une histoire incroyable, pas de rogue-like..."
                    value={customMoodInput}
                    onChange={(e) => setCustomMoodInput(e.target.value)}
                    disabled={isGeneratingRecs}
                    className="flex-grow bg-transparent text-slate-200 outline-none px-3 py-2 font-mono text-sm placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleAIRecommend}
                    disabled={isGeneratingRecs}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-display font-bold px-5 py-2 rounded-lg text-sm flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(147,51,234,0.3)] shrink-0 cursor-pointer disabled:bg-slate-800 disabled:text-slate-600"
                  >
                    {isGeneratingRecs ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        <span>Calcul...</span>
                      </>
                    ) : (
                      <>
                        <span> Conseiller</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations layout display drawer */}
            {recsError && (
              <div className="p-3 mt-4 rounded-xl bg-red-950/40 border border-red-900 text-red-400 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{recsError}</p>
              </div>
            )}

            {aiRecommendations.length > 0 && (
              <div className="pt-4 mt-4 space-y-2 border-t border-cyber-darkgreen/30 animate-fade-in w-full">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-cyber-amber" />
                  <span>Suggestions Idéales selon votre profil & humeur :</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="bg-black/60 border border-cyber-darkgreen/20 rounded-xl p-3 flex flex-col justify-between hover:border-cyber-amber/50 glow-amber transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-cyber-amber truncate" title={rec.title}>{rec.title}</h4>
                          <span className="text-[10px] font-mono text-amber-400 flex items-center shrink-0">★{rec.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-3 leading-normal font-mono">{rec.shortDescription}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddRecommendedToCatalog(rec)}
                        className="w-full mt-2.5 py-1 rounded bg-black/40 hover:bg-cyber-darkgreen/20 border border-cyber-darkgreen/40 hover:border-cyber-green text-[10px] font-mono text-slate-300 hover:text-cyber-green transition-colors cursor-pointer"
                      >
                        + Importer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* SECTION 2: TECHNICAL SIDE-BY-SIDE COMPARE BENCHMARK AREA */}
        {compareIds.length > 0 && (
          <section className="bg-black/40 border border-cyber-green/30 rounded-2xl p-5 space-y-4 animate-fade-in shadow-xl shadow-cyber-green/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyber-green/10 rounded-lg text-cyber-green">
                  <Shuffle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-display text-white tracking-wide uppercase">Matrice comparative de repérage</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Analyse juxtaposée des caractéristiques de jeu ({compareIds.length}/3)</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setCompareIds([])}
                className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                [ Vider la matrice ]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareIds.map(id => {
                const game = gamesList.find(g => g.id === id);
                if (!game) return null;
                const track = trackedGames[id];
                return (
                  <div key={id} className="bg-black/60 border border-cyber-darkgreen/40 rounded-xl p-4 flex flex-col justify-between space-y-3 relative group">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-cyber-amber font-display">{game.title}</h3>
                          <p className="text-[10px] text-slate-500 font-mono">{game.developer} — {game.releaseYear}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleCompare(game.id)}
                          className="text-[10px] text-slate-600 hover:text-red-400 font-mono transition-colors cursor-pointer"
                          title="Retirer du benchmark"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Technical specifications rows stack */}
                      <div className="space-y-1.5 pt-1 text-xs font-mono">
                        <div className="flex justify-between border-b border-cyber-darkgreen/10 pb-1">
                          <span className="text-slate-500">Note Globale:</span>
                          <span className="text-amber-400 font-bold">{game.rating.toFixed(1)} / 10</span>
                        </div>
                        <div className="flex justify-between border-b border-cyber-darkgreen/10 pb-1">
                          <span className="text-slate-500">Temps de jeu:</span>
                          <span className="text-cyber-green font-bold">~{game.playTimeHours} heures</span>
                        </div>
                        <div className="flex justify-between border-b border-cyber-darkgreen/10 pb-1">
                          <span className="text-slate-500">Complexité:</span>
                          <span className="text-purple-400">{game.difficulty}</span>
                        </div>
                        <div className="flex justify-between border-b border-cyber-darkgreen/10 pb-1">
                          <span className="text-slate-500">Mon Statut:</span>
                          <span className={`font-bold ${
                            track?.status === 'en_cours' ? 'text-blue-400' :
                            track?.status === 'termine' ? 'text-cyber-green' :
                            track?.status === 'envie_de_jouer' ? 'text-cyber-amber' : 'text-slate-600'
                          }`}>
                            {track?.status === 'en_cours' ? 'En Cours' :
                             track?.status === 'termine' ? 'Terminé' :
                             track?.status === 'envie_de_jouer' ? 'Envie' : 'Non suivi'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveDetailGame(game)}
                      className="w-full py-1.5 rounded-lg bg-black/40 hover:bg-cyber-darkgreen/20 border border-cyber-darkgreen/40 hover:border-cyber-green text-center text-xs font-mono text-slate-200 hover:text-cyber-green transition-colors cursor-pointer"
                    >
                      Ouvrir l'analyse complète
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: RESPONSIVE FILTERS AND REPOSITORY CATALOG */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-darkgreen/20 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-black/40 rounded-lg border border-cyber-darkgreen/30 text-cyber-green">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-display text-white tracking-wide uppercase">Catalogue de repérage</h2>
                <p className="text-[10px] text-slate-400 font-mono">Filtres dynamiques sur la collection en cache</p>
              </div>
            </div>

            {/* Filters selectors container toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Query Search Input */}
              <input
                type="text"
                placeholder="Filtrer par titre, studio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-cyber-darkgreen/30 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyber-green/50 min-w-[180px] transition-all font-mono"
              />

              {/* Genre combo selection */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-black/60 border border-cyber-darkgreen/30 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyber-green/50 cursor-pointer font-mono"
              >
                {GENRES_LIST.map(g => (
                  <option key={g} value={g} className="bg-cyber-bg text-slate-300">{g === 'Tous' ? 'Tous les Genres' : g}</option>
                ))}
              </select>

              {/* Platform combo selection */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-black/60 border border-cyber-darkgreen/30 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyber-green/50 cursor-pointer font-mono"
              >
                {PLATFORMS_LIST.map(p => (
                  <option key={p} value={p} className="bg-cyber-bg text-slate-300">{p === 'Toutes' ? 'Toutes Plateformes' : p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GRID RENDER COMPONENT ENTRYPOINT */}
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  trackedState={trackedGames[game.id]}
                  onStatusChange={handleStatusChange}
                  onRemoveTrack={handleRemoveTrack}
                  onOpenDetails={setActiveDetailGame}
                  isComparing={compareIds.includes(game.id)}
                  onToggleCompare={handleToggleCompare}
                  onViewDetails={setActiveDetailGame}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-black/40 border border-cyber-darkgreen/30 rounded-2xl p-6">
              <Gamepad2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">Aucun résultat</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-mono">
                Aucun jeu de votre catalogue ne correspond à vos filtres combinés. Utilisez la barre de scout IA en haut pour importer de nouveaux jeux !
              </p>
            </div>
          )}
        </section>

      </main>

      {/* GAME DETAIL MODAL DIALOG */}
      {activeDetailGame && (
        <GameDetailModal
          game={activeDetailGame}
          trackedState={trackedGames[activeDetailGame.id]}
          onClose={() => setActiveDetailGame(null)}
          onUpdateTrack={handleUpdateTrackDetails}
          onRemoveTrack={handleRemoveTrack}
        />
      )}

      {/* FOOTER */}
      <footer className="mt-20 border-t border-cyber-darkgreen/20 bg-black/60 py-6 max-w-7xl mx-auto px-4 w-full text-center text-xs text-slate-500 font-mono">
        <p>REPER-GAME — Site de repérage et d'analyse de jeux vidéo personnalisé.</p>
      </footer>
    </div>
  );
}