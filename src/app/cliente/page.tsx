'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS } from '@/types/post';
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, getFileTypeInfo } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CalendarCheck, Upload, ArrowUpRight, Check, Loader2, User, UploadCloud, X, FileIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function ClienteDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    await updateDoc(ref, { 
      stato: 'approvato', 
      aggiornato_il: serverTimestamp() 
    });
    toast({ title: "Post approvato!", description: "L'agenzia procederà alla pubblicazione." });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!clienteId || !selectedFile || !user) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, 'clienti', clienteId, 'materiali'), {
        nome_file: selectedFile.name,
        url_storage: null,
        caricato_da: user.uid,
        stato_validazione: 'in_attesa',
        note_rifiuto: null,
        creato_il: serverTimestamp()
      });
      resetUploadForm();
      toast({ title: "Materiale inviato!", description: "Il team Nexus lo validerà a breve." });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isClientLoading || !clienteId) return <div className="space-y-6 p-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64" /></div>;
  if (!client) return <div className="p-8">Errore caricamento dati cliente.</div>;

  const usagePercent = client.post_totali > 0 ? (client.post_usati / client.post_totali) * 100 : 0;

  const groupedMaterials = materials?.reduce((acc: any, mat: any) => {
    const date = mat.creato_il?.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) || 'Data non disponibile';
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
        <Dialog onOpenChange={(open) => { if (!open) resetUploadForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 w-full md:w-auto h-12">
              <Upload className="w-4 h-4" /> Invia Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invia materiale all'agenzia</DialogTitle>
              <DialogDescription>Seleziona il file da caricare nel tuo archivio.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>File da caricare</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${selectedFile ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
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
                      <UploadCloud className="w-10 h-10 text-gray-300" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Seleziona o trascina un file</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full bg-indigo-600 h-11">
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
              <CardTitle className="text-xl font-headline flex items-center gap-2">Crediti Post</CardTitle>
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
          <div className="space-y-4">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">Piano Editoriale (PED)</h2>
            {isPostsLoading ? <Skeleton className="h-48" /> : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <Card key={post.id} className="rounded-xl border-gray-200/50 shadow-sm transition-all hover:border-indigo-200">
                    <CardHeader className="pb-3 flex flex-row justify-between items-start space-y-0">
                      <div>
                        <CardTitle className="text-lg font-headline font-semibold">{post.titolo}</CardTitle>
                        <CardDescription className="text-xs">Programmato per il {post.data_pubblicazione ? post.data_pubblicazione.toDate().toLocaleDateString() : 'Prossimamente'}</CardDescription>
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

          <div className="space-y-6">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">Archivio Asset</h2>
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
                      return (
                        <Card key={mat.id} className="rounded-xl border-gray-200/50 shadow-sm hover:border-indigo-200 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 ${typeInfo.bg} rounded-lg`}><typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} /></div>
                            </div>
                            <p className="font-semibold text-sm truncate" title={mat.nome_file}>{mat.nome_file}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-3 h-3 text-indigo-500" />
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                                UID Caricatore: {mat.caricato_da?.substring(0, 8)}...
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
