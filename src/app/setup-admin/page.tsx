'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Questa pagina di setup è stata disabilitata per sicurezza.
// L'account super_admin è già stato inizializzato.
export default function SetupAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
