'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, RotateCcw, Check, UploadCloud, X, FileIcon, ImageIcon } from 'lucide-react';
import { generateSocialPost, GeneratePostOutput } from '@/ai/flows/generate-post-ai-flow';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DestinazioneAsset } from '@/types/material';

const PIATTAFORME = [
  { id: 'insta', label: 'Instagram', istruzioni: 'caption coinvolgente con emoji e hashtag, max 2200 caratteri' },
  { id: 'fb', label: 'Facebook', istruzioni: 'post articolato e informativo, può essere più lungo' },
  { id: 'li', label: 'LinkedIn', istruzioni: 'post professionale e autorevole, tono business' },
  { id: 'tt', label: 'TikTok', istruzioni: 'script breve e dinamico per video, tono giovane e diretto' },
  { id: 'x', label: 'X / Twitter', istruzioni: 'tweet incisivo, max 280 caratteri, diretto e d\'impatto' },
];

const TONI = [
  { id: 'prof', label: 'Professionale', descrizione: 'formale ma accessibile' },
  { id: 'amie', label: 'Amichevole', descrizione: 'caldo, informale, empatico' },
  { id: 'iron', label: 'Ironico', descrizione: 'spiritoso, leggero, con un tocco di umorismo' },
  { id: 'ispi', label: 'Ispirazionale', descrizione: 'motivante, positivo, energico' },
  { id: 'info', label: 'Informativo', descrizione: 'chiaro, educativo, basato sui fatti' },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNome: string;
  clienteSettore: string;
}

export function GeneraBozzaModal({ isOpen, onClose, clienteId, clienteNome, clienteSettore }: Props) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [platId, setPlatId] = useState(PIATTAFORME[0].id);
  const [tonoId, setTonoId] = useState(TONI[0].id);
  const [argomento, setArgomento] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<GeneratePostOutput | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [destinazione, setDestinazione] = useState<DestinazioneAsset>('social');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const db = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'File troppo grande',
          description: 'Il limite per il caricamento diretto è di 50MB. Per file più grandi, usa un link (Drive/WeTransfer) nell\'Archivio Asset.',
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleGenera = async () => {
    setLoading(true);
    try {
      const output = await generateSocialPost({
        nomeAzienda: clienteNome,
        settore: clienteSettore,
        piattaforma: PIATTAFORME.find(p => p.id === platId)!,
        tono: TONI.find(t => t.id === tonoId)!,
        argomento,
        noteAggiuntive: note
      });
      setResult(output);
      setStep(2);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Errore IA', description: 'Non è stato possibile generare il post.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSalva = async () => {
    if (!result || !user) return;
    setLoading(true);
    
    try {
      let materialeId = null;

      if (selectedFile) {
        const matRef = await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
          nome_file: selectedFile.name,
          url_storage: null,
          caricato_da: user.uid,
          destinazione: destinazione,
          stato_validazione: 'validato',
          note_rifiuto: null,
          creato_il: serverTimestamp()
        });
        materialeId = matRef.id;
      }

      const postColRef = collection(db, 'clienti', clienteId, 'post');
      const clientRef = doc(db, 'clienti', clienteId);
      
      const postData = {
        titolo: result.titolo,
        testo: result.testo,
        stato: 'bozza',
        materiale_id: materialeId,
        data_pubblicazione: null,
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp()
      };

      await addDoc(postColRef, postData);

      await updateDoc(clientRef, {
        post_usati: increment(1)
      });

      toast({ title: 'Bozza salvata!', description: 'Il post è stato aggiunto al calendario con i relativi asset.' });
      handleClose();
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `clienti/${clienteId}`, operation: 'write' }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setResult(null);
    setArgomento('');
    setNote('');
    setSelectedFile(null);
    setDestinazione('social');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-600">
            <Sparkles className="w-5 h-5" /> Genera Bozza con IA
          </DialogTitle>
          <DialogDescription>Gemini creerà una bozza personalizzata e potrai aggiungere i contenuti multimediali (max 50MB).</DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Piattaforma Social</Label>
              <div className="flex flex-wrap gap-2">
                {PIATTAFORME.map(p => (
                  <Button key={p.id} variant={platId === p.id ? 'default' : 'outline'} size="sm" onClick={() => setPlatId(p.id)} className={platId === p.id ? 'bg-indigo-600' : ''}>
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tono di Voce</Label>
              <div className="flex flex-wrap gap-2">
                {TONI.map(t => (
                  <Button key={t.id} variant={tonoId === t.id ? 'default' : 'outline'} size="sm" onClick={() => setTonoId(t.id)} className={tonoId === t.id ? 'bg-indigo-600' : ''}>
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arg">Argomento del Post *</Label>
              <Input id="arg" value={argomento} onChange={(e) => setArgomento(e.target.value)} placeholder="es. Lancio menu estivo" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note Aggiuntive</Label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="es. Sconto del 20%" />
            </div>

            <Button onClick={handleGenera} disabled={!argomento || loading} className="w-full bg-violet-600 hover:bg-violet-700 h-12">
              {loading ? <Loader2 className="animate-spin" /> : 'Genera Ora'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
               <span className="text-xs font-bold uppercase text-indigo-600">Reminder: {PIATTAFORME.find(p => p.id === platId)?.label} / {TONI.find(t => t.id === tonoId)?.label}</span>
               <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-indigo-600"><RotateCcw className="w-3 h-3 mr-1"/> Modifica Prompt</Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titolo Interno</Label>
                <Input value={result?.titolo} onChange={(e) => setResult(prev => prev ? {...prev, titolo: e.target.value} : null)} />
              </div>
              <div className="space-y-2">
                <Label>Testo Generato</Label>
                <Textarea value={result?.testo} onChange={(e) => setResult(prev => prev ? {...prev, testo: e.target.value} : null)} className="min-h-[150px]" />
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="flex items-center gap-2 text-violet-600 font-bold">
                  <ImageIcon className="w-4 h-4" /> Aggiungi Contenuto al Post
                </Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${selectedFile ? 'border-violet-400 bg-violet-50/50' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  {selectedFile ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-violet-600 p-2 rounded-lg mb-2"><FileIcon className="w-6 h-6 text-white" /></div>
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
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleGenera} disabled={loading}>Rigenera Testo</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSalva} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Salva Post Completo'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
