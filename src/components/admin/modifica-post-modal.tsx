'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, Timestamp, collection, query, where, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit3, Calendar, FileImage, Layout, Share2 } from 'lucide-react';
import { Post, PIATTAFORMA_LABELS, FORMATO_LABELS, PiattaformaPost, FormatoPost } from '@/types/post';
import { Material } from '@/types/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  post: Post | null;
}

export function ModificaPostModal({ isOpen, onClose, clienteId, post }: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titolo: '',
    testo: '',
    data_pubblicazione: '',
    materiale_id: '',
    piattaforma: 'instagram' as PiattaformaPost,
    formato: 'immagine_singola' as FormatoPost,
  });

  const db = useFirestore();
  const { toast } = useToast();

  const materialsQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'clienti', clienteId, 'materiali'),
      where('stato_validazione', '==', 'validato')
    );
  }, [db, clienteId]);
  
  const { data: materials } = useCollection<Material>(materialsQuery);

  useEffect(() => {
    if (post) {
      let dateStr = '';
      if (post.data_pubblicazione && typeof post.data_pubblicazione.toDate === 'function') {
        dateStr = post.data_pubblicazione.toDate().toISOString().slice(0, 16);
      }
      setFormData({
        titolo: post.titolo,
        testo: post.testo,
        data_pubblicazione: dateStr,
        materiale_id: post.materiale_id || 'none',
        piattaforma: post.piattaforma || 'instagram',
        formato: post.formato || 'immagine_singola',
      });
    }
  }, [post]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !formData.titolo || !formData.testo || !user) return;

    setLoading(true);
    try {
      const postRef = doc(db, 'clienti', clienteId, 'post', post.id);
      const isTextChanged = formData.testo !== post.testo || formData.titolo !== post.titolo;
      
      const updateData: any = {
        titolo: formData.titolo,
        testo: formData.testo,
        data_pubblicazione: formData.data_pubblicazione ? Timestamp.fromDate(new Date(formData.data_pubblicazione)) : null,
        materiale_id: formData.materiale_id === 'none' ? null : formData.materiale_id,
        piattaforma: formData.piattaforma,
        formato: formData.formato,
        aggiornato_il: serverTimestamp(),
      };

      // NEXUS PRO: Salvataggio versione se il testo è cambiato
      if (isTextChanged) {
        updateData.versioni = arrayUnion({
          titolo: post.titolo,
          testo: post.testo,
          autore_uid: user.uid,
          autore_nome: 'Operatore Agenzia',
          timestamp: Timestamp.now(),
          nota: "Versione precedente salvata automaticamente"
        });
        updateData.versione_corrente = (post.versione_corrente || 0) + 1;
      }

      await updateDoc(postRef, updateData);
      toast({ title: 'Post aggiornato', description: 'Bozza salvata e versione archiviata.' });
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile aggiornare il post.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600" /> Modifica Strategica
          </DialogTitle>
          <DialogDescription>Ogni modifica creerà una nuova versione nel log storico.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Share2 className="w-3 h-3" /> Piattaforma</Label>
              <Select value={formData.piattaforma} onValueChange={(v: any) => setFormData({...formData, piattaforma: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PIATTAFORMA_LABELS).map(([id, label]) => (
                    <SelectItem key={id} value={id}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Layout className="w-3 h-3" /> Formato</Label>
              <Select value={formData.formato} onValueChange={(v: any) => setFormData({...formData, formato: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FORMATO_LABELS).map(([id, label]) => (
                    <SelectItem key={id} value={id}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-titolo">Titolo Interno</Label>
            <Input id="edit-titolo" value={formData.titolo} onChange={(e) => setFormData({...formData, titolo: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-testo">Copy del Post</Label>
            <Textarea id="edit-testo" value={formData.testo} onChange={(e) => setFormData({...formData, testo: e.target.value})} className="min-h-[150px]" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Pubblicazione</Label>
              <Input type="datetime-local" value={formData.data_pubblicazione} onChange={(e) => setFormData({...formData, data_pubblicazione: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><FileImage className="w-3 h-3" /> Asset</Label>
              <Select value={formData.materiale_id} onValueChange={(val) => setFormData({...formData, materiale_id: val})}>
                <SelectTrigger><SelectValue placeholder="Seleziona asset" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun asset</SelectItem>
                  {materials?.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome_file}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aggiorna Versione'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
