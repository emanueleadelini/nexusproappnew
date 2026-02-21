'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  postTotaliAttuali: number;
}

export function ModificaPianoModal({ isOpen, onClose, clienteId, postTotaliAttuali }: Props) {
  const [loading, setLoading] = useState(false);
  const [nuoviPost, setNuoviPost] = useState(postTotaliAttuali);
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    setNuoviPost(postTotaliAttuali);
  }, [postTotaliAttuali, isOpen]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const clientRef = doc(db, 'clienti', clienteId);
      await updateDoc(clientRef, {
        post_totali: nuoviPost,
        richiesta_upgrade: false, // Reset della richiesta se presente
        aggiornato_il: serverTimestamp(),
      });

      toast({ 
        title: 'Piano aggiornato', 
        description: `Il limite post per questo cliente è ora di ${nuoviPost}.` 
      });
      onClose();
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Errore', 
        description: 'Impossibile aggiornare il piano.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Modifica Piano Post
          </DialogTitle>
          <DialogDescription>
            Aumenta o diminuisci il numero di post inclusi nell'abbonamento mensile.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <Label className="text-xs font-bold uppercase text-gray-400">Post Totali Mensili</Label>
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full border-2"
              onClick={() => setNuoviPost(prev => Math.max(1, prev - 1))}
            >
              <ChevronDown className="w-6 h-6" />
            </Button>
            
            <div className="text-6xl font-headline font-bold text-gray-900 w-24 text-center">
              {nuoviPost}
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full border-2"
              onClick={() => setNuoviPost(prev => prev + 1)}
            >
              <ChevronUp className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {nuoviPost > postTotaliAttuali 
              ? `Stai aggiungendo ${nuoviPost - postTotaliAttuali} post al piano attuale.`
              : nuoviPost < postTotaliAttuali 
              ? `Stai rimuovendo ${postTotaliAttuali - nuoviPost} post dal piano attuale.`
              : 'Nessuna modifica selezionata.'}
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
          <Button 
            onClick={handleUpdate} 
            disabled={loading || nuoviPost === postTotaliAttuali} 
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Conferma Modifica'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
