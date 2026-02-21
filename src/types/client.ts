export interface Client {
  id: string;                // document ID
  nomeAzienda: string;       // campo Firestore: "nome_azienda"
  settore?: string;
  emailRiferimento?: string; // campo Firestore: "email_riferimento"
  postTotali: number;        // campo Firestore: "post_totali"
  postUsati: number;         // campo Firestore: "post_usati"
  creatoIl?: any;            // campo Firestore: "creato_il"
}
