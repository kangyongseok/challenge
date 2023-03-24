import { atom } from 'recoil';

import type { PostUserAccountData } from '@dto/user';

export const settingsAccountSelectBankBottomSheetOpenState = atom({
  key: 'settingsAccount/selectBankBottomSheetOpenState',
  default: false
});

export const settingsAccountConfirmDialogOpenState = atom({
  key: 'settingsAccount/confirmDialogOpenState',
  default: false
});

export const settingsAccountData = atom<PostUserAccountData>({
  key: 'settingsAccount/selectedBankCodeState',
  default: {
    bankCode: '',
    accountHolder: '',
    accountNumber: ''
  }
});
