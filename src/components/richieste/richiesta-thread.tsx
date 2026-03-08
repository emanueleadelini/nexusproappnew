'use client';

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, getDocs, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessaggioRichiesta, Richiesta, StatoRichiesta, STATO_RICHIESTA_COLORS, STATO_RICHIESTA_LABELS, Allegato } from '@/types/richiesta';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Send, X, Link as LinkIcon, Plus, ChevronRight, Loader2, Clock } from 'lucide-react';

interface Props {
  richiesta: Richiesta;
  clienteId: string;
  ruoloUtente: string;
  onClose: () => void;
}

export function RichiestaThread({ richiesta, clienteId, ruoloUtente, onClose }: Props) {
  const { user } = useUser();
  const db = useFirestore();
  const [testo, setTesto] = useState('');
  const [loading, setLoading] = useState(false);
  const [allegati, setAllegati] = useState<Allegato[]>([]);
  const [nuovoLink, setNuovoLink] = useState('');
  const [nuovoNome, setNuovoNome] = useState('');

  const isAdmin = ruoloUtente === 'super_admin' || ruoloUtente === 'admin_agenzia';

  const messaggiQuery = useMemoFirebase(() => {
    if (!richiesta?.id) return null;
    return query(
      collection(db, 'clienti', clienteId, 'richieste', richiesta.id, 'messaggi'),
      orderBy('creato_il', 'asc')
    );
  }, [db, clienteId, richiesta?.id]);

  const { data: messaggi } = useCollection<MessaggioRichiesta>(messaggiQuery);

  const aggiungiAllegato = () => {
    if (!nuovoLink.trim()) return;
    setAllegati(prev => [...prev, { nome: nuovoNome.trim() || nuovoLink, link: nuovoLink.trim() }]);
    setNuovoLink('');
    setNuovoNome('');
  };

  const handleSend = async () => {
    if (!testo.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(
        collection(db, 'clienti', clienteId, 'richieste', richiesta.id, 'messaggi'),
        {
          autore_uid: user.uid,
          autore_ruolo: ruoloUtente,
          autore_nome: user.email?.split('@')[0] || 'Utente',
          testo: testo.trim(),
          allegati,
          creato_il: serverTimestamp(),
        }
      );

      const richiestaRef = doc(db, 'clienti', clienteId, 'richieste', richiesta.id);
      await updateDoc(richiestaRef, {
        aggiornato_il: serverTimestamp(),
        ultimo_messaggio_preview: testo.trim().substring(0, 100),
        ...(isAdmin ? { non_letti_cliente: (richiesta.non_letti_cliente || 0) + 1, stato: richiesta.stato === 'aperta' ? 'in_lavorazione' : richiesta.stato } : { non_letti_admin: (richiesta.non_letti_admin || 0) + 1 }),
      });

      // Notifiche
      if (isAdmin) {
        const clientUsersSnap = await getDocs(query(collection(db, 'users'), where('cliente_id', '==', clienteId), where('ruolo', '==', 'cliente_finale')));
        for (const u of clientUsersSnap.docs) {
          await addDoc(collection(db, 'users', u.id, 'notifiche'), {
            tipo: 'risposta_richiesta',
            messaggio: `Il team ha risposto alla tua richiesta: "${richiesta.titolo}"`,
            destinatario_uid: u.id,
            cliente_id: clienteId,
            riferimento_tipo: 'richiesta',
            riferimento_id: richiesta.id,
            letta: false,
            creato_il: serverTimestamp(),
          });
        }
      } else {
        const adminsSnap = await getDocs(query(collection(db, 'users'), where('ruolo', '==', 'super_admin')));
        for (const a of adminsSnap.docs) {
          await addDoc(collection(db, 'users', a.id, 'notifiche'), {
            tipo: 'nuova_richiesta',
            messaggio: `Nuovo messaggio su: "${richiesta.titolo}"`,
            destinatario_uid: a.id,
            cliente_id: clienteId,
            riferimento_tipo: 'richiesta',
            riferimento_id: richiesta.id,
            letta: false,
            creato_il: serverTimestamp(),
          });
        }
      }

      setTesto('');
      setAllegati([]);
    } catch {
      // silently handled
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStato = async (nuovoStato: StatoRichiesta) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'clienti', clienteId, 'richieste', richiesta.id), {
      stato: nuovoStato,
      aggiornato_il: serverTimestamp(),
    });
  };

  const statoColors = STATO_RICHIESTA_COLORS[richiesta.stato];

  return (
    <div className="fixed inset-y-0 right-0 w-[460px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Richiesta Supporto</p>
            <h3 className="font-headline font-bold text-slate-900 text-base leading-tight truncate">{richiesta.titolo}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Badge className={`${statoColors.bg} ${statoColors.text} border-none text-[10px] font-black uppercase tracking-widest px-3`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statoColors.dot} mr-1.5 inline-block`} />
            {STATO_RICHIESTA_LABELS[richiesta.stato]}
          </Badge>
          {isAdmin && (
            <Select value={richiesta.stato} onValueChange={(v) => handleChangeStato(v as StatoRichiesta)}>
              <SelectTrigger className="h-7 text-[10px] font-black uppercase w-36 border-slate-200 rounded-lg bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aperta">Aperta</SelectItem>
                <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                <SelectItem value="risolta">Risolta</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Messaggi */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messaggi?.map((m) => {
            const isMine = m.autore_uid === user?.uid;
            const isAdminMsg = m.autore_ruolo === 'super_admin' || m.autore_ruolo === 'admin_agenzia';
            return (
              <div key={m.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={`text-[10px] font-black uppercase ${isAdminMsg ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {m.autore_nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{m.autore_nome}</span>
                    {isAdminMsg && <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">Team</span>}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isMine ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                    {m.testo}
                  </div>
                  {m.allegati?.length > 0 && (
                    <div className="space-y-1 w-full">
                      {m.allegati.map((a, i) => (
                        <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <LinkIcon className="w-3 h-3 shrink-0" /> {a.nome}
                        </a>
                      ))}
                    </div>
                  )}
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {m.creato_il ? formatDistanceToNow(m.creato_il.toDate(), { addSuffix: true, locale: it }) : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input risposta */}
      {richiesta.stato !== 'risolta' && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          {allegati.length > 0 && (
            <div className="space-y-1.5">
              {allegati.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                  <LinkIcon className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="text-xs font-bold text-indigo-700 flex-1 truncate">{a.nome}</span>
                  <button onClick={() => setAllegati(prev => prev.filter((_, idx) => idx !== i))}><X className="w-3 h-3 text-slate-400" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={nuovoLink}
              onChange={(e) => setNuovoLink(e.target.value)}
              placeholder="Link allegato (Drive, ecc.)"
              className="flex-1 h-8 text-xs px-3 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), aggiungiAllegato())}
            />
            <Button type="button" variant="outline" size="sm" onClick={aggiungiAllegato} disabled={!nuovoLink.trim()} className="h-8 rounded-lg border-slate-200 px-2">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="relative">
            <Textarea
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="min-h-[80px] text-sm bg-white resize-none rounded-xl border-slate-200 pr-12 text-slate-900 placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
              }}
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={loading || !testo.trim()}
              className="absolute bottom-2 right-2 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[9px] text-slate-400 text-right">Invio con Cmd/Ctrl + Enter</p>
        </div>
      )}
      {richiesta.stato === 'risolta' && (
        <div className="p-4 border-t border-slate-100 text-center text-xs text-emerald-600 font-bold bg-emerald-50">
          Richiesta risolta — riaprila cambiando lo stato
        </div>
      )}
    </div>
  );
}
