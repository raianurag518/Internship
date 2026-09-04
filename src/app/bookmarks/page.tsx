'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookmarksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/saved');
  }, [router]);

  return null;
}
