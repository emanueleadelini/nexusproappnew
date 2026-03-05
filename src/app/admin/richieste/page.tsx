'use client';

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy, where } from 'firebase/firestore';
import { usePermessi } from '@/hooks/use-permessi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RichiestaThread } from '@/components/richieste/richiesta-thread';
import { Richiesta, STATO_RICHIESTA_COLORS, STATO_RICHIESTA_LABELS, StatoRichiesta } from '@/types/richiesta';
import { MessageSquare, Clock, CheckCircle2, Inbox, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const FILTRI: { label: string; value: StatoRichiesta | 'tutte' }[] = [
  { label: 'Tutte', value: 'tutte' },
  { label: 'Aperte', value: 'aperta' },
  { label: 'In Lavorazione', value: 'in_lavorazione' },
  { label: 'Risolte', value: 'risolta' },
];

export default function AdminRichiestePage() {
  const { user } = useUser();
  const { isAdmin, ruolo } = usePermessi();
  const db = useFirestore();
  const [filtro, setFiltro] = useState<StatoRichiesta | 'tutte'>('tutte');
  const [richiestaAperta, setRichiestaAperta] = useState<Richiesta | null>(null);
  const [clienteIdAperto, setClienteIdAperto] = useState<string>('');

  const richiesteQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    if (filtro === 'tutte') {
      return query(collectionGroup(db, 'richieste'), orderBy('aggiornato_il', 'desc'));
    }
    return query(collectionGroup(db, 'richieste'), where('stato', '==', filtro), orderBy('aggiornato_il', 'desc'));
  }, [db, user, isAdmin, filtro]);

  const { data: richieste, isLoading } = useCollection<Richiesta>(richiesteQuery);

  const apriThread = (r: Richiesta) => {
    setRichiestaAperta(r);
    setClienteIdAperto(r.cliente_id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 mb-1">Richieste Clienti</h1>
        <p className="text-slate-500 text-sm">Gestisci le richieste di supporto in arrivo dai tuoi clienti.</p>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 flex-wrap">
        {FILTRI.map(f => (
          <Button
            key={f.value}
            variant={filtro === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltro(f.value)}
            className={`h-9 rounded-xl text-xs font-black uppercase tracking-wider ${filtro === f.value ? 'gradient-primary border-0' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            {f.label}
            {f.value !== 'tutte' && (
              <span className="ml-1.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[9px]">
                {richieste?.filter(r => r.stato === f.value).length || 0}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Lista richieste */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {richieste && richieste.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {richieste.map((r) => {
                const colors = STATO_RICHIESTA_COLORS[r.stato];
                const hasUnread = (r.non_letti_admin || 0) > 0;
                return (
                  <div
                    key={r.id}
                    onClick={() => apriThread(r)}
                    className={`p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group ${hasUnread ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot} ${!hasUnread ? 'opacity-40' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold text-sm truncate ${hasUnread ? 'text-slate-900' : 'text-slate-600'}`}>{r.titolo}</p>
                        {hasUnread && (
                          <span className="shrink-0 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{r.non_letti_admin}</span>
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
                        <span className="text-[10px] text-slate-400 font-bold uppercase truncate">
                          Cliente: {r.cliente_id}
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
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-slate-500 font-bold">Nessuna richiesta {filtro !== 'tutte' ? `"${STATO_RICHIESTA_LABELS[filtro as StatoRichiesta]}"` : ''}</p>
              <p className="text-slate-400 text-xs mt-1">Tutto in ordine — i clienti non hanno richieste aperte.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {richiestaAperta && (
        <RichiestaThread
          richiesta={richiestaAperta}
          clienteId={clienteIdAperto}
          ruoloUtente={ruolo || 'admin_agenzia'}
          onClose={() => setRichiestaAperta(null)}
        />
      )}
    </div>
  );
}
