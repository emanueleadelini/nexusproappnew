import { Timestamp } from 'firebase/firestore';

export type StatoLead = 'nuovo' | 'contattato' | 'convertito';
export type TipoLead = 'prova' | 'demo';
export type ProdottoLead = 'nexuspro' | 'placeat' | 'fatturaparse' | 'normaguard' | 'fatturamatch' | 'fiscoauto' | 'studioflow' | 'adnextformazione' | 'bundle' | 'altro';

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefono?: string;
  azienda?: string;
  messaggio?: string;
  prodotto: ProdottoLead;
  tipo: TipoLead;
  stato: StatoLead;
  creato_il: Timestamp;
}

export const STATO_LEAD_LABELS: Record<StatoLead, string> = {
  nuovo: 'Nuovo',
  contattato: 'Contattato',
  convertito: 'Convertito',
};

export const STATO_LEAD_COLORS: Record<StatoLead, { bg: string; text: string; dot: string }> = {
  nuovo: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  contattato: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  convertito: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export const PRODOTTO_LEAD_LABELS: Record<ProdottoLead, string> = {
  nexuspro: 'Nexus Pro',
  placeat: 'Placeat',
  fatturaparse: 'FatturaParse',
  normaguard: 'NormaGuard',
  fatturamatch: 'FatturaMatch',
  fiscoauto: 'FiscoAuto',
  studioflow: 'StudioFlow',
  adnextformazione: 'AD Next Formazione',
  bundle: 'Bundle Completo',
  altro: 'Altro',
};
