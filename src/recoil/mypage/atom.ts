import { atom } from 'recoil';

import type { AlarmsParams } from '@dto/user';

export const AllAlarmControllState = atom<AlarmsParams>({
  key: 'mypage/AllAlarmControllState',
  default: {
    isNotiNotNight: false,
    isNotiEvent: false,
    isNotiChannel: false,
    isNotiProductList: false,
    isNotiProductWish: false,
    isNotiLegit: false,
    isNotiMyProductWish: false,
    isNotiKeyword: false
  }
});
