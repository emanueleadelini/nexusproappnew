
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Users, LogOut, Loader2, Settings, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;
    
    // Se non c'è sessione, manda al login
    if (!user) {
      router.push('/login');
      return;
    }

    // Verifica ruolo admin
    const checkAdmin = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().ruolo === 'admin') {
        setIsAuthorized(true);
      } else {
        // Se non è admin, lo rispedisce al login (o all'area cliente se lo è)
        router.push('/login');
      }
    };
    
    checkAdmin();
  }, [user, isUserLoading, db, router]);

  if (isUserLoading || !isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse text-sm">Verifica autorizzazioni admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200/60 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-headline font-bold text-gray-900 tracking-tight">Nexus Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-4">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 font-semibold transition-colors">
              <Users className="w-5 h-5" /> Clienti
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-gray-400 cursor-not-allowed">
            <Settings className="w-5 h-5" /> Impostazioni
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Sessione Attiva</p>
            <p className="text-xs text-gray-600 font-medium truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold" onClick={() => auth.signOut()}>
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <h1 className="font-headline font-bold text-indigo-600 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Nexus
          </h1>
          <Button variant="ghost" size="icon" onClick={() => auth.signOut()}>
            <LogOut className="w-5 h-5 text-red-600" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden bg-white border-t border-gray-100 p-2 flex justify-around sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <Link href="/admin" className="p-3 text-indigo-600 flex flex-col items-center">
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 uppercase">Clienti</span>
          </Link>
          <button className="p-3 text-gray-300 flex flex-col items-center cursor-not-allowed">
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1 uppercase">Impostazioni</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
