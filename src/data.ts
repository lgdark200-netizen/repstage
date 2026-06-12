import { Game } from './types';
import gamesData from './games-data.json';

// 1. Export des jeux typés
export const CURATED_GAMES: Game[] = gamesData as Game[];

// 2. Génération dynamique et unique des genres (fini les doublons !)
export const GENRES_LIST = [
  'Tous',
  ...Array.from(new Set(CURATED_GAMES.flatMap(game => game.genres || [])))
].sort();

// 3. Génération dynamique et unique des plateformes
export const PLATFORMS_LIST = [
  'Toutes',
  ...Array.from(new Set(CURATED_GAMES.flatMap(game => game.platforms || [])))
].sort();