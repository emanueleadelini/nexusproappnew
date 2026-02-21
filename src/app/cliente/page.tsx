'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS } from '@/types/post';
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, getFileTypeInfo, DESTINAZIONE_LABELS, DESTINAZIONE_ICONS, DestinazioneMateriale } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CalendarCheck, Upload, HelpCircle, ArrowUpRight, Check, FileText, Info, Loader2, User, ShieldCheck, Share2, Globe, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ClienteDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [destinazione, setDestinazione] = useState<DestinazioneMateriale>('social');
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

  const approvePost = async (postId: string) => {
    if (!clienteId) return;
    const ref = doc(db, 'clienti', clienteId, 'post', postId);
    await updateDoc(ref, { stato: 'approvato', aggiornato_il: new Date().toISOString() });
    toast({ title: "Post approvato!", description: "L'agenzia procederà alla pubblicazione." });
  };

  const handleUpload = async () => {
    if (!clienteId || !newFileName || !user) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
        nome_file: newFileName,
        url_storage: null,
        caricato_da: user.uid,
        ruolo_caricatore: 'cliente',
        stato_validazione: 'in_attesa',
        destinazione: destinazione,
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

  const usagePercent = client.post_totali > 0 ? (client.post_usati / client.post_totali) * 100 : 0;

  // Raggruppamento materiali per data per visualizzazione a calendario
  const groupedMaterials = materials?.reduce((acc: any, mat: any) => {
    const date = new Date(mat.creato_il).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(mat);
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gray-900">Ciao, {client.nome_azienda}</h1>
          <p className="text-muted-foreground">Ecco la situazione aggiornata delle tue attività.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 w-full md:w-auto h-12">
              <Upload className="w-4 h-4" /> Invia Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invia materiale all'agenzia</DialogTitle>
              <DialogDescription>Specifica il tipo di file e la sua destinazione d'uso.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">Nome File / Descrizione</Label>
                <Input id="fileName" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="es. Foto evento Natale.jpg" />
              </div>
              <div className="space-y-2">
                <Label>Destinazione d'uso</Label>
                <Select value={destinazione} onValueChange={(v: DestinazioneMateriale) => setDestinazione(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona destinazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="sito">Sito Web</SelectItem>
                    <SelectItem value="offline">Grafica Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={!newFileName || isUploading} className="w-full">
                {isUploading ? <Loader2 className="animate-spin" /> : 'Invia ora'}
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
                <CalendarCheck className="w-5 h-5" /> Crediti Post
              </CardTitle>
              <CardDescription className="text-indigo-100">Post disponibili nel piano</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-sm font-medium text-gray-500">Post Rimanenti</span>
                 <span className="text-3xl font-bold text-gray-900">{client.post_totali - client.post_usati} / {client.post_totali}</span>
              </div>
              <Progress value={usagePercent} className={`h-3 ${usagePercent > 80 ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-600'}`} />
              <Button variant="link" className="w-full text-indigo-600 p-0 flex items-center justify-center gap-1">
                Richiedi Post Extra <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-12">
          {/* Calendario PED */}
          <div className="space-y-4">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-500" /> Piano Editoriale (PED)
            </h2>
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
                    <CardContent>
                      <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-600">"{post.testo}"</p>
                    </CardContent>
                    {post.stato === 'da_approvare' && (
                      <CardFooter className="pt-0 flex justify-end">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => approvePost(post.id)}>
                          <Check className="w-4 h-4" /> Approva Post
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-sm">Nessun post programmato.</p>
            )}
          </div>

          {/* Calendario Asset */}
          <div className="space-y-6">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" /> Archivio Asset Giornaliero
            </h2>
            {isMaterialsLoading ? <Skeleton className="h-64" /> : groupedMaterials && Object.keys(groupedMaterials).length > 0 ? (
              Object.keys(groupedMaterials).map(date => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border">{date}</h3>
                    <div className="h-px bg-gray-100 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groupedMaterials[date].map((mat: any) => {
                      const typeInfo = getFileTypeInfo(mat.nome_file);
                      const DestIcon = DESTINAZIONE_ICONS[mat.destinazione as keyof typeof DESTINAZIONE_ICONS] || FileText;
                      return (
                        <Card key={mat.id} className="rounded-xl border-gray-200/50 shadow-sm hover:border-indigo-200 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 ${typeInfo.bg} rounded-lg`}>
                                <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
                              </div>
                              <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 gap-1 border-indigo-100">
                                <DestIcon className="w-3 h-3" /> {DESTINAZIONE_LABELS[mat.destinazione as keyof typeof DESTINAZIONE_LABELS]}
                              </Badge>
                            </div>
                            <p className="font-semibold text-sm truncate" title={mat.nome_file}>{mat.nome_file}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {mat.ruolo_caricatore === 'admin' ? <ShieldCheck className="w-3 h-3 text-violet-500" /> : <User className="w-3 h-3 text-indigo-500" />}
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                                {mat.ruolo_caricatore === 'admin' ? 'Nexus Agency' : 'Caricato da te'}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <Badge className={`${STATO_VALIDAZIONE_COLORS[mat.stato_validazione as StatoValidazione].bg} ${STATO_VALIDAZIONE_COLORS[mat.stato_validazione as StatoValidazione].text} border-none text-[10px]`}>
                                {STATO_VALIDAZIONE_LABELS[mat.stato_validazione as StatoValidazione]}
                              </Badge>
                            </div>
                            {mat.stato_validazione === 'rifiutato' && mat.note_rifiuto && (
                              <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                <strong>Feedback:</strong> {mat.note_rifiuto}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50/50 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground text-sm">Nessun materiale condiviso.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
