import { Timestamp } from 'firebase/firestore';
import { FileText, Camera, Share2, Printer, Link as LinkIcon, FileSignature, Fingerprint } from 'lucide-react';

export type StatoValidazione = 'in_attesa' | 'validato' | 'rifiutato';
export type DestinazioneAsset = 'social' | 'sito' | 'offline' | 'strategico' | 'visual_identity' | 'contratto';

export const STATO_VALIDAZIONE_LABELS: Record<StatoValidazione, string> = {
  in_attesa: 'In attesa',
  validato: 'Validato',
  rifiutato: 'Rifiutato',
};

export interface Material {
  id: string;
  nome_file: string;
  url_storage: string | null;
  link_esterno?: string | null;
  caricato_da: string;
  ruolo_caricatore: 'admin' | 'cliente';
  stato_validazione: StatoValidazione;
  destinazione: DestinazioneAsset; 
  tipo_strategico?: 'piano_strategico' | 'piano_comunicazione' | 'business_plan' | 'business_model';
  tipo_offline?: 'brochure' | 'volantino' | '6x3' | '3x6' | 'bigliettini' | 'gadget' | 'altro';
  note_rifiuto: string | null;
  creato_il: Timestamp;
}

export function getFileTypeInfo(fileName: string, isLink?: boolean, destinazione?: DestinazioneAsset) {
  if (destinazione === 'contratto') return { icon: FileSignature, color: 'text-slate-900', bg: 'bg-slate-100' };
  if (destinazione === 'visual_identity') return { icon: Fingerprint, color: 'text-indigo-600', bg: 'bg-indigo-50' };
  if (isLink) return { icon: LinkIcon, color: 'text-blue-600', bg: 'bg-blue-50' };
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return { icon: Camera, color: 'text-emerald-500', bg: 'bg-emerald-50' };
  return { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' };
}
