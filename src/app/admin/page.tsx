'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, userData, isAdmin } = useUser();
  const db = useFirestore();

  // Query Clienti (Solo se Admin e dati caricati)
  const clientsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    return query(collection(db, 'clienti'), orderBy('creato_il', 'desc'), limit(5));
  }, [db, user, isAdmin]);
  const { data: clients, isLoading: isClientsLoading } = useCollection<any>(clientsQuery);

  // Query Post in Attesa (Solo se Admin e dati caricati)
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

  if (isClientsLoading || isPostsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white mb-2">Hub Direzionale</h1>
          <p className="text-slate-400">Bentornato nell'area di controllo Nexus Pro, {userData?.email.split('@')[0]}.</p>
        </div>
        <Link href="/admin/clienti">
          <Button className="gradient-primary h-12 px-6 rounded-xl font-bold shadow-lg shadow-indigo-500/20 gap-2">
            <Plus className="w-5 h-5" /> Nuovo Cliente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-none overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/20 font-black">ACTIVE</Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Clienti Hub</p>
            <p className="text-3xl font-bold text-white">{clients?.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/20 font-black">PENDING</Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">In Approvazione</p>
            <p className="text-3xl font-bold text-white">{pendingPosts?.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/20 font-black">MONTHLY</Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Post Prodotti</p>
            <p className="text-3xl font-bold text-white">{totalUsed}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/20 font-black">LIVE</Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Efficienza Hub</p>
            <p className="text-3xl font-bold text-white">98.4%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-indigo-400" /> Clienti Recenti
            </CardTitle>
            <Link href="/admin/clienti">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-white transition-colors">
                Vedi tutti <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6 px-0">
            <div className="divide-y divide-white/5">
              {clients?.map((client: any) => (
                <Link key={client.id} href={`/admin/clienti/${client.id}`}>
                  <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-indigo-400 group-hover:border-indigo-500/50">
                        {client.nome_azienda.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{client.nome_azienda}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{client.settore || 'Servizi'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{client.post_usati} / {client.post_totali}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Budget Post</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Workflow in Attesa
            </CardTitle>
            <Badge className="bg-amber-500/20 text-amber-400 border-none px-2 py-0.5 text-[10px] font-black uppercase">
              {pendingPosts?.length || 0} Task
            </Badge>
          </CardHeader>
          <CardContent className="pt-6 px-0">
            <div className="divide-y divide-white/5">
              {pendingPosts?.map((post: any) => (
                <div key={post.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate max-w-[200px]">{post.titolo}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.piattaforma}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/clienti/${post.cliente_id}?postId=${post.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold uppercase text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg">
                      Apri Task
                    </Button>
                  </Link>
                </div>
              ))}
              {(!pendingPosts || pendingPosts.length === 0) && (
                <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/30" />
                  <p className="text-slate-500 italic text-sm">Ottimo lavoro! Nessun post in sospeso.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
