import { FileText, Image as ImageIcon, Video, FileCode, File as FileIcon } from 'lucide-react';

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
  nome_file: string;          // campo Firestore: "nome_file"
  url_storage?: string | null; // campo Firestore: "url_storage"
  caricato_da: string;        // campo Firestore: "caricato_da" (UID)
  ruolo_caricatore: 'admin' | 'cliente'; // Per distinguere chi ha caricato
  stato_validazione: StatoValidazione;
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
  if (['doc', 'docx', 'txt', 'pages'].includes(extension || '')) {
    return { label: 'Documento', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' };
  }
  return { label: 'File', icon: FileIcon, color: 'text-gray-500', bg: 'bg-gray-50' };
}
