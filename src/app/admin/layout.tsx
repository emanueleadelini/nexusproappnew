'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, LogOut, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) { router.push('/login'); return; }

    const checkAdmin = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().ruolo === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/login');
      }
    };
    checkAdmin();
  }, [user, isUserLoading, db, router]);

  if (isUserLoading || !isAuthorized) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200/50">
        <div className="p-6 border-b border-gray-200/50">
          <h1 className="text-xl font-headline font-bold text-indigo-600">Nexus Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
              <Users className="w-5 h-5" /> Clienti
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
            <Settings className="w-5 h-5" /> Impostazioni
          </Button>
        </nav>
        <div className="p-4 border-t border-gray-200/50">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50" onClick={() => auth.signOut()}>
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center">
          <h1 className="font-headline font-bold text-indigo-600">Nexus</h1>
          <Button variant="ghost" size="icon" onClick={() => auth.signOut()}><LogOut className="w-5 h-5 text-red-600" /></Button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
        {/* Mobile Nav */}
        <nav className="md:hidden bg-white border-t p-2 flex justify-around">
          <Link href="/admin" className="p-2 text-indigo-600 flex flex-col items-center">
            <Users className="w-6 h-6" />
            <span className="text-[10px]">Clienti</span>
          </Link>
          <button className="p-2 text-gray-400 flex flex-col items-center">
            <Settings className="w-6 h-6" />
            <span className="text-[10px]">Impostazioni</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
