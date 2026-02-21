'use server';

/**
 * @fileOverview Flow per la generazione di post social con Gemini.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePostInputSchema = z.object({
  nomeAzienda: z.string(),
  settore: z.string(),
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
  prompt: `Sei un social media manager esperto per un'agenzia di comunicazione italiana.
Devi generare un post per i social media.

CLIENTE: {{{nomeAzienda}}}
SETTORE: {{{settore}}}
PIATTAFORMA: {{{piattaforma.label}}} ({{{piattaforma.istruzioni}}})
TONO DI VOCE: {{{tono.label}}} ({{{tono.descrizione}}})
ARGOMENTO: {{{argomento}}}
NOTE AGGIUNTIVE: {{{noteAggiuntive}}}

ISTRUZIONI:
1. Scrivi in italiano.
2. Adatta il linguaggio alla piattaforma indicata.
3. Usa il tono di voce richiesto.
4. NON inventare informazioni specifiche (prezzi, date, indirizzi) a meno che non siano nelle note.
5. Includi emoji se appropriato per la piattaforma.
6. Includi hashtag se appropriato per la piattaforma.

FORMATO RISPOSTA (rispetta esattamente questo formato):
TITOLO: [Un titolo breve e descrittivo per uso interno, max 60 caratteri]
TESTO: [Il testo completo del post]`,
});

export async function generateSocialPost(input: GeneratePostInput): Promise<GeneratePostOutput> {
  const { output } = await generatePostPrompt(input);
  if (!output) throw new Error("Generazione fallita");
  return output;
}
