/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Game {
  id: string;
  title: string;
  developer: string;
  releaseYear: string;
  genres: string[];
  platforms: string[];
  rating: number; // Note globale sur 10
  imageUrl: string;
  shortDescription: string;
  description: string;
  playTimeHours?: number;
  difficulty?: string;
  isCustom?: boolean; // Indique si le jeu a été scouté par l'IA
}

export type PlayStatus = 'backlog' | 'en_cours' | 'termine' | 'envie_de_jouer';

export interface UserTrackedGame {
  gameId: string;
  status: PlayStatus;
  personalRating?: number; // De 1 à 5 étoiles
  personalNotes?: string;
  addedAt: string;
}

export interface AIRecommendation {
  title: string;
  shortDescription: string;
  description: string;
  genres: string[];
  platforms: string[];
  rating: number;
  releaseYear: string;
  developer: string;
  reason: string; // Explication de la recommandation par l'IA
}