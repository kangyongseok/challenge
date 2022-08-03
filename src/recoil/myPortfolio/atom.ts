import { atom } from 'recoil';

export const SuccessDialogState = atom({
  key: 'successDialog',
  default: false
});

export const PreReserveCheckState = atom<string[]>({
  key: 'preReserve',
  default: []
});

export const PreReserveDataState = atom<{ phone?: string; model?: string }>({
  key: 'preReserveData',
  default: {
    phone: '',
    model: ''
  }
});
