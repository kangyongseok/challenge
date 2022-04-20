import React from 'react';
import { useRouter } from 'next/router';

function Index() {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.push('/category')}>
      Index
    </button>
  );
}

export default Index;
