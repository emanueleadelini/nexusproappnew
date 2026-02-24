import { Timestamp } from 'firebase/firestore';

export type TipoNotifica = 
  | "post_da_approvare" | "post_approvato" | "post_revisione" | "post_pubblicato"
  | "materiale_caricato" | "materiale_validato" | "materiale_rifiutato"
  | "crediti_esauriti" | "upgrade_richiesto" | "commento_nuovo" | "nuovo_cliente";

export interface Notifica {
  id: string;
  tipo: TipoNotifica;
  titolo: string;
  messaggio: string;
  destinatario_uid: string;
  cliente_id: string;
  riferimento_tipo: "post" | "materiale" | "cliente" | "commento";
  riferimento_id: string;
  letta: boolean;
  creato_il: Timestamp;
}
