'use client';

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, collection, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { usePermessi } from '@/hooks/use-permessi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RichiestaThread } from '@/components/richieste/richiesta-thread';
import { Richiesta, STATO_RICHIESTA_COLORS, STATO_RICHIESTA_LABELS, StatoRichiesta } from '@/types/richiesta';
import { Lead, STATO_LEAD_LABELS, STATO_LEAD_COLORS, PRODOTTO_LEAD_LABELS, StatoLead } from '@/types/lead';
import { MessageSquare, Clock, CheckCircle2, Zap, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const FILTRI: { label: string; value: StatoRichiesta | 'tutte' }[] = [
  { label: 'Tutte', value: 'tutte' },
  { label: 'Aperte', value: 'aperta' },
  { label: 'In Lavorazione', value: 'in_lavorazione' },
  { label: 'Risolte', value: 'risolta' },
];

type TabType = 'supporto' | 'prova';

export default function AdminRichiestePage() {
  const { user } = useUser();
  const { isAdmin, ruolo } = usePermessi();
  const db = useFirestore();
  const [tab, setTab] = useState<TabType>('supporto');
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

  const leadsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    return query(collection(db, 'leads'), orderBy('creato_il', 'desc'));
  }, [db, user, isAdmin]);

  const { data: richieste, isLoading } = useCollection<Richiesta>(richiesteQuery);
  const { data: leads, isLoading: isLeadsLoading } = useCollection<Lead>(leadsQuery);

  const aggiornaStatoLead = async (leadId: string, stato: StatoLead) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { stato });
      toast.success('Stato aggiornato');
    } catch {
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const apriThread = (r: Richiesta) => {
    setRichiestaAperta(r);
    setClienteIdAperto(r.cliente_id);
  };

  if (isLoading || isLeadsLoading) {
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
        <h1 className="text-3xl font-headline font-bold text-slate-900 mb-1">Richieste</h1>
        <p className="text-slate-500 text-sm">Gestisci supporto clienti e richieste di prova dal sito.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        <button
          onClick={() => setTab('supporto')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${tab === 'supporto' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare className="w-4 h-4" />
          Supporto Clienti
          {richieste && richieste.length > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">{richieste.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('prova')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${tab === 'prova' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Zap className="w-4 h-4" />
          Leads & Demo
          {leads && leads.filter(l => l.stato === 'nuovo').length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">{leads.filter(l => l.stato === 'nuovo').length}</span>
          )}
        </button>
      </div>

      {/* Contenuto tab Supporto */}
      {tab === 'supporto' && (
        <>
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
        </>
      )}

      {/* Contenuto tab Richieste Prova */}
      {tab === 'prova' && (
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {leads && leads.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {leads.map((lead) => {
                  const colors = STATO_LEAD_COLORS[lead.stato];
                  const isProdottoNexus = lead.prodotto === 'nexuspro';
                  return (
                    <div key={lead.id} className="p-5 flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${colors.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="font-bold text-sm text-slate-900">{lead.nome}</p>
                          <Badge className={`${lead.tipo === 'prova' ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'} border-none text-[9px] font-black uppercase px-2 py-0.5`}>
                            {lead.tipo === 'prova' ? 'Prova' : 'Demo'}
                          </Badge>
                          <Badge className={`${isProdottoNexus ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600'} border-none text-[9px] font-medium px-2 py-0.5`}>
                            {PRODOTTO_LEAD_LABELS[lead.prodotto]}
                          </Badge>
                          <Badge className={`${colors.bg} ${colors.text} border-none text-[9px] font-black uppercase px-2 py-0.5`}>
                            {STATO_LEAD_LABELS[lead.stato]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>{lead.email}</span>
                          {lead.telefono && <span>{lead.telefono}</span>}
                          {lead.azienda && <span className="font-medium text-slate-700">{lead.azienda}</span>}
                        </div>
                        {lead.messaggio && (
                          <p className="text-xs text-slate-400 mt-1 italic">"{lead.messaggio}"</p>
                        )}
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-2.5 h-2.5" />
                          {lead.creato_il ? formatDistanceToNow(lead.creato_il.toDate(), { addSuffix: true, locale: it }) : ''}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {lead.stato !== 'contattato' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => aggiornaStatoLead(lead.id, 'contattato')}>
                            Contattato
                          </Button>
                        )}
                        {lead.stato !== 'convertito' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => aggiornaStatoLead(lead.id, 'convertito')}>
                            Convertito
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-slate-500 font-bold">Nessun lead ancora</p>
                <p className="text-slate-400 text-xs mt-1">Le richieste demo e prova dal sito appariranno qui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
