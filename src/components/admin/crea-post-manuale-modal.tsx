'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus2, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

export function CreaPostManualeModal({ isOpen, onClose, clienteId }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titolo: '',
    testo: '',
    data_pubblicazione: '',
  });
  const db = useFirestore();
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titolo || !formData.testo) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Titolo e Testo sono obbligatori.' });
      return;
    }

    setLoading(true);
    try {
      const postData = {
        titolo: formData.titolo,
        testo: formData.testo,
        stato: 'bozza',
        data_pubblicazione: formData.data_pubblicazione ? new Date(formData.data_pubblicazione).toISOString() : null,
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp(),
      };

      await addDoc(collection(db, 'clienti', clienteId, 'post'), postData);

      toast({ title: 'Post creato!', description: 'La bozza è stata aggiunta al PED.' });
      setFormData({ titolo: '', testo: '', data_pubblicazione: '' });
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile creare il post.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-indigo-600" /> Nuovo Post (PED)
          </DialogTitle>
          <DialogDescription>Aggiungi manualmente una voce al piano editoriale del cliente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titolo">Titolo del Post *</Label>
            <Input 
              id="titolo" 
              value={formData.titolo} 
              onChange={(e) => setFormData({...formData, titolo: e.target.value})} 
              placeholder="es. Promo Natale - 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testo">Contenuto (Copy) *</Label>
            <Textarea 
              id="testo" 
              value={formData.testo} 
              onChange={(e) => setFormData({...formData, testo: e.target.value})} 
              placeholder="Scrivi qui il testo del post, inclusi emoji e hashtag..."
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Data Pubblicazione (Opzionale)
            </Label>
            <Input 
              id="data" 
              type="datetime-local"
              value={formData.data_pubblicazione} 
              onChange={(e) => setFormData({...formData, data_pubblicazione: e.target.value})} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva come Bozza'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
