import dayjs from 'dayjs';

import type { Order } from '@dto/order';

export type OrderStatusName =
  | '결제대기'
  | '결제진행'
  | '결제완료'
  | '결제취소'
  | '배송대기'
  | '거래대기'
  | '배송진행'
  | '배송완료'
  | '배송준비 중 취소 요청'
  | '거래준비 중 취소 요청'
  | '정산대기'
  | '정산진행'
  | '정산완료'
  | '환불대기'
  | '환불진행'
  | '환불완료';

export interface OrderStatus {
  name: OrderStatusName | '';
  displayText: string;
  overlayText: string;
  description: string;
  transactionMethod: '택배거래' | '직거래' | '카멜 구매대행' | '';
  paymentMethod: string;
  stepperValues: {
    name: 'ready' | 'active' | 'complete' | 'completeWithActive';
    text: string;
    subText?: string;
  }[];
  isExpired: boolean;
  isSeller: boolean;
  hasReview: boolean;
  orderDate: string;
  paymentDate: string;
  waitingSettlementDate: string;
  completeSettlementDate: string;
}

// [status-result-type-hold]
export const orderStatusName: {
  [key: `${number}-${number}-${number}-${number}`]: OrderStatusName;
} = {
  '0-0-0-0': '결제대기',
  '0-0-1-0': '결제대기',
  '0-0-2-0': '결제대기',
  '0-1-0-0': '결제진행',
  '0-1-1-0': '결제진행',
  '0-1-2-0': '결제진행',
  '0-2-0-0': '결제완료',
  '0-2-1-0': '결제완료',
  '0-2-2-0': '결제완료',
  '0-3-0-0': '결제취소',
  '0-3-1-0': '결제취소',
  '0-3-2-0': '결제취소',
  '1-0-0-0': '배송대기',
  '1-0-2-0': '배송대기',
  '1-0-1-0': '거래대기',
  '1-1-0-0': '배송진행',
  '1-1-1-0': '배송진행',
  '1-1-2-0': '배송진행',
  '1-2-0-0': '배송완료',
  '1-2-1-0': '배송완료',
  '1-2-2-0': '배송완료',
  '1-0-0-1': '배송준비 중 취소 요청',
  '1-0-2-1': '배송준비 중 취소 요청',
  '1-0-1-1': '거래준비 중 취소 요청',
  '2-0-0-0': '정산대기',
  '2-0-1-0': '정산대기',
  '2-0-2-0': '정산대기',
  '2-1-0-0': '정산진행',
  '2-1-1-0': '정산진행',
  '2-1-2-0': '정산진행',
  '2-2-0-0': '정산완료',
  '2-2-1-0': '정산완료',
  '2-2-2-0': '정산완료',
  '3-0-0-0': '환불대기',
  '3-0-1-0': '환불대기',
  '3-0-2-0': '환불대기',
  '3-1-0-0': '환불진행',
  '3-1-1-0': '환불진행',
  '3-1-2-0': '환불진행',
  '3-2-0-0': '환불완료',
  '3-2-1-0': '환불완료',
  '3-2-2-0': '환불완료'
};

