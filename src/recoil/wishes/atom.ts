import { atom } from 'recoil';

export const openSoldoutDialogState = atom({
  key: 'wishes/openSoldoutDialogState',
  default: false
});

export const openDeleteToastState = atom({
  key: 'wishes/openDeleteToastState',
  default: false
});

export const openRollbackToastState = atom({
  key: 'wishes/openRollbackToastState',
  default: false
});

export const removeIdState = atom({
  key: 'wishes/removeIdState',
  default: 0
});
