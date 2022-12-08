import { atom } from 'recoil';

import type { OpinionLegitsParams } from '@dto/productLegit';

export const defaultLegitProfileOpinionLegitsParamsState: OpinionLegitsParams = {
  page: 0,
  size: 16,
  status: [20, 30],
  results: [0, 1, 2],
  userIds: []
};

export const legitProfileOpinionLegitsParamsState = atom<OpinionLegitsParams>({
  key: 'legitProfile/opinionLegitsParamsState',
  default: {
    page: 0,
    size: 16,
    status: [],
    results: [],
    userIds: []
  }
});