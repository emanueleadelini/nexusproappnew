'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { usePermessi } from '@/hooks/use-permessi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Plus,
  Search,
  Building2,
  ArrowRight,
  Briefcase,
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { AggiungiClienteModal } from '@/components/admin/aggiungi-cliente-modal';
import { Progress } from '@/components/ui/progress';

export default function ClientiListPage() {
  const { user } = useUser();
  const { isAdmin, ruolo } = usePermessi();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroSettore, setFiltroSettore] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const clientsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin || !ruolo) return null;
    if (ruolo === 'super_admin') {
      return query(collection(db, 'clienti'), orderBy('nome_azienda', 'asc'));
    } else {
      return query(collection(db, 'clienti'), where('agenzia_id', '==', user.uid), orderBy('nome_azienda', 'asc'));
    }
  }, [db, user, isAdmin, ruolo]);

  const { data: clients, isLoading } = useCollection<any>(clientsQuery);

  const settoriDisponibili = [...new Set(clients?.map(c => c.settore).filter(Boolean) || [])].sort();

  const filteredClients = clients?.filter(c => {
    const matchSearch = c.nome_azienda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.settore?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSettore = !filtroSettore || c.settore === filtroSettore;
    return matchSearch && matchSettore;
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <Skeleton className="h-10 w-48 bg-slate-200" />
          <Skeleton className="h-10 w-32 bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl bg-slate-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 mb-1">Portfolio Clienti</h1>
          <p className="text-slate-500 text-sm">Gestione tenant e monitoraggio performance Hub.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gradient-primary h-11 px-6 rounded-xl font-bold shadow-sm gap-2">
          <Plus className="w-4 h-4" /> Aggiungi Cliente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cerca azienda o settore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 focus-visible:ring-indigo-500/20"
          />
        </div>
        <div className="relative">
          <select
            value={filtroSettore}
            onChange={(e) => setFiltroSettore(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold px-4 pr-8 appearance-none cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Tutti i Settori</option>
            {settoriDisponibili.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients?.map((client) => {
          const usagePercent = (client.post_usati / (client.post_totali || 1)) * 100;
          return (
            <Link key={client.id} href={`/admin/clienti/${client.id}`}>
              <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer h-full rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden group-hover:border-indigo-300 transition-colors">
                      {client.logo_url ? (
                        <img src={client.logo_url} alt={client.nome_azienda} className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-[9px] text-indigo-600 border-indigo-200 bg-indigo-50 font-black uppercase">
                      {client.settore || 'Servizi'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-slate-900 pt-3 group-hover:text-indigo-600 transition-colors">{client.nome_azienda}</CardTitle>
                  <CardDescription className="text-slate-400 text-xs truncate">Ref: {client.email_riferimento || 'Nessuna email'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Post Mensili</span>
                      <span className="text-slate-700">{client.post_usati} / {client.post_totali}</span>
                    </div>
                    <Progress value={usagePercent} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold">Attivo da {client.creato_il?.toDate().toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {filteredClients?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-900 font-bold">Nessun cliente trovato</h3>
            <p className="text-slate-500 text-sm mt-1">Prova a cambiare i termini di ricerca.</p>
          </div>
        )}
      </div>

      <AggiungiClienteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}