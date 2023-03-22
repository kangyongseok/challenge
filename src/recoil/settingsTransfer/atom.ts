import { atom } from 'recoil';

import type { PostTransferData } from '@dto/user';

export const settingsTransferSelectBottomSheetOpenState = atom({
  key: 'settingsTransfer/selectBottomSheetOpenState',
  default: false
});

export const settingsTransferPlatformsState = atom<
  {
    id: number;
    name: string;
    selected: boolean;
  }[]
>({
  key: 'settingsTransfer/platformsState',
  default: [
    {
      id: 2,
      name: '번개장터',
      selected: false
    },
    {
      id: 3,
      name: '당근마켓',
      selected: false
    },
    {
      id: 11,
      name: '중고나라',
      selected: false
    },
    {
      id: 4,
      name: '세컨웨어',
      selected: false
    },
    {
      id: 25,
      name: '중고나라앱',
      selected: false
    },
    {
      id: 7,
      name: '필웨이',
      selected: false
    },
    {
      id: 6,
      name: '나이키매니아',
      selected: false
    },
    {
      id: 32,
      name: '머스트잇',
      selected: false
    }
  ]
});

export const settingsTransferDataState = atom<PostTransferData>({
  key: 'settingsTransfer/dataState',
  default: {
    siteId: 0,
    url: '',
    isUrlPattern: false
  }
});
