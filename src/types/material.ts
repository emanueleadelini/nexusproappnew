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
  nome_file: string;
  url_storage?: string | null;
  caricato_da: string;
  stato_validazione: StatoValidazione;
  note_rifiuto?: string | null;
  creato_il?: any;
}
