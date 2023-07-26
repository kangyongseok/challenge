import type { ReactNode } from 'react';

import { Flexbox } from '@mrcamelhub/camel-ui';

function Empty({ children }: { children: ReactNode }) {
  return (
    <Flexbox
      direction="vertical"
      alignment="center"
      justifyContent="center"
      gap={20}
      customStyle={{ padding: '84px 0' }}
    >
      {children}
    </Flexbox>
  );
}

export default Empty;
