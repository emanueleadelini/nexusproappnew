
'use server';

/**
 * @fileOverview Flow per la generazione di post social con Gemini per AD next lab.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePostInputSchema = z.object({
  nomeAzienda: z.string(),
  settore: z.string(),
  brandTraining: z.object({
    brandVoice: z.string().optional(),
    targetAudience: z.string().optional(),
    keyValues: z.string().optional(),
    mainTopics: z.string().optional(),
  }).optional(),
  piattaforma: z.object({
    label: z.string(),
    istruzioni: z.string(),
  }),
  tono: z.object({
    label: z.string(),
    descrizione: z.string(),
  }),
  argomento: z.string(),
  noteAggiuntive: z.string().optional(),
});

const GeneratePostOutputSchema = z.object({
  titolo: z.string(),
  testo: z.string(),
});

export type GeneratePostInput = z.infer<typeof GeneratePostInputSchema>;
export type GeneratePostOutput = z.infer<typeof GeneratePostOutputSchema>;

const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  input: { schema: GeneratePostInputSchema },
  output: { schema: GeneratePostOutputSchema },
  prompt: `Sei un Senior Social Media Strategist & Copywriter per AD next lab, un'agenzia di comunicazione italiana d'avanguardia specializzata in posizionamento premium.
Devi scrivere un post per i social media strategico, orientato all'engagement e alla conversione, per uno dei nostri clienti.

INFORMAZIONI AZIENDA:
CLIENTE: {{{nomeAzienda}}}
SETTORE: {{{settore}}}

{{#if brandTraining}}
IL DNA DEL BRAND (CRITICO - ADEGUA IL TONO E IL VOCABOLARIO A QUESTI PUNTI):
- VOCE DEL BRAND: {{{brandTraining.brandVoice}}}
- PUBBLICO TARGET: {{{brandTraining.targetAudience}}}
- VALORI CHIAVE: {{{brandTraining.keyValues}}}
- PILASTRI DI CONTENUTO: {{{brandTraining.mainTopics}}}
{{/if}}

DETTAGLI DEL POST:
PIATTAFORMA: {{{piattaforma.label}}} ({{{piattaforma.istruzioni}}})
TONO RICHIESTO DA QUESTO SPECIFICO POST: {{{tono.label}}} ({{{tono.descrizione}}})
ARGOMENTO CENTRALE: {{{argomento}}}
NOTE E DETTAGLI AGGIUNTIVI FORNITI DAL CLIENTE: {{{noteAggiuntive}}}

REGOLE DI COPYWRITING (DA RISPETTARE TASSATIVAMENTE):
1. HOOK: La prima frase deve essere un gancio irresistibile che fermi lo scroll (una domanda forte, un contrasto, o un'affermazione audace).
2. STRUTTURA A PARAGRAFI: Non produrre muri di testo. Dividi il copy in in paragrafi brevi e ariosi di 1-2 frasi al massimo. Usa interlinee vuote.
3. PERSONALITÀ: Abbandona lo stile "robotico" o generico da IA. Trasuda l'identità del brand. Scrivi come scriverebbe il fondatore stesso.
4. CALL TO ACTION (CTA): L'ultimo paragrafo deve contenere sempre una singola Call To Action chiara (es. "Scrivici in DM", "Salva il post", "Clicca il link in bio").
5. AUTENTICITÀ: NON inventare promozioni specifiche, prezzi, date o numeri a meno che non siano menzionati nelle "Note Aggiuntive".
6. FORMATTAZIONE SOCIAL: Usa le emoji con parsimonia ma in modo strategico per guidare l'occhio. Aggiungi dai 3 ai 7 hashtag rilevanti alla fine.

FORMATO DI RISPOSTA ATTESO (JSON):
Restituisci solo un titolo interno (non sarà pubblicato, serve solo per riconoscerlo nel calendario) e il TESTO completo e impaginato del post pronto per essere copiato e incollato.`,
});

export async function generateSocialPost(input: GeneratePostInput): Promise<GeneratePostOutput> {
  const { output } = await generatePostPrompt(input);
  if (!output) throw new Error("Generazione fallita");
  return output;
}

// Flow per il Calendario Editoriale
const GenerateCalendarInputSchema = z.object({
  nomeAzienda: z.string(),
  settore: z.string(),
  brandTraining: z.object({
    brandVoice: z.string().optional(),
    targetAudience: z.string().optional(),
    keyValues: z.string().optional(),
    mainTopics: z.string().optional(),
  }).optional(),
  mese: z.string(),
  numeroPost: z.number().default(8),
});

const CalendarPostSchema = z.object({
  giorno: z.number(),
  titolo: z.string(),
  testo: z.string(),
  piattaforma: z.string(),
});

const GenerateCalendarOutputSchema = z.object({
  posts: z.array(CalendarPostSchema),
});

export type GenerateCalendarOutput = z.infer<typeof GenerateCalendarOutputSchema>;

const generateCalendarPrompt = ai.definePrompt({
  name: 'generateCalendarPrompt',
  input: { schema: GenerateCalendarInputSchema },
  output: { schema: GenerateCalendarOutputSchema },
  prompt: `Sei il Direttore Creativo e Head of Content di AD next lab.
Siamo stati incaricati di progettare un CALENDARIO EDITORIALE STRATEGICO di alto livello per il mese di {{{mese}}} per il cliente {{{nomeAzienda}}}. Il tuo obiettivo è generare un piano mensile che prevenga la noia del pubblico e spazi lungo l'intero "funnel" di marketing.

IL MIO CLIENTE: {{{nomeAzienda}}} (Settore: {{{settore}}})

{{#if brandTraining}}
IL BRAND DNA (DA RISPETTARE COME LA BIBBIA):
- VOCE: {{{brandTraining.brandVoice}}}
- TARGET: {{{brandTraining.targetAudience}}}
- VALORI: {{{brandTraining.keyValues}}}
- TOPICS: {{{brandTraining.mainTopics}}}
{{/if}}

OBIETTIVO DEL TASK:
Creare un totale di {{{numeroPost}}} post unici distribuiti equamente nell'arco del mese.
Devi variare intelligentemente i pillar di contenuto, alternando tra:
a) Valore/Informativo (educare l'audience)
b) Emozionale/Dietro le Quinte (creare connessione)
c) Engagement (suscitare reazioni e commenti)
d) Promozionale/Vendita (chiusura e CTA diretta)

LE REGOLE D'ORO PER I POST:
1. Scegli {{{numeroPost}}} giorni diversi nel mese per coprire una programmazione logica.
2. Per ogni post scrivi un "titolo" breve di riferimento.
3. Il "testo" deve essere il copy completo finale, con hook iniziali potenti, paragrafi spaziati (mai testo compatto), emoji e CTAs. Niente testo placeholder. Usa il Brand DNA.
4. Scegli la piattaforma ideale per ogni post in base all'argomento (Instagram, Facebook o LinkedIn).

DEVI RESTITUIRE ESATTAMENTE IL NUMERO DI POST RICHIESTI IN FORMATO JSON COME DA SCHEMA SPECIFICATO.`,
});

export async function generateMonthlyCalendar(input: any): Promise<GenerateCalendarOutput> {
  const { output } = await generateCalendarPrompt(input);
  if (!output) throw new Error("Generazione calendario fallita");
  return output;
}
