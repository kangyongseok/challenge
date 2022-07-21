import type { ProductOrder } from '@dto/product';

export default function getEventPropertyOrder(productOrder: ProductOrder) {
  if (productOrder === 'postedDesc') {
    return 'RECENT';
  }
  if (productOrder === 'postedAllDesc') {
    return 'RECENT_ALL';
  }
  if (productOrder === 'priceDesc') {
    return 'HIGHP';
  }
  if (productOrder === 'priceAsc') {
    return 'LOWP';
  }
  return 'RECOMM';
}
