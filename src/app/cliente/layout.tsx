'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [nomeAzienda, setNomeAzienda] = useState('');

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) { router.push('/login'); return; }

    const checkRole = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().ruolo === 'cliente') {
        setIsAuthorized(true);
        setNomeAzienda(userDoc.data().nomeAzienda || '');
      } else {
        router.push('/login');
      }
    };
    checkRole();
  }, [user, isUserLoading, db, router]);

  if (isUserLoading || !isAuthorized) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200/50 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="font-headline font-bold text-xl text-indigo-600">Nexus <span className="text-gray-400 font-normal">Agency</span></div>
          <div className="hidden md:block h-6 w-px bg-gray-200" />
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
             <UserCircle className="w-4 h-4" /> {nomeAzienda}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-red-600 gap-2 hover:bg-red-50" onClick={() => auth.signOut()}>
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
