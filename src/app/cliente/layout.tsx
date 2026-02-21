
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, UserCircle, Briefcase } from 'lucide-react';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [nomeAzienda, setNomeAzienda] = useState('');

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const checkRole = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().ruolo === 'cliente') {
        setIsAuthorized(true);
        setNomeAzienda(userDoc.data().nomeAzienda || 'La tua Azienda');
      } else {
        router.push('/login');
      }
    };
    checkRole();
  }, [user, isUserLoading, db, router]);

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
          <div className="font-headline font-bold text-2xl text-indigo-600 flex items-center gap-2">
            <Briefcase className="w-7 h-7" /> Nexus <span className="text-gray-300 font-light hidden sm:inline">Agency</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-gray-200" />
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-600 font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
             <UserCircle className="w-5 h-5 text-indigo-500" /> {nomeAzienda}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="md:hidden text-xs font-bold text-gray-400 truncate max-w-[120px]">
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
        &copy; {new Date().getFullYear()} Nexus Agency - Tutti i diritti riservati.
      </footer>
    </div>
  );
}
