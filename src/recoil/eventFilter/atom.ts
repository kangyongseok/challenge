import { atom } from 'recoil';

import type { ContentProductsParams } from '@dto/common';

export const eventContentProductsParamsState = atom<ContentProductsParams>({
  key: 'event/contentProductsParamsState',
  default: {
    id: 0,
    brandIds: [],
    size: 30
  }
});
