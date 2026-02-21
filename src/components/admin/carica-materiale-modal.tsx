'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Share2, Globe, Printer } from 'lucide-react';
import { DestinazioneMateriale } from '@/types/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

export function CaricaMaterialeModal({ isOpen, onClose, clienteId }: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [nomeFile, setNomeFile] = useState('');
  const [destinazione, setDestinazione] = useState<DestinazioneMateriale>('social');
  const db = useFirestore();
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFile || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
        nome_file: nomeFile,
        url_storage: null,
        caricato_da: user.uid,
        ruolo_caricatore: 'admin',
        stato_validazione: 'validato', // Gli admin caricano file già validati
        destinazione: destinazione,
        creato_il: new Date().toISOString()
      });

      toast({ title: 'Materiale aggiunto!', description: 'Il file è stato caricato correttamente.' });
      setNomeFile('');
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile caricare il materiale.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" /> Carica Asset Agenzia
          </DialogTitle>
          <DialogDescription>Aggiungi un nuovo file per il cliente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome File / Descrizione</Label>
            <Input 
              id="nome" 
              value={nomeFile} 
              onChange={(e) => setNomeFile(e.target.value)} 
              placeholder="es. Banner Sito Promo.png"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Destinazione</Label>
            <Select value={destinazione} onValueChange={(v: DestinazioneMateriale) => setDestinazione(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona destinazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social">
                  <div className="flex items-center gap-2"><Share2 className="w-4 h-4" /> Social Media</div>
                </SelectItem>
                <SelectItem value="sito">
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> Sito Web</div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-2"><Printer className="w-4 h-4" /> Grafica Offline</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carica Ora'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
