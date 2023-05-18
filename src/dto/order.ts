export interface Order {
  id: number;
  channelId: number;
  deliveryInfo: DeliveryInfo;
  externalId: string;
  fee: 0;
  name: string;
  orderDetails: OrderDetail[];
  orderPayments: OrderPayments[];
  orderFeeInfos: OrderFeeInfos[];
  orderDelivery: OrderDelivery;
  firstProductId: number;
  reviewFormInfo: {
    hasReview: boolean;
    isTargetUserSeller: boolean | null;
    productId: number | null;
    targetUserId: number | null;
    targetUserName: string | null;
  };
  price: number;
  quantity: number;
  totalPrice: number;
  status: 0 | 1 | 2 | 3; // 0: 결제, 1: 배송, 2: 정산, 3: 환불
  result: 0 | 1 | 2 | 3; // 0: 대기, 1: 진행, 2: 완료, 3: 취소
  reason: string;
  description: string;
  dateCompleted: string;
  dateExpired: string;
}

export interface OrderDelivery {
  contents: string;
  deliveryCode: string;
  type: 0 | 1 | 2 | 3;
}

export interface OrderFeeInfos {
  discountFee: number;
  fee: number;
  name: string;
  totalFee: number;
  type: number;
}

export interface DeliveryInfo {
  address: string;
  name: string;
  phone: string;
}

export interface OrderPayments {
  agencyCode: string;
  agencyName: string;
  data: string;
  dateExpired: string;
  externalPaymentKey: string;
  method: number;
  partnerId: number;
  receiptUrl: string;
  result: number;
}

export interface OrderDetail {
  data: string;
  name: string;
  options: string;
  price: number;
  quantity: number;
  targetId: number;
  type: number;
}

/* ---------- Request Parameters ---------- */

export interface OrderPaymentsData {
  id: number;
  channelId?: number;
  partnerId: 0;
  method: 0 | 1;
  externalKey: string;
  externalPaymentKey: string;
  agencyCode: string;
  dateExpired?: string;
  data: string;
  receiptUrl: string;
  amount: number;
}

export interface OrderSearchParams {
  type: 0 | 1; // 구매 0, 판매 1
  isConfirmed: boolean;
  page: number;
}

export interface ProductOrderParams {
  productId: number;
  isCreated?: boolean;
}
