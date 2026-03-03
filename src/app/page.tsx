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
  CalendarCheck,
  PenTool,
  FolderLock,
  MessageCircleQuestion,
  Wand2,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const { user, isUserLoading, isAdmin } = useUser();
  const router = useRouter();

  const handleAdminRedirect = () => {
    if (!user) { router.push('/login'); return; }
    router.push(isAdmin ? '/admin' : '/cliente');
  };

  const handleClientRedirect = () => {
    if (!user) { router.push('/login'); return; }
    router.push('/cliente');
  };

  return (
    <div className="min-h-screen bg-white font-body selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 md:px-20 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-headline font-bold text-slate-900 tracking-tight">AD next lab <span className="text-indigo-600">Pro</span></span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {!isUserLoading ? (
            <>
              <Button onClick={handleAdminRedirect} variant="ghost" className="text-slate-600 font-bold hover:text-indigo-600 gap-2 rounded-full">
                <ShieldAlert className="w-4 h-4" /> Admin
              </Button>
              <Button onClick={handleClientRedirect} className="gradient-primary font-bold gap-2 rounded-full px-6 shadow-indigo-500/20">
                <Users className="w-4 h-4" /> Clienti
              </Button>
            </>
          ) : (
            <div className="w-32 h-10 bg-slate-100 animate-pulse rounded-full" />
          )}
        </div>
      </nav>

      <section className="min-h-screen flex items-center pt-20 pb-24 px-6 md:px-20 text-center relative overflow-hidden bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-widest mx-auto">
            <Sparkles className="w-3.5 h-3.5" /> Nexus Pro: Leggibilità Totale
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-headline font-bold text-slate-900 leading-tight tracking-tighter">
              L'Hub Digitale per <br />
              <span className="gradient-text">AD next lab.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Gestione strategica, workflow AI-driven e archivio asset tutto in un unico posto riservato.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button size="lg" className="gradient-primary text-lg font-bold h-16 px-12 rounded-full shadow-2xl shadow-indigo-500/30">
              Prenota Consulenza <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button onClick={handleClientRedirect} variant="outline" size="lg" className="text-lg font-bold h-16 px-12 rounded-full border-slate-200 hover:bg-white bg-white text-slate-900 shadow-sm">
              Area Riservata Clienti
            </Button>
          </div>
        </div>

        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      </section>

      {/* Sezione Features */}
      <section className="py-24 px-6 md:px-20 bg-white relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-slate-900 tracking-tight">Tutto ciò che serve al <span className="text-indigo-600">tuo brand.</span></h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Non perderti più tra email e chat. Un unico hub per la tua presenza digitale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Wand2 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-headline font-bold text-slate-900 mb-3">Copywriting AI</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Generiamo i testi dei tuoi post allenando l'Intelligenza Artificiale sul DNA e tono di voce unico della tua azienda.</p>
            </div>

            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-headline font-bold text-slate-900 mb-3">Calendario Condiviso</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Visione completa del piano editoriale mensile. Approvi, chiedi modifiche o rifiuti i post in un click, direttamente dal tuo feed.</p>
            </div>

            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <FolderLock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-headline font-bold text-slate-900 mb-3">Archivio Digitale</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Contratti firmati, loghi vettoriali e materiali per la stampa offline (flyer, bigliettini) sempre a tua disposizione.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Come Funziona */}
      <section className="py-24 px-6 md:px-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">Come collaboriamo</h2>
            <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto">Un processo semplice e trasparente che ti fa risparmiare ore di tempo ogni settimana.</p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-800/50 p-8 rounded-[2.5rem] border border-white/5">
              <div className="w-16 h-16 shrink-0 bg-indigo-600 rounded-full flex items-center justify-center font-headline font-bold text-2xl shadow-lg shadow-indigo-500/30">1</div>
              <div>
                <h4 className="text-xl font-bold mb-2 font-headline">Creazione e Strategia</h4>
                <p className="text-slate-400 text-sm">Il team di AD next lab analizza il tuo brand e prepara le bozze dei post abbinando le grafiche al copy generato dall'AI.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-800/50 p-8 rounded-[2.5rem] border border-white/5 md:ml-12">
              <div className="w-16 h-16 shrink-0 bg-amber-500 rounded-full flex items-center justify-center font-headline font-bold text-2xl shadow-lg shadow-amber-500/30 text-amber-950">2</div>
              <div>
                <h4 className="text-xl font-bold mb-2 font-headline">Notifica e Approvazione</h4>
                <p className="text-slate-400 text-sm">Ricevi una notifica nel tuo Hub. Controlli l'anteprima reale su Instagram e approvi il post con un click o chiedi modifiche.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-800/50 p-8 rounded-[2.5rem] border border-white/5 md:ml-24">
              <div className="w-16 h-16 shrink-0 bg-emerald-500 rounded-full flex items-center justify-center font-headline font-bold text-2xl shadow-lg shadow-emerald-500/30 text-emerald-950">3</div>
              <div>
                <h4 className="text-xl font-bold mb-2 font-headline">Pubblicazione (Silenzio Assenso)</h4>
                <p className="text-slate-400 text-sm">Se non ci sono richieste entro 24h, il sistema approva in automatico per non ritardare il piano editoriale. Zero stress.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sfondi astratti */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />
      </section>

      <footer className="py-12 border-t border-slate-100 px-6 md:px-20 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline font-bold text-slate-900 text-lg tracking-tight">AD next lab</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Hub Digitale &bull; Progettato per l'eccellenza
          </p>
        </div>
      </footer>
    </div>
  );
}
