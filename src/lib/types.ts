import { Timestamp } from 'firebase/firestore';

export type Role = 'admin' | 'cliente';

export interface UserProfile {
  uid: string;
  email: string;
  ruolo: Role;
  cliente_id?: string;
  nomeAzienda?: string;
  creatoIl: Timestamp;
}

export type StatoPost = 'bozza' | 'da_approvare' | 'approvato' | 'pubblicato';

export interface PostModel {
  id: string;
  titolo: string;
  testo: string;
  stato: StatoPost;
  data_pubblicazione: Timestamp | null;
  creato_il: Timestamp;
  aggiornato_il: Timestamp;
}

export type StatoValidazione = 'in_attesa' | 'validato' | 'rifiutato';

export interface MaterialModel {
  id: string;
  nome_file: string;
  url_storage: string | null;
  caricato_da: string; // UID utente
  stato_validazione: StatoValidazione;
  note_rifiuto: string | null;
  creato_il: Timestamp;
}

export interface ClientModel {
  id: string;
  nome_azienda: string;
  settore?: string;
  email_riferimento?: string;
  post_totali: number;
  post_usati: number;
  creato_il: Timestamp;
}
