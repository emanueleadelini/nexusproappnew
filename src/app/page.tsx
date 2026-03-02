'use client';

import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
  Globe,
  GraduationCap,
  Cpu,
  MousePointer2
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const handleDashboardRedirect = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const ruolo = userDoc.data().ruolo;
        if (['super_admin', 'operatore', 'admin'].includes(ruolo)) {
          router.push('/admin');
        } else {
          router.push('/cliente');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white font-body selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 md:px-20 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-headline font-bold text-slate-900 tracking-tight">AD next lab <span className="text-indigo-600">Pro</span></span>
        </div>
        <div className="flex items-center gap-4">
          {!isUserLoading && user ? (
            <Button onClick={handleDashboardRedirect} className="gradient-primary font-bold gap-2 rounded-full px-6">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 font-bold hover:text-indigo-600">Accedi</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 md:px-20 text-center relative overflow-hidden bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Nexus Pro v7.0: Leggibilità Totale
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-slate-900 leading-tight">
            Smetti di spendere in Marketing. <br />
            <span className="gradient-text">Inizia a investire in Competenze.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Il primo Hub italiano che unisce Formazione d'eccellenza, Strategia Digitale potenziata dall'AI e Automazione Tech.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button size="lg" className="gradient-primary text-lg font-bold h-14 px-10 rounded-full">
              Prenota Consulenza <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button onClick={handleDashboardRedirect} variant="outline" size="lg" className="text-lg font-bold h-14 px-10 rounded-full border-slate-200 hover:bg-white bg-transparent text-slate-900 shadow-sm">
              Area Riservata
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-24 border-t border-slate-200 pt-12">
          {[
            { label: "Aziende in Hub", val: "200+" },
            { label: "Professionisti", val: "5.000+" },
            { label: "Risparmio Tech", val: "40%" },
            { label: "Aumento ROI", val: "3x" }
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">{s.val}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24 px-6 md:px-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-slate-900">I 3 Pilastri di AD next lab</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Un ecosistema integrato per trasformare la tua presenza digitale.</p>
          </div>

          <Tabs defaultValue="digital" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-slate-50 border border-slate-200 h-14 p-1 rounded-2xl mb-12">
              <TabsTrigger value="digital" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold">Digital</TabsTrigger>
              <TabsTrigger value="tech" className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold">Tech</TabsTrigger>
              <TabsTrigger value="academy" className="rounded-xl data-[state=active]:bg-amber-600 data-[state=active]:text-white font-bold">Academy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="digital" className="animate-in fade-in zoom-in-95 duration-500">
              <div className="grid lg:grid-cols-2 gap-12 items-center bg-white border border-slate-100 p-8 md:p-16 rounded-[2.5rem] shadow-sm">
                <div className="space-y-6 text-left">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900">Marketing + IA</h3>
                  <p className="text-slate-600 leading-relaxed">Strategie di comunicazione basate sui dati e potenziate dall'Intelligenza Artificiale per massimizzare la visibilità e il conversion rate.</p>
                  <ul className="space-y-3">
                    {['Content Strategy AI-Driven', 'Social Media Management', 'Performance Marketing', 'SEO & Brand Positioning'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="aspect-video bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">Preview Strategia Digitale</div>
              </div>
            </TabsContent>

            {/* ... Altri contenuti simili adattati al chiaro */}
          </Tabs>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-24 px-6 md:px-20 max-w-6xl mx-auto bg-slate-50 rounded-[3rem] my-12">
        <h2 className="text-3xl md:text-5xl font-headline font-bold text-center mb-20 text-slate-900">Metodologia ADNext</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Audit", desc: "Analisi profonda dei dati e dei processi attuali.", icon: MousePointer2 },
            { step: "02", title: "Strategia", desc: "Design del piano d'azione personalizzato.", icon: ShieldCheck },
            { step: "03", title: "Build", desc: "Implementazione tech e produzione creativa.", icon: Cpu },
            { step: "04", title: "Optimize", desc: "Monitoraggio real-time e scalabilità.", icon: Sparkles }
          ].map((m, i) => (
            <div key={i} className="relative p-8 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-black text-slate-100 absolute top-4 right-6">{m.step}</div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <m.icon className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">{m.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">Pronto a scalare la tua azienda?</h2>
            <p className="text-indigo-100 text-xl font-medium">Entra nel futuro del marketing digitale. Prenota oggi la tua sessione strategica gratuita.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 font-bold h-16 px-12 rounded-full text-xl">
                Prenota Consulenza
              </Button>
              <Button onClick={() => router.push('/login')} variant="outline" size="lg" className="border-indigo-400 text-white hover:bg-white/10 font-bold h-16 px-12 rounded-full text-xl bg-transparent">
                Accedi Hub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-6 md:px-20 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline font-bold text-slate-900 text-lg tracking-tight">AD next lab</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} AD next lab Hub Digitale. Tutti i diritti riservati.</p>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Termini</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Supporto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
