'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { usePermessi } from '@/hooks/use-permessi';
import { collectionGroup, query, orderBy, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  LayoutGrid,
  Share2,
  ArrowRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { STATO_POST_LABELS, STATO_POST_COLORS, PIATTAFORMA_LABELS, Post } from '@/types/post';

export default function AdminGlobalPostPage() {
  const { user } = useUser();
  const { isAdmin } = usePermessi();
  const db = useFirestore();
  const [filterStato, setFilterStato] = useState<string | null>(null);

  const postsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    let q = query(collectionGroup(db, 'post'), orderBy('creato_il', 'desc'), limit(50));
    if (filterStato) {
      q = query(collectionGroup(db, 'post'), where('stato', '==', filterStato), orderBy('creato_il', 'desc'), limit(50));
    }
    return q;
  }, [db, user, isAdmin, filterStato]);

  const { data: posts, isLoading } = useCollection<Post>(postsQuery);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-12 w-64 bg-white/5" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white mb-2">Monitoraggio Post</h1>
          <p className="text-slate-400 text-sm">Visione globale di tutti i workflow attivi nell'Hub.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={!filterStato ? 'default' : 'outline'} 
            onClick={() => setFilterStato(null)}
            className="h-10 text-[10px] font-black uppercase tracking-widest"
          >
            Tutti
          </Button>
          <Button 
            variant={filterStato === 'da_approvare' ? 'default' : 'outline'} 
            onClick={() => setFilterStato('da_approvare')}
            className="h-10 text-[10px] font-black uppercase tracking-widest border-amber-500/20 text-amber-500"
          >
            In Approvazione
          </Button>
        </div>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {posts?.map((post) => (
              <div key={post.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className={`w-3 h-3 rounded-full ${STATO_POST_COLORS[post.stato].bg} border border-white/10`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} border-none text-[9px] font-black uppercase`}>
                        {STATO_POST_LABELS[post.stato]}
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> {PIATTAFORMA_LABELS[post.piattaforma] || post.piattaforma}
                      </span>
                    </div>
                    <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors">{post.titolo}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.creato_il?.toDate().toLocaleDateString()}
                      </span>
                      {post.scadenza_approvazione && post.stato === 'da_approvare' && (
                        <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Scadenza: {post.scadenza_approvazione.toDate().toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Link href={`/admin/clienti/${(post as any).cliente_id}?postId=${post.id}`}>
                    <Button variant="ghost" className="h-9 text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/10 rounded-lg">
                      Apri Task <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {(!posts || posts.length === 0) && (
              <div className="p-20 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
                <p className="text-slate-500 italic">Nessun post trovato con questi criteri.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}