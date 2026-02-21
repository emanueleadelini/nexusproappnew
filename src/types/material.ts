import { Timestamp } from 'firebase/firestore';
import { FileText, Image as ImageIcon, Video, Camera, Share2, Globe, Printer } from 'lucide-react';

export type StatoValidazione = 'in_attesa' | 'validato' | 'rifiutato';
export type DestinazioneAsset = 'social' | 'sito' | 'offline';
export type TipoAsset = 'grafica' | 'foto' | 'video' | 'documento';

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

export const DESTINAZIONE_LABELS: Record<DestinazioneAsset, string> = {
  social: 'Social Media',
  sito: 'Sito Web',
  offline: 'Grafica Offline',
};

export const DESTINAZIONE_ICONS: Record<DestinazioneAsset, any> = {
  social: Share2,
  sito: Globe,
  offline: Printer,
};

export interface Material {
  id: string;
  nome_file: string;
  url_storage: string | null;
  caricato_da: string; // UID utente
  stato_validazione: StatoValidazione;
  destinazione: DestinazioneAsset; // Campo per suddivisione Social/Sito/Offline
  note_rifiuto: string | null;
  creato_il: Timestamp;
}

export function getFileTypeInfo(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['svg', 'ai', 'eps'].includes(extension || '')) {
    return { type: 'grafica' as TipoAsset, label: 'Grafica', icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-50' };
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
    return { type: 'foto' as TipoAsset, label: 'Foto', icon: Camera, color: 'text-emerald-500', bg: 'bg-emerald-50' };
  }
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
    return { type: 'video' as TipoAsset, label: 'Video', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' };
  }
  return { type: 'documento' as TipoAsset, label: 'Documento', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' };
}
