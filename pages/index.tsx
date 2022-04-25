import React from 'react';
import { useRouter } from 'next/router';

import { Box } from 'mrcamel-ui';

function Index() {
  const router = useRouter();

  return (
    <>
      <button type="button" onClick={() => router.push('/category')}>
        Go to category
      </button>
      <Box
        customStyle={{
          fontFamily: 'Spoqa Han Sans Neo'
        }}
      >
        Box
      </Box>
    </>
  );
}

export default Index;
