/**
 * @name getPageNameByPathName
 * @returns string
 * @example MAIN, PRODUCT_LIST, SEARCH
 */
export function getPageNameByPathName(pathname: string) {
  let pageName = 'NONE';

  if (pathname === '/') {
    pageName = 'MAIN';
  } else if (pathname === '/search') {
    pageName = 'SEARCHMODAL';
  } else if (pathname === '/category') {
    pageName = 'CATEGORY';
  } else if (pathname === '/ranking') {
    pageName = 'HOT';
  } else if (pathname === '/productList') {
    pageName = 'PRODUCT_LIST';
  } else if (pathname.indexOf('/product/') >= 0) {
    pageName = 'PRODUCT_DETAIL';
  } else if (pathname === '/brands') {
    pageName = 'BRAND';
  }

  return pageName;
}
