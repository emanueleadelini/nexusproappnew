import { Timestamp } from 'firebase/firestore';

export type TipoCommento = "commento" | "suggerimento" | "approvazione" | "revisione";

export interface Commento {
  id: string;
  testo: string;
  autore_uid: string;
  autore_nome: string;
  autore_ruolo: "super_admin" | "operatore" | "referente" | "collaboratore";
  tipo: TipoCommento;
  risolto: boolean;
  creato_il: Timestamp;
}
