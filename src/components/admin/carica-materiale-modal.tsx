
'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser, useStorage } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, X, Link as LinkIcon, Plus, Printer, Fingerprint, FileSignature } from 'lucide-react';
import { DestinazioneAsset } from '@/types/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function CaricaMaterialeModal({ isOpen, onClose, clienteId }: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [externalLink, setExternalLink] = useState('');
  const [destinazione, setDestinazione] = useState<DestinazioneAsset>('social');
  const [tipoStrategico, setTipoStrategico] = useState<string>('piano_strategico');
  const [tipoOffline, setTipoOffline] = useState<string>('altro');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: 'File troppo grande',
          description: `Uno o più file superano il limite di 50MB. Per favore, usa l'opzione "Link" per questi file.`,
        });
        const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
        setSelectedFiles(prev => [...prev, ...validFiles]);
      } else {
        setSelectedFiles(prev => [...prev, ...files]);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (uploadType === 'file' && selectedFiles.length === 0) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Seleziona almeno un file.' });
      return;
    }
    if (uploadType === 'link' && !externalLink) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Inserisci un link valido.' });
      return;
    }

    setLoading(true);
    try {
      const matColRef = collection(db, 'clienti', clienteId, 'materiali');

      if (uploadType === 'file') {
        const uploadPromises = selectedFiles.map(async (file) => {
          const timestamp = Date.now();
          const storagePath = `clienti/${clienteId}/${timestamp}_${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);
          const url_storage = await getDownloadURL(storageRef);
          return addDoc(matColRef, {
            nome_file: file.name,
            url_storage,
            caricato_da: user.uid,
            uploadedByUserId: user.uid,
            clientId: clienteId,
            ruolo_caricatore: 'admin',
            destinazione: destinazione,
            tipo_strategico: destinazione === 'strategico' ? tipoStrategico : null,
            tipo_offline: destinazione === 'offline' ? tipoOffline : null,
            stato_validazione: 'validato',
            note_rifiuto: null,
            creato_il: serverTimestamp()
          });
        });
        await Promise.all(uploadPromises);
      } else {
        await addDoc(matColRef, {
          nome_file: destinazione === 'strategico' ? `Link Strategia` : destinazione === 'contratto' ? 'Link Contratto' : 'Link Esterno',
          url_storage: null,
          link_esterno: externalLink,
          caricato_da: user.uid,
          uploadedByUserId: user.uid,
          clientId: clienteId,
          ruolo_caricatore: 'admin',
          destinazione: destinazione,
          tipo_strategico: destinazione === 'strategico' ? tipoStrategico : null,
          tipo_offline: destinazione === 'offline' ? tipoOffline : null,
          stato_validazione: 'validato',
          note_rifiuto: null,
          creato_il: serverTimestamp()
        });
      }

      toast({ title: 'Materiale caricato!', description: 'Gli asset sono stati aggiunti all\'archivio.' });
      resetForm();
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile caricare il materiale.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setExternalLink('');
    setDestinazione('social');
    setUploadType('file');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <UploadCloud className="w-5 h-5 text-indigo-600" /> Invia Documentazione & Assets
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">Carica contratti, loghi o grafiche offline per il cliente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 py-4">
          <Tabs value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="file" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">File Locale</TabsTrigger>
              <TabsTrigger value="link" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">Link Esterno</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4 pt-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${selectedFiles.length > 0 ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-slate-100'}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                {selectedFiles.length > 0 ? (
                  <div className="w-full space-y-2">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-700 shadow-sm">
                        <span className="truncate flex-1 mr-2">{f.name}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex justify-center pt-2">
                      <Button type="button" variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest border-indigo-100 text-indigo-600 rounded-lg"><Plus className="w-3 h-3 mr-1" /> Aggiungi Altri</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-slate-300" />
                    <div className="text-center space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Trascina o clicca per caricare</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Limite 50MB per file.</p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="link" className="text-xs font-bold text-slate-600">URL del File</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input id="link" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://..." className="pl-10 rounded-xl bg-slate-50" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Destinazione d'uso</Label>
              <Select value={destinazione} onValueChange={(val: DestinazioneAsset) => setDestinazione(val)}>
                <SelectTrigger className="w-full rounded-xl bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contratto"><div className="flex items-center gap-2"><FileSignature className="w-4 h-4 text-slate-900" /> 📄 Contratto</div></SelectItem>
                  <SelectItem value="visual_identity"><div className="flex items-center gap-2"><Fingerprint className="w-4 h-4 text-indigo-600" /> 🎨 Visual Identity (Logo)</div></SelectItem>
                  <SelectItem value="offline"><div className="flex items-center gap-2"><Printer className="w-4 h-4 text-emerald-600" /> 🖨️ Grafica Offline</div></SelectItem>
                  <SelectItem value="social">📱 Social Media Assets</SelectItem>
                  <SelectItem value="strategico">🛡️ Strategia Master</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {destinazione === 'offline' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label className="text-xs font-bold text-slate-600">Formato Offline</Label>
                <Select value={tipoOffline} onValueChange={setTipoOffline}>
                  <SelectTrigger className="w-full rounded-xl bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brochure">📖 Brochure</SelectItem>
                    <SelectItem value="volantino">📄 Volantino</SelectItem>
                    <SelectItem value="bigliettini">📇 Bigliettini da Visita</SelectItem>
                    <SelectItem value="gadget">🎁 Gadget</SelectItem>
                    <SelectItem value="6x3">🖼️ 6x3 (Grande Formato)</SelectItem>
                    <SelectItem value="3x6">🖼️ 3x6 (Grande Formato)</SelectItem>
                    <SelectItem value="altro">⚙️ Altro Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {destinazione === 'strategico' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label className="text-xs font-bold text-slate-600">Tipo Strategia</Label>
                <Select value={tipoStrategico} onValueChange={setTipoStrategico}>
                  <SelectTrigger className="w-full rounded-xl bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piano_strategico">🎯 Piano Strategico Master</SelectItem>
                    <SelectItem value="piano_comunicazione">📣 Piano di Comunicazione</SelectItem>
                    <SelectItem value="business_plan">💼 Business Plan</SelectItem>
                    <SelectItem value="business_model">🧱 Business Model Canvas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="font-bold text-slate-500">Annulla</Button>
            <Button type="submit" disabled={loading} className="gradient-primary font-bold h-12 rounded-xl px-8">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia al Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
