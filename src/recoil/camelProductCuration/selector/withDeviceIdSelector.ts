import { selector } from 'recoil';

import { deviceIdState } from '@recoil/common';

import { searchParamsState } from '..';

export const searchParamsWithDeviceIdSelector = selector({
  key: 'camelProductCuration/searchParamsWithDeviceIdSelector',
  get: ({ get }) => {
    const searchParams = get(searchParamsState);
    const deviceId = get(deviceIdState);

    return {
      ...searchParams,
      deviceId
    };
  }
});
