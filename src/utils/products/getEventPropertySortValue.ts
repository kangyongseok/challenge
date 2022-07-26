import type { ProductOrder } from '@dto/product';

export default function getEventPropertySortValue(order?: ProductOrder) {
  if (order === 'postedDesc') {
    return 1;
  }
  if (order === 'postedAllDesc') {
    return 6;
  }
  if (order === 'priceAsc') {
    return 3;
  }
  if (order === 'priceDesc') {
    return 4;
  }
  return 7;
}
