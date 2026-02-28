
'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, increment, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus2, Calendar, UploadCloud, X, FileIcon, ImageIcon, AlertCircle, Share2, Layout } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DestinazioneAsset } from '@/types/material';
import { PiattaformaPost, FormatoPost, PIATTAFORMA_LABELS, FORMATO_LABELS, StatoPost } from '@/types/post';

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
    piattaforma: 'instagram' as PiattaformaPost,
    formato: 'immagine_singola' as FormatoPost,
    tags: '',
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
          description: 'Il limite è 50MB. Per file più grandi usa un link.',
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
        const matRef = await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
          nome_file: selectedFile.name,
          url_storage: null,
          caricato_da: user.uid,
          ruolo_caricatore: 'admin',
          destinazione: destinazione,
          stato_validazione: 'validato',
          note_rifiuto: null,
          creato_il: serverTimestamp()
        });
        materialeId = matRef.id;
      }

      const postColRef = collection(db, 'clienti', clienteId, 'post');
      const clientRef = doc(db, 'clienti', clienteId);
      
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const timestamp = Timestamp.now();

      const postData = {
        titolo: formData.titolo,
        testo: formData.testo,
        stato: 'bozza' as StatoPost,
        materiale_id: materialeId,
        data_pubblicazione: formData.data_pubblicazione ? Timestamp.fromDate(new Date(formData.data_pubblicazione)) : null,
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp(),
        piattaforma: formData.piattaforma,
        formato: formData.formato,
        tags: tagsArray,
        numero_revisioni: 0,
        versione_corrente: 0,
        storico_stati: [{
          stato: 'bozza',
          autore_uid: user.uid,
          timestamp: timestamp
        }],
        versioni: [{
          titolo: formData.titolo,
          testo: formData.testo,
          autore_uid: user.uid,
          autore_nome: 'Admin',
          timestamp: timestamp
        }]
      };

      const newPostRef = await addDoc(postColRef, postData);
      await updateDoc(clientRef, { post_usati: increment(1) });

      // TRIGGER NOTIFICA: Trova il referente del cliente
      const usersSnap = await getDocs(query(collection(db, 'users'), where('cliente_id', '==', clienteId), where('ruolo', '==', 'referente')));
      for (const refDoc of usersSnap.docs) {
        await addDoc(collection(db, 'users', refDoc.id, 'notifiche'), {
          tipo: 'post_da_approvare',
          messaggio: `L'agenzia ha creato un nuovo post: "${formData.titolo}". Controllalo nel feed!`,
          destinatario_uid: refDoc.id,
          cliente_id: clienteId,
          riferimento_tipo: 'post',
          riferimento_id: newPostRef.id,
          letta: false,
          creato_il: serverTimestamp()
        });
      }

      toast({ title: 'Post creato!', description: 'Bozza aggiunta e cliente notificato.' });
      resetForm();
      onClose();
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `clienti/${clienteId}/post`, operation: 'create' }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ titolo: '', testo: '', data_pubblicazione: '', piattaforma: 'instagram', formato: 'immagine_singola', tags: '' });
    setSelectedFile(null);
    setDestinazione('social');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-indigo-600" /> Nuovo Post Strategico
          </DialogTitle>
          <DialogDescription>Configura piattaforma, formato e contenuto del post.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Share2 className="w-4 h-4" /> Piattaforma</Label>
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
              <Label className="flex items-center gap-2"><Layout className="w-4 h-4" /> Formato</Label>
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titolo">Titolo Interno *</Label>
              <Input id="titolo" value={formData.titolo} onChange={(e) => setFormData({...formData, titolo: e.target.value})} placeholder="es. Lancio Collezione Autunno" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testo">Copy del Post *</Label>
              <Textarea id="testo" value={formData.testo} onChange={(e) => setFormData({...formData, testo: e.target.value})} placeholder="Scrivi il testo qui..." className="min-h-[120px]" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separati da virgola)</Label>
              <Input id="tags" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="promo, evento, novità" />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label className="flex items-center gap-2 text-indigo-600 font-bold">
              <ImageIcon className="w-4 h-4" /> Media Asset
            </Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${selectedFile ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <FileIcon className="w-8 h-8 text-indigo-600 mb-1" />
                  <span className="text-xs font-semibold truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-[10px] text-gray-400 mt-1">Trascina qui o clicca (Max 50MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data Pubblicazione</Label>
            <Input id="data" type="datetime-local" value={formData.data_pubblicazione} onChange={(e) => setFormData({...formData, data_pubblicazione: e.target.value})} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
