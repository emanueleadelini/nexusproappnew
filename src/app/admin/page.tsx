'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { usePermessi } from '@/hooks/use-permessi';
import { query, collection, where, orderBy, limit, collectionGroup } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useUser();
  const { isAdmin } = usePermessi();
  const db = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    return query(collection(db, 'clienti'), orderBy('creato_il', 'desc'), limit(5));
  }, [db, user, isAdmin]);
  const { data: clients, isLoading: isClientsLoading } = useCollection<any>(clientsQuery);

  const pendingPostsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    return query(
      collectionGroup(db, 'post'),
      where('stato', '==', 'da_approvare'),
      limit(5)
    );
  }, [db, user, isAdmin]);
  const { data: pendingPosts, isLoading: isPostsLoading } = useCollection<any>(pendingPostsQuery);

  const totalUsed = clients?.reduce((acc: number, c: any) => acc + (c.post_usati || 0), 0) || 0;
  const totalBudget = clients?.reduce((acc: number, c: any) => acc + (c.post_totali || 0), 0) || 0;
  const kpiSaturation = totalBudget > 0 ? `${Math.round((totalUsed / totalBudget) * 100)}%` : '—';

  if (isClientsLoading || isPostsLoading) {
    return (
      <div className="space-y-8 p-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-slate-900 mb-2">Hub Direzionale</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Cockpit AD next lab &bull; Benvenuto, {user?.email?.split('@')[0]}</p>
        </div>
        <Link href="/admin/clienti">
          <Button className="gradient-primary h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-indigo-500/20">
            <Plus className="w-5 h-5" /> Nuovo Cliente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Clienti Attivi", val: clients?.length || 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", tag: "HUB" },
          { label: "Task Approvazione", val: pendingPosts?.length || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", tag: "24H" },
          { label: "Post Mensili", val: totalUsed, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", tag: "TOTAL" },
          { label: "Saturazione Budget", val: kpiSaturation, icon: Zap, color: "text-purple-600", bg: "bg-purple-50", tag: "LIVE" }
        ].map((stat, i) => (
          <Card key={i} className="bg-white border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all rounded-[2rem]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <Badge variant="outline" className="text-[10px] font-black tracking-widest border-slate-200 text-slate-500 bg-slate-50 uppercase">{stat.tag}</Badge>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-slate-900 tracking-tighter">{stat.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-slate-100 shadow-sm rounded-[2.5rem]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-8">
            <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-slate-900">
              <Users className="w-6 h-6 text-indigo-600" /> Portfolio Recenti
            </CardTitle>
            <Link href="/admin/clienti">
              <Button variant="ghost" size="sm" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider hover:bg-indigo-50 rounded-xl">
                Tutti i Tenant <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {clients?.map((client: any) => (
                <Link key={client.id} href={`/admin/clienti/${client.id}`}>
                  <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center font-black text-xl text-indigo-600 group-hover:border-indigo-200">
                        {client.nome_azienda.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{client.nome_azienda}</p>
                        <p className="text-xs text-slate-500 uppercase font-black tracking-wider">{client.settore || 'Servizi Professionali'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{client.post_usati} / {client.post_totali}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Budget Post</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm rounded-[2.5rem]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-8">
            <CardTitle className="text-xl font-headline font-bold flex items-center gap-3 text-slate-900">
              <AlertCircle className="w-6 h-6 text-amber-500" /> Workflow 24h
            </CardTitle>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              {pendingPosts?.length || 0} Attesa
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {pendingPosts?.map((post: any) => (
                <div key={post.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]" />
                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-900 truncate max-w-[220px]">{post.titolo}</p>
                      <div className="flex gap-2 mt-1">
                        {(post.piattaforme || [post.piattaforma]).map((p: string) => (
                          <span key={p} className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Link href={`/admin/clienti/${post.cliente_id}?postId=${post.id}`}>
                    <Button size="sm" variant="ghost" className="h-10 px-4 text-xs font-black uppercase tracking-wider text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      Apri Task
                    </Button>
                  </Link>
                </div>
              ))}
              {(!pendingPosts || pendingPosts.length === 0) && (
                <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/50" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Tutto approvato &bull; Hub in Ordine</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
