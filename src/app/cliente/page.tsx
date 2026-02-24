'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, addDoc, getDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS, PIATTAFORMA_LABELS } from '@/types/post';
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, getFileTypeInfo, Material, DestinazioneAsset } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Upload, ArrowUpRight, Check, Loader2, UploadCloud, X, CalendarDays, Clock, PieChart, Image as ImageIcon, Link as LinkIcon, ExternalLink, MessageSquare, History } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommentiSidebar } from '@/components/commenti-sidebar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePermessi } from '@/hooks/use-permessi';
import { useSearchParams } from 'next/navigation';

export default function ClienteDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { haPermesso } = usePermessi();
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('postId');
  
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [externalLink, setExternalLink] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [destinazione, setDestinazione] = useState<DestinazioneAsset>('social');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [postPerCommenti, setPostPerCommenti] = useState<string | null>(null);
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

  useEffect(() => {
    if (postIdFromUrl) setPostPerCommenti(postIdFromUrl);
  }, [postIdFromUrl]);

  const clientDocRef = useMemoFirebase(() => clienteId ? doc(db, 'clienti', clienteId) : null, [db, clienteId]);
  const { data: client, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    return clienteId ? query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc')) : null;
  }, [db, clienteId]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<any>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    return clienteId ? query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc')) : null;
  }, [db, clienteId]);
  const { data: materials, isLoading: isMaterialsLoading } = useCollection<Material>(materialsQuery);

  const handleApprovazione = (postId: string, approvato: boolean) => {
    if (!clienteId || !user) return;
    const postRef = doc(db, 'clienti', clienteId, 'post', postId);
    const nuovoStato = approvato ? 'approvato' : 'revisione';
    
    updateDoc(postRef, { 
      stato: nuovoStato, 
      aggiornato_il: serverTimestamp(),
      storico_stati: arrayUnion({
        stato: nuovoStato,
        autore_uid: user.uid,
        timestamp: Timestamp.now(),
        nota: approvato ? "Approvato dal cliente" : "Revisione richiesta tramite feedback"
      })
    }).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'update' }));
    });
    
    toast({ 
      title: approvato ? "Post approvato!" : "Richiesta revisione", 
      description: approvato ? "L'agenzia procederà alla programmazione." : "Usa la sidebar dei commenti per specificare le modifiche." 
    });
    
    if (!approvato) setPostPerCommenti(postId);
  };

  const handleUpload = async () => {
    if (!clienteId || !user) return;
    setIsUploading(true);
    const matColRef = collection(db, 'clienti', clienteId, 'materiali');
    
    try {
      if (uploadType === 'file') {
        const promises = selectedFiles.map(file => 
          addDoc(matColRef, {
            nome_file: file.name,
            url_storage: null,
            caricato_da: user.uid,
            ruolo_caricatore: 'cliente',
            destinazione: destinazione,
            stato_validazione: 'in_attesa',
            note_rifiuto: null,
            creato_il: serverTimestamp()
          })
        );
        await Promise.all(promises);
      } else {
        await addDoc(matColRef, {
          nome_file: 'Link Esterno Cliente',
          url_storage: null,
          link_esterno: externalLink,
          caricato_da: user.uid,
          ruolo_caricatore: 'cliente',
          destinazione: destinazione,
          stato_validazione: 'in_attesa',
          note_rifiuto: null,
          creato_il: serverTimestamp()
        });
      }
      setSelectedFiles([]);
      setExternalLink('');
      toast({ title: "Materiale inviato!", description: "L'agenzia lo validerà a breve." });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: matColRef.path, operation: 'create' }));
    } finally {
      setIsUploading(false);
    }
  };

  if (isClientLoading || !clienteId) return <div className="space-y-6 p-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64" /></div>;

  const postTotali = client.post_totali || 0;
  const postUsati = posts?.length || 0;
  const usagePercent = postTotali > 0 ? (postUsati / postTotali) * 100 : 0;

  const postsOnSelectedDate = posts?.filter((post: any) => {
    if (!post.data_pubblicazione || !selectedDate || typeof post.data_pubblicazione.toDate !== 'function') return false;
    const pubDate = post.data_pubblicazione.toDate();
    return pubDate.toDateString() === selectedDate.toDateString();
  }) || [];

  const daysWithPosts = posts?.filter((p: any) => p.data_pubblicazione && typeof p.data_pubblicazione.toDate === 'function').map((p: any) => p.data_pubblicazione.toDate().toDateString()) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gray-900">Area Clienti AD next lab</h1>
          <p className="text-muted-foreground">Benvenuto, {client.nome_azienda}.</p>
        </div>
        {haPermesso('upload_materiali') && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 w-full md:w-auto h-12">
                <Upload className="w-4 h-4" /> Invia nuovo Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invia materiale all'agenzia</DialogTitle>
                <DialogDescription>Limite 50MB per file. Usa i link per file più pesanti.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Tabs value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">File Locale</TabsTrigger>
                    <TabsTrigger value="link">Link Esterno</TabsTrigger>
                  </TabsList>
                  <TabsContent value="file" className="pt-4">
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                      <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="hidden" multiple />
                      <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500">{selectedFiles.length > 0 ? `${selectedFiles.length} file selezionati` : "Clicca per caricare (max 50MB)"}</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="link" className="pt-4">
                    <Input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="Link WeTransfer / Drive / Dropbox" />
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-indigo-600">
                  {isUploading ? <Loader2 className="animate-spin" /> : 'Invia Materiale'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <CardHeader className="bg-indigo-600 text-white">
              <CardTitle className="text-lg font-headline flex items-center gap-2"><PieChart className="w-5 h-5" /> Piano Post Mensile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post Rimanenti</span>
                <div className="text-5xl font-bold text-gray-900 mt-1">{Math.max(0, postTotali - postUsati)} / {postTotali}</div>
              </div>
              <Progress value={usagePercent} className="h-2" />
              {haPermesso('richiesta_upgrade') && !client.richiesta_upgrade && (
                <Button variant="link" onClick={() => updateDoc(doc(db, 'clienti', clienteId), { richiesta_upgrade: true })} className="w-full text-indigo-600 font-bold">
                  Richiedi Post Extra <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-xl border bg-white p-4"
            modifiers={{ hasPost: (date) => daysWithPosts.includes(date.toDateString()) }}
            modifiersClassNames={{ hasPost: "bg-indigo-100 text-indigo-900 font-bold" }}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-headline font-bold">Calendario Editoriale</h2>
          {isPostsLoading ? <Skeleton className="h-48" /> : postsOnSelectedDate.length > 0 ? (
            <div className="space-y-6">
              {postsOnSelectedDate.map((post: any) => {
                const materialAssociato = materials?.find(m => m.id === post.materiale_id);
                return (
                  <Card key={post.id} className="rounded-xl border-gray-200/60 overflow-hidden shadow-sm bg-white">
                    <div className="p-4 flex items-center justify-between border-b">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10"><AvatarFallback className="bg-indigo-600 text-white font-bold">{client.nome_azienda.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm">{client.nome_azienda}</h3>
                            <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} text-[9px]`}>{STATO_POST_LABELS[post.stato]}</Badge>
                          </div>
                          <p className="text-[10px] text-gray-400">Pianificato: {post.data_pubblicazione?.toDate().toLocaleString('it-IT')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" onClick={() => setPostPerCommenti(post.id)} className="text-indigo-600">
                           <MessageSquare className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                    <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap">{post.testo}</div>
                    {materialAssociato && (
                      <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden border-y">
                        {materialAssociato.link_esterno ? (
                          <div className="flex flex-col items-center gap-2">
                            <LinkIcon className="w-8 h-8 text-blue-400" />
                            <a href={materialAssociato.link_esterno} target="_blank" className="text-xs bg-blue-600 text-white px-4 py-1 rounded">Scarica Asset</a>
                          </div>
                        ) : <ImageIcon className="w-12 h-12 text-gray-200" />}
                      </div>
                    )}
                    <CardFooter className="p-3 bg-gray-50 flex justify-end gap-2">
                      <div className="mr-auto flex items-center gap-1 text-[10px] text-gray-400">
                        <History className="w-3 h-3" /> v.{post.versione_corrente + 1}
                      </div>
                      {haPermesso('approvazione_post') && post.stato === 'da_approvare' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-red-600 font-bold" onClick={() => handleApprovazione(post.id, false)}><X className="w-4 h-4 mr-1" /> Revisione</Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => handleApprovazione(post.id, true)}><Check className="w-4 h-4 mr-1" /> Approva Post</Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed text-gray-400">Nessun post per questa data.</div>}
        </div>
      </div>

      {postPerCommenti && (
        <CommentiSidebar 
          clienteId={clienteId} 
          postId={postPerCommenti} 
          isOpen={!!postPerCommenti} 
          onClose={() => setPostPerCommenti(null)} 
        />
      )}
    </div>
  );
}
