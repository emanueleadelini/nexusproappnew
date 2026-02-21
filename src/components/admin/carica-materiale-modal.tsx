'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileIcon, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

export function CaricaMaterialeModal({ isOpen, onClose, clienteId }: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Seleziona un file prima di continuare.' });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
        nome_file: selectedFile.name,
        url_storage: null,
        caricato_da: user.uid,
        stato_validazione: 'validato',
        note_rifiuto: null,
        creato_il: serverTimestamp()
      });

      toast({ title: 'Materiale caricato!', description: `Il file ${selectedFile.name} è stato aggiunto correttamente.` });
      resetForm();
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile caricare il materiale.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Carica Asset</DialogTitle>
          <DialogDescription>Seleziona un file da condividere nel piano del cliente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Seleziona File</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${selectedFile ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              {selectedFile ? (
                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-600 p-2 rounded-lg mb-2"><FileIcon className="w-6 h-6 text-white" /></div>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[250px]">{selectedFile.name}</span>
                  <Button type="button" variant="ghost" size="sm" className="mt-2 text-red-500 hover:text-red-600 h-7" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                    <X className="w-3 h-3 mr-1" /> Rimuovi
                  </Button>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">Clicca per sfogliare</p>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading || !selectedFile} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carica Ora'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
