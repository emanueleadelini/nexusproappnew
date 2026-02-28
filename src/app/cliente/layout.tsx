'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, UserCircle, Briefcase, Avatar, AvatarImage, AvatarFallback } from 'lucide-react';
import { NotificheBell } from '@/components/notifiche-bell';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [nomeAzienda, setNomeAzienda] = useState('');
  const [clienteId, setClienteId] = useState<string | null>(null);

  // Recupero iniziale per autorizzazione e clienteId
  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const checkRole = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const ruolo = data.ruolo;
        if (ruolo === 'referente' || ruolo === 'collaboratore') {
          setIsAuthorized(true);
          setNomeAzienda(data.nomeAzienda || 'La tua Azienda');
          setClienteId(data.cliente_id);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };
    checkRole();
  }, [user, isUserLoading, db, router]);

  // Sottoscrizione in tempo reale ai dati del cliente per il logo
  const clientDocRef = useMemoFirebase(() => clienteId ? doc(db, 'clienti', clienteId) : null, [db, clienteId]);
  const { data: clientData } = useDoc<any>(clientDocRef);

  if (isUserLoading || !isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse text-sm">Caricamento Area Riservata...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200/50 h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="font-headline font-bold text-2xl text-indigo-600 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center p-1.5">
              {clientData?.logo_url ? (
                <img src={clientData.logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Briefcase className="w-6 h-6 text-indigo-500" />
              )}
            </div>
            <span className="hidden sm:inline">AD next lab</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-gray-200" />
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-600 font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
             <UserCircle className="w-5 h-5 text-indigo-500" /> {nomeAzienda}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificheBell />
          <div className="hidden sm:block md:hidden text-xs font-bold text-gray-400 truncate max-w-[120px]">
            {nomeAzienda}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 font-bold gap-2 hover:bg-red-50 hover:text-red-700 transition-all rounded-lg" 
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-4 h-4" /> 
            <span className="hidden sm:inline">Esci</span>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 p-6 text-center text-gray-400 text-xs">
        &copy; {new Date().getFullYear()} AD next lab - Tutti i diritti riservati.
      </footer>
    </div>
  );
}

import { useAuth } from '@/firebase';
