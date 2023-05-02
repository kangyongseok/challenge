import { atom } from 'recoil';

import type { UserKeywordInfo } from '@dto/user';

export const keywordAlertManageBottomSheetState = atom<
  UserKeywordInfo & {
    open: boolean;
  }
>({
  key: 'keywordAlert/manageBottomSheetState',
  default: {
    open: false,
    id: 0,
    userId: 0,
    keyword: '',
    minPrice: null,
    maxPrice: null,
    isMySize: false
  }
});

export const keywordAlertOffDialogOpenState = atom({
  key: 'keywordAlert/offDialogOpenState',
  default: false
});

export const keywordAlertIsSetupMySizeState = atom({
  key: 'keywordAlert/isSetupMySizeState',
  default: false
});
