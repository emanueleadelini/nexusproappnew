import { Timestamp } from 'firebase/firestore';

export type TipoNotifica = 
  | "post_da_approvare" 
  | "post_approvato" 
  | "post_revisione" 
  | "post_pubblicato"
  | "materiale_caricato" 
  | "materiale_validato" 
  | "materiale_rifiutato"
  | "crediti_esauriti" 
  | "upgrade_richiesto" 
  | "commento_nuovo" 
  | "nuovo_cliente"
  | "approvazione_auto_silenzio"
  | "nuova_richiesta"
  | "risposta_richiesta";

export interface Notifica {
  id: string;
  tipo: TipoNotifica;
  messaggio: string;
  destinatario_uid: string;
  cliente_id: string;
  letta: boolean;
  creato_il: Timestamp;
  
  // Campi per Deep Linking (Sprint 2.0)
  riferimento_tipo: "post" | "materiale" | "cliente" | "commento" | "richiesta";
  riferimento_id: string;
  
  // Opzionali per UI
  anteprima_titolo?: string;
  letta_il?: Timestamp | null;
}
