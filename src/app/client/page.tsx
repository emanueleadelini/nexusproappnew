'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Route legacy con mock data — redirect al nuovo hub cliente reale
export default function ClientPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cliente');
  }, [router]);

  return null;
}
