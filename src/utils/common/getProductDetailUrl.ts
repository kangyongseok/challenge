import type { Product, ProductResult } from '@dto/product';

export function getProductDetailUrl({
  type = 'product',
  product
}:
  | { type?: 'product' | 'targetProduct'; product: Product }
  | { type: 'productResult'; product: ProductResult }
  | { type: 'targetProduct'; product: Product | ProductResult }) {
  const { id, targetProductId, targetProductUrl, quoteTitle } = product || {};
  let productDetailUrl = `/products/${id}`;

  if (type === 'targetProduct') {
    if (targetProductUrl) {
      productDetailUrl = `/products/${targetProductUrl}`;
    } else if (quoteTitle) {
      productDetailUrl = `/products/${quoteTitle.replace(/ /g, '-')}-${targetProductId}`;
    }
  } else if (type !== 'productResult' && (product as Product)?.urlDetail) {
    productDetailUrl = `/products/${(product as Product).urlDetail}`;
  } else if (quoteTitle) {
    productDetailUrl = `/products/${quoteTitle.replace(/ /g, '-')}-${id}`;
  }

  return productDetailUrl;
}
