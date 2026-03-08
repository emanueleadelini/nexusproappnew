import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — AD Next Lab',
  description: 'Informativa sul trattamento dei dati personali ai sensi del GDPR (Regolamento UE 2016/679).',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">AD Next Lab</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 space-y-10">

          <div className="border-b border-slate-100 pb-8">
            <p className="text-indigo-600 font-black uppercase tracking-widest text-xs mb-3">Documento legale</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">Informativa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR)</p>
            <p className="text-slate-400 text-xs mt-2">Ultimo aggiornamento: 8 marzo 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">1. Titolare del Trattamento</h2>
            <p className="text-slate-600 leading-relaxed">
              Il Titolare del trattamento dei dati personali è <strong>AD Next Lab</strong>, con sede legale in Italia,
              P.IVA IT12345678901, raggiungibile all'indirizzo e-mail: <a href="mailto:privacy@adnextlab.it" className="text-indigo-600 hover:underline">privacy@adnextlab.it</a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">2. Tipologie di Dati Raccolti</h2>
            <p className="text-slate-600 leading-relaxed">
              In fase di utilizzo della piattaforma <strong>Nexus Pro</strong>, raccogliamo le seguenti categorie di dati personali:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Dati di identificazione:</strong> nome, cognome, indirizzo e-mail, numero di telefono forniti in fase di registrazione o compilazione di moduli.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Dati aziendali:</strong> ragione sociale, P.IVA, settore di attività, forniti in fase di onboarding.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, sistema operativo, pagine visitate, durata della sessione, raccolti automaticamente dai nostri sistemi.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Contenuti caricati:</strong> immagini, video, documenti, testi caricati dagli utenti sulla piattaforma per la gestione dei post e dei materiali.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Dati di comunicazione:</strong> messaggi inviati tramite il sistema di supporto interno alla piattaforma.</span></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">3. Finalità e Base Giuridica del Trattamento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-900 font-bold">
                    <th className="text-left p-3 border border-slate-200 rounded-tl-lg">Finalità</th>
                    <th className="text-left p-3 border border-slate-200">Base Giuridica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200">Erogazione del servizio Nexus Pro</td>
                    <td className="p-3 border border-slate-200">Esecuzione del contratto (art. 6.1.b GDPR)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3 border border-slate-200">Gestione delle richieste di supporto</td>
                    <td className="p-3 border border-slate-200">Legittimo interesse (art. 6.1.f GDPR)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200">Invio di comunicazioni commerciali e aggiornamenti</td>
                    <td className="p-3 border border-slate-200">Consenso (art. 6.1.a GDPR)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3 border border-slate-200">Adempimenti fiscali e contabili</td>
                    <td className="p-3 border border-slate-200">Obbligo legale (art. 6.1.c GDPR)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200">Analisi statistica anonima sull'utilizzo</td>
                    <td className="p-3 border border-slate-200">Legittimo interesse (art. 6.1.f GDPR)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">4. Modalità del Trattamento e Conservazione</h2>
            <p className="text-slate-600 leading-relaxed">
              I dati personali sono trattati con strumenti informatici e telematici, adottando misure di sicurezza tecniche
              e organizzative adeguate a prevenire accessi non autorizzati, perdite o divulgazioni illecite.
            </p>
            <p className="text-slate-600 leading-relaxed">
              I dati sono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Dati contrattuali:</strong> 10 anni dalla cessazione del rapporto (obbligo fiscale).</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Dati di navigazione:</strong> massimo 12 mesi.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Contenuti caricati:</strong> fino alla cancellazione dell'account o richiesta dell'interessato.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Richieste di supporto:</strong> 3 anni dall'ultima interazione.</span></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">5. Destinatari dei Dati</h2>
            <p className="text-slate-600 leading-relaxed">
              I dati possono essere comunicati a soggetti terzi che operano come responsabili del trattamento ai sensi dell'art. 28 GDPR, tra cui:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Google Firebase</strong> (Firebase Authentication, Firestore, Storage) — infrastruttura cloud con server in Europa (region: europe-west1). <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Privacy Google</a>.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Google Gemini / Genkit</strong> — elaborazione AI per la generazione di bozze di post. I contenuti inviati sono trattati secondo la <a href="https://ai.google/responsibility/privacy/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">policy AI di Google</a>.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span><strong>Professionisti incaricati</strong> (commercialisti, consulenti legali) per adempimenti normativi.</span></li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              I dati non vengono mai venduti a terzi né utilizzati per finalità diverse da quelle dichiarate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">6. Trasferimento Extra-UE</h2>
            <p className="text-slate-600 leading-relaxed">
              I dati sono trattati prevalentemente all'interno dell'Unione Europea. Qualora vengano trasferiti verso paesi terzi,
              il trasferimento avviene nel rispetto delle garanzie previste dagli artt. 44-49 GDPR (Clausole Contrattuali Standard,
              decisioni di adeguatezza della Commissione Europea).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">7. Diritti dell'Interessato</h2>
            <p className="text-slate-600 leading-relaxed">
              Ai sensi degli artt. 15-22 GDPR, hai il diritto di:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                ['Accesso', 'Ottenere conferma e copia dei tuoi dati (art. 15)'],
                ['Rettifica', 'Correggere dati inesatti o incompleti (art. 16)'],
                ['Cancellazione', 'Richiedere la cancellazione dei tuoi dati (art. 17)'],
                ['Limitazione', 'Limitare il trattamento in certi casi (art. 18)'],
                ['Portabilità', 'Ricevere i tuoi dati in formato strutturato (art. 20)'],
                ['Opposizione', 'Opporti al trattamento basato su legittimo interesse (art. 21)'],
                ['Revoca consenso', 'Revocare il consenso prestato in qualsiasi momento'],
                ['Reclamo', 'Presentare reclamo al Garante Privacy italiano (www.gpdp.it)'],
              ].map(([title, desc]) => (
                <div key={title} className="bg-slate-50 rounded-xl p-4">
                  <p className="font-bold text-slate-900 text-sm mb-1">{title}</p>
                  <p className="text-slate-500 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-600 leading-relaxed">
              Per esercitare i tuoi diritti, scrivi a: <a href="mailto:privacy@adnextlab.it" className="text-indigo-600 hover:underline">privacy@adnextlab.it</a>.
              Risponderemo entro 30 giorni dalla ricezione della richiesta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">8. Minori</h2>
            <p className="text-slate-600 leading-relaxed">
              La piattaforma Nexus Pro è destinata esclusivamente a utenti di età pari o superiore a 18 anni e a soggetti
              giuridici (aziende, agenzie, professionisti). Non raccogliamo consapevolmente dati di minori di 14 anni.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">9. Modifiche alla Present Informativa</h2>
            <p className="text-slate-600 leading-relaxed">
              Il Titolare si riserva il diritto di modificare la presente informativa in qualsiasi momento. Le modifiche
              sostanziali saranno comunicate agli utenti registrati via e-mail con almeno 15 giorni di preavviso.
              La versione aggiornata è sempre disponibile su questa pagina con indicazione della data di revisione.
            </p>
          </section>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-indigo-800 text-sm font-bold mb-1">Contatto Privacy</p>
            <p className="text-indigo-600 text-sm">
              Per qualsiasi questione relativa alla privacy: <a href="mailto:privacy@adnextlab.it" className="underline">privacy@adnextlab.it</a>
            </p>
          </div>

        </div>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 AD Next Lab. Tutti i diritti riservati.</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link href="/privacy-policy" className="text-indigo-400 font-bold">Privacy Policy</Link>
            <Link href="/termini-di-servizio" className="hover:text-white">Termini di Servizio</Link>
            <Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
