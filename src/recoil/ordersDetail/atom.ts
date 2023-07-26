import { atom } from 'recoil';

export const ordersDetailOpenSalesApproveDialogState = atom({
  key: 'ordersDetail/openSalesApproveDialogState',
  default: false
});

export const ordersDetailOpenInvoiceNumberDialogState = atom({
  key: 'ordersDetail/openInvoiceNumberDialogState',
  default: false
});

export const ordersDetailPurchaseConfirmDialogState = atom<{
  open: boolean;
  variant: 'delivery' | 'direct';
}>({
  key: 'ordersDetail/purchaseConfirmDialogState',
  default: {
    open: false,
    variant: 'delivery'
  }
});

export const ordersDetailOpenCancelDialogState = atom({
  key: 'ordersDetail/openCancelDialogState',
  default: false
});

export const ordersDetailOpenCancelRequestDialogState = atom({
  key: 'ordersDetail/openCancelRequestDialogState',
  default: false
});

export const ordersDetailOpenCancelRequestApproveDialogState = atom({
  key: 'ordersDetail/openCancelRequestApproveDialogState',
  default: false
});

export const ordersDetailOpenCancelRequestWithdrawDialogState = atom({
  key: 'ordersDetail/openCancelRequestWithdrawDialogState',
  default: false
});

export const ordersDetailSalesCancelDialogState = atom<{
  open: boolean;
  variant: 'cancel' | 'refuse';
}>({
  key: 'ordersDetail/salesCancelDialogState',
  default: {
    open: false,
    variant: 'cancel'
  }
});

export const ordersDetailOpenEmptyInvoiceNumberDialogState = atom({
  key: 'ordersDetail/openEmptyInvoiceNumberDialogState',
  default: false
});

export const ordersDetailOpenCancelRequestRefuseDialogState = atom({
  key: 'ordersDetail/openCancelRequestRefuseDialogState',
  default: false
});

export const ordersDetailOpenDeliveryStatusFrameState = atom({
  key: 'ordersDetail/openDeliveryStatusFrameState',
  default: false
});

export const ordersDetailOpenDeliveryCompleteConfirmDialogState = atom({
  key: 'ordersDetail/openDeliveryCompleteConfirmDialogState',
  default: false
});
