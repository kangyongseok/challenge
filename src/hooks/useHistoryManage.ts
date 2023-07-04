import { NextRouter, useRouter } from 'next/router';

interface ExtendsType extends NextRouter {
  components?: { [key: string]: string };
}

function useHistoryManage() {
  const { components, pathname }: ExtendsType = useRouter();
  const firstProductListPages = [
    '/products/search/[keyword]',
    '/products/brands/[keyword]',
    '/products/categories/[keyword]'
  ];

  return {
    viewToast: components && !components['/'] && firstProductListPages.includes(pathname),
    isPopStateEvent: components && !components['/'] && pathname === '/products/[id]',
    isGoToMain: components && components['/products/brands/[keyword]']
  };
}

export default useHistoryManage;
