'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, ShieldCheck, LayoutGrid, Bell, LifeBuoy } from 'lucide-react';
import { NotificheBell } from '@/components/notifiche-bell';
import Link from 'next/link';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const checkRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const ruolo = data.ruolo;
          if (ruolo === 'cliente_finale') {
            setIsAuthorized(true);
            setClienteId(data.cliente_id);
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (e) {
        console.error("Errore verifica ruolo:", e);
      }
    };
    checkRole();
  }, [user, isUserLoading, db, router]);

  const clientDocRef = useMemoFirebase(() => {
    if (!clienteId) return null;
    return doc(db, 'clienti', clienteId);
  }, [db, clienteId]);
  const { data: clientData } = useDoc<any>(clientDocRef);

  if (isUserLoading || !isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
        <p className="text-slate-500 font-bold animate-pulse text-sm">Caricamento Hub Pro...</p>
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-screen bg-background flex flex-col">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/cliente" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center p-1 group hover:border-indigo-600 transition-colors">
              {clientData?.logo_url ? (
                <img src={clientData.logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-headline font-bold leading-tight">Nexus Pro</span>
              <span className="text-[10px] text-indigo-600 uppercase tracking-widest font-black">Client Hub</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NotificheBell />
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 font-bold gap-2 hover:bg-red-50 hover:text-red-600 transition-all rounded-lg h-10"
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Esci</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6">
        {children}
      </main>

      <nav className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around z-40 px-4 shadow-2xl">
        <Link href="/cliente" className="flex flex-col items-center gap-1 text-indigo-600">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Feed</span>
        </Link>
        <Link href="/cliente/richieste" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors">
          <LifeBuoy className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Supporto</span>
        </Link>
        <Link href="/cliente/notifiche" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Notifiche</span>
        </Link>
        <button onClick={() => auth.signOut()} className="flex flex-col items-center gap-1 text-slate-400">
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase">Esci</span>
        </button>
      </nav>

      <footer className="bg-white border-t border-slate-100 p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-24 md:pb-8">
        &copy; {new Date().getFullYear()} AD next lab Hub Digitale &bull; Progettato per l'eccellenza
      </footer>
    </div>
  );
}
