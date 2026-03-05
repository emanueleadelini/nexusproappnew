'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Questa route era basata su mock data ed è stata sostituita da /admin/clienti/[clienteId]
export default function AdminClientDetailRedirect() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/clienti/${id}`);
  }, [id, router]);

  return null;
}
