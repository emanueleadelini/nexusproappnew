import { Timestamp } from 'firebase/firestore';

export type StatoRichiesta = 'aperta' | 'in_lavorazione' | 'risolta';

export interface Allegato {
  nome: string;
  link: string;
}

export interface Richiesta {
  id: string;
  cliente_id: string;
  titolo: string;
  stato: StatoRichiesta;
  creato_il: Timestamp;
  aggiornato_il: Timestamp;
  ultimo_messaggio_preview: string;
  non_letti_admin: number;
  non_letti_cliente: number;
  creato_da_uid: string;
}

export interface MessaggioRichiesta {
  id: string;
  autore_uid: string;
  autore_ruolo: string;
  autore_nome: string;
  testo: string;
  allegati: Allegato[];
  creato_il: Timestamp;
}

export const STATO_RICHIESTA_LABELS: Record<StatoRichiesta, string> = {
  aperta: 'Aperta',
  in_lavorazione: 'In Lavorazione',
  risolta: 'Risolta',
};

export const STATO_RICHIESTA_COLORS: Record<StatoRichiesta, { bg: string; text: string; dot: string }> = {
  aperta: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  in_lavorazione: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  risolta: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};