// TODO 오퍼레이터 주문 상태 분기 처리
export default function getOrderStatus({
  id,
  status,
  result,
  type,
  hold,
  description,
  orderHistories = [],
  orderPayments = [],
  orderDelivery,
  additionalInfo,
  dateExpired,
  dateCompleted,
  reviewFormInfo,
  isSeller
}: Order & {
  isSeller: boolean;
}) {
  const newOrderStatus: OrderStatus = {
    name: '',
    displayText: '',
    overlayText: '',
    description: '',
    transactionMethod: '',
    paymentMethod: '',
    stepperValues: [],
    isExpired: false,
    hasReview: false,
    orderDate: '',
    paymentDate: '',
    waitingSettlementDate: '',
    completeSettlementDate: '',
    isSeller: false
  };

  const isDirectTransaction = type === 1;
  const isOperatorTransaction = type === 2;

  const paymentHistory = orderHistories?.find((orderHistory) => orderHistory.name === '결제완료');
  const waitingSettlementHistory = orderHistories?.find(
    (orderHistory) => orderHistory.name === '정산대기'
  );
  const completeSettlementHistory = orderHistories?.find(
    (orderHistory) => orderHistory.name === '정산완료'
  );

  newOrderStatus.name = orderStatusName[`${status}-${result}-${type}-${hold}`];
  newOrderStatus.orderDate = dayjs(paymentHistory?.dateCreated).format('YYYY.MM.DD. HH:mm');
  newOrderStatus.paymentDate = dayjs(paymentHistory?.dateCreated).format('MM. DD. HH:mm');
  newOrderStatus.waitingSettlementDate = dayjs(waitingSettlementHistory?.dateCreated).format(
    'MM. DD. HH:mm'
  );
  newOrderStatus.completeSettlementDate = dayjs(completeSettlementHistory?.dateCreated).format(
    'MM. DD. HH:mm'
  );
  newOrderStatus.hasReview = !!reviewFormInfo?.hasReview;
  newOrderStatus.transactionMethod = isDirectTransaction ? '직거래' : '택배거래';
  if (isOperatorTransaction) newOrderStatus.transactionMethod = '카멜 구매대행';
  newOrderStatus.paymentMethod =
    orderPayments[0]?.method === 0 ? orderPayments[0]?.agencyName : '무통장입금';
  newOrderStatus.isExpired = dayjs(dateExpired).diff(dayjs(), 'minutes') < 0; // 무통장입금 시간초과 여부

  const { name, paymentDate, waitingSettlementDate, completeSettlementDate, paymentMethod } =
    newOrderStatus;

  // 직거래 구매자
  if (!isSeller && isDirectTransaction) {
    if (name === '결제대기') {
      newOrderStatus.displayText = '결제대기';
      newOrderStatus.overlayText = '결제대기';
    } else if (name === '결제진행' && paymentMethod === '무통장입금') {
      newOrderStatus.displayText = '입금을 완료해주세요.';
      newOrderStatus.overlayText = '입금요청';
      newOrderStatus.description = `${dayjs(orderPayments[0]?.dateExpired).format(
        'MM월 DD일(ddd)'
      )}까지 결제금액을 입금해주세요.<br/>미입금시 주문이 취소됩니다.`;
      newOrderStatus.stepperValues = [
        {
          name: 'active',
          text: '입금요청'
        },
        {
          name: 'ready',
          text: '거래대기'
        }
      ];
      // 카드결제가 최초에 결제진행 상태가 되므로, 이를 방지하기 위해 카드결제의 경우 곧 바로 결제완료 화면을 보여주도록 수정
    } else if (name === '결제완료' || (name === '결제진행' && paymentMethod !== '무통장입금')) {
      newOrderStatus.displayText = '결제완료';
      newOrderStatus.overlayText = '결제완료';
      newOrderStatus.description =
        '결제 금액은 거래가 끝날때까지 카멜이 안전하게 보관하고 있어요.<p class="mt-8">판매자 승인 후 거래가 진행됩니다.</p>';
      newOrderStatus.stepperValues = [
        {
          name: 'completeWithActive',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'ready',
          text: '거래준비'
        }
      ];
    } else if (name === '결제취소') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';

      if (newOrderStatus.isExpired) {
        newOrderStatus.description = '시간초과로 가상계좌 결제가 취소되었어요.';
      }
    } else if (name === '거래대기') {
      newOrderStatus.displayText = '거래준비';
      newOrderStatus.overlayText = '거래준비';
      newOrderStatus.description = '판매자와 직거래 후 구매확정 버튼을 눌러주세요.';

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'active',
          text: '거래준비'
        }
      ];
    } else if (['정산대기', '정산진행', '정산완료'].includes(name)) {
      newOrderStatus.displayText = '거래완료';
      newOrderStatus.overlayText = '거래완료';
      newOrderStatus.description = `${additionalInfo?.sellerName}님과 거래가 완료되었어요.`;

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'completeWithActive',
          text: '거래완료',
          subText: waitingSettlementDate
        }
      ];
    } else if (
      ['환불대기', '환불진행', '환불완료'].includes(name) &&
      paymentMethod !== '무통장입금'
    ) {
      newOrderStatus.name = '환불완료';
      newOrderStatus.displayText = '환불완료';
      newOrderStatus.overlayText = '환불완료';
      newOrderStatus.description =
        '거래가 취소되어 결제한 방법으로 환불되었어요.<p class="mt-8">카드사에 따라 영업일 기준 2일까지 소요될 수 있어요.</p>';
    } else if (name === '환불대기') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
    } else if (name === '환불진행') {
      newOrderStatus.displayText = '환불예정';
      newOrderStatus.overlayText = '환불예정';
      newOrderStatus.description = `거래가 취소되어 등록된 정산계좌로 ${dayjs(dateCompleted).format(
        'MM월 DD일(ddd)'
      )} 이내에 환불 예정입니다.`;
    } else if (name === '환불완료') {
      newOrderStatus.displayText = '환불완료';
      newOrderStatus.overlayText = '환불완료';

      if (orderPayments[0]?.method === 1) {
        newOrderStatus.description = '등록된 정산계좌로 환불되었어요.';
      } else if (orderPayments[0]?.method === 0) {
        newOrderStatus.description = '거래가 취소되어 결제한 방법으로 환불되었어요.';
      }
    } else if (name === '거래준비 중 취소 요청') {
      newOrderStatus.displayText = '취소요청';
      newOrderStatus.overlayText = '취소요청';
      newOrderStatus.description = '판매자가 요청을 승인하면 결제한 방법으로 환불됩니다.';
    }
    // 직거래 판매자
  } else if (isSeller && isDirectTransaction) {
    if (name === '결제대기') {
      newOrderStatus.displayText = '결제대기';
      newOrderStatus.overlayText = '결제대기';
    } else if (name === '결제진행' && paymentMethod === '무통장입금') {
      newOrderStatus.displayText = '입금을 완료해주세요.';
      newOrderStatus.overlayText = '입금요청';
      newOrderStatus.description = `${dayjs(orderPayments[0]?.dateExpired).format(
        'MM월 DD일(ddd)'
      )}까지 결제금액을 입금해주세요.<br/>미입금시 주문이 취소됩니다.`;
      newOrderStatus.stepperValues = [
        {
          name: 'active',
          text: '입금요청'
        },
        {
          name: 'ready',
          text: '거래대기'
        }
      ];
    } else if (name === '결제완료' || (name === '결제진행' && paymentMethod !== '무통장입금')) {
      newOrderStatus.displayText = '결제완료';
      newOrderStatus.overlayText = '결제완료';
      newOrderStatus.description =
        '결제 금액은 거래가 끝날때까지 카멜이 안전하게 보관하고 있어요.<p class="mt-8">판매하려면 판매승인 버튼을 눌러주세요.</p>';
      newOrderStatus.stepperValues = [
        {
          name: 'completeWithActive',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'ready',
          text: '거래준비'
        },
        {
          name: 'ready',
          text: '정산대기'
        }
      ];
    } else if (name === '결제취소') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
      newOrderStatus.description = `${additionalInfo?.buyerName}님과의 거래가 취소되었어요.`;
    } else if (name === '거래대기') {
      newOrderStatus.displayText = '거래준비';
      newOrderStatus.overlayText = '거래준비';
      newOrderStatus.description = '구매자와 직거래 후 구매확정 버튼 클릭을 요청해주세요.';

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'active',
          text: '거래준비'
        },
        {
          name: 'ready',
          text: '정산대기'
        }
      ];
    } else if (name === '정산대기') {
      newOrderStatus.displayText = '정산대기';
      newOrderStatus.overlayText = '정산대기';

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '거래완료'
        },
        {
          name: 'active',
          text: '정산대기'
        }
      ];
    } else if (name === '정산진행') {
      newOrderStatus.displayText = '정산예정';
      newOrderStatus.overlayText = '정산예정';
      newOrderStatus.description = `정산계좌로 ${dayjs(dateCompleted).format(
        'MM월 DD일(ddd)'
      )}까지 판매대금이 입금예정이에요.${
        !newOrderStatus.hasReview
          ? `<p class="mt-8">${additionalInfo?.buyerName}님과 거래는 어떠셨나요?<br />거래후기도 남겨주세요.</p>`
          : ''
      }`;

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '거래완료'
        },
        {
          name: 'active',
          text: '정산예정',
          subText: `${dayjs(dateCompleted).format('MM. DD.')} 예정`
        }
      ];
    } else if (name === '정산완료') {
      newOrderStatus.displayText = '정산완료';
      newOrderStatus.overlayText = '정산완료';
      newOrderStatus.description = '정산계좌로 판매대금이 입금되었어요.';

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '거래완료'
        },
        {
          name: 'completeWithActive',
          text: '정산완료',
          subText: completeSettlementDate
        }
      ];
    } else if (name === '환불대기') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
      newOrderStatus.description = `${additionalInfo?.buyerName}님과의 거래가 취소되었어요.`;
    } else if (name === '환불진행') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
      newOrderStatus.description = `${additionalInfo?.buyerName}님과의 거래가 취소되었어요.`;
    } else if (name === '환불완료') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
      newOrderStatus.description = `${additionalInfo?.buyerName}님과의 거래가 취소되었어요.`;
    } else if (name === '거래준비 중 취소 요청') {
      newOrderStatus.displayText = '취소요청';
      newOrderStatus.overlayText = '취소요청';
      newOrderStatus.description = '판매자가 요청을 승인하면 결제한 방법으로 환불됩니다.';
    }
    // 택배거래 구매자
  } else if (!isSeller && !isDirectTransaction) {
    if (name === '결제대기') {
      newOrderStatus.displayText = '결제대기';
      newOrderStatus.overlayText = '결제대기';
    } else if (name === '결제진행' && paymentMethod === '무통장입금') {
      newOrderStatus.displayText = '입금을 완료해주세요.';
      newOrderStatus.overlayText = '입금요청';
      newOrderStatus.description = `${dayjs(orderPayments[0]?.dateExpired).format(
        'MM월 DD일(ddd)'
      )}까지 결제금액을 입금해주세요.<br/>미입금시 주문이 취소됩니다.`;

      newOrderStatus.stepperValues = [
        {
          name: 'active',
          text: '입금요청'
        },
        {
          name: 'ready',
          text: '배송준비'
        },
        {
          name: 'ready',
          text: '구매확정대기'
        }
      ];
    } else if (name === '결제완료' || (name === '결제진행' && paymentMethod !== '무통장입금')) {
      newOrderStatus.displayText = '결제완료';
      newOrderStatus.overlayText = '결제완료';
      newOrderStatus.description =
        '결제 금액은 거래가 끝날때까지 카멜이 안전하게 보관하고 있어요.<p class="mt-8">판매자 승인 후 거래가 진행됩니다.</p>';

      newOrderStatus.stepperValues = [
        {
          name: 'completeWithActive',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'ready',
          text: '배송준비'
        },
        {
          name: 'ready',
          text: '구매확정대기'
        }
      ];
    } else if (name === '결제취소') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';

      if (newOrderStatus.isExpired) {
        newOrderStatus.description = '시간초과로 가상계좌 결제가 취소되었어요.';
      }
    } else if (name === '배송대기') {
      newOrderStatus.displayText = '배송준비';
      newOrderStatus.overlayText = '배송준비';
      newOrderStatus.description = isOperatorTransaction
        ? '카멜이 배송을 준비하고 있어요'
        : '판매자가 배송을 준비하고 있어요.';

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'active',
          text: '배송준비'
        },
        {
          name: 'ready',
          text: '구매확정대기'
        }
      ];
    } else if (name === '배송진행') {
      newOrderStatus.displayText = '배송중';
      newOrderStatus.overlayText = '배송중';

      if (isOperatorTransaction) {
        newOrderStatus.description =
          description === '배송중 7일 후 구매확정 문의'
            ? '배송을 받으셨나요?<br />거래하셨다면 구매확정 버튼을 눌러주세요.'
            : '배송이 시작되었어요!';
      } else {
        newOrderStatus.description =
          orderDelivery?.type === 1
            ? '배송이 시작되었어요!<br />배송현황은 배송조회를 클릭하여 확인해주세요.'
            : '배송이 시작되었어요!';
      }

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'active',
          text: '배송중'
        },
        {
          name: 'ready',
          text: '구매확정대기'
        }
      ];
    } else if (name === '배송완료') {
      newOrderStatus.displayText = '구매확정 대기';
      newOrderStatus.overlayText = '구매확정 대기';
      newOrderStatus.description = '매물을 잘 받으셨다면 구매확정 버튼을 눌러주세요.';

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '배송완료'
        },
        {
          name: 'active',
          text: '구매확정대기'
        }
      ];
    } else if (['정산대기', '정산진행', '정산완료'].includes(name)) {
      newOrderStatus.displayText = '거래완료';
      newOrderStatus.overlayText = '거래완료';

      if (isOperatorTransaction) {
        newOrderStatus.description = '카멜 구매대행 거래가 완료되었어요.';
      } else {
        newOrderStatus.description = `${additionalInfo?.sellerName}님과 거래가 완료되었어요.`;
      }

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '배송완료'
        },
        {
          name: 'completeWithActive',
          text: '거래완료',
          subText: waitingSettlementDate
        }
      ];
      // 카드 결제 즉시 취소 케이스 대응 (가상계좌의 환불 프로세스를 타지 않도록)
    } else if (
      ['환불대기', '환불진행', '환불완료'].includes(name) &&
      paymentMethod !== '무통장입금'
    ) {
      newOrderStatus.name = '환불완료';
      newOrderStatus.displayText = '환불완료';
      newOrderStatus.overlayText = '환불완료';
      newOrderStatus.description =
        '거래가 취소되어 결제한 방법으로 환불되었어요.<br/><p class="mt-8">카드사에 따라 영업일 기준 2일까지 소요될 수 있어요.</p>';
    } else if (name === '환불대기') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
    } else if (name === '환불진행') {
      newOrderStatus.displayText = '환불진행';
      newOrderStatus.overlayText = '환불예정';
      newOrderStatus.description = `거래가 취소되어 등록된 정산계좌로 ${dayjs(dateCompleted).format(
        'MM월 DD일(ddd)'
      )} 이내에 환불 예정입니다.`;
    } else if (name === '환불완료') {
      newOrderStatus.displayText = '환불완료';
      newOrderStatus.overlayText = '환불완료';

      if (orderPayments[0]?.method === 1) {
        newOrderStatus.description = '등록된 정산계좌로 환불되었어요.';
      } else if (orderPayments[0]?.method === 0) {
        newOrderStatus.description = '거래가 취소되어 결제한 방법으로 환불되었어요.';
      }
    } else if (name === '배송준비 중 취소 요청') {
      newOrderStatus.displayText = '취소요청';
      newOrderStatus.overlayText = '취소요청';
      newOrderStatus.description = '판매자가 요청을 승인하면 결제한 방법으로 환불됩니다.';
    }
    // 택배거래 판매자
  } else if (isSeller && !isDirectTransaction) {
    if (name === '결제대기') {
      newOrderStatus.displayText = '결제대기';
      newOrderStatus.overlayText = '결제대기';
    } else if (name === '결제진행' && paymentMethod === '무통장입금') {
      newOrderStatus.displayText = '입금을 완료해주세요.';
      newOrderStatus.overlayText = '입금요청';
      newOrderStatus.description = `${dayjs(orderPayments[0]?.dateExpired).format(
        'MM월 DD일(ddd)'
      )}까지 결제금액을 입금해주세요.<br/>미입금시 주문이 취소됩니다.`;
      newOrderStatus.stepperValues = [
        {
          name: 'active',
          text: '입금요청'
        },
        {
          name: 'ready',
          text: '배송준비'
        },
        {
          name: 'ready',
          text: '정산대기'
        }
      ];
    } else if (name === '결제완료' || (name === '결제진행' && paymentMethod !== '무통장입금')) {
      newOrderStatus.displayText = '결제완료';
      newOrderStatus.overlayText = '결제완료';
      newOrderStatus.description =
        '결제 금액은 거래가 끝날때까지 카멜이 안전하게 보관하고 있어요.<br/><p class="mt-8">판매하려면 판매승인 버튼을 눌러주세요.</p>';
      newOrderStatus.stepperValues = [
        {
          name: 'completeWithActive',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'ready',
          text: '배송준비'
        },
        {
          name: 'ready',
          text: '정산대기'
        }
      ];
    } else if (name === '결제취소') {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
      newOrderStatus.description = `${additionalInfo?.buyerName}님과의 거래가 취소되었어요.`;
    } else if (name === '배송대기') {
      newOrderStatus.displayText = '배송준비';
      newOrderStatus.overlayText = '배송준비';
      newOrderStatus.description = '택배를 보낸 뒤 송장번호를 입력해주세요.';
      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'active',
          text: '배송준비'
        },
        {
          name: 'ready',
          text: '정산대기'
        }
      ];
    } else if (name === '배송진행') {
      newOrderStatus.displayText = '배송중';
      newOrderStatus.overlayText = '배송중';
      newOrderStatus.description =
        orderDelivery?.type === 1
          ? '배송이 시작되었어요!<br />배송현황은 배송조회를 클릭하여 확인해주세요.'
          : '배송이 시작되었어요!';
      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'active',
          text: '배송중'
        },
        {
          name: 'ready',
          text: '정산대기'
        }
      ];
    } else if (name === '배송완료') {
      newOrderStatus.displayText = '배송완료';
      newOrderStatus.overlayText = '배송완료';
      newOrderStatus.description = `구매자가 구매확정하면 영업일 기준 1일 후 정산되며, 구매확정하지 않아도 ${dayjs(
        dateCompleted
      ).format('MM월 DD일(ddd)')}까지 정산 완료됩니다.`;
      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'completeWithActive',
          text: '배송완료'
        },
        {
          name: 'ready',
          text: '정산대기'
        }
      ];
    } else if (name === '정산대기') {
      newOrderStatus.displayText = '정산대기';
      newOrderStatus.overlayText = '정산대기';

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '배송완료'
        },
        {
          name: 'active',
          text: '정산대기'
        }
      ];
    } else if (name === '정산진행') {
      newOrderStatus.displayText = '정산예정';
      newOrderStatus.description = `정산계좌로 ${dayjs(dateCompleted).format(
        'MM월 DD일(ddd)'
      )}까지 판매대금이 입금예정이에요.${
        !newOrderStatus.hasReview
          ? `<p class="mt-8">${additionalInfo?.buyerName}님과 거래는 어떠셨나요?<br />거래후기도 남겨주세요.</p>`
          : ''
      }`;

      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '배송완료'
        },
        {
          name: 'active',
          text: '정산예정',
          subText: `${dayjs(dateCompleted).format('MM. DD.')} 예정`
        }
      ];
    } else if (name === '정산완료') {
      newOrderStatus.displayText = '정산완료';
      newOrderStatus.overlayText = '정산완료';
      newOrderStatus.description = '정산계좌로 판매대금이 입금되었어요.';
      newOrderStatus.stepperValues = [
        {
          name: 'complete',
          text: '결제완료',
          subText: paymentDate
        },
        {
          name: 'complete',
          text: '배송완료'
        },
        {
          name: 'completeWithActive',
          text: '정산완료',
          subText: completeSettlementDate
        }
      ];
    } else if (['환불대기', '환불진행', '환불완료'].includes(name)) {
      newOrderStatus.displayText = '거래취소';
      newOrderStatus.overlayText = '거래취소';
      newOrderStatus.description = `${additionalInfo?.buyerName}님과의 거래가 취소되었어요.`;
    } else if (name === '배송준비 중 취소 요청') {
      newOrderStatus.displayText = '취소요청';
      newOrderStatus.overlayText = '취소요청';
      newOrderStatus.description = `구매자의 취소요청을 확인해주세요.<p class="mt-8 b2 ui60">${dayjs(
        dateExpired
      ).format('MM월 DD일')}까지 미확인시 주문이 취소됩니다.</p>`;
    }
  }

  if (!newOrderStatus.name || !newOrderStatus.displayText) {
    newOrderStatus.displayText = '주문상태 알 수 없음';
    newOrderStatus.description = `마이 > 1:1 문의를 통해 아래의 주문번호와 함께 문의해 주세요!<p class="mt-8 ui60">주문번호: ${id}</p>`;
  }

  return newOrderStatus;
}
