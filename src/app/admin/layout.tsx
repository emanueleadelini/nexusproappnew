'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
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
  X,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { NotificheBell } from '@/components/notifiche-bell';
import { usePermessi } from '@/hooks/use-permessi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, loading: isPermessiLoading } = usePermessi();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isUserLoading || isPermessiLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/cliente');
    }
  }, [user, isUserLoading, isPermessiLoading, isAdmin, router]);

  if (isUserLoading || isPermessiLoading || !isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
        <p className="text-slate-500 font-bold animate-pulse text-sm">Verifica autorizzazioni Hub Admin...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Clienti', href: '/admin/clienti', icon: Users },
    { label: 'Post', href: '/admin/post', icon: FileText },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Notifiche', href: '/admin/notifiche', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span className="font-headline font-bold text-slate-900 text-sm">Nexus Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificheBell />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
          </Button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 p-6 z-40 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden lg:flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-bold text-slate-900 tracking-tight">AD next lab</span>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-11 font-bold rounded-xl transition-all ${(item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href))
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Operatore</p>
            <p className="text-xs text-slate-900 font-bold truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 h-11 font-bold rounded-xl"
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
