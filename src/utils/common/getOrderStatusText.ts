import type { Order } from '@dto/order';

export function getOrderStatusText({
  status,
  result,
  options: { isBuyer } = {}
}: Partial<Pick<Order, 'status' | 'result'>> & {
  options?: {
    isBuyer?: boolean;
  };
}) {
  if (status === 2 && isBuyer) {
    return '거래완료';
  }

  if (status === 0 && result === 0) {
    return '결제대기';
  }
  if (status === 0 && result === 2) {
    return '거래대기';
  }
  if (status === 0 && result === 3) {
    return '결제취소';
  }
  if (status === 1 && result === 1) {
    return '거래중';
  }
  if (status === 1 && result === 2) {
    return '거래중';
  }
  if (status === 2 && result === 0) {
    return '거래완료/판매완료';
  }
  if (status === 3 && result === 0) {
    return '환불대기/거래취소';
  }
  if (status === 2 && result === 1) {
    return '정산예정';
  }
  if (status === 2 && result === 2) {
    return '정산완료';
  }
  if (status === 3 && result === 0) {
    return '환불대기';
  }
  if (status === 3 && result === 1) {
    return '환불예정';
  }
  if (status === 3 && result === 2) {
    return '환불완료/거래취소';
  }
  return '';
}
