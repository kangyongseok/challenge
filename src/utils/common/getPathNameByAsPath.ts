export function getPathNameByAsPath(asPath: string) {
  if (asPath.indexOf('/products/categories') > -1) {
    return '/products/categories/[keyword]';
  }
  if (asPath.indexOf('/products/brands') > -1) {
    return '/products/brands/[keyword]';
  }
  if (asPath.indexOf('/products/search') > -1) {
    return '/products/search/[keyword]';
  }
  if (asPath.indexOf('/products/camel') > -1) {
    return '/products/camel';
  }
  if (asPath.indexOf('/products/crm') > -1) {
    return '/products/crm/[notice]';
  }
  if (asPath.indexOf('/products') > -1) {
    return '/products/[id]';
  }
  return '/';
}
