# Nexus Pro - Data Model Specification

## 1. Users Collection (`/users/{uid}`)
Rappresenta i profili utente e i permessi.
```typescript
interface UserProfile {
  uid: string;
  email: string;
  ruolo: 'super_admin' | 'operatore' | 'referente' | 'collaboratore';
  cliente_id?: string; // FONDAMENTALE per il multi-tenancy
  nomeAzienda?: string;
  permessi: string[]; // Array di stringhe per controllo granulare
  creatoIl: Timestamp;
}
```

## 2. Clienti Collection (`/clienti/{clienteId}`)
Il cuore del tenant. Contiene le impostazioni del piano e i Feature Flags.
```typescript
interface Client {
  nome_azienda: string;
  settore: string;
  post_totali: number; // Budget mensile
  post_usati: number;  // Utilizzo nel mese corrente
  include_contratto: boolean; // Feature Flag
  include_visual_identity: boolean; // Feature Flag
  include_offline: boolean; // Feature Flag
  ai_training: {
    brand_voice: string;
    target_audience: string;
    key_values: string;
    main_topics: string;
  };
}
```

## 3. Post Sub-collection (`/clienti/{clienteId}/post/{postId}`)
Gestione del ciclo di vita dei contenuti social.
```typescript
interface Post {
  titolo: string;
  testo: string;
  stato: 'bozza' | 'da_approvare' | 'approvato' | 'programmato' | 'pubblicato';
  piattaforme: string[]; // ['instagram', 'facebook', ...]
  formato: 'immagine_singola' | 'carosello' | 'video' | 'reel';
  materiali_ids: string[]; // Riferimenti ai documenti nella sub-collezione materiali
  scadenza_approvazione: Timestamp; // T+24h dall'invio
  storico_stati: Array<{ stato: string, autore_uid: string, timestamp: Timestamp }>;
}
```

## 4. Materiali Sub-collection (`/clienti/{clienteId}/materiali/{materialeId}`)
Asset grafici e documenti legali.
```typescript
interface Material {
  nome_file: string;
  destinazione: 'social' | 'visual_identity' | 'contratto' | 'offline';
  tipo_offline?: 'brochure' | 'volantino' | 'bigliettini' | 'gadget' | '6x3' | '3x6';
  url_storage: string;
  stato_validazione: 'in_attesa' | 'validato' | 'rifiutato';
}
```
