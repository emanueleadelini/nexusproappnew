'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { query, collection, where, orderBy, limit, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Bell, Check, Clock, MessageSquare, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Notifica, TipoNotifica } from '@/types/notifica';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function NotificheBell() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'notifiche'),
      where('destinatario_uid', '==', user.uid),
      orderBy('creato_il', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: notifications } = useCollection<Notifica>(notificationsQuery);
  const unreadCount = notifications?.filter(n => !n.letta).length || 0;

  const handleNotificationClick = async (notification: Notifica) => {
    const notificaRef = doc(db, 'notifiche', notification.id);
    
    if (!notification.letta) {
      updateDoc(notificaRef, { 
        letta: true,
        letta_il: serverTimestamp() 
      }).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: notificaRef.path,
          operation: 'update',
          requestResourceData: { letta: true }
        }));
      });
    }

    if (notification.riferimento_tipo === 'post' && notification.cliente_id) {
      // Determina il percorso base in base al ruolo dell'utente (admin o cliente)
      const path = window.location.pathname.startsWith('/admin') ? '/admin' : '/cliente';
      router.push(`${path}/clienti/${notification.cliente_id}?postId=${notification.riferimento_id}`);
    }
  };

  const getIcon = (tipo: TipoNotifica) => {
    switch (tipo) {
      case 'commento_nuovo': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'post_da_approvare': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'post_approvato': return <Check className="w-4 h-4 text-emerald-500" />;
      case 'post_revisione': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'materiale_caricato': return <FileText className="w-4 h-4 text-indigo-500" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border-2 border-white text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-gray-100 rounded-xl overflow-hidden">
        <DropdownMenuLabel className="p-4 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
          <span className="font-headline font-bold text-sm text-gray-900">Centro Notifiche</span>
          {unreadCount > 0 && (
            <Badge variant="outline" className="text-[9px] border-indigo-200 text-indigo-600 font-bold uppercase tracking-tighter">
              {unreadCount} nuove
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={`p-4 cursor-pointer focus:bg-indigo-50/40 transition-all border-b border-gray-50 last:border-none ${!n.letta ? 'bg-indigo-50/10' : ''}`}
              >
                <div className="flex gap-3 items-start w-full">
                  <div className="mt-1 shrink-0 p-2 bg-white rounded-lg shadow-sm border border-gray-50">
                    {getIcon(n.tipo)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className={`text-[11px] leading-snug break-words ${!n.letta ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {n.messaggio}
                    </p>
                    <p className="text-[9px] text-gray-400 flex items-center gap-1 font-medium">
                      <Clock className="w-2.5 h-2.5" />
                      {n.creato_il && typeof n.creato_il.toDate === 'function' 
                        ? formatDistanceToNow(n.creato_il.toDate(), { addSuffix: true, locale: it }) 
                        : 'poco fa'}
                    </p>
                  </div>
                  {!n.letta && <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0 animate-pulse" />}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-2">
              <Bell className="w-8 h-8 text-gray-200" />
              <p className="text-xs text-gray-400 italic">Non hai ancora ricevuto notifiche.</p>
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <Button variant="ghost" className="w-full text-[10px] font-bold uppercase text-indigo-600 h-10 rounded-none hover:bg-indigo-50">
          Mostra tutte le notifiche
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}