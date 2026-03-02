'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bell, 
  LogOut, 
  Loader2, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { NotificheBell } from '@/components/notifiche-bell';
import { useAuth } from '@/firebase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, userData, isUserDataLoading, isAdmin } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isUserLoading || isUserDataLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/cliente');
    }
  }, [user, isUserLoading, isUserDataLoading, isAdmin, router]);

  if (isUserLoading || isUserDataLoading || !isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
        <p className="text-slate-400 font-medium animate-pulse text-sm">Verifica autorizzazioni Hub Admin...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Clienti', href: '/admin/clienti', icon: Users },
    { label: 'Post', href: '/admin/post', icon: FileText },
    { label: 'Notifiche', href: '/admin/notifiche', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-500" />
          <span className="font-headline font-bold text-white text-sm">Nexus Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificheBell />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </Button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900/50 border-r border-white/5 p-6 z-40 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden lg:flex items-center gap-3 mb-10">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-bold text-white tracking-tight">AD next lab</span>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className={`w-full justify-start gap-3 h-11 font-semibold rounded-xl transition-all ${
                  pathname === item.href 
                    ? 'bg-indigo-600/20 text-indigo-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          <div className="px-4 py-3 bg-white/5 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Operatore</p>
            <p className="text-xs text-white font-medium truncate">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 h-11 font-bold rounded-xl" 
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
