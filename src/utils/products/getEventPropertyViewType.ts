import { ProductsVariant } from '@typings/products';

export default function getEventPropertyViewType(
  variant: ProductsVariant,
  parentIds?: string | string[]
) {
  if (variant === 'categories') {
    return 'CATEGORY';
  }
  if (variant === 'brands' && !parentIds) {
    return 'BRAND';
  }
  if (variant === 'brands' && parentIds) {
    return 'BRAND_CATEGORY1';
  }
  if (variant === 'camel') {
    return 'CAMEL';
  }

  return 'SEARCH';
}
