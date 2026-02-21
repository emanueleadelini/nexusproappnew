'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { Client } from '@/types/client';
import { Post, STATO_POST_LABELS, STATO_POST_COLORS } from '@/types/post';
import { Material, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS } from '@/types/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, FolderOpen, Send, CheckCircle, XCircle, Clock, Sparkles, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { GeneraBozzaModal } from '@/components/admin/genera-bozza-modal';

export default function ClienteDettaglio() {
  const { clienteId } = useParams() as { clienteId: string };
  const db = useFirestore();
  const [isGeneraOpen, setIsGeneraOpen] = useState(false);

  // Data Fetching
  const clientDocRef = useMemoFirebase(() => doc(db, 'clienti', clienteId), [db, clienteId]);
  const { data: client, isLoading: isClientLoading } = useDoc<Client>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    return query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc'));
  }, [db, clienteId]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<Post>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    return query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc'));
  }, [db, clienteId]);
  const { data: materials, isLoading: isMaterialsLoading } = useCollection<Material>(materialsQuery);

  // Actions
  const updatePostState = async (postId: string, newState: string) => {
    const ref = doc(db, 'clienti', clienteId, 'post', postId);
    await updateDoc(ref, { stato: newState, aggiornato_il: new Date().toISOString() });
  };

  const validateMaterial = async (materialId: string, status: 'validato' | 'rifiutato', notes: string | null = null) => {
    const ref = doc(db, 'clienti', clienteId, 'materiali', materialId);
    await updateDoc(ref, { stato_validazione: status, note_rifiuto: notes });
  };

  if (isClientLoading) return <div className="space-y-4"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-64" /></div>;
  if (!client) return <div>Cliente non trovato.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <Link href="/admin" className="text-sm text-indigo-600 hover:underline">← Clienti</Link>
          </div>
          <h1 className="text-4xl font-headline font-bold text-gray-900">{client.nome_azienda}</h1>
          <p className="text-muted-foreground">{client.settore} • {client.email_riferimento}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <Plus className="w-4 h-4" /> Crea Manualmente
          </Button>
          <Button onClick={() => setIsGeneraOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200">
            <Sparkles className="w-4 h-4" /> Genera con AI
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="bg-white border-b border-gray-200 p-0 h-12 w-full justify-start rounded-none mb-6">
          <TabsTrigger value="calendar" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-8 text-sm font-medium">
            <CalendarDays className="w-4 h-4 mr-2" /> Calendario Editoriale
          </TabsTrigger>
          <TabsTrigger value="materials" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-8 text-sm font-medium">
            <FolderOpen className="w-4 h-4 mr-2" /> Materiali & Asset
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {isPostsLoading ? <Skeleton className="h-48" /> : posts && posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map(post => (
                <Card key={post.id} className="rounded-xl border-gray-200/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-headline font-semibold text-lg">{post.titolo}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock className="w-3 h-3 text-gray-400" />
                           <span className="text-xs text-gray-400">
                             {post.data_pubblicazione ? new Date(post.data_pubblicazione).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }) : 'Data non pianificata'}
                           </span>
                        </div>
                      </div>
                      <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} border-none font-medium`}>
                        {STATO_POST_LABELS[post.stato]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 italic border-l-2 border-indigo-100 pl-4 bg-indigo-50/30 p-2 rounded-r">
                      "{post.testo}"
                    </p>
                  </div>
                  <CardFooter className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-end gap-2">
                    {post.stato === 'bozza' && (
                      <Button size="sm" onClick={() => updatePostState(post.id, 'da_approvare')} className="bg-orange-600 hover:bg-orange-700">
                        <Send className="w-3 h-3 mr-2" /> Invia per approvazione
                      </Button>
                    )}
                    {post.stato === 'da_approvare' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updatePostState(post.id, 'bozza')}>Rimetti in bozza</Button>
                        <Button size="sm" onClick={() => updatePostState(post.id, 'approvato')} className="bg-blue-600 hover:bg-blue-700">Approva</Button>
                      </>
                    )}
                    {post.stato === 'approvato' && (
                      <Button size="sm" onClick={() => updatePostState(post.id, 'pubblicato')} className="bg-green-600 hover:bg-green-700">Segna pubblicato</Button>
                    )}
                    {post.stato === 'pubblicato' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4">Completato</Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
              <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-muted-foreground">Nessun post pianificato.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {isMaterialsLoading ? <Skeleton className="h-48" /> : materials && materials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map(mat => (
                <Card key={mat.id} className="rounded-xl border-gray-200/50 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg"><FolderOpen className="w-5 h-5 text-gray-500" /></div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" title={mat.nome_file}>{mat.nome_file}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Caricato il {new Date(mat.creato_il).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge className={`${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].bg} ${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].text} border-none font-medium text-[10px] px-2`}>
                      {STATO_VALIDAZIONE_LABELS[mat.stato_validazione]}
                    </Badge>
                    {mat.stato_validazione === 'rifiutato' && mat.note_rifiuto && (
                      <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{mat.note_rifiuto}</p>
                    )}
                  </div>
                  {mat.stato_validazione === 'in_attesa' && (
                    <div className="p-3 bg-gray-50 border-t flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => validateMaterial(mat.id, 'rifiutato', 'Materiale non conforme.')}>Rifiuta</Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => validateMaterial(mat.id, 'validato')}>Valida</Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
              <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-muted-foreground">Nessun materiale caricato.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GeneraBozzaModal 
        isOpen={isGeneraOpen} 
        onClose={() => setIsGeneraOpen(false)} 
        clienteId={clienteId}
        clienteNome={client.nome_azienda}
        clienteSettore={client.settore || ''}
      />
    </div>
  );
}
