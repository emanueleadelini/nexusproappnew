export type StatoValidazione = 'in_attesa' | 'validato' | 'rifiutato';

export const STATO_VALIDAZIONE_LABELS: Record<StatoValidazione, string> = {
  in_attesa: 'In attesa',
  validato: 'Validato',
  rifiutato: 'Rifiutato',
};

export const STATO_VALIDAZIONE_COLORS: Record<StatoValidazione, { bg: string; text: string }> = {
  in_attesa: { bg: 'bg-amber-100', text: 'text-amber-800' },
  validato: { bg: 'bg-green-100', text: 'text-green-800' },
  rifiutato: { bg: 'bg-red-100', text: 'text-red-800' },
};

export interface Material {
  id: string;
  nomeFile: string;          // campo Firestore: "nome_file"
  urlStorage?: string | null; // campo Firestore: "url_storage"
  caricatoDa: string;        // campo Firestore: "caricato_da" (UID)
  statoValidazione: StatoValidazione;
  noteRifiuto?: string | null;
  creatoIl?: any;
}
