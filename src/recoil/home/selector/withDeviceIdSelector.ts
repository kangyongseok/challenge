import { selector } from 'recoil';

import { homeCamelSearchParamsState } from '@recoil/home';
import { deviceIdState } from '@recoil/common';

export const camelSearchParamsWithDeviceIdSelector = selector({
  key: 'home/camelSearchParamsWithDeviceIdSelector',
  get: ({ get }) => {
    const searchParams = get(homeCamelSearchParamsState);
    const deviceId = get(deviceIdState);

    return { ...searchParams, deviceId };
  }
});
