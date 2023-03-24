export interface Payment {
  version: string;
  paymentKey: string;
  type: 'NORMAL' | 'BILLING' | 'BRANDPAY';
  orderId: string;
  orderName: string;
  mId: string;
  currency: string;
  method: string;
  totalAmount: string;
  balanceAmount: string;
  status:
    | 'READY'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_DEPOSIT'
    | 'DONE'
    | 'CANCELED'
    | 'PARTIAL_CANCELED'
    | 'ABORTED'
    | 'EXPIRED';
  requestedAt: string;
  approvedAt: string;
  useEscrow: boolean;
  lastTransactionKey: string;
  suppliedAmount: string;
  vat: number;
  cultureExpense: boolean;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  cancels:
    | {
        cancelAmount: number;
        cancelReason: string;
        taxFreeAmount: string;
        taxExemptionAmount: number;
        refundableAmount: number;
        easyPayDiscountAmount: number;
        canceledAt: string;
        transactionKey: string;
      }[]
    | null;
  isPartialCancelable: boolean;
  card: {
    amount: number;
    issuerCode: CardCode;
    acquirerCode: CardCode;
    number: string;
    installmentPlanMonths: number;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: 'READY' | 'REQUESTED' | 'COMPLETED' | 'CANCEL_REQUESTED' | 'CANCELED';
    isInterestFree: boolean;
    interestPayer: string;
  } | null;
  virtualAccount: {
    accountType: '일반' | '고정';
    accountNumber: string;
    bankCode: BankCode;
    customerName: string;
    dueDate: string;
    refundStatus: 'NONE' | 'PENDING' | 'FAILED' | 'PARTIAL_FAILED' | 'COMPLETED';
    expired: boolean;
    settlementStatus: string;
  };
  secret: string | null;
  mobilePhone: {
    customerMobilePhone: string;
    settlementStatus: 'INCOMPLETED' | 'COMPLETED';
    receiptUrl: string;
  } | null;
  giftCertificate: {
    approveNo: string;
    settlementStatus: 'INCOMPLETED' | 'COMPLETED';
  } | null;
  transfer: {
    bankCode: BankCode;
    settlementStatus: 'INCOMPLETED' | 'COMPLETED';
  } | null;
  receipt: {
    url: string;
  };
  checkout: {
    url: string;
  };
  easyPay: {
    provider:
      | 'TOSSPAY'
      | 'NAVERPAY'
      | 'SAMSUNGPAY'
      | 'LPAY'
      | 'KAKAOPAY'
      | 'PAYCO'
      | 'LGPAY'
      | 'SSG';
    amount: number;
    discountAmount: number;
  } | null;
  country: string;
  failure: {
    code: string;
    message: string;
  } | null;
  cacheReceipt: {
    receiptKey: string;
    type: '소득공제' | '지출증빙';
    amount: number;
    taxFreeAmount: number;
    issueNumber: string;
    receiptUrl: string;
  } | null;
  discount: {
    amount: number;
  } | null;
}

export type CardCode =
  | '3K'
  | 46
  | 71
  | 30
  | 31
  | 51
  | 38
  | 41
  | 62
  | 36
  | 33
  | 'W1'
  | 37
  | 39
  | 35
  | 42
  | 15
  | '3A'
  | 24
  | 21
  | 61
  | 11
  | 91
  | 34
  | '6D'
  | '6I'
  | '4M'
  | '3C'
  | '7A'
  | '4J'
  | '4V';

export type BankCode =
  | '039'
  | '39'
  | '034'
  | '34'
  | '261'
  | '58'
  | '012'
  | '12'
  | '267'
  | 'SE'
  | '287'
  | 'SK'
  | '238'
  | '55'
  | '032'
  | '32'
  | '240'
  | '53'
  | '045'
  | '45'
  | '064'
  | '64'
  | '291'
  | 'SN'
  | '278'
  | 'S2'
  | '088'
  | '88'
  | '048'
  | '48'
  | '027'
  | '27'
  | '020'
  | '20'
  | '071'
  | '71'
  | '209'
  | '50'
  | '037'
  | '37'
  | '035'
  | '35'
  | '090'
  | '90'
  | '288'
  | 'SQ'
  | '089'
  | '89'
  | '092'
  | '92'
  | '271'
  | 'ST'
  | '294'
  | 'SR'
  | '270'
  | 'SH'
  | '081'
  | '81'
  | '262'
  | 'S9'
  | '243'
  | '56'
  | '269'
  | 'SG'
  | '263'
  | 'SA'
  | '054'
  | '54'
  | '279'
  | 'SI'
  | '031'
  | '31'
  | '003'
  | '03'
  | '004'
  | '06'
  | '218'
  | 'S4'
  | '002'
  | '02'
  | '227'
  | 'SP'
  | '292'
  | 'S0'
  | '011'
  | '11'
  | '247'
  | 'SL'
  | '023'
  | '23'
  | '007'
  | '07'
  | '266'
  | 'SD'
  | '';
