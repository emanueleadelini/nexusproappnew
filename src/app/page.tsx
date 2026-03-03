'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Users,
  ShieldAlert,
  Cpu,
  Utensils,
  Zap,
  FileText,
  CheckCircle2,
  Lock,
  LineChart,
  Repeat
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const { user, isUserLoading, isAdmin } = useUser();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdminRedirect = () => {
    if (!user) { router.push('/login'); return; }
    router.push(isAdmin ? '/admin' : '/cliente');
  };

  const handleClientRedirect = () => {
    if (!user) { router.push('/login'); return; }
    router.push('/cliente');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body selection:bg-indigo-500/30 selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 h-20 flex items-center px-6 md:px-20 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-headline font-bold text-white tracking-tight">AD next lab</span>
        </div>

        <div className="flex items-center gap-4">
          {!isUserLoading ? (
            <>
              <Button onClick={handleAdminRedirect} variant="ghost" className="text-slate-400 font-bold hover:text-white hover:bg-white/5 gap-2 rounded-full hidden sm:flex">
                <ShieldAlert className="w-4 h-4" /> Admin
              </Button>
              <Button onClick={handleClientRedirect} className="bg-white text-slate-900 hover:bg-slate-200 font-bold gap-2 rounded-full px-6 transition-all duration-300">
                <Users className="w-4 h-4" /> Accedi all'Hub
              </Button>
            </>
          ) : (
            <div className="w-32 h-10 bg-slate-800 animate-pulse rounded-full" />
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-6 md:px-20 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mx-auto backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Software che Funziona dal Giorno 1
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black text-white leading-tight tracking-tighter">
              L'Evoluzione Digitale <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x">Senza Complicazioni.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Software specializzati per agenzie, ristoranti e studi professionali. Testati, pronti all'uso e focalizzati sul risultato.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-lg font-bold h-16 px-12 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-300">
              Scopri le Soluzioni <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button onClick={handleClientRedirect} variant="outline" size="lg" className="text-lg font-bold h-16 px-12 rounded-full border-white/10 hover:bg-white/5 bg-slate-900 text-white shadow-xl backdrop-blur-md">
              Area Riservata
            </Button>
          </div>
        </div>

        {/* Floating Cards (Background Detail) */}
        <div className="absolute top-1/4 left-10 md:left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 md:right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* PRODOTTI PRINCIPALI (NEXUS PRO & PLACEAT) */}
      <section className="py-32 px-6 md:px-20 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">Le Nostre <span className="text-indigo-400">Piattaforme Core</span></h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">Scegli la suite su misura per il tuo settore. Zero configurazioni infinite, operatività immediata.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* NEXUS PRO */}
            <div className="group relative bg-slate-900 border border-white/10 p-10 lg:p-12 rounded-[2.5rem] hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] group-hover:bg-indigo-600/20 transition-all duration-500" />
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                  <Cpu className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-headline font-black text-white mb-4">Nexus Pro</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">Il sistema operativo elitario per agenzie di comunicazione e i loro clienti. Motore AI proprietario, approvazione workflow automatizzata e archivio cloud sicuro.</p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Brand DNA Engine</li>
                  <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Sistema Silenzio-Assenso (24h)</li>
                  <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Condivisione Sicura Materiali Offline</li>
                </ul>
              </div>
            </div>

            {/* PLACEAT */}
            <div className="group relative bg-slate-900 border border-white/10 p-10 lg:p-12 rounded-[2.5rem] hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] group-hover:bg-emerald-600/20 transition-all duration-500" />
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                  <Utensils className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-headline font-black text-white mb-4">Placeat</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">Gestione rivoluzionaria per il mondo della ristorazione. Dai menu digitali dinamici alla fidelizzazione clienti con marketing automatizzato.</p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Menu Digitale Interattivo</li>
                  <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Piattaforma Gestione Recensioni</li>
                  <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Database Clienti CRM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 TOOL */}
      <section className="py-32 px-6 md:px-20 bg-slate-900/50 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold white tracking-tight">L'Ecosistema dei <span className="text-violet-400">Micro-Toolkit</span></h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">Applicazioni focalizzate su una singola efficienza, nate per risolvere buchi neri dei processi aziendali.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: FileText, title: "FatturaParse", desc: "Estrazione dati fatture AI", col: "text-blue-400" },
              { icon: ShieldCheck, title: "NormaGuard", desc: "Audit documenti aziendali", col: "text-amber-400" },
              { icon: Repeat, title: "FatturaMatch", desc: "Sincronizzazione contabile", col: "text-rose-400" },
              { icon: LineChart, title: "FiscoAuto", desc: "Dashboard fisco real-time", col: "text-emerald-400" },
              { icon: Zap, title: "StudioFlow", desc: "Gestore priorità staff agenzia", col: "text-violet-400" },
            ].map((tool, i) => (
              <div key={i} className="bg-slate-900/80 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors text-center group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <tool.icon className={"w-6 h-6 " + tool.col} />
                </div>
                <h4 className="font-bold text-white mb-2">{tool.title}</h4>
                <p className="text-slate-400 text-xs">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IL PROCESSO / COME FUNZIONA */}
      <section className="py-32 px-6 md:px-20 relative">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">Metodologia AD next lab</h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[3.5rem] md:before:ml-[50%] before:-translate-x-px md:before:mx-auto before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center z-10 shrink-0 shadow-xl mx-auto absolute left-4 md:left-1/2 md:-translate-x-1/2">
                <span className="text-2xl font-black text-indigo-500">01</span>
              </div>
              <div className="w-full pl-32 md:pl-0 md:w-[calc(50%-4rem)] md:text-right md:pr-10">
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors">
                  <h4 className="text-2xl font-bold text-white mb-2">Onboarding Sensoriale</h4>
                  <p className="text-slate-400 leading-relaxed">Assorbiamo il DNA della tua azienda. Dati, tono di voce, obiettivi futuri. L'Intelligenza Artificiale viene addestrata nello specifico per darti un'estensione del tuo team.</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center z-10 shrink-0 shadow-xl mx-auto absolute left-4 md:left-1/2 md:-translate-x-1/2">
                <span className="text-2xl font-black text-violet-500">02</span>
              </div>
              <div className="w-full pl-32 md:pl-0 md:w-[calc(50%-4rem)] md:ml-auto md:pl-10">
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors">
                  <h4 className="text-2xl font-bold text-white mb-2">Build dell'Infrastruttura</h4>
                  <p className="text-slate-400 leading-relaxed">Distribuiamo l'ambiente isolato per il tuo brand, Nexus Pro o Placeat. Creazione utenze Sicure, impostazioni ruoli e approvazione permessi live.</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center z-10 shrink-0 shadow-xl mx-auto absolute left-4 md:left-1/2 md:-translate-x-1/2">
                <span className="text-2xl font-black text-emerald-500">03</span>
              </div>
              <div className="w-full pl-32 md:pl-0 md:w-[calc(50%-4rem)] md:text-right md:pr-10">
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors">
                  <h4 className="text-2xl font-bold text-white mb-2">Risultati Autopilota</h4>
                  <p className="text-slate-400 leading-relaxed">L'infrastruttura entra a regime. Visualizzi le preview su smartphone, approvi con 1 click o sfrutti il Silenzio-Assenso per farci lavorare senza ritardi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIANZE / SOCIAL PROOF */}
      <section className="py-24 px-6 md:px-20 bg-slate-900/30 border-t border-white/5 text-center">
        <h2 className="text-2xl font-bold text-slate-400 mb-12 uppercase tracking-widest text-sm">Usato dalle migliori agenzie partner</h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          {/* placeholder loghi */}
          <div className="text-2xl font-black font-headline tracking-tighter mix-blend-overlay text-white">TECH<span className="text-indigo-500">VANGUARD</span></div>
          <div className="text-2xl font-black font-headline tracking-tighter mix-blend-overlay text-white">NOVA<span className="font-light">RESTAURANTS</span></div>
          <div className="text-2xl font-black font-headline tracking-tighter mix-blend-overlay text-white">URBAN<span className="text-emerald-500">LAB</span></div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-32 px-6 md:px-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950 pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-8 relative z-10 bg-slate-900 border border-white/10 p-12 rounded-[3xl] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
          <h2 className="text-4xl md:text-5xl font-headline font-black text-white leading-tight">Pronto a trasformare la tua infrastruttura?</h2>
          <p className="text-lg text-slate-400">Implementazione garantita in 72 ore. Abbandona l'artigianato software, entra nella fase Pro.</p>
          <div className="pt-6">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-200 text-lg font-bold h-16 px-12 rounded-full shadow-2xl transition-all duration-300">
              Contattaci Subito
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/10 px-6 md:px-20 bg-slate-950 text-slate-500 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-headline font-bold text-white text-lg tracking-tight">AD next lab</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Termini di Servizio</a>
            <a href="#" className="hover:text-white transition-colors">Supporto</a>
          </div>
          <p className="font-bold uppercase tracking-widest text-xs">
            © {new Date().getFullYear()} Software Ecosistema &bull; Roma
          </p>
        </div>
      </footer>
    </div>
  );
}
