
'use client';

import { useFirestore, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, ChevronRight, PieChart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AggiungiClienteModal } from '@/components/admin/aggiungi-cliente-modal';
import Link from 'next/link';

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'clienti'), orderBy('nome_azienda'));
  }, [db, user]);

  const { data: clients, isLoading, error } = useCollection<any>(clientsQuery);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Errore nel caricamento dei clienti.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">I Tuoi Clienti</h2>
          <p className="text-muted-foreground">Gestisci le aziende e i loro piani editoriali.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2">
          <Plus className="w-4 h-4" /> Aggiungi Cliente
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : clients && clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const usagePercent = client.post_totali > 0 ? (client.post_usati / client.post_totali) * 100 : 0;
            return (
              <Link key={client.id} href={`/admin/clienti/${client.id}`}>
                <Card className="hover:border-indigo-400 transition-colors cursor-pointer group rounded-xl border-gray-200/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {client.nome_azienda?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <CardTitle className="text-lg font-headline font-semibold group-hover:text-indigo-600 transition-colors">
                        {client.nome_azienda}
                      </CardTitle>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground italic">
                        {client.settore || 'Settore non specificato'}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1"><PieChart className="w-3 h-3" /> Crediti Post</span>
                          <span className={usagePercent > 80 ? "text-red-600 font-bold" : ""}>
                            {client.post_usati} / {client.post_totali}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {client.email_riferimento}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nessun cliente trovato</h3>
          <p className="text-muted-foreground">Inizia aggiungendo un nuovo cliente per gestire i suoi post.</p>
          <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="mt-4 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
            Aggiungi il tuo primo cliente
          </Button>
        </div>
      )}

      <AggiungiClienteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
