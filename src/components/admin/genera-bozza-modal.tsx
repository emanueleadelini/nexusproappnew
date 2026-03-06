
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Calendar, FileText, Check, AlertTriangle, Wand2, PlusCircle } from 'lucide-react';
import { generateSocialPost, generateMonthlyCalendar, GeneratePostOutput, GenerateCalendarOutput } from '@/ai/flows/generate-post-ai-flow';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, Timestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNome: string;
  clienteSettore: string;
}

const PIATTAFORME = [
  { id: 'instagram', label: 'Instagram', istruzioni: 'caption coinvolgente con emoji e hashtag' },
  { id: 'facebook', label: 'Facebook', istruzioni: 'post informativo e colloquiale' },
  { id: 'linkedin', label: 'LinkedIn', istruzioni: 'post professionale e autorevole' },
  { id: 'tiktok', label: 'TikTok', istruzioni: 'script breve e dinamico' },
];

export function GeneraBozzaModal({ isOpen, onClose, clienteId, clienteNome, clienteSettore }: Props) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'single' | 'calendar'>('single');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [argomento, setArgomento] = useState('');
  const [platId, setPlatId] = useState('instagram');
  const [numeroPost, setNumeroPost] = useState(8);
  
  const [postResult, setPostResult] = useState<GeneratePostOutput | null>(null);
  const [calendarResult, setCalendarResult] = useState<GenerateCalendarOutput | null>(null);

  const clientRef = useMemoFirebase(() => {
    if (!user || !clienteId) return null;
    return doc(db, 'clienti', clienteId);
  }, [db, clienteId, user]);
  const { data: client } = useDoc<any>(clientRef);

  const canGenerate = client ? (client.post_usati || 0) < (client.post_totali || 1) : false;

  const handleGeneraSingle = async () => {
    setLoading(true);
    try {
      const output = await generateSocialPost({
        nomeAzienda: clienteNome,
        settore: clienteSettore,
        brandTraining: client?.ai_training ? {
          brandVoice: client.ai_training.brand_voice,
          targetAudience: client.ai_training.target_audience,
          keyValues: client.ai_training.key_values,
          mainTopics: client.ai_training.main_topics
        } : undefined,
        piattaforma: PIATTAFORME.find(p => p.id === platId)!,
        tono: { label: 'Coerente', descrizione: 'Usa il tono salvato nel brand training' },
        argomento,
      });
      setPostResult(output);
      setStep(2);
    } catch (e) {
      toast({ variant: 'destructive', title: "Errore AI" });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneraCalendar = async () => {
    setLoading(true);
    try {
      const meseAttuale = new Date().toLocaleString('it-IT', { month: 'long' });
      const output = await generateMonthlyCalendar({
        nomeAzienda: clienteNome,
        settore: clienteSettore,
        brandTraining: client?.ai_training ? {
          brandVoice: client.ai_training.brand_voice,
          targetAudience: client.ai_training.target_audience,
          keyValues: client.ai_training.key_values,
          mainTopics: client.ai_training.main_topics
        } : undefined,
        mese: meseAttuale,
        numeroPost
      });
      setCalendarResult(output);
      setStep(2);
    } catch (e) {
      toast({ variant: 'destructive', title: "Errore Strategia AI" });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvaSingle = async () => {
    if (!postResult || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clienti', clienteId, 'post'), {
        titolo: postResult.titolo,
        testo: postResult.testo,
        stato: 'bozza',
        cliente_id: clienteId,
        piattaforme: [platId],
        formato: 'immagine_singola',
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp(),
        versione_corrente: 0,
        storico_stati: [{ stato: 'bozza', autore_uid: user.uid, timestamp: Timestamp.now() }]
      });
      await updateDoc(doc(db, 'clienti', clienteId), { post_usati: increment(1) });
      toast({ title: "Bozza Salvata" });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSalvaCalendar = async () => {
    if (!calendarResult || !user) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const postsCol = collection(db, 'clienti', clienteId, 'post');
      const now = new Date();
      
      for (const p of calendarResult.posts) {
        const dataPubRef = new Date(now.getFullYear(), now.getMonth(), p.giorno, 10, 0);
        const postRef = doc(postsCol);
        batch.set(postRef, {
          titolo: p.titolo,
          testo: p.testo,
          stato: 'bozza',
          cliente_id: clienteId,
          piattaforme: [p.piattaforma.toLowerCase()],
          data_pubblicazione: Timestamp.fromDate(dataPubRef),
          creato_il: serverTimestamp(),
          aggiornato_il: serverTimestamp(),
          versione_corrente: 0,
          storico_stati: [{ stato: 'bozza', autore_uid: user.uid, timestamp: Timestamp.now() }]
        });
      }
      
      batch.update(doc(db, 'clienti', clienteId), { post_usati: increment(calendarResult.posts.length) });
      await batch.commit();
      toast({ title: "Calendario Importato", description: `${calendarResult.posts.length} post aggiunti alle bozze.` });
      handleClose();
    } catch (e) {
      toast({ variant: 'destructive', title: "Errore salvataggio calendario" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPostResult(null);
    setCalendarResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-600 text-2xl font-headline">
            <Sparkles className="w-6 h-6" /> Strategia AI ADNext
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            {client?.ai_training ? 'L\'AI è addestrata con il DNA del brand.' : 'Consigliato: configura il Brand Training per risultati migliori.'}
          </DialogDescription>
        </DialogHeader>

        {!canGenerate && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <div className="text-xs font-bold uppercase tracking-wider">Crediti post insufficienti nel piano attuale.</div>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-8 py-4">
            <Tabs value={mode} onValueChange={(v: any) => setMode(v)}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="single" className="rounded-lg font-bold">Post Singolo</TabsTrigger>
                <TabsTrigger value="calendar" className="rounded-lg font-bold">Calendario Mensile</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-6 pt-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Piattaforma</Label>
                  <div className="flex flex-wrap gap-2">
                    {PIATTAFORME.map(p => (
                      <Button key={p.id} variant={platId === p.id ? 'default' : 'outline'} size="sm" onClick={() => setPlatId(p.id)} className={platId === p.id ? 'bg-indigo-600 rounded-lg' : 'rounded-lg'}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Argomento del Post</Label>
                  <Input value={argomento} onChange={(e) => setArgomento(e.target.value)} placeholder="Di cosa vogliamo parlare oggi?" className="bg-slate-50 border-slate-200 h-12 rounded-xl" />
                </div>
                <Button onClick={handleGeneraSingle} disabled={!argomento || loading || !canGenerate} className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Wand2 className="w-5 h-5" /> Genera Post Strategico</>}
                </Button>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6 pt-6">
                <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 space-y-2">
                  <h4 className="text-violet-900 font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Pianificazione Mensile</h4>
                  <p className="text-xs text-violet-600 font-medium">L'AI genererà una sequenza di post per coprire l'intero mese corrente basandosi sui pilastri del brand.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Numero di Post da generare</Label>
                  <Input type="number" min="4" max="20" value={numeroPost} onChange={(e) => setNumeroPost(Number(e.target.value))} className="bg-slate-50 border-slate-200 h-12 rounded-xl" />
                </div>
                <Button onClick={handleGeneraCalendar} disabled={loading || !canGenerate} className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Sparkles className="w-5 h-5" /> Genera Strategia Mensile</>}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-6 py-4 animate-in fade-in zoom-in duration-300">
            {mode === 'single' ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <Input value={postResult?.titolo} onChange={(e) => setPostResult(prev => prev ? {...prev, titolo: e.target.value} : null)} className="font-bold border-none bg-transparent text-lg p-0 h-auto focus-visible:ring-0" />
                  <Textarea value={postResult?.testo} onChange={(e) => setPostResult(prev => prev ? {...prev, testo: e.target.value} : null)} className="min-h-[200px] border-none bg-transparent p-0 resize-none focus-visible:ring-0 text-sm leading-relaxed" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setStep(1)}>Indietro</Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-bold" onClick={handleSalvaSingle} disabled={loading}>Salva in Bozze</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {calendarResult?.posts.map((p, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                      <div className="bg-white px-2 py-1 rounded border border-slate-200 text-xs font-black text-violet-600">GIORNO {p.giorno}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900">{p.titolo}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{p.testo}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setStep(1)}>Indietro</Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-bold gap-2" onClick={handleSalvaCalendar} disabled={loading}>
                    <PlusCircle className="w-4 h-4" /> Importa Calendario
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
