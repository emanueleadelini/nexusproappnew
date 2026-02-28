
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useMemoFirebase, useCollection, useDoc, useAuth, useUser } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, serverTimestamp, deleteDoc, increment, arrayUnion, Timestamp, getDocs, where } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS, Post } from '@/types/post';
import { Material, getFileTypeInfo, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, DESTINAZIONE_LABELS } from '@/types/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarDays, 
  FolderOpen, 
  Sparkles, 
  ChevronLeft, 
  UploadCloud, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  LayoutGrid, 
  List, 
  ShieldAlert, 
  KeyRound, 
  Download, 
  Plus,
  Loader2,
  History
} from 'lucide-react';
import { useState } from 'react';
import { GeneraBozzaModal } from '@/components/admin/genera-bozza-modal';
import { CreaPostManualeModal } from '@/components/admin/crea-post-manuale-modal';
import { ModificaPostModal } from '@/components/admin/modifica-post-modal';
import { ModificaPianoModal } from '@/components/admin/modifica-piano-modal';
import { CaricaMaterialeModal } from '@/components/admin/carica-materiale-modal';
import { CommentiSidebar } from '@/components/commenti-sidebar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePermessi } from '@/hooks/use-permessi';
import { CalendarioVisuale } from '@/components/admin/calendario-visuale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TRANSIZIONI_PERMESSE: Record<StatoPost, StatoPost[]> = {
  bozza: ["revisione_interna", "da_approvare"],
  revisione_interna: ["bozza", "da_approvare"],
  da_approvare: ["approvato", "revisione"],
  revisione: ["da_approvare"],
  approvato: ["programmato"],
  programmato: ["pubblicato"],
  pubblicato: []
};

