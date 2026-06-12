import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY manquant. Mode de secours activé.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API statut de clé
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', hasAIKey: !!process.env.GEMINI_API_KEY });
  });

  // NOUVELLE API : Récupère des vrais jeux depuis Internet (FreeToGame API)
  app.get('/api/external-games', async (req, res) => {
    try {
      // On appelle l'API publique sur Internet
      const response = await fetch('https://www.freetogame.com/api/games?');
      
      if (!response.ok) {
        throw new Error(`Erreur API externe: ${response.status}`);
      }

      const gamesData = await response.json();
      
      // On ne prend que les 10 premiers jeux pour ne pas surcharger le projet
      const top10Games = gamesData.slice(0, 10);
      
      res.json(top10Games);
    } catch (error: any) {
      console.error("Erreur lors de l'appel de l'API externe :", error);
      res.status(500).json({ error: "Impossible de récupérer les jeux sur Internet", details: error.message });
    }
  });

  // API: Recherche ou scout d'un jeu via Gemini
  app.post('/api/search-game?', async (req, res) => {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'La recherche est requise.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Service d\'analyse indisponible.' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Tu es un expert encyclopédique de jeux vidéo. Donne les détails du jeu : "${query}". Retourne une description, l'année, le développeur, la durée de vie et la difficulté en français.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              developer: { type: Type.STRING },
              releaseYear: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
              rating: { type: Type.NUMBER },
              shortDescription: { type: Type.STRING },
              description: { type: Type.STRING },
              playTimeHours: { type: Type.NUMBER },
              difficulty: { type: Type.STRING },
              found: { type: Type.BOOLEAN },
            },
            required: ['title', 'developer', 'releaseYear', 'genres', 'platforms', 'rating', 'shortDescription', 'description', 'playTimeHours', 'difficulty', 'found'],
          },
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (e: any) {
      res.status(500).json({ error: 'Erreur communication IA', details: e.message });
    }
  });

  // API: Recommandation intelligente via Gemini
  app.post('/api/recommend-games', async (req, res) => {
    const { favoriteGenres, favoritePlatforms, trackedGamesText, customUserRequest } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Moteur IA indisponible.' });
      return;
    }

    try {
      const prompt = `Génère 3 recommandations personnalisées. Genres souhaités : ${favoriteGenres?.join(', ') || 'Tous'}. Plateformes : ${favoritePlatforms?.join(', ') || 'Toutes'}. Demande : "${customUserRequest || 'Incontournables'}". Recommandations réelles uniquement.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                developer: { type: Type.STRING },
                releaseYear: { type: Type.STRING },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                rating: { type: Type.NUMBER },
                shortDescription: { type: Type.STRING },
                description: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ['title', 'developer', 'releaseYear', 'genres', 'platforms', 'rating', 'shortDescription', 'description', 'reason'],
            },
          },
        },
      });
      res.json(JSON.parse(response.text || '[]'));
    } catch (e: any) {
      res.status(500).json({ error: 'Erreur IA', details: e.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Serveur actif sur le port ${PORT}`));
}

startServer();