'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Users,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { user, isUserLoading, isAdmin } = useUser();
  const router = useRouter();

  const handleAdminRedirect = () => {
    if (!user) { router.push('/login'); return; }
    router.push(isAdmin ? '/admin' : '/cliente');
  };

  return (
    <div className="min-h-screen bg-white font-body selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation (Header) */}
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
              <Button 
                onClick={handleAdminRedirect} 
                variant="ghost" 
                className="text-slate-600 font-bold hover:text-indigo-600 gap-2 rounded-full"
              >
                <ShieldAlert className="w-4 h-4" /> Admin
              </Button>
              <Button 
                onClick={() => router.push('/login')} 
                className="gradient-primary font-bold gap-2 rounded-full px-6 shadow-indigo-500/20"
              >
                <Users className="w-4 h-4" /> Clienti
              </Button>
            </>
          ) : (
            <div className="w-32 h-10 bg-slate-100 animate-pulse rounded-full" />
          )}
        </div>
      </nav>

      {/* Hero Section */}
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
              Gestione strategica, workflow AI-driven e archivio asset tutto in un unico posto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button size="lg" className="gradient-primary text-lg font-bold h-16 px-12 rounded-full shadow-2xl shadow-indigo-500/30">
              Prenota Consulenza <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => router.push('/login')} 
              variant="outline" 
              size="lg" 
              className="text-lg font-bold h-16 px-12 rounded-full border-slate-200 hover:bg-white bg-white text-slate-900 shadow-sm"
            >
              Area Riservata Clienti
            </Button>
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      </section>

      {/* Simplified Footer */}
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