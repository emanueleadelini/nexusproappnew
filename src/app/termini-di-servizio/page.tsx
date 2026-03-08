import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Termini di Servizio — AD Next Lab',
  description: 'Condizioni generali di utilizzo della piattaforma Nexus Pro di AD Next Lab.',
};

export default function TerminiDiServizioPage() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Termini di Servizio</h1>
            <p className="text-slate-500 text-sm">Condizioni generali di utilizzo della piattaforma Nexus Pro</p>
            <p className="text-slate-400 text-xs mt-2">Ultimo aggiornamento: 8 marzo 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">1. Accettazione dei Termini</h2>
            <p className="text-slate-600 leading-relaxed">
              Accedendo e utilizzando la piattaforma <strong>Nexus Pro</strong> di proprietà di <strong>AD Next Lab</strong>
              (P.IVA IT12345678901), l'utente accetta integralmente i presenti Termini di Servizio. Se non accetti questi termini,
              ti preghiamo di non utilizzare il servizio.
            </p>
            <p className="text-slate-600 leading-relaxed">
              I presenti Termini costituiscono il contratto vincolante tra AD Next Lab e l'utente/azienda cliente.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">2. Descrizione del Servizio</h2>
            <p className="text-slate-600 leading-relaxed">
              Nexus Pro è una piattaforma SaaS (Software as a Service) dedicata alla gestione del workflow editoriale tra agenzie
              di marketing e i propri clienti. Il servizio include:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Dashboard di gestione post e contenuti social</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Calendario editoriale visuale con drag-and-drop</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Sistema di approvazione post con notifiche e scadenze</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Archiviazione di materiali digitali (immagini, video, documenti)</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Sistema di messaggistica interna e ticket di supporto</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Generazione di bozze contenuti tramite intelligenza artificiale (Gemini)</span></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">3. Account e Accesso</h2>
            <p className="text-slate-600 leading-relaxed">
              L'accesso alla piattaforma avviene tramite credenziali personali (email e password). L'utente è responsabile di:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Mantenere riservate le proprie credenziali di accesso.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Comunicare tempestivamente ad AD Next Lab qualsiasi accesso non autorizzato al proprio account.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Non condividere l'account con soggetti non autorizzati.</span></li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Gli account vengono creati e gestiti dal team di AD Next Lab. Non è disponibile una registrazione autonoma pubblica.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">4. Utilizzo Accettabile</h2>
            <p className="text-slate-600 leading-relaxed">L'utente si impegna a non utilizzare la piattaforma per:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span><span>Caricare contenuti illegali, offensivi, diffamatori, pornografici o che violino diritti di terzi.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span><span>Tentare di accedere ad aree della piattaforma non autorizzate al proprio ruolo.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span><span>Effettuare reverse engineering, decompilazione o tentativi di estrazione del codice sorgente.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span><span>Sovraccaricare intenzionalmente i server (attacchi DoS o simili).</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span><span>Violare le leggi applicabili italiane ed europee.</span></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">5. Proprietà Intellettuale</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Piattaforma:</strong> Tutti i diritti relativi al software, design, interfaccia e funzionalità di Nexus Pro
              appartengono esclusivamente ad AD Next Lab. È vietata qualsiasi riproduzione o distribuzione senza autorizzazione scritta.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Contenuti dell'utente:</strong> I contenuti caricati (testi, immagini, video, loghi) rimangono di proprietà
              dell'utente o del cliente che li ha prodotti. Caricando contenuti sulla piattaforma, l'utente concede ad AD Next Lab
              una licenza limitata, non esclusiva e non trasferibile per visualizzarli e archiviarli nell'ambito del servizio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">6. Livelli di Servizio e Disponibilità</h2>
            <p className="text-slate-600 leading-relaxed">
              AD Next Lab si impegna a garantire la disponibilità della piattaforma in misura ragionevolmente elevata,
              ma non garantisce un uptime del 100%. Possono verificarsi interruzioni per:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Manutenzione programmata (comunicata con anticipo)</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Guasti tecnici imprevisti dei fornitori di infrastruttura (Google Firebase)</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Cause di forza maggiore</span></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">7. Limitazione di Responsabilità</h2>
            <p className="text-slate-600 leading-relaxed">
              AD Next Lab non è responsabile per danni indiretti, incidentali, speciali o consequenziali derivanti dall'uso
              o dall'impossibilità di utilizzo del servizio, inclusi mancati guadagni, perdita di dati o interruzioni dell'attività.
            </p>
            <p className="text-slate-600 leading-relaxed">
              La responsabilità massima di AD Next Lab nei confronti del cliente è limitata all'importo pagato dall'utente
              nel mese precedente all'evento che ha dato origine alla responsabilità.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">8. Silenzio-Assenso per Approvazione Post</h2>
            <p className="text-slate-600 leading-relaxed">
              Laddove configurato dall'agenzia, la piattaforma applica un meccanismo di <strong>silenzio-assenso</strong>:
              se un post inviato in approvazione non viene esplicitamente approvato o rifiutato entro il termine indicato
              (generalmente 24 ore), si intende automaticamente approvato. L'utente cliente, accettando i presenti Termini,
              acconsente a tale meccanismo.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">9. Pagamenti e Abbonamenti</h2>
            <p className="text-slate-600 leading-relaxed">
              I prezzi e le modalità di pagamento sono definiti nel contratto di servizio stipulato tra AD Next Lab
              e il cliente al momento dell'attivazione. In mancanza di accordo specifico, si applicano le tariffe
              standard comunicate via e-mail.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Il mancato pagamento entro i termini concordati può comportare la sospensione temporanea dell'accesso alla piattaforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">10. Recesso e Cancellazione</h2>
            <p className="text-slate-600 leading-relaxed">
              Ciascuna parte può recedere dal contratto di servizio con un preavviso scritto di 30 giorni.
              Alla cessazione del rapporto, AD Next Lab conserverà i dati del cliente per 90 giorni,
              durante i quali sarà possibile richiedere l'esportazione. Trascorso tale periodo, i dati saranno
              eliminati in modo sicuro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">11. Legge Applicabile e Foro Competente</h2>
            <p className="text-slate-600 leading-relaxed">
              I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall'interpretazione
              o esecuzione dei presenti Termini, il foro competente esclusivo è quello di <strong>Milano</strong>,
              salvo diverso accordo scritto tra le parti.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">12. Modifiche ai Termini</h2>
            <p className="text-slate-600 leading-relaxed">
              AD Next Lab si riserva il diritto di modificare i presenti Termini in qualsiasi momento.
              Le modifiche sostanziali saranno comunicate con almeno 15 giorni di anticipo via e-mail.
              Il proseguimento dell'utilizzo del servizio dopo la comunicazione costituisce accettazione dei nuovi Termini.
            </p>
          </section>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-indigo-800 text-sm font-bold mb-1">Domande sui Termini?</p>
            <p className="text-indigo-600 text-sm">
              Scrivici a: <a href="mailto:nexus@adnextlab.it" className="underline">nexus@adnextlab.it</a>
            </p>
          </div>

        </div>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 AD Next Lab. Tutti i diritti riservati.</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/termini-di-servizio" className="text-indigo-400 font-bold">Termini di Servizio</Link>
            <Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