export default function ClienteDettaglio() {
  const { clienteId } = useParams() as { clienteId: string };
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { haPermesso } = usePermessi();

  const [isGeneraOpen, setIsGeneraOpen] = useState(false);
  const [isCreaManualeOpen, setIsCreaManualeOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postDaModificare, setPostDaModificare] = useState<Post | null>(null);
  const [postPerCommenti, setPostPerCommenti] = useState<string | null>(null);

  const clientDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'clienti', clienteId);
  }, [db, clienteId, user]);
  const { data: client, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc'));
  }, [db, clienteId, user]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<Post>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc'));
  }, [db, clienteId, user]);
  const { data: materials, isLoading: isMaterialsLoading } = useCollection<Material>(materialsQuery);

  const handleTransizione = (post: Post, nuovoStato: StatoPost) => {
    if (!user) return;
    const postRef = doc(db, 'clienti', clienteId, 'post', post.id);
    const nota = nuovoStato === 'revisione' ? window.prompt("Note per il cliente:") : "";
    
    updateDoc(postRef, { 
      stato: nuovoStato, 
      aggiornato_il: serverTimestamp(),
      storico_stati: arrayUnion({
        stato: nuovoStato,
        autore_uid: user.uid,
        timestamp: Timestamp.now(),
        nota: nota || ""
      })
    }).catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'update' })));
    toast({ title: "Stato aggiornato", description: `Post in ${STATO_POST_LABELS[nuovoStato]}` });
  };

  const handleResetPassword = async () => {
    if (!client?.email_riferimento) {
      toast({ variant: 'destructive', title: "Errore", description: "Email di riferimento non trovata." });
      return;
    }
    setIsResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, client.email_riferimento);
      toast({ title: "Email inviata", description: `Link inviato a ${client.email_riferimento}` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Errore", description: "Impossibile inviare l'email." });
    } finally {
      setIsResetLoading(false);
    }
  };

  const deletePost = (post: Post) => {
    if (!window.confirm("Eliminare definitivamente e riaccreditare?")) return;
    deleteDoc(doc(db, 'clienti', clienteId, 'post', post.id));
    if (post.stato !== 'pubblicato') {
      updateDoc(doc(db, 'clienti', clienteId), { post_usati: increment(-1) });
    }
    toast({ title: "Post eliminato e credito rimborsato" });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        azienda: client,
        post: posts || [],
        materiali: materials || [],
        esportato_il: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${client.nome_azienda}.json`;
      link.click();
      toast({ title: "Backup completato" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('cliente_id', '==', clienteId)));
      const deletePromises = [
        ...usersSnap.docs.map(d => deleteDoc(d.ref)),
        deleteDoc(doc(db, 'clienti', clienteId))
      ];
      await Promise.all(deletePromises);
      router.push('/admin');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isClientLoading) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-1/3"/><Skeleton className="h-64"/></div>;
  if (!client) return <div className="p-8 text-center">Cliente non trovato.</div>;

  const usagePercent = (client.post_usati / (client.post_totali || 1)) * 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/admin" className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-2">
            <ChevronLeft className="w-4 h-4"/> Elenco Clienti
          </Link>
          <h1 className="text-4xl font-headline font-bold">{client.nome_azienda}</h1>
          <p className="text-muted-foreground">{client.settore}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsCreaManualeOpen(true)} className="border-indigo-600 text-indigo-700">
            <Plus className="w-4 h-4 mr-2"/> Nuovo Post
          </Button>
          <Button variant="outline" onClick={() => setIsUploadOpen(true)} className="border-indigo-200 text-indigo-700">
            <UploadCloud className="w-4 h-4 mr-2"/> Carica Asset
          </Button>
          <Button onClick={() => setIsGeneraOpen(true)} className="bg-violet-600 hover:bg-violet-700 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2"/> Genera AI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Tabs defaultValue="visual">
            <TabsList className="bg-transparent border-b rounded-none h-12 w-full justify-start p-0 mb-6">
              <TabsTrigger value="visual" className="data-[state=active]:border-b-2 border-indigo-600 rounded-none h-full px-6">
                <LayoutGrid className="w-4 h-4 mr-2"/> Calendario Visuale
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:border-b-2 border-indigo-600 rounded-none h-full px-6">
                <List className="w-4 h-4 mr-2"/> Elenco Post
              </TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:border-b-2 border-indigo-600 rounded-none h-full px-6">
                <FolderOpen className="w-4 h-4 mr-2"/> Archivio Asset 
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual">
              {posts && <CalendarioVisuale clienteId={clienteId} posts={posts} onAddPost={() => setIsCreaManualeOpen(true)} />}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
               {posts?.map(post => {
                 const formattedDate = post.data_pubblicazione && typeof post.data_pubblicazione.toDate === 'function' 
                   ? post.data_pubblicazione.toDate().toLocaleDateString() 
                   : 'Non definita';
                 
                 return (
                   <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} border-none`}>
                            {STATO_POST_LABELS[post.stato]}
                          </Badge>
                          <span className="text-xs text-gray-400">Pianificato: {formattedDate}</span>
                        </div>
                        <div className="flex gap-1">
                          {post.versioni && post.versioni.length > 0 && (
                            <Badge variant="outline" className="text-[9px] gap-1">
                              <History className="w-2 h-2" /> v{post.versione_corrente + 1}
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setPostPerCommenti(post.id)}><MessageSquare className="w-4 h-4"/></Button>
                          <Button variant="ghost" size="icon" onClick={() => setPostDaModificare(post)}><Edit3 className="w-4 h-4"/></Button>
                          <Button variant="ghost" size="icon" className="text-red-400" onClick={() => deletePost(post)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-bold mb-1">{post.titolo}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.testo}</p>
                      </CardContent>
                      <CardFooter className="bg-gray-50/50 p-3 flex justify-end gap-2">
                         {TRANSIZIONI_PERMESSE[post.stato].map(next => (
                           <Button key={next} size="sm" onClick={() => handleTransizione(post, next)} className={`h-8 text-[10px] font-bold uppercase ${STATO_POST_COLORS[next].bg} ${STATO_POST_COLORS[next].text} border-none`}>
                             Sposta in {STATO_POST_LABELS[next]}
                           </Button>
                         ))}
                      </CardFooter>
                   </Card>
                 );
               })}
            </TabsContent>

            <TabsContent value="assets">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {materials?.map(mat => {
                  const type = getFileTypeInfo(mat.nome_file, !!mat.link_esterno);
                  return (
                    <Card key={mat.id} className="overflow-hidden group">
                      <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center relative">
                        <type.icon className={`w-10 h-10 ${type.color} opacity-40`}/>
                        <span className="text-[10px] mt-2 font-bold uppercase text-gray-400 px-4 truncate">{mat.nome_file}</span>
                      </div>
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-[9px] uppercase">{DESTINAZIONE_LABELS[mat.destinazione]}</Badge>
                          <Badge className={`${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].bg} ${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].text} text-[9px]`}>
                            {STATO_VALIDAZIONE_LABELS[mat.stato_validazione]}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl shadow-md border-indigo-100">
            <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
              <CardTitle className="text-lg font-headline">Stato Piano Post</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residui Mensili</span>
                <div className="text-5xl font-bold font-headline mt-1">{Math.max(0, (client.post_totali || 0) - (client.post_usati || 0))}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Utilizzo</span>
                  <span className={usagePercent > 80 ? 'text-red-600' : 'text-indigo-600'}>{client.post_usati} / {client.post_totali}</span>
                </div>
                <Progress value={usagePercent} className={`h-2 ${usagePercent > 80 ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-600'}`} />
              </div>
              <Button variant="outline" className="w-full text-indigo-600 border-indigo-200" onClick={() => setIsPianoOpen(true)}>Gestisci Crediti</Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-gray-100 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Gestione Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                <Button 
                  variant="outline" size="sm" className="w-full border-gray-200 text-gray-700 h-9 font-bold text-[11px]"
                  onClick={handleResetPassword} disabled={isResetLoading}
                >
                  {isResetLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <KeyRound className="w-3 h-3 mr-2" />}
                  RESET PASSWORD
                </Button>

                <Button 
                  variant="outline" size="sm" className="w-full border-indigo-100 text-indigo-600 h-9 font-bold text-[11px]"
                  onClick={handleExportData} disabled={isExporting}
                >
                  {isExporting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Download className="w-3 h-3 mr-2" />}
                  SCARICA BACKUP (JSON)
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full text-red-600 h-9 font-bold text-[11px] mt-2" disabled={isDeleting}>
                      <Trash2 className="w-3 h-3 mr-2" /> ELIMINA CLIENTE
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Questa azione cancellerà definitamente l'azienda <strong>{client.nome_azienda}</strong> e tutti i relativi dati.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteClient} className="bg-red-600">Elimina Tutto</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <GeneraBozzaModal isOpen={isGeneraOpen} onClose={() => setIsGeneraOpen(false)} clienteId={clienteId} clienteNome={client.nome_azienda} clienteSettore={client.settore || ''} />
      <CreaPostManualeModal isOpen={isCreaManualeOpen} onClose={() => setIsCreaManualeOpen(false)} clienteId={clienteId} />
      <ModificaPostModal isOpen={!!postDaModificare} onClose={() => setPostDaModificare(null)} clienteId={clienteId} post={postDaModificare} />
      <ModificaPianoModal isOpen={isPianoOpen} onClose={() => setIsPianoOpen(false)} clienteId={clienteId} postTotaliAttuali={client.post_totali} />
      <CaricaMaterialeModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} clienteId={clienteId} />
      {postPerCommenti && <CommentiSidebar clienteId={clienteId} postId={postPerCommenti} isOpen={!!postPerCommenti} onClose={() => setPostPerCommenti(null)} />}
    </div>
  );
}
