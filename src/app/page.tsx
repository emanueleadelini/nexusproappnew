
'use client';

import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Users, 
  Sparkles, 
  CalendarDays, 
  MessageSquare, 
  ChevronRight, 
  ArrowRight,
  LayoutDashboard,
  Building2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-agency');

  return (
    <div className="min-h-screen bg-white font-body selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center px-6 md:px-20 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-headline font-bold text-gray-900 tracking-tight">AD next lab</span>
        </div>
        <div className="flex items-center gap-4">
          {!isUserLoading && user ? (
            <Button onClick={handleDashboardRedirect} className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 rounded-full px-6 shadow-lg shadow-indigo-100">
              <LayoutDashboard className="w-4 h-4" /> Vai alla Dashboard
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 font-bold hover:text-indigo-600">Accedi</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100">
            <Sparkles className="w-4 h-4" /> Nexus Pro v5.2 è ora online
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-gray-900 leading-[1.1]">
            La tua agenzia, <br />
            <span className="text-indigo-600">finalmente in cloud.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
            Gestisci piani editoriali strategici, approvazioni in tempo reale e generazione contenuti con IA in un'unica piattaforma multi-tenant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={handleDashboardRedirect} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg font-bold h-14 px-8 rounded-full shadow-xl shadow-indigo-200">
              Inizia Ora <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg font-bold h-14 px-8 rounded-full border-2">
                Area Clienti
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-1000 border-8 border-white">
          {heroImage && (
            <Image 
              src={heroImage.imageUrl} 
              alt={heroImage.description} 
              fill 
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24 px-6 md:px-20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Un ecosistema completo</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Tutto ciò di cui hai bisogno per scalare la tua agenzia di comunicazione.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: CalendarDays, 
                title: "Calendario Strategico", 
                desc: "Workflow a 7 stati per un controllo totale sulla produzione dei post.",
                color: "bg-blue-50 text-blue-600"
              },
              { 
                icon: Sparkles, 
                title: "AI Copywriting", 
                desc: "Genera bozze creative in pochi secondi con il motore Gemini 2.5.",
                color: "bg-violet-50 text-violet-600"
              },
              { 
                icon: Building2, 
                title: "Multi-tenancy", 
                desc: "I datti di ogni cliente sono isolati e sicuri al 100% con rules V5.2.",
                color: "bg-emerald-50 text-emerald-600"
              },
              { 
                icon: MessageSquare, 
                title: "Feedback Loop", 
                desc: "Approvazioni e commenti centralizzati per eliminare le email infinite.",
                color: "bg-indigo-50 text-indigo-600"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-20 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-headline font-bold">Pronto per il decollo?</h2>
              <p className="text-indigo-100 text-lg">Nexus Pro è lo strumento definitivo per chi vuole trasformare la produzione di contenuti in un processo industriale di alta qualità.</p>
              <ul className="space-y-3">
                {['Isolamento dati Multi-tenant', 'Sistema di crediti usage-based', 'Versionamento post integrato'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 space-y-8">
              <div className="space-y-4">
                <h4 className="text-2xl font-bold">Accesso Rapido</h4>
                <p className="text-sm text-indigo-100">Seleziona il tuo profilo per accedere all'area riservata.</p>
              </div>
              <div className="grid gap-4">
                <Button onClick={() => router.push('/login')} className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold h-14 rounded-2xl text-lg">
                  Accesso Agenzia <Users className="w-5 h-5 ml-2" />
                </Button>
                <Button onClick={() => router.push('/login')} variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold h-14 rounded-2xl text-lg">
                  Portale Clienti <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 px-6 md:px-20 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="font-headline font-bold text-gray-900">AD next lab</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} AD next lab. Progettato per l'eccellenza digitale.</p>
          <div className="flex gap-6 text-sm font-bold text-gray-500">
            <Link href="#" className="hover:text-indigo-600">Privacy</Link>
            <Link href="#" className="hover:text-indigo-600">Termini</Link>
            <Link href="#" className="hover:text-indigo-600">Supporto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
