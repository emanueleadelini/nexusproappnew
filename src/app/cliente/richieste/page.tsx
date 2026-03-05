'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NuovaRichiestaModal } from '@/components/richieste/nuova-richiesta-modal';
import { RichiestaThread } from '@/components/richieste/richiesta-thread';
import { Richiesta, STATO_RICHIESTA_COLORS, STATO_RICHIESTA_LABELS } from '@/types/richiesta';
import { MessageSquare, Plus, Clock, CheckCircle2, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export default function ClienteRichiestePage() {
  const { user } = useUser();
  const db = useFirestore();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [richiestaAperta, setRichiestaAperta] = useState<Richiesta | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setClienteId(snap.data().cliente_id || null);
    });
  }, [user, db]);

  const richiesteQuery = useMemoFirebase(() => {
    if (!clienteId) return null;
    return query(
      collection(db, 'clienti', clienteId, 'richieste'),
      orderBy('aggiornato_il', 'desc')
    );
  }, [db, clienteId]);

  const { data: richieste, isLoading } = useCollection<Richiesta>(richiesteQuery);

  if (!clienteId || isLoading) {
    return (
      <div className="space-y-4 py-10">
        <Skeleton className="h-10 w-48" />
        {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 mb-1">Le tue Richieste</h1>
          <p className="text-slate-500 text-sm">Invia una nuova richiesta al team. Riceverai risposta direttamente qui.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gradient-primary h-11 px-6 rounded-xl font-bold shadow-sm gap-2">
          <Plus className="w-4 h-4" /> Nuova Richiesta
        </Button>
      </div>

      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {richieste && richieste.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {richieste.map((r) => {
                const colors = STATO_RICHIESTA_COLORS[r.stato];
                const hasUnread = (r.non_letti_cliente || 0) > 0;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRichiestaAperta(r)}
                    className={`p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group ${hasUnread ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot} ${!hasUnread ? 'opacity-40' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold text-sm truncate ${hasUnread ? 'text-slate-900' : 'text-slate-600'}`}>{r.titolo}</p>
                        {hasUnread && (
                          <span className="shrink-0 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{r.non_letti_cliente}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{r.ultimo_messaggio_preview}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge className={`${colors.bg} ${colors.text} border-none text-[9px] font-black uppercase px-2 py-0.5`}>
                          {STATO_RICHIESTA_LABELS[r.stato]}
                        </Badge>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {r.aggiornato_il ? formatDistanceToNow(r.aggiornato_il.toDate(), { addSuffix: true, locale: it }) : ''}
                        </span>
                      </div>
                    </div>
                    <MessageSquare className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold">Nessuna richiesta ancora</p>
              <p className="text-slate-400 text-xs mt-1 mb-6">Hai bisogno di supporto o vuoi chiedere una modifica?</p>
              <Button onClick={() => setIsModalOpen(true)} className="gradient-primary rounded-xl font-bold px-6 gap-2">
                <Plus className="w-4 h-4" /> Apri prima richiesta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <NuovaRichiestaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clienteId={clienteId} />

      {richiestaAperta && (
        <RichiestaThread
          richiesta={richiestaAperta}
          clienteId={clienteId}
          ruoloUtente="cliente_finale"
          onClose={() => setRichiestaAperta(null)}
        />
      )}
    </div>
  );
}
