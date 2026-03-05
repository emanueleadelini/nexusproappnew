'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Link as LinkIcon } from 'lucide-react';
import { Allegato } from '@/types/richiesta';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

export function NuovaRichiestaModal({ isOpen, onClose, clienteId }: Props) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [messaggio, setMessaggio] = useState('');
  const [allegati, setAllegati] = useState<Allegato[]>([]);
  const [nuovoAllegatoNome, setNuovoAllegatoNome] = useState('');
  const [nuovoAllegatoLink, setNuovoAllegatoLink] = useState('');

  const aggiungiAllegato = () => {
    if (!nuovoAllegatoLink.trim()) return;
    setAllegati(prev => [...prev, {
      nome: nuovoAllegatoNome.trim() || nuovoAllegatoLink,
      link: nuovoAllegatoLink.trim()
    }]);
    setNuovoAllegatoNome('');
    setNuovoAllegatoLink('');
  };

  const rimuoviAllegato = (i: number) => {
    setAllegati(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim() || !messaggio.trim() || !user) return;
    setLoading(true);
    try {
      const richiestaRef = await addDoc(
        collection(db, 'clienti', clienteId, 'richieste'),
        {
          cliente_id: clienteId,
          titolo: titolo.trim(),
          stato: 'aperta',
          creato_il: serverTimestamp(),
          aggiornato_il: serverTimestamp(),
          ultimo_messaggio_preview: messaggio.trim().substring(0, 100),
          non_letti_admin: 1,
          non_letti_cliente: 0,
          creato_da_uid: user.uid,
        }
      );

      await addDoc(
        collection(db, 'clienti', clienteId, 'richieste', richiestaRef.id, 'messaggi'),
        {
          autore_uid: user.uid,
          autore_ruolo: 'cliente_finale',
          autore_nome: user.email?.split('@')[0] || 'Cliente',
          testo: messaggio.trim(),
          allegati,
          creato_il: serverTimestamp(),
        }
      );

      // Notifica agli admin
      const adminsSnap = await getDocs(query(collection(db, 'users'), where('ruolo', '==', 'super_admin')));
      for (const adminDoc of adminsSnap.docs) {
        await addDoc(collection(db, 'users', adminDoc.id, 'notifiche'), {
          tipo: 'nuova_richiesta',
          messaggio: `Nuova richiesta da ${clienteId}: "${titolo}"`,
          destinatario_uid: adminDoc.id,
          cliente_id: clienteId,
          riferimento_tipo: 'richiesta',
          riferimento_id: richiestaRef.id,
          letta: false,
          creato_il: serverTimestamp(),
        });
      }

      toast({ title: 'Richiesta inviata!', description: 'Il team ti risponderà al più presto.' });
      setTitolo('');
      setMessaggio('');
      setAllegati([]);
      onClose();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile inviare la richiesta.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-white rounded-3xl border-slate-200 max-w-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline font-bold text-slate-900">Nuova Richiesta</DialogTitle>
          <DialogDescription className="text-slate-500">Descrivi cosa ti serve. Il team ti risponderà in piattaforma.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">Oggetto</Label>
            <Input
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Es: Modifica caption post Instagram, Nuova strategia..."
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">Messaggio</Label>
            <Textarea
              value={messaggio}
              onChange={(e) => setMessaggio(e.target.value)}
              placeholder="Spiega nel dettaglio cosa ti serve..."
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5" /> Allegati (link Google Drive, WeTransfer, ecc.)
            </Label>
            {allegati.map((a, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-xs font-bold text-indigo-700 flex-1 truncate">{a.nome}</span>
                <button type="button" onClick={() => rimuoviAllegato(i)}>
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={nuovoAllegatoLink}
                onChange={(e) => setNuovoAllegatoLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="rounded-xl border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={aggiungiAllegato} disabled={!nuovoAllegatoLink.trim()} className="rounded-xl border-slate-200 text-slate-600 shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500 font-bold">Annulla</Button>
            <Button type="submit" disabled={loading || !titolo.trim() || !messaggio.trim()} className="gradient-primary font-bold rounded-xl px-8">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia Richiesta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
