'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, increment, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus2, UploadCloud, X, ImageIcon, Share2, Layout, Zap, Clock, Images } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DestinazioneAsset } from '@/types/material';
import { PiattaformaPost, FormatoPost, PIATTAFORMA_LABELS, FORMATO_LABELS, StatoPost, TipoPianificazione } from '@/types/post';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function CreaPostManualeModal({ isOpen, onClose, clienteId }: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    titolo: '',
    testo: '',
    data_pubblicazione: '',
    piattaforme: [] as PiattaformaPost[],
    formato: 'immagine_singola' as FormatoPost,
    tags: '',
    tipo_pianificazione: 'programmata' as TipoPianificazione
  });

  const db = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const isCarousel = formData.formato === 'carosello';

      if (!isCarousel && files.length > 1) {
        toast({ variant: 'destructive', title: 'Formato singolo', description: 'Puoi caricare un solo file per questo formato.' });
        return;
      }

      const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
      if (validFiles.length < files.length) {
        toast({ variant: 'destructive', title: 'File troppo grandi', description: 'Alcuni file superano i 50MB.' });
      }

      if (isCarousel) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      } else {
        setSelectedFiles(validFiles.slice(0, 1));
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const togglePiattaforma = (id: PiattaformaPost) => {
    setFormData(prev => ({
      ...prev,
      piattaforme: prev.piattaforme.includes(id)
        ? prev.piattaforme.filter(p => p !== id)
        : [...prev.piattaforme, id]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titolo || !formData.testo || !user || formData.piattaforme.length === 0) {
      toast({ variant: 'destructive', title: 'Campi mancanti', description: 'Titolo, testo e almeno un social sono richiesti.' });
      return;
    }

    setLoading(true);
    try {
      const materialiIds: string[] = [];

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const matRef = await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
            nome_file: file.name,
            url_storage: null,
            caricato_da: user.uid,
            uploadedByUserId: user.uid,
            clientId: clienteId,
            ruolo_caricatore: 'admin',
            destinazione: 'social',
            stato_validazione: 'validato',
            creato_il: serverTimestamp()
          });
          materialiIds.push(matRef.id);
        }
      }

      const timestamp = Timestamp.now();
      const scadenza = new Date();
      scadenza.setHours(scadenza.getHours() + 24);

      const postData = {
        titolo: formData.titolo,
        testo: formData.testo,
        stato: 'da_approvare' as StatoPost,
        cliente_id: clienteId,
        materiali_ids: materialiIds,
        materiale_id: materialiIds[0] || null, // Per retro-compatibilità
        piattaforme: formData.piattaforme,
        piattaforma: formData.piattaforme[0], // Per retro-compatibilità
        formato: formData.formato,
        data_pubblicazione: formData.data_pubblicazione ? Timestamp.fromDate(new Date(formData.data_pubblicazione)) : null,
        tipo_pianificazione: formData.tipo_pianificazione,
        scadenza_approvazione: Timestamp.fromDate(scadenza),
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        numero_revisioni: 0,
        versione_corrente: 0,
        storico_stati: [{ stato: 'da_approvare', autore_uid: user.uid, timestamp }],
        versioni: [{ titolo: formData.titolo, testo: formData.testo, autore_uid: user.uid, autore_nome: 'Admin', timestamp }]
      };

      const newPostRef = await addDoc(collection(db, 'clienti', clienteId, 'post'), postData);
      await updateDoc(doc(db, 'clienti', clienteId), { post_usati: increment(1) });

      // Notifica al referente (bypass errore indice Firestore filtrando in memoria)
      const usersSnap = await getDocs(query(collection(db, 'users'), where('cliente_id', '==', clienteId)));
      for (const refDoc of usersSnap.docs) {
        if (refDoc.data().ruolo === 'cliente_finale') {
          await addDoc(collection(db, 'users', refDoc.id, 'notifiche'), {
            tipo: 'post_da_approvare',
            messaggio: `Nuovo post "${formData.titolo}" pronto per ${formData.piattaforme.join(', ')}!`,
            destinatario_uid: refDoc.id,
            cliente_id: clienteId,
            riferimento_tipo: 'post',
            riferimento_id: newPostRef.id,
            letta: false,
            creato_il: serverTimestamp()
          });
        }
      }

      toast({ title: 'Post Inviato!', description: 'Il cliente è stato notificato.' });
      resetForm();
      onClose();
    } catch (e: any) {
      console.error("ERRORE REALE SALVATAGGIO:", e);
      toast({ variant: 'destructive', title: 'Errore', description: e.message || 'Errore sconosciuto' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ titolo: '', testo: '', data_pubblicazione: '', piattaforme: [], formato: 'immagine_singola', tags: '', tipo_pianificazione: 'programmata' });
    setSelectedFiles([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600">
            <FilePlus2 className="w-5 h-5" /> Nuovo Post Strategico
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">Configura i canali social e gli asset per questo post.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Piattaforme Social</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(PIATTAFORMA_LABELS).map(([id, label]) => (
                <div key={id} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <Checkbox
                    id={`plat-${id}`}
                    checked={formData.piattaforme.includes(id as PiattaformaPost)}
                    onCheckedChange={() => togglePiattaforma(id as PiattaformaPost)}
                  />
                  <Label htmlFor={`plat-${id}`} className="text-xs font-bold text-slate-700 cursor-pointer leading-none">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Formato</Label>
              <Select value={formData.formato} onValueChange={(v: any) => { setFormData({ ...formData, formato: v }); if (v !== 'carosello') setSelectedFiles(prev => prev.slice(0, 1)); }}>
                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(FORMATO_LABELS).map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Pianificazione</Label>
              <Select value={formData.tipo_pianificazione} onValueChange={(v: any) => setFormData({ ...formData, tipo_pianificazione: v })}>
                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediata">Pubblica Subito</SelectItem>
                  <SelectItem value="programmata">Programma Uscita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titolo" className="text-xs font-bold text-slate-600">Titolo Interno</Label>
              <Input id="titolo" value={formData.titolo} onChange={(e) => setFormData({ ...formData, titolo: e.target.value })} placeholder="es. Lancio Prodotto Primavera" required className="rounded-xl border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testo" className="text-xs font-bold text-slate-600">Copy del Post</Label>
              <Textarea id="testo" value={formData.testo} onChange={(e) => setFormData({ ...formData, testo: e.target.value })} className="min-h-[120px] rounded-xl border-slate-200 resize-none" placeholder="Scrivi il testo del post..." required />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center">
              <Label className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Images className="w-4 h-4" />
                Media Assets {formData.formato === 'carosello' ? '(Multipli)' : '(Singolo)'}
              </Label>
              {selectedFiles.length > 0 && <span className="text-[10px] font-black text-slate-400 uppercase">{selectedFiles.length} file pronti</span>}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFiles.length > 0 ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-slate-100'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple={formData.formato === 'carosello'}
              />
              <UploadCloud className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Trascina o clicca per caricare</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-700 shadow-sm">
                    <span className="truncate flex-1 mr-2">{file.name}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.tipo_pianificazione === 'programmata' && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <Label className="text-xs font-bold text-slate-600">Data e Ora di Uscita</Label>
              <Input type="datetime-local" value={formData.data_pubblicazione} onChange={(e) => setFormData({ ...formData, data_pubblicazione: e.target.value })} className="rounded-xl border-slate-200 bg-slate-50" />
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="font-bold text-slate-500">Annulla</Button>
            <Button type="submit" disabled={loading} className="gradient-primary font-bold h-12 rounded-xl px-10">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Invia al Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
