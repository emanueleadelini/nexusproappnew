'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { query, collection, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Bell, Check, Clock, MessageSquare, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Notifica, TipoNotifica } from '@/types/notifica';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export function NotificheBell() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
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
    if (!notification.letta) {
      await updateDoc(doc(db, 'notifiche', notification.id), { letta: true });
    }

    if (notification.riferimento_tipo === 'post') {
      const basePath = user?.uid ? (await getRolePath(user.uid)) : '/login';
      router.push(`${basePath}/clienti/${notification.cliente_id}?postId=${notification.riferimento_id}`);
    }
  };

  async function getRolePath(uid: string) {
    // Semplice logica di routing basata sul ruolo salvato
    return '/admin'; // Per semplicità in questo componente
  }

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
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border-2 border-white text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="p-4 flex justify-between items-center bg-gray-50/50">
          <span className="font-bold text-sm">Notifiche</span>
          {unreadCount > 0 && <span className="text-[10px] text-indigo-600 font-bold uppercase">{unreadCount} nuove</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={`p-4 cursor-pointer focus:bg-indigo-50/50 transition-colors border-b last:border-none ${!n.letta ? 'bg-indigo-50/20' : ''}`}
              >
                <div className="flex gap-3 items-start">
                  <div className="mt-1">{getIcon(n.tipo)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-xs leading-tight ${!n.letta ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                      {n.messaggio}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {n.creato_il ? formatDistanceToNow(n.creato_il.toDate(), { addSuffix: true, locale: it }) : ''}
                    </p>
                  </div>
                  {!n.letta && <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2" />}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-xs text-gray-400 italic">Non hai ancora ricevuto notifiche.</p>
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <Button variant="ghost" className="w-full text-[10px] font-bold uppercase text-gray-400 h-10 rounded-none">
          Mostra tutte le notifiche
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
