
'use client';

import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { UserRole, PERMESSI_DEFAULT } from '@/types/user';

export function usePermessi() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [ruolo, setRuolo] = useState<UserRole | null>(null);
  const [permessi, setPermessi] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userRole = data.ruolo as UserRole;
          setRuolo(userRole);
          // Usa i permessi dal documento o quelli di default
          setPermessi(data.permessi || PERMESSI_DEFAULT[userRole] || []);
        }
      } catch {
        // silently handled
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, isUserLoading, db]);

  const haPermesso = (permesso: string) => {
    return permessi.includes(permesso) || ruolo === 'super_admin';
  };

  return {
    haPermesso,
    ruolo,
    isAdmin: ruolo === 'super_admin' || ruolo === 'admin_agenzia',
    isCliente: ruolo === 'cliente_finale',
    loading: loading || isUserLoading
  };
}
