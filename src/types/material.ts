import { FileText, Image as ImageIcon, Video, File as FileIcon, Globe, Share2, Printer } from 'lucide-react';

export type StatoValidazione = 'in_attesa' | 'validato' | 'rifiutato';
export type DestinazioneMateriale = 'social' | 'sito' | 'offline';

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

export const DESTINAZIONE_LABELS: Record<DestinazioneMateriale, string> = {
  social: 'Social Media',
  sito: 'Sito Web',
  offline: 'Grafica Offline',
};

export const DESTINAZIONE_ICONS: Record<DestinazioneMateriale, any> = {
  social: Share2,
  sito: Globe,
  offline: Printer,
};

export interface Material {
  id: string;
  nome_file: string;
  url_storage?: string | null;
  caricato_da: string;
  ruolo_caricatore: 'admin' | 'cliente';
  stato_validazione: StatoValidazione;
  destinazione: DestinazioneMateriale;
  note_rifiuto?: string | null;
  creato_il: string;
}

export function getFileTypeInfo(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
    return { label: 'Grafica', icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-50' };
  }
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
    return { label: 'Video', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' };
  }
  if (['pdf'].includes(extension || '')) {
    return { label: 'PDF', icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
  }
  return { label: 'Documento', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' };
}
