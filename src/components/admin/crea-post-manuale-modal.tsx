'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus2, Calendar, UploadCloud, X, FileIcon, ImageIcon, AlertCircle } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DestinazioneAsset } from '@/types/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function CreaPostManualeModal({ isOpen, onClose, clienteId }: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [destinazione, setDestinazione] = useState<DestinazioneAsset>('social');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    titolo: '',
    testo: '',
    data_pubblicazione: '',
  });
  
  const db = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'File troppo grande',
          description: 'Il limite per il caricamento diretto è di 50MB. Per file più grandi, caricalo prima nell\'Archivio Asset usando un link (Drive/WeTransfer).',
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titolo || !formData.testo || !user) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Titolo e Testo sono obbligatori.' });
      return;
    }

    setLoading(true);
    try {
      let materialeId = null;

      if (selectedFile) {
        const matData = {
          nome_file: selectedFile.name,
          url_storage: null,
          caricato_da: user.uid,
          destinazione: destinazione,
          stato_validazione: 'validato',
          note_rifiuto: null,
          creato_il: serverTimestamp()
        };
        const matRef = await addDoc(collection(db, 'clienti', clienteId, 'materiali'), matData);
        materialeId = matRef.id;
      }

      const postColRef = collection(db, 'clienti', clienteId, 'post');
      const clientRef = doc(db, 'clienti', clienteId);
      
      const postData = {
        titolo: formData.titolo,
        testo: formData.testo,
        stato: 'bozza',
        materiale_id: materialeId,
        data_pubblicazione: formData.data_pubblicazione ? Timestamp.fromDate(new Date(formData.data_pubblicazione)) : null,
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp(),
      };

      await addDoc(postColRef, postData);

      await updateDoc(clientRef, {
        post_usati: increment(1)
      });

      toast({ 
        title: 'Post creato!', 
        description: selectedFile 
          ? 'Post e contenuto multimediale salvati correttamente.' 
          : 'La bozza è stata aggiunta al PED.' 
      });
      
      resetForm();
      onClose();
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `clienti/${clienteId}`, operation: 'write' }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ titolo: '', testo: '', data_pubblicazione: '' });
    setSelectedFile(null);
    setDestinazione('social');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-indigo-600" /> Nuovo Post Completo
          </DialogTitle>
          <DialogDescription>Inserisci testo e carica il contenuto multimediale (max 50MB).</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titolo">Titolo del Post *</Label>
              <Input id="titolo" value={formData.titolo} onChange={(e) => setFormData({...formData, titolo: e.target.value})} placeholder="es. Lancio Nuova Collezione" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testo">Contenuto (Copy) *</Label>
              <Textarea id="testo" value={formData.testo} onChange={(e) => setFormData({...formData, testo: e.target.value})} placeholder="Scrivi qui il testo del post..." className="min-h-[120px]" required />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label className="flex items-center gap-2 text-indigo-600 font-bold">
              <ImageIcon className="w-4 h-4" /> Aggiungi Foto o Video
            </Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${selectedFile ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
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
                  <UploadCloud className="w-8 h-8 text-gray-300" />
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500">Trascina o clicca per caricare</p>
                    <p className="text-[10px] text-gray-400 mt-1">Limite 50MB. Per file più grandi usa un link nell'archivio.</p>
                  </div>
                </>
              )}
            </div>

            {selectedFile && (
              <div className="space-y-2">
                <Label>Destinazione Asset</Label>
                <Select value={destinazione} onValueChange={(val: DestinazioneAsset) => setDestinazione(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona destinazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">📱 Social Media</SelectItem>
                    <SelectItem value="sito">🌐 Sito Web</SelectItem>
                    <SelectItem value="offline">🖨️ Grafiche Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="data" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Data Pubblicazione (Opzionale)
            </Label>
            <Input id="data" type="datetime-local" value={formData.data_pubblicazione} onChange={(e) => setFormData({...formData, data_pubblicazione: e.target.value})} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crea Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
