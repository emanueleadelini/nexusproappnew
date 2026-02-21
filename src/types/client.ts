export interface Client {
  id: string;
  nome_azienda: string;
  settore?: string;
  email_riferimento?: string;
  post_totali: number;
  post_usati: number;
  creato_il?: any;
}
