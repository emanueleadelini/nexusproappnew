import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy — AD Next Lab',
  description: "Informativa sull'uso dei cookie sulla piattaforma Nexus Pro di AD Next Lab, ai sensi della Direttiva 2009/136/CE e del GDPR.",
};

export default function CookiePolicyPage() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Cookie Policy</h1>
            <p className="text-slate-500 text-sm">
              Informativa ai sensi della Direttiva 2009/136/CE (Cookie Law), del GDPR (Regolamento UE 2016/679)
              e delle Linee Guida del Garante Privacy italiano.
            </p>
            <p className="text-slate-400 text-xs mt-2">Ultimo aggiornamento: 8 marzo 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">1. Cosa sono i Cookie</h2>
            <p className="text-slate-600 leading-relaxed">
              I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente (computer, tablet, smartphone)
              durante la navigazione. Permettono al sito di riconoscere il browser e memorizzare informazioni sulle preferenze o azioni passate.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Tecnologie simili includono i <strong>web storage</strong> (localStorage, sessionStorage) e i <strong>pixel di tracciamento</strong>.
              Questa policy si applica a tutte queste tecnologie.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">2. Cookie Utilizzati su Nexus Pro</h2>

            <h3 className="text-lg font-bold text-slate-800 mt-6">2.1 Cookie Tecnici (Strettamente Necessari)</h3>
            <p className="text-slate-600 leading-relaxed">
              Questi cookie sono essenziali per il funzionamento della piattaforma e non richiedono consenso.
              Senza di essi, alcune funzionalità non sarebbero disponibili.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-900 font-bold">
                    <th className="text-left p-3 border border-slate-200">Nome</th>
                    <th className="text-left p-3 border border-slate-200">Scopo</th>
                    <th className="text-left p-3 border border-slate-200">Durata</th>
                    <th className="text-left p-3 border border-slate-200">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200 font-mono text-xs">firebase:authUser</td>
                    <td className="p-3 border border-slate-200">Mantiene la sessione di autenticazione Firebase</td>
                    <td className="p-3 border border-slate-200">Sessione / Persistente</td>
                    <td className="p-3 border border-slate-200">localStorage</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3 border border-slate-200 font-mono text-xs">firebase:persistence</td>
                    <td className="p-3 border border-slate-200">Preferenza di persistenza login</td>
                    <td className="p-3 border border-slate-200">Persistente</td>
                    <td className="p-3 border border-slate-200">localStorage</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-mono text-xs">__session</td>
                    <td className="p-3 border border-slate-200">Cookie di sessione Next.js per server rendering</td>
                    <td className="p-3 border border-slate-200">Sessione</td>
                    <td className="p-3 border border-slate-200">Cookie HTTP</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-6">2.2 Cookie Funzionali</h3>
            <p className="text-slate-600 leading-relaxed">
              Questi cookie memorizzano preferenze dell'utente per migliorare l'esperienza d'uso (es. preferenza tema,
              lingua, stato dei pannelli). Non tracciano l'utente tra siti diversi.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-900 font-bold">
                    <th className="text-left p-3 border border-slate-200">Nome</th>
                    <th className="text-left p-3 border border-slate-200">Scopo</th>
                    <th className="text-left p-3 border border-slate-200">Durata</th>
                    <th className="text-left p-3 border border-slate-200">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200 font-mono text-xs">nexus_ui_prefs</td>
                    <td className="p-3 border border-slate-200">Preferenze UI (tab attivo, filtri attivi)</td>
                    <td className="p-3 border border-slate-200">30 giorni</td>
                    <td className="p-3 border border-slate-200">localStorage</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-6">2.3 Cookie Analitici</h3>
            <p className="text-slate-600 leading-relaxed">
              Attualmente la piattaforma <strong>non utilizza</strong> cookie analitici di terze parti (es. Google Analytics)
              nell'area riservata. Eventuali statistiche sull'utilizzo sono raccolte in forma aggregata e anonima
              attraverso Firebase Analytics con IP anonimizzato.
            </p>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-emerald-800 text-sm font-bold">Nessun cookie di profilazione</p>
              <p className="text-emerald-600 text-sm mt-1">
                La piattaforma Nexus Pro non utilizza cookie di profilazione o di remarketing per finalità pubblicitarie.
              </p>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-6">2.4 Cookie di Terze Parti</h3>
            <p className="text-slate-600 leading-relaxed">
              La piattaforma si appoggia ai seguenti servizi terzi che possono impostare propri cookie:
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                <span>
                  <strong>Google Firebase</strong> (Auth, Firestore, Storage): cookie tecnici per l'autenticazione e
                  la gestione delle sessioni. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Privacy Google</a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                <span>
                  <strong>Google Fonts</strong>: caricamento font web. Può trasmettere l'IP dell'utente a Google.
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline"> Privacy Google</a>
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">3. Consenso e Gestione dei Cookie</h2>
            <p className="text-slate-600 leading-relaxed">
              I cookie tecnici non richiedono consenso e vengono installati automaticamente all'accesso alla piattaforma.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Per i cookie funzionali e analitici, il consenso viene richiesto alla prima visita tramite apposito banner.
              Puoi modificare o revocare il consenso in qualsiasi momento attraverso:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Le impostazioni del tuo browser (vedi sezione 4)</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span><span>Scrivendo a <a href="mailto:privacy@adnextlab.it" className="text-indigo-600 hover:underline">privacy@adnextlab.it</a></span></li>
            </ul>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-amber-800 text-sm font-bold">Attenzione</p>
              <p className="text-amber-600 text-sm mt-1">
                Disabilitare i cookie tecnici (come quelli di autenticazione Firebase) impedirà l'accesso alla piattaforma.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">4. Come Gestire i Cookie nel Browser</h2>
            <p className="text-slate-600 leading-relaxed">
              Puoi controllare e cancellare i cookie direttamente dal tuo browser. Qui i link alle guide ufficiali:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                ['Google Chrome', 'https://support.google.com/chrome/answer/95647'],
                ['Mozilla Firefox', 'https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie'],
                ['Safari (macOS/iOS)', 'https://support.apple.com/it-it/guide/safari/sfri11471/mac'],
                ['Microsoft Edge', 'https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie'],
              ].map(([browser, url]) => (
                <a
                  key={browser}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors group"
                >
                  <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">{browser} →</p>
                </a>
              ))}
            </div>
            <p className="text-slate-600 leading-relaxed">
              Per la gestione di cookie analitici Google, puoi installare il <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Analytics Opt-out Add-on</a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">5. Durata di Conservazione</h2>
            <p className="text-slate-600 leading-relaxed">
              I cookie di sessione vengono eliminati automaticamente alla chiusura del browser.
              I cookie persistenti rimangono sul dispositivo per il periodo indicato nella tabella della sezione 2,
              o fino a quando non vengono cancellati manualmente.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">6. Aggiornamenti alla Cookie Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              AD Next Lab si riserva il diritto di aggiornare la presente Cookie Policy in seguito a modifiche normative
              o tecnologiche. La versione aggiornata sarà pubblicata su questa pagina con indicazione della data di revisione.
              Per modifiche sostanziali, verrà nuovamente richiesto il consenso tramite banner.
            </p>
          </section>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-indigo-800 text-sm font-bold mb-1">Domande sui Cookie?</p>
            <p className="text-indigo-600 text-sm">
              Scrivici a: <a href="mailto:privacy@adnextlab.it" className="underline">privacy@adnextlab.it</a>
            </p>
          </div>

        </div>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 AD Next Lab. Tutti i diritti riservati.</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/termini-di-servizio" className="hover:text-white">Termini di Servizio</Link>
            <Link href="/cookie-policy" className="text-indigo-400 font-bold">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
