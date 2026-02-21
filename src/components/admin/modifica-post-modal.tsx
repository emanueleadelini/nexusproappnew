'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, Timestamp, collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit3, Calendar, FileImage } from 'lucide-react';
import { Post } from '@/types/post';
import { Material } from '@/types/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  post: Post | null;
}

export function ModificaPostModal({ isOpen, onClose, clienteId, post }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titolo: '',
    testo: '',
    data_pubblicazione: '',
    materiale_id: '',
  });

  const db = useFirestore();
  const { toast } = useToast();

  // Carica i materiali validati per permettere l'associazione
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
        const d = post.data_pubblicazione.toDate();
        dateStr = d.toISOString().slice(0, 16); // format for datetime-local input
      }
      setFormData({
        titolo: post.titolo,
        testo: post.testo,
        data_pubblicazione: dateStr,
        materiale_id: post.materiale_id || 'none',
      });
    }
  }, [post]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !formData.titolo || !formData.testo) return;

    setLoading(true);
    try {
      const postRef = doc(db, 'clienti', clienteId, 'post', post.id);
      await updateDoc(postRef, {
        titolo: formData.titolo,
        testo: formData.testo,
        data_pubblicazione: formData.data_pubblicazione ? Timestamp.fromDate(new Date(formData.data_pubblicazione)) : null,
        materiale_id: formData.materiale_id === 'none' ? null : formData.materiale_id,
        aggiornato_il: serverTimestamp(),
      });

      toast({ title: 'Post aggiornato', description: 'Le modifiche sono state salvate correttamente.' });
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile aggiornare il post.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600" /> Modifica Post
          </DialogTitle>
          <DialogDescription>Aggiorna il contenuto, la data o l'asset associato a questo post.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-titolo">Titolo del Post *</Label>
            <Input 
              id="edit-titolo" 
              value={formData.titolo} 
              onChange={(e) => setFormData({...formData, titolo: e.target.value})} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-testo">Contenuto (Copy) *</Label>
            <Textarea 
              id="edit-testo" 
              value={formData.testo} 
              onChange={(e) => setFormData({...formData, testo: e.target.value})} 
              className="min-h-[150px]" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-data" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Data Pubblicazione
              </Label>
              <Input 
                id="edit-data" 
                type="datetime-local" 
                value={formData.data_pubblicazione} 
                onChange={(e) => setFormData({...formData, data_pubblicazione: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <FileImage className="w-3 h-3" /> Asset Associato
              </Label>
              <Select 
                value={formData.materiale_id} 
                onValueChange={(val) => setFormData({...formData, materiale_id: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun asset</SelectItem>
                  {materials?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome_file}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva Modifiche'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
