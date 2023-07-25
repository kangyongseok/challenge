import type { OrderFees, Product } from '@dto/product';

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
  orderFees: OrderFees[];
  orderDelivery: OrderDelivery;
  orderHistories: OrderHistory[];
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
  status: 0 | 1 | 2 | 3 | 4; // 0: 결제, 1: 배송, 2: 정산, 3: 환불, 4: 취소
  result: 0 | 1 | 2 | 3; // 0: 대기, 1: 진행, 2: 완료, 3: 취소
  reason: string;
  hold: 0 | 1; // 0: 기본, 1: 취소 요청
  type: 0 | 1 | 2; // 0: 택배거래, 2: 직거래, 3: 구매대행
  cancelReasons: {
    request: null; // 취소 요청이 있는 경우
    response: null; // 취소 요청 거절이 있는 경우
  };
  additionalInfo?: {
    buyerName: string;
    buyerUserId: number;
    product: Product;
    sellerName: string;
    sellerUserId: number;
  };
  userId: number;
  description: string;
  dateCompleted: string;
  dateExpired: string;
  beforeTotalPrice?: number;
}

export interface OrderDelivery {
  contents: string;
  deliveryCode: string;
  type: 0 | 1 | 2 | 3;
}

export interface OrderHistory {
  dateCreated: string;
  description: string;
  name: string;
  result: number;
  status: number;
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
  method: number; // 1: 가상계좌, 0: 카드
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
  type?: number;
  includeLegit?: boolean;
}
