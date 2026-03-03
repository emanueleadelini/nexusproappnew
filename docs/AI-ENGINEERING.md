# Nexus Pro - AI Engineering Specs

## 1. Genkit Integration
L'applicazione utilizza **Firebase Genkit** come layer di orchestrazione AI. Il modello predefinito è `gemini-2.5-flash` per bilanciare velocità e costi.

## 2. Flussi di Generazione (`src/ai/flows/`)
### generateSocialPost
Genera un copy creativo basato su:
- Argomento inserito dall'operatore.
- DNA del Brand (Brand Training) salvato nel documento cliente.
- Vincoli della piattaforma (es. hashtag per Instagram, tono professionale per LinkedIn).

### generateMonthlyCalendar
Un flusso avanzato che genera un array di oggetti Post. Gemini progetta una strategia mensile completa, distribuendo i contenuti sui giorni del mese e alternando i pilastri comunicativi (vendita, engagement, educational).

## 3. Brand DNA Mapping
I dati raccolti nella tab "Brand DNA" vengono iniettati nel prompt Handlebars:
```handlebars
CONTESTO BRAND:
- VOCE DEL BRAND: {{{brandTraining.brandVoice}}}
- PUBBLICO TARGET: {{{brandTraining.targetAudience}}}
- VALORI CHIAVE: {{{brandTraining.keyValues}}}
```
Questo garantisce che l'AI non generi testi generici, ma agisca come un copywriter dedicato che conosce l'azienda.
