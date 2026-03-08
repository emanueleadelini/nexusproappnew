'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { query, collection, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { MessageSquare, Send, CheckCircle2, User, Clock, ChevronRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Commento, TipoCommento } from '@/types/commento';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { usePermessi } from '@/hooks/use-permessi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  clienteId: string;
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentiSidebar({ clienteId, postId, isOpen, onClose }: Props) {
  const { user } = useUser();
  const db = useFirestore();
  const { ruolo, haPermesso } = usePermessi();
  const [testo, setTesto] = useState('');
  const [tipo, setTipo] = useState<TipoCommento>('commento');
  const [loading, setLoading] = useState(false);

  const commentiQuery = useMemoFirebase(() => {
    if (!user || !clienteId || !postId) return null;
    return query(
      collection(db, 'clienti', clienteId, 'post', postId, 'commenti'),
      orderBy('creato_il', 'asc')
    );
  }, [db, clienteId, postId, user]);

  const { data: commenti } = useCollection<Commento>(commentiQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testo.trim() || !user || !ruolo) return;

    setLoading(true);
    try {
      const commentoData = {
        testo: testo.trim(),
        autore_uid: user.uid,
        autore_nome: user.email?.split('@')[0] || 'Utente',
        autore_ruolo: ruolo,
        tipo: tipo,
        risolto: false,
        creato_il: serverTimestamp()
      };

      await addDoc(collection(db, 'clienti', clienteId, 'post', postId, 'commenti'), commentoData);

      // LOGICA NOTIFICHE V5.3: Determina destinatari
      if (ruolo === 'cliente_finale') {
        const adminsSnap = await getDocs(query(collection(db, 'users'), where('ruolo', '==', 'super_admin')));
        for (const adminDoc of adminsSnap.docs) {
          await addDoc(collection(db, 'users', adminDoc.id, 'notifiche'), {
            tipo: 'commento_nuovo',
            messaggio: `Nuovo feedback da ${clienteId} su "${postId}"`,
            destinatario_uid: adminDoc.id,
            cliente_id: clienteId,
            riferimento_tipo: 'post',
            riferimento_id: postId,
            letta: false,
            creato_il: serverTimestamp()
          });
        }
      } else {
        const clientUsersSnap = await getDocs(query(collection(db, 'users'), where('cliente_id', '==', clienteId), where('ruolo', '==', 'cliente_finale')));
        for (const clientUserDoc of clientUsersSnap.docs) {
          await addDoc(collection(db, 'users', clientUserDoc.id, 'notifiche'), {
            tipo: 'commento_nuovo',
            messaggio: `L'agenzia ha risposto al tuo post`,
            destinatario_uid: clientUserDoc.id,
            cliente_id: clienteId,
            riferimento_tipo: 'post',
            riferimento_id: postId,
            letta: false,
            creato_il: serverTimestamp()
          });
        }
      }

      setTesto('');
      setTipo('commento');
    } catch {
      // silently handled
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (commentoId: string) => {
    if (!haPermesso('modifica_post')) return;
    await updateDoc(doc(db, 'clienti', clienteId, 'post', postId, 'commenti', commentoId), {
      risolto: true
    });
  };

  if (!isOpen) return null;

  const attivi = commenti?.filter(c => !c.risolto) || [];
  const risolti = commenti?.filter(c => c.risolto) || [];

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
        <h3 className="font-headline font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" /> Feedback e Note
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}><ChevronRight className="w-5 h-5" /></Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {attivi.map((c) => (
            <div key={c.id} className={`group p-3 rounded-xl border ${c.tipo === 'revisione' ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 font-bold uppercase">{c.autore_nome.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="leading-none">
                    <p className="text-[11px] font-bold text-gray-900">{c.autore_nome}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{c.autore_ruolo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.tipo !== 'commento' && (
                    <Badge variant="outline" className="text-[8px] font-bold uppercase py-0">{c.tipo}</Badge>
                  )}
                  {haPermesso('modifica_post') && !c.risolto && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => markAsResolved(c.id)}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">"{c.testo}"</p>
              <p className="text-[9px] text-gray-400 mt-2 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> {c.creato_il ? formatDistanceToNow(c.creato_il.toDate(), { addSuffix: true, locale: it }) : ''}
              </p>
            </div>
          ))}

          {risolti.length > 0 && (
            <div className="mt-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-3 h-3" /> Note Risolte ({risolti.length})
              </p>
              <div className="space-y-3 opacity-60">
                {risolti.map((c) => (
                  <div key={c.id} className="p-2 rounded bg-gray-50 border border-gray-100">
                    <p className="text-xs line-through text-gray-400">"{c.testo}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Select value={tipo} onValueChange={(v: TipoCommento) => setTipo(v)}>
              <SelectTrigger className="h-8 text-[10px] font-bold uppercase w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commento">Commento</SelectItem>
                <SelectItem value="suggerimento">Suggerimento</SelectItem>
                {ruolo === 'cliente_finale' && <SelectItem value="revisione">Richiesta Revisione</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Textarea
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              placeholder="Scrivi una nota..."
              className="min-h-[80px] text-sm bg-white resize-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !testo.trim()}
              className="absolute bottom-2 right-2 h-8 w-8 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}