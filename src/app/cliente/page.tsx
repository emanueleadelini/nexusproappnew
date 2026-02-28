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
  History, 
  CreditCard, 
  AlertTriangle, 
  FolderOpen,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ShieldCheck,
  Briefcase,
  FileText,
  Download
} from 'lucide-react';
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
        nota: approvato ? "Approvato dal cliente" : "Richiesta revisione dal cliente"
      })
    }).catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'update' })));
    
    toast({ 
      title: approvato ? "Post approvato!" : "Revisione richiesta", 
      description: approvato ? "L'agenzia procederà alla programmazione." : "Usa i commenti per spiegare le modifiche." 
    });
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
            creato_il: serverTimestamp()
          })
        );
        await Promise.all(promises);
      } else {
        await addDoc(matColRef, {
          nome_file: 'Link Esterno Cliente',
          link_esterno: externalLink,
          caricato_da: user.uid,
          ruolo_caricatore: 'cliente',
          destinazione: destinazione,
          stato_validazione: 'in_attesa',
          creato_il: serverTimestamp()
        });
      }
      setSelectedFiles([]);
      setExternalLink('');
      toast({ title: "Asset inviato!", description: "L'agenzia lo validerà a breve." });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: matColRef.path, operation: 'create' }));
    } finally {
      setIsUploading(false);
    }
  };

  if (isClientLoading || !clienteId || !client) return <div className="space-y-6 p-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64" /></div>;

  const postTotali = client?.post_totali || 0;
  const postUsati = posts?.length || 0;
  const usagePercent = (postUsati / (postTotali || 1)) * 100;

  const postsOnSelectedDate = posts?.filter((post: any) => {
    if (!post.data_pubblicazione || !selectedDate || typeof post.data_pubblicazione.toDate !== 'function') return false;
    return post.data_pubblicazione.toDate().toDateString() === selectedDate.toDateString();
  }) || [];

  const daysWithPosts = posts?.filter((p: any) => p.data_pubblicazione && typeof p.data_pubblicazione.toDate === 'function').map((p: any) => p.data_pubblicazione.toDate().toDateString()) || [];
  
  const strategicDocs = materials?.filter(m => m.destinazione === 'strategico' && m.stato_validazione === 'validato') || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center p-2">
            {client.logo_url ? (
              <img src={client.logo_url} alt="Logo Azienda" className="w-full h-full object-contain" />
            ) : (
              <Avatar className="h-full w-full rounded-none">
                <AvatarFallback className="bg-indigo-600 text-white font-bold">{client.nome_azienda?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-gray-900">Area Riservata {client?.nome_azienda}</h1>
            <p className="text-muted-foreground">Monitora il tuo piano editoriale strategico.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {haPermesso('upload_materiali') && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 flex-1 md:flex-none">
                  <Upload className="w-4 h-4" /> Invia Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Invia materiale all'agenzia</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                   <Tabs value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">File Locale</TabsTrigger>
                        <TabsTrigger value="link">Link Esterno</TabsTrigger>
                      </TabsList>
                      <TabsContent value="file" className="pt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="hidden" multiple />
                        <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2"/>
                        <p className="text-xs text-gray-400">{selectedFiles.length > 0 ? `${selectedFiles.length} file pronti` : "Trascina o clicca (Max 50MB)"}</p>
                      </TabsContent>
                      <TabsContent value="link" className="pt-4">
                        <Input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="Link WeTransfer / Drive" />
                      </TabsContent>
                   </Tabs>
                   <Select value={destinazione} onValueChange={(v: any) => setDestinazione(v)}>
                     <SelectTrigger><SelectValue placeholder="Destinazione asset"/></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="social">Social Media</SelectItem>
                       <SelectItem value="sito">Sito Web</SelectItem>
                     </SelectContent>
                   </Select>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-xl shadow-md overflow-hidden border-indigo-100">
            <CardHeader className="bg-indigo-600 text-white">
              <CardTitle className="text-lg font-headline flex items-center gap-2"><CreditCard className="w-5 h-5" /> Piano Post Mensile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post Rimanenti</span>
                <div className="text-5xl font-bold text-gray-900 mt-1">{Math.max(0, postTotali - postUsati)} / {postTotali}</div>
              </div>
              <Progress value={usagePercent} className="h-2" />
              {haPermesso('richiesta_upgrade') && client && !client.richiesta_upgrade && (
                <Button variant="link" onClick={() => updateDoc(doc(db, 'clienti', clienteId!), { richiesta_upgrade: true })} className="w-full text-indigo-600 font-bold">
                  Richiedi Post Extra <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md overflow-hidden border-gray-100">
            <CardHeader className="bg-gray-900 text-white">
               <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Area Strategica</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-gray-100">
                  {[
                    { id: 'piano_strategico', label: 'Piano Strategico', icon: ShieldCheck, color: 'text-indigo-600' },
                    { id: 'piano_comunicazione', label: 'Piano Comunicazione', icon: FileText, color: 'text-blue-600' },
                    { id: 'business_plan', label: 'Business Plan', icon: Briefcase, color: 'text-emerald-600', restricted: !client.include_business_plan },
                    { id: 'business_model', label: 'Business Model', icon: PieChart, color: 'text-violet-600', restricted: !client.include_business_model },
                  ].map(type => {
                    const doc = strategicDocs.find(d => d.tipo_strategico === type.id);
                    return (
                      <div key={type.id} className={`p-4 flex items-center justify-between group ${type.restricted ? 'opacity-30' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <type.icon className={`w-5 h-5 ${type.color}`} />
                          <div>
                             <p className="text-xs font-bold leading-none">{type.label}</p>
                             <p className="text-[9px] text-gray-400 uppercase mt-1">{doc ? 'Disponibile' : type.restricted ? 'Non nel pacchetto' : 'In lavorazione'}</p>
                          </div>
                        </div>
                        {doc && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" asChild>
                             <a href={doc.link_esterno || '#'} target="_blank" rel="noreferrer"><Download className="w-4 h-4" /></a>
                          </Button>
                        )}
                      </div>
                    );
                  })}
               </div>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl border-gray-200">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              modifiers={{ hasPost: (date) => daysWithPosts.includes(date.toDateString()) }}
              modifiersClassNames={{ hasPost: "bg-indigo-100 text-indigo-900 font-bold" }}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-headline font-bold">Instagram Preview Feed</h2>
          {isPostsLoading ? <Skeleton className="h-48" /> : postsOnSelectedDate.length > 0 ? (
            <div className="space-y-8 max-w-[500px] mx-auto">
              {postsOnSelectedDate.map((post: any, index: number) => {
                const material = materials?.find(m => m.id === post.materiale_id);
                const formattedDate = post.data_pubblicazione && typeof post.data_pubblicazione.toDate === 'function'
                  ? post.data_pubblicazione.toDate().toLocaleString('it-IT', { day: 'numeric', month: 'long' })
                  : 'Prossimamente';
                
                const placeholder = PlaceHolderImages.filter(img => img.id.startsWith('post-'))[index % 3];
                const imageSrc = material?.url_storage || placeholder?.imageUrl;

                return (
                  <Card key={post.id} className="rounded-xl border-gray-200 overflow-hidden bg-white shadow-sm border-none sm:border">
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          {client.logo_url ? <AvatarImage src={client.logo_url} /> : <AvatarFallback>{client.nome_azienda?.charAt(0)}</AvatarFallback>}
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold leading-none">{client?.nome_azienda}</span>
                          <span className="text-[10px] text-gray-500">{PIATTAFORMA_LABELS[post.piattaforma || 'instagram']}</span>
                        </div>
                      </div>
                      <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} text-[10px] px-2 py-0 h-5`}>
                        {STATO_POST_LABELS[post.stato]}
                      </Badge>
                    </div>

                    <div className="aspect-square bg-gray-50 relative group">
                      {imageSrc ? (
                        <Image src={imageSrc} alt={post.titolo} fill className="object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300">
                          <ImageIcon className="w-12 h-12 mb-2"/>
                          <span className="text-[10px] uppercase font-bold">In attesa di asset</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <Heart className="w-6 h-6 hover:text-red-500 cursor-pointer transition-colors" />
                          <MessageCircle className="w-6 h-6 hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => setPostPerCommenti(post.id)} />
                          <Send className="w-6 h-6" />
                        </div>
                        <Bookmark className="w-6 h-6" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-bold">{client?.nome_azienda} <span className="font-normal ml-1">{post.titolo}</span></p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.testo}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{formattedDate}</p>
                      </div>
                    </div>

                    {haPermesso('approvazione_post') && post.stato === 'da_approvare' && (
                      <CardFooter className="p-3 bg-gray-50/50 border-t flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-100 hover:bg-red-50 font-bold h-9" onClick={() => handleApprovazione(post.id, false)}>
                          <X className="w-4 h-4 mr-1" /> Revisione
                        </Button>
                        <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold h-9" onClick={() => handleApprovazione(post.id, true)}>
                          <Check className="w-4 h-4 mr-1" /> Approva Post
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 italic">Nessun post previsto per questa data.</p>
            </div>
          )}
        </div>
      </div>

      {postPerCommenti && clienteId && <CommentiSidebar clienteId={clienteId} postId={postPerCommenti} isOpen={!!postPerCommenti} onClose={() => setPostPerCommenti(null)} />}
    </div>
  );
}
