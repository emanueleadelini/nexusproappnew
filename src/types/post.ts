export type StatoPost = 'bozza' | 'da_approvare' | 'approvato' | 'pubblicato';

export const STATO_POST_LABELS: Record<StatoPost, string> = {
  bozza: 'Bozza',
  da_approvare: 'Da approvare',
  approvato: 'Approvato',
  pubblicato: 'Pubblicato',
};

export const STATO_POST_COLORS: Record<StatoPost, { bg: string; text: string }> = {
  bozza: { bg: 'bg-gray-100', text: 'text-gray-700' },
  da_approvare: { bg: 'bg-orange-100', text: 'text-orange-800' },
  approvato: { bg: 'bg-blue-100', text: 'text-blue-800' },
  pubblicato: { bg: 'bg-green-100', text: 'text-green-800' },
};

export interface Post {
  id: string;
  titolo: string;
  testo: string;
  stato: StatoPost;
  data_pubblicazione?: any;
  creato_il?: any;
  aggiornato_il?: any;
}
