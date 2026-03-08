
import { Timestamp } from 'firebase/firestore';
import { ClientModel, PostModel, MaterialModel, UserProfile } from './types';

const ts = (iso: string) => iso as unknown as Timestamp;

export const MOCK_CLIENTS: ClientModel[] = [
  {
    id: 'client-1',
    nome_azienda: 'Gusto Italiano',
    settore: 'Food & Beverage',
    email_riferimento: 'marketing@gusto.it',
    post_totali: 12,
    post_usati: 8,
    creato_il: ts(new Date().toISOString()),
  },
  {
    id: 'client-2',
    nome_azienda: 'TechFlow Solutions',
    settore: 'Software Development',
    email_riferimento: 'info@techflow.com',
    post_totali: 6,
    post_usati: 2,
    creato_il: ts(new Date().toISOString()),
  }
];

export const MOCK_POSTS: Record<string, PostModel[]> = {
  'client-1': [
    {
      id: 'p1',
      titolo: 'Lancio Nuova Pizza Tartufata',
      testo: 'Scopri il sapore unico del tartufo bianco sulle nostre pizze gourmet. 🍕✨ #GustoItaliano #Gourmet',
      stato: 'approvato',
      data_pubblicazione: ts('2023-12-24T18:00:00Z'),
      creato_il: ts('2023-12-20T10:00:00Z'),
      aggiornato_il: ts('2023-12-21T11:00:00Z'),
    },
    {
      id: 'p2',
      titolo: 'Promozione Natale 2023',
      testo: 'Prenota il tuo tavolo per il cenone di Natale entro il 15 dicembre! 🎄🥂',
      stato: 'da_approvare',
      data_pubblicazione: ts('2023-12-25T12:00:00Z'),
      creato_il: ts('2023-12-10T10:00:00Z'),
      aggiornato_il: ts('2023-12-10T10:00:00Z'),
    }
  ],
  'client-2': []
};

export const MOCK_MATERIALS: Record<string, MaterialModel[]> = {
  'client-1': [
    {
      id: 'm1',
      nome_file: 'logo_vettoriale_definitivo.svg',
      url_storage: null,
      caricato_da: 'uid-cliente-1',
      stato_validazione: 'validato',
      note_rifiuto: null,
      creato_il: ts('2023-12-01T09:00:00Z'),
    },
    {
      id: 'm2',
      nome_file: 'foto_pizza_tartufo.jpg',
      url_storage: null,
      caricato_da: 'uid-cliente-1',
      stato_validazione: 'in_attesa',
      note_rifiuto: null,
      creato_il: ts('2023-12-20T08:30:00Z'),
    }
  ],
  'client-2': []
};

export const MOCK_USERS: Record<string, UserProfile> = {
  'admin-1': {
    uid: 'admin-1',
    email: 'admin@nexus.agency',
    ruolo: 'admin',
    nomeAzienda: 'Nexus Agency',
    creatoIl: ts(new Date().toISOString()),
  },
  'client-user-1': {
    uid: 'client-user-1',
    email: 'marketing@gusto.it',
    ruolo: 'cliente',
    cliente_id: 'client-1',
    nomeAzienda: 'Gusto Italiano',
    creatoIl: ts(new Date().toISOString()),
  }
};
