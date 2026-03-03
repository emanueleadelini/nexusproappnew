'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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
  const { user, isAdmin } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const clientsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    return query(collection(db, 'clienti'), orderBy('nome_azienda', 'asc'));
  }, [db, user, isAdmin]);

  const { data: clients, isLoading } = useCollection<any>(clientsQuery);

  const filteredClients = clients?.filter(c =>
    c.nome_azienda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.settore?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <Skeleton className="h-10 w-48 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900 mb-2">Portfolio Clienti</h1>
          <p className="text-slate-500 text-sm">Gestione tenant e monitoraggio performance Hub.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gradient-primary h-12 px-6 rounded-xl font-bold shadow-lg shadow-indigo-500/20 gap-2">
          <Plus className="w-5 h-5" /> Aggiungi Cliente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Cerca azienda o settore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-900 rounded-xl h-11 focus:ring-indigo-500/20 shadow-sm"
          />
        </div>
        <Button variant="outline" className="border-slate-200 text-slate-600 gap-2 h-11 rounded-xl shadow-sm hover:bg-slate-50 hover:text-slate-900">
          <Filter className="w-4 h-4" /> Filtri
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients?.map((client) => {
          const usagePercent = (client.post_usati / (client.post_totali || 1)) * 100;
          return (
            <Link key={client.id} href={`/admin/clienti/${client.id}`}>
              <Card className="glass-card border-none hover:border-indigo-500/30 transition-all group cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-indigo-500/50 transition-colors shadow-sm">
                      {client.logo_url ? (
                        <img src={client.logo_url} alt={client.nome_azienda} className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-indigo-400" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-[9px] text-indigo-400 border-indigo-500/20 font-black uppercase">
                      {client.settore || 'Servizi'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-slate-900 pt-4 group-hover:text-indigo-600 transition-colors font-headline font-bold">{client.nome_azienda}</CardTitle>
                  {client.email_riferimento && (
                    <CardDescription className="text-slate-500 text-xs truncate mt-1">{client.email_riferimento}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Post Mensili</span>
                      <span className="text-slate-900">{client.post_usati} / {client.post_totali}</span>
                    </div>
                    <Progress value={usagePercent} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold">Attivo da {client.creato_il?.toDate().toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="text-indigo-600 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {filteredClients?.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card rounded-[2rem] border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-900 font-bold">Nessun cliente trovato</h3>
            <p className="text-slate-500 text-sm">Prova a cambiare i termini di ricerca.</p>
          </div>
        )}
      </div>

      <AggiungiClienteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}