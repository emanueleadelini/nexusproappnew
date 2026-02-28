import { Timestamp } from 'firebase/firestore';

export type StatoPost =
  | 'bozza'
  | 'revisione_interna'
  | 'da_approvare'
  | 'revisione'
  | 'approvato'
  | 'programmato'
  | 'pubblicato';

export const STATO_POST_LABELS: Record<StatoPost, string> = {
  bozza: 'Bozza',
  revisione_interna: 'Revisione Interna',
  da_approvare: 'Da approvare',
  revisione: 'Richiesta Revisione',
  approvato: 'Approvato',
  programmato: 'Programmato',
  pubblicato: 'Pubblicato',
};

export const STATO_POST_COLORS: Record<StatoPost, { bg: string; text: string }> = {
  bozza: { bg: 'bg-gray-100', text: 'text-gray-700' },
  revisione_interna: { bg: 'bg-blue-100', text: 'text-blue-800' },
  da_approvare: { bg: 'bg-orange-100', text: 'text-orange-800' },
  revisione: { bg: 'bg-red-100', text: 'text-red-800' },
  approvato: { bg: 'bg-green-100', text: 'text-green-800' },
  programmato: { bg: 'bg-purple-100', text: 'text-purple-800' },
  pubblicato: { bg: 'bg-green-600', text: 'text-white' },
};

export type PiattaformaPost = "instagram" | "facebook" | "linkedin" | "tiktok" | "twitter" | "pinterest" | "google_business";
export type FormatoPost = "immagine_singola" | "carosello" | "video" | "reel" | "story" | "testo";

export const PIATTAFORMA_LABELS: Record<PiattaformaPost, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
  pinterest: 'Pinterest',
  google_business: 'Google Business',
};

export const FORMATO_LABELS: Record<FormatoPost, string> = {
  immagine_singola: 'Immagine Singola',
  carosello: 'Carosello',
  video: 'Video',
  reel: 'Reel',
  story: 'Story',
  testo: 'Solo Testo',
};

export interface StoricoStato {
  stato: StatoPost;
  autore_uid: string;
  timestamp: Timestamp;
  nota?: string;
}

export interface VersionePost {
  testo: string;
  titolo: string;
  autore_uid: string;
  autore_nome: string;
  timestamp: Timestamp;
  nota?: string;
}

export interface Post {
  id: string;
  titolo: string;
  testo: string;
  stato: StatoPost;
  data_pubblicazione: Timestamp | null;
  creato_il: Timestamp;
  aggiornato_il: Timestamp;
  materiale_id?: string | null;
  
  // Pro Features (Sprint 1C)
  piattaforma: PiattaformaPost;
  formato: FormatoPost;
  tags?: string[];
  numero_revisioni: number;
  storico_stati: StoricoStato[];
  versioni: VersionePost[];
  versione_corrente: number;
}
