'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, RotateCcw, UploadCloud, X, FileIcon, ImageIcon, AlertTriangle } from 'lucide-react';
import { generateSocialPost, GeneratePostOutput } from '@/ai/flows/generate-post-ai-flow';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DestinazioneAsset } from '@/types/material';

const PIATTAFORME = [
  { id: 'insta', label: 'Instagram', istruzioni: 'caption coinvolgente con emoji e hashtag' },
  { id: 'fb', label: 'Facebook', istruzioni: 'post informativo e colloquiale' },
  { id: 'li', label: 'LinkedIn', istruzioni: 'post professionale e autorevole' },
  { id: 'tt', label: 'TikTok', istruzioni: 'script breve e dinamico' },
];

const TONI = [
  { id: 'prof', label: 'Professionale', descrizione: 'formale ma accessibile' },
  { id: 'amie', label: 'Amichevole', descrizione: 'caldo, empatico' },
  { id: 'iron', label: 'Ironico', descrizione: 'spiritoso, leggero' },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNome: string;
  clienteSettore: string;
}

export function GeneraBozzaModal({ isOpen, onClose, clienteId, clienteNome, clienteSettore }: Props) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
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

  // NEXUS PRO: Controllo crediti AI
  const clientRef = useMemoFirebase(() => {
    if (!user || !clienteId) return null;
    return doc(db, 'clienti', clienteId);
  }, [db, clienteId, user]);
  const { data: client } = useDoc<any>(clientRef);

  const canGenerate = client ? client.post_usati < client.post_totali : false;

  const handleGenera = async () => {
    if (!canGenerate) {
      toast({ variant: 'destructive', title: 'Crediti esauriti', description: 'Impossibile generare post oltre il limite del piano.' });
      return;
    }
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
      toast({ variant: 'destructive', title: 'Errore IA', description: 'Generazione fallita.' });
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
          creato_il: serverTimestamp()
        });
        materialeId = matRef.id;
      }

      await addDoc(collection(db, 'clienti', clienteId, 'post'), {
        titolo: result.titolo,
        testo: result.testo,
        stato: 'bozza',
        materiale_id: materialeId,
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp(),
        versione_corrente: 0,
        storico_stati: [{ stato: 'bozza', autore_uid: user.uid, timestamp: Timestamp.now() }],
        versioni: []
      });

      await updateDoc(doc(db, 'clienti', clienteId), { post_usati: increment(1) });
      toast({ title: 'Bozza salvata!' });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-600">
            <Sparkles className="w-5 h-5" /> Genera Strategia AI
          </DialogTitle>
          <DialogDescription>Gemini trasformerà le tue note in un post professionale.</DialogDescription>
        </DialogHeader>

        {!canGenerate && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <div className="text-sm font-bold">Crediti post esauriti. Aumenta il piano per usare l'IA.</div>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Piattaforma</Label>
              <div className="flex flex-wrap gap-2">
                {PIATTAFORME.map(p => (
                  <Button key={p.id} variant={platId === p.id ? 'default' : 'outline'} size="sm" onClick={() => setPlatId(p.id)} className={platId === p.id ? 'bg-indigo-600' : ''}>
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Argomento del Post</Label>
              <Input value={argomento} onChange={(e) => setArgomento(e.target.value)} placeholder="Di cosa vogliamo parlare?" />
            </div>

            <Button onClick={handleGenera} disabled={!argomento || loading || !canGenerate} className="w-full bg-violet-600">
              {loading ? <Loader2 className="animate-spin" /> : 'Genera Ora'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Input value={result?.titolo} onChange={(e) => setResult(prev => prev ? {...prev, titolo: e.target.value} : null)} />
              <Textarea value={result?.testo} onChange={(e) => setResult(prev => prev ? {...prev, testo: e.target.value} : null)} className="min-h-[150px]" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Indietro</Button>
              <Button className="flex-1 bg-green-600" onClick={handleSalva} disabled={loading}>Salva Bozza</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}