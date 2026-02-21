'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, RotateCcw, Check } from 'lucide-react';
import { generateSocialPost, GeneratePostOutput } from '@/ai/flows/generate-post-ai-flow';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNome: string;
  clienteSettore: string;
}

export function GeneraBozzaModal({ isOpen, onClose, clienteId, clienteNome, clienteSettore }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [platId, setPlatId] = useState(PIATTAFORME[0].id);
  const [tonoId, setTonoId] = useState(TONI[0].id);
  const [argomento, setArgomento] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<GeneratePostOutput | null>(null);
  const db = useFirestore();
  const { toast } = useToast();

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
    if (!result) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clienti', clienteId, 'post'), {
        titolo: result.titolo,
        testo: result.testo,
        stato: 'bozza',
        data_pubblicazione: null,
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp()
      });
      toast({ title: 'Bozza salvata!', description: 'Il post è stato aggiunto al calendario.' });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setResult(null);
    setArgomento('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-600">
            <Sparkles className="w-5 h-5" /> Genera Bozza con IA
          </DialogTitle>
          <DialogDescription>Gemini creerà una bozza personalizzata.</DialogDescription>
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
               <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-indigo-600"><RotateCcw className="w-3 h-3 mr-1"/> Modifica</Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titolo Interno</Label>
                <Input value={result?.titolo} onChange={(e) => setResult(prev => prev ? {...prev, titolo: e.target.value} : null)} />
              </div>
              <div className="space-y-2">
                <Label>Testo Generato</Label>
                <Textarea value={result?.testo} onChange={(e) => setResult(prev => prev ? {...prev, testo: e.target.value} : null)} className="min-h-[200px]" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleGenera} disabled={loading}>Rigenera</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSalva} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Salva come Bozza'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
