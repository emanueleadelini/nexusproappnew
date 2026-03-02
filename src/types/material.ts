
import { Timestamp } from 'firebase/firestore';
import { FileText, Image as ImageIcon, Video, Camera, Share2, Globe, Printer, Link as LinkIcon, ShieldCheck, PieChart, Briefcase, FileSignature, Fingerprint, CreditCard, Gift } from 'lucide-react';

export type StatoValidazione = 'in_attesa' | 'validato' | 'rifiutato';
export type DestinazioneAsset = 'social' | 'sito' | 'offline' | 'strategico' | 'visual_identity' | 'contratto';
export type TipoAsset = 'grafica' | 'foto' | 'video' | 'documento' | 'link' | 'strategia' | 'legale';

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
  strategico: 'Documento Strategico',
  visual_identity: 'Visual Identity (Logo)',
  contratto: 'Contratto & Accordi',
};

export const DESTINAZIONE_ICONS: Record<DestinazioneAsset, any> = {
  social: Share2,
  sito: Globe,
  offline: Printer,
  strategico: ShieldCheck,
  visual_identity: Fingerprint,
  contratto: FileSignature,
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
  note_cliente?: string | null;
  creato_il: Timestamp;
}

export function getFileTypeInfo(fileName: string, isLink?: boolean, destinazione?: DestinazioneAsset) {
  if (destinazione === 'contratto') {
    return { type: 'legale' as TipoAsset, label: 'Contratto', icon: FileSignature, color: 'text-slate-900', bg: 'bg-slate-100' };
  }
  if (destinazione === 'strategico') {
     return { type: 'strategia' as TipoAsset, label: 'Strategia', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' };
  }
  if (isLink) {
    return { type: 'link' as TipoAsset, label: 'Link Esterno', icon: LinkIcon, color: 'text-blue-600', bg: 'bg-blue-50' };
  }
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
