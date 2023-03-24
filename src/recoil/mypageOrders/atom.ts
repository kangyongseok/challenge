import { atom } from 'recoil';

import type { Order } from '@dto/order';

export const mypageOrdersPurchaseConfirmDialogState = atom<{
  open: boolean;
  order: Order | null;
}>({
  key: 'mypageOrders/purchaseConfirmDialogState',
  default: {
    open: false,
    order: null
  }
});

export const mypageOrdersIsConfirmedState = atom({
  key: 'mypageOrders/isConfirmedState',
  default: false
});
