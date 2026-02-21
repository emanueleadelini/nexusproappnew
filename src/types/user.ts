export type UserRole = 'admin' | 'cliente';

export interface UserProfile {
  uid: string;
  email: string;
  ruolo: UserRole;
  cliente_id?: string;
  nomeAzienda?: string;
  creatoIl?: any;
}
