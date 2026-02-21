'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { Post, STATO_POST_LABELS, STATO_POST_COLORS, StatoPost } from '@/types/post';
import { Material, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, StatoValidazione } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CalendarCheck, Upload, HelpCircle, ArrowUpRight, Check, FileText, Info, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ClienteDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setClienteId(userDoc.data().cliente_id);
      };
      fetchProfile();
    }
  }, [user, db]);

  // Data Fetching
  const clientDocRef = useMemoFirebase(() => clienteId ? doc(db, 'clienti', clienteId) : null, [db, clienteId]);
  const { data: client, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    return clienteId ? query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc')) : null;
  }, [db, clienteId]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<any>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    return clienteId ? query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc')) : null;
  }, [db, clienteId]);
  const { data: materials, isLoading: isMaterialsLoading } = useCollection<any>(materialsQuery);

  // Actions
  const approvePost = async (postId: string) => {
    if (!clienteId) return;
    const ref = doc(db, 'clienti', clienteId, 'post', postId);
    await updateDoc(ref, { stato: 'approvato', aggiornato_il: new Date().toISOString() });
    toast({ title: "Post approvato!", description: "L'agenzia procederà ora alla pubblicazione." });
  };

  const handleUpload = async () => {
    if (!clienteId || !newFileName || !user) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
        nome_file: newFileName,
        url_storage: null,
        caricato_da: user.uid,
        stato_validazione: 'in_attesa',
        creato_il: new Date().toISOString()
      });
      setNewFileName('');
      toast({ title: "Materiale inviato!", description: "Il team Nexus lo validerà a breve." });
    } finally {
      setIsUploading(false);
    }
  };

  if (isClientLoading || !clienteId) return <div className="space-y-6 p-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64" /></div>;
  if (!client) return <div className="p-8">Errore caricamento dati cliente.</div>;

  const postRimanenti = client.post_totali - client.post_usati;
  const usagePercent = client.post_totali > 0 ? (client.post_usati / client.post_totali) * 100 : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gray-900">Ciao, {client.nome_azienda}</h1>
          <p className="text-muted-foreground">Ecco la situazione aggiornata del tuo piano editoriale.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 w-full md:w-auto">
              <Upload className="w-4 h-4" /> Carica Materiale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invia un nuovo asset</DialogTitle>
              <DialogDescription>Inserisci il nome del file o del materiale che vuoi inviare all'agenzia.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">Nome File / Descrizione</Label>
                <Input id="fileName" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="es. Foto evento Natale.jpg" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={!newFileName || isUploading}>
                {isUploading ? <Loader2 className="animate-spin" /> : 'Invia Materiale'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-xl border-gray-200/50 shadow-md overflow-hidden">
            <CardHeader className="bg-indigo-600 text-white">
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" /> Saldo Post
              </CardTitle>
              <CardDescription className="text-indigo-100">Rinnovo previsto fine mese</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-sm font-medium text-gray-500">Post Rimanenti</span>
                 <span className="text-3xl font-bold text-gray-900">{postRimanenti} <span className="text-sm font-normal text-gray-400">/ {client.post_totali}</span></span>
              </div>
              <div className="space-y-1">
                <Progress value={usagePercent} className={`h-3 ${usagePercent > 80 ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-600'}`} />
              </div>
              <Button variant="link" className="w-full text-indigo-600 p-0 flex items-center justify-center gap-1">
                Richiedi Post Extra <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-200/50 bg-gray-50">
            <CardContent className="p-4 flex gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-gray-500">Supporto</p>
                <p className="text-sm text-gray-600">Serve aiuto con un post? Contattaci.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-headline font-bold">Calendario Editoriale</h2>
            {isPostsLoading ? <Skeleton className="h-48" /> : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <Card key={post.id} className="rounded-xl border-gray-200/50 shadow-sm transition-all hover:border-indigo-200">
                    <CardHeader className="pb-3 flex flex-row justify-between items-start space-y-0">
                      <div>
                        <CardTitle className="text-lg font-headline font-semibold">{post.titolo}</CardTitle>
                        <CardDescription className="text-xs">Programmato per il {post.data_pubblicazione ? new Date(post.data_pubblicazione).toLocaleDateString() : 'Prossimamente'}</CardDescription>
                      </div>
                      <Badge className={`${STATO_POST_COLORS[post.stato as StatoPost].bg} ${STATO_POST_COLORS[post.stato as StatoPost].text} border-none font-medium text-[10px]`}>
                        {STATO_POST_LABELS[post.stato as StatoPost]}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-600">"{post.testo}"</p>
                    </CardContent>
                    {post.stato === 'da_approvare' && (
                      <CardFooter className="pt-0 flex justify-end">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => approvePost(post.id)}>
                          <Check className="w-4 h-4" /> Approva questo post
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground">Nessun post da visualizzare.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-headline font-bold">I Tuoi Materiali</h2>
            {isMaterialsLoading ? <Skeleton className="h-48" /> : materials && materials.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {materials.map(mat => (
                  <Card key={mat.id} className="rounded-xl border-gray-200/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg"><FileText className="w-5 h-5 text-indigo-600" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{mat.nome_file}</p>
                          <Badge className={`${STATO_VALIDAZIONE_COLORS[mat.stato_validazione as StatoValidazione].bg} ${STATO_VALIDAZIONE_COLORS[mat.stato_validazione as StatoValidazione].text} border-none text-[10px] mt-1`}>
                            {STATO_VALIDAZIONE_LABELS[mat.stato_validazione as StatoValidazione]}
                          </Badge>
                        </div>
                      </div>
                      {mat.stato_validazione === 'rifiutato' && mat.note_rifiuto && (
                        <div className="mt-3 bg-red-50 p-2 rounded border border-red-100 flex gap-2">
                           <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
                           <p className="text-[10px] text-red-700"><strong>Motivo Rifiuto:</strong> {mat.note_rifiuto}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground">Nessun materiale inviato.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
