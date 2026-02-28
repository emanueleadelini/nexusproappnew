'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, addDoc, getDoc, serverTimestamp, arrayUnion, Timestamp, increment } from 'firebase/firestore';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS, PIATTAFORMA_LABELS } from '@/types/post';
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, getFileTypeInfo, Material, DestinazioneAsset } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  ArrowUpRight, 
  Check, 
  Loader2, 
  X, 
  CalendarDays, 
  Clock, 
  PieChart, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  MessageSquare, 
  CreditCard, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  FileText, 
  Download,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Zap,
  Timer,
  LayoutGrid
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommentiSidebar } from '@/components/commenti-sidebar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePermessi } from '@/hooks/use-permessi';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarioVisuale } from '@/components/admin/calendario-visuale';

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
  const [postPerCommenti, setPostPerCommenti] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) setClienteId(userDoc.data().cliente_id);
        } catch (e) {}
      };
      fetchProfile();
    }
  }, [user, db]);

  useEffect(() => {
    if (postIdFromUrl) setPostPerCommenti(postIdFromUrl);
  }, [postIdFromUrl]);

  const clientDocRef = useMemoFirebase(() => {
    if (!user || !clienteId) return null;
    return doc(db, 'clienti', clienteId);
  }, [db, clienteId, user]);
  const { data: client, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    if (!user || !clienteId) return null;
    return query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc'));
  }, [db, clienteId, user]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<any>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    if (!user || !clienteId) return null;
    return query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc'));
  }, [db, clienteId, user]);
  const { data: materials } = useCollection<Material>(materialsQuery);

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
        nota: approvato ? "Approvato dal cliente (Silenzio Assenso evitato)" : "Revisione richiesta dal cliente"
      })
    }).catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'update' })));
    
    toast({ title: approvato ? "Post approvato!" : "Revisione richiesta" });
  };

  const handleUpload = async () => {
    if (!clienteId || !user) return;
    setIsUploading(true);
    const matColRef = collection(db, 'clienti', clienteId, 'materiali');
    try {
      if (uploadType === 'file') {
        await Promise.all(selectedFiles.map(file => addDoc(matColRef, {
          nome_file: file.name,
          url_storage: null,
          caricato_da: user.uid,
          ruolo_caricatore: 'cliente',
          destinazione,
          stato_validazione: 'in_attesa',
          creato_il: serverTimestamp()
        })));
      } else {
        await addDoc(matColRef, {
          nome_file: 'Link Esterno Cliente',
          link_esterno: externalLink,
          caricato_da: user.uid,
          ruolo_caricatore: 'cliente',
          destinazione,
          stato_validazione: 'in_attesa',
          creato_il: serverTimestamp()
        });
      }
      setSelectedFiles([]);
      setExternalLink('');
      toast({ title: "Asset inviato!" });
    } finally {
      setIsUploading(false);
    }
  };

  if (isClientLoading || !clienteId || !client) return <div className="space-y-6 p-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64" /></div>;

  const postTotali = client?.post_totali || 0;
  const postUsati = posts?.length || 0;
  const usagePercent = (postUsati / (postTotali || 1)) * 100;

  const strategicDocs = materials?.filter(m => m.destinazione === 'strategico' && m.stato_validazione === 'validato') || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header e Sidebar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center p-2">
            {client.logo_url ? <img src={client.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <AvatarFallback className="bg-indigo-600 text-white">{client.nome_azienda?.charAt(0)}</AvatarFallback>}
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">Area Riservata {client?.nome_azienda}</h1>
            <p className="text-muted-foreground">Strategia & Pianificazione Real-time</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600"><Upload className="w-4 h-4 mr-2" /> Invia Asset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invia Materiale</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Tabs value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="file">File</TabsTrigger><TabsTrigger value="link">Link</TabsTrigger></TabsList>
                <TabsContent value="file" className="pt-4 border-2 border-dashed rounded-xl p-8 text-center" onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="hidden" multiple />
                  <p className="text-xs text-gray-400">{selectedFiles.length > 0 ? `${selectedFiles.length} file pronti` : "Clicca per caricare"}</p>
                </TabsContent>
                <TabsContent value="link" className="pt-4"><Input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="Link Drive/WeTransfer" /></TabsContent>
              </Tabs>
            </div>
            <DialogFooter><Button onClick={handleUpload} disabled={isUploading} className="w-full">Invia Materiale</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          {/* Card Stato Piano */}
          <Card className="rounded-xl border-indigo-100 shadow-md">
            <CardHeader className="bg-indigo-600 text-white"><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="w-5 h-5" /> Piano Mensile</CardTitle></CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Post Rimanenti</span>
                <div className="text-5xl font-bold">{Math.max(0, postTotali - postUsati)} / {postTotali}</div>
              </div>
              <Progress value={usagePercent} className="h-2" />
            </CardContent>
          </Card>

          {/* Area Strategica */}
          <Card className="rounded-xl shadow-md border-gray-100">
            <CardHeader className="bg-gray-900 text-white"><CardTitle className="text-sm uppercase flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Strategia</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {['piano_strategico', 'piano_comunicazione', 'business_plan', 'business_model'].map(id => {
                  const hasAccess = id === 'piano_strategico' || id === 'piano_comunicazione' || (id === 'business_plan' && client.include_business_plan) || (id === 'business_model' && client.include_business_model);
                  const doc = strategicDocs.find(d => d.tipo_strategico === id);
                  
                  return (
                    <div key={id} className={`p-4 flex items-center justify-between transition-colors ${!hasAccess ? 'opacity-40 grayscale bg-gray-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold capitalize">{id.replace('_', ' ')}</span>
                      </div>
                      {hasAccess ? (
                        doc ? <Download className="w-4 h-4 text-indigo-600 cursor-pointer" /> : <Clock className="w-4 h-4 text-gray-300" />
                      ) : (
                        <Badge variant="outline" className="text-[8px] uppercase">Upgrade</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="feed">
            <TabsList className="bg-transparent border-b rounded-none h-12 w-full justify-start p-0 mb-6">
              <TabsTrigger value="feed" className="data-[state=active]:border-b-2 border-indigo-600 px-6 font-bold flex gap-2">
                <LayoutGrid className="w-4 h-4" /> Preview Feed
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:border-b-2 border-indigo-600 px-6 font-bold flex gap-2">
                <CalendarDays className="w-4 h-4" /> Calendario Editoriale
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold">Simulazione Instagram</h2>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                  <Timer className="w-3 h-3 mr-1" /> Silenzio Assenso Attivo (24h)
                </Badge>
              </div>

              {isPostsLoading ? <Skeleton className="h-64 w-full" /> : posts && posts.length > 0 ? (
                <div className="space-y-8 max-w-[500px] mx-auto">
                  {posts.filter(p => p.stato !== 'bozza').map((post: any) => {
                    const material = materials?.find(m => m.id === post.materiale_id);
                    const scadenzaStr = post.scadenza_approvazione && typeof post.scadenza_approvazione.toDate === 'function'
                      ? formatDistanceToNow(post.scadenza_approvazione.toDate(), { addSuffix: true, locale: it })
                      : null;
                    
                    const isUrgent = post.stato === 'da_approvare' && scadenzaStr;

                    return (
                      <Card key={post.id} className="rounded-xl border-gray-200 overflow-hidden bg-white shadow-sm">
                        <div className="p-3 flex items-center justify-between border-b">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {client.logo_url ? <AvatarImage src={client.logo_url} /> : <AvatarFallback>{client.nome_azienda?.charAt(0)}</AvatarFallback>}
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold leading-none">{client?.nome_azienda}</span>
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                {post.tipo_pianificazione === 'immediata' ? <Zap className="w-2 h-2 text-amber-500 fill-amber-500" /> : <Clock className="w-2 h-2" />}
                                {post.tipo_pianificazione === 'immediata' ? 'Pubblicazione Immediata' : 'Programmato'}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} text-[9px] uppercase`}>
                            {STATO_POST_LABELS[post.stato]}
                          </Badge>
                        </div>

                        <div className="aspect-square bg-gray-50 relative group">
                          {material?.url_storage ? (
                            <Image src={material.url_storage} alt={post.titolo} fill className="object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                              <ImageIcon className="w-12 h-12 mb-2"/>
                              <span className="text-[10px] uppercase font-bold">In attesa di asset grafico</span>
                            </div>
                          )}
                        </div>

                        <div className="p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Heart className="w-6 h-6 hover:text-red-500 cursor-pointer transition-colors" />
                              <MessageCircle className="w-6 h-6 hover:text-indigo-600 cursor-pointer" onClick={() => setPostPerCommenti(post.id)} />
                              <Send className="w-6 h-6" />
                            </div>
                            <Bookmark className="w-6 h-6" />
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm font-bold">{client?.nome_azienda} <span className="font-normal ml-1">{post.titolo}</span></p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.testo}</p>
                          </div>

                          {isUrgent && (
                            <div className="bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2 text-[10px] font-bold text-red-700 uppercase">
                              <AlertTriangle className="w-3 h-3" /> Scadenza approvazione: {scadenzaStr}
                            </div>
                          )}
                        </div>

                        {haPermesso('approvazione_post') && post.stato === 'da_approvare' && (
                          <CardFooter className="p-3 bg-gray-50 border-t flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-100 font-bold" onClick={() => handleApprovazione(post.id, false)}>
                              <X className="w-4 h-4 mr-1" /> Revisione
                            </Button>
                            <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => handleApprovazione(post.id, true)}>
                              <Check className="w-4 h-4 mr-1" /> Approva
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 italic">Nessun post caricato nel feed.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
               {posts && <CalendarioVisuale clienteId={clienteId} posts={posts} readOnly={true} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {postPerCommenti && clienteId && <CommentiSidebar clienteId={clienteId} postId={postPerCommenti} isOpen={!!postPerCommenti} onClose={() => setPostPerCommenti(null)} />}
    </div>
  );
}
