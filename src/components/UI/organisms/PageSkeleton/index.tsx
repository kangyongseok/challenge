import { useEffect, useRef, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import { getPathNameByAsPath } from '@utils/common';

import { isGoBackState } from '@recoil/common';

import { StyledPageSkeleton } from './PageSkeleton.styles';
import { BrandProducts, CategoryProducts, ProductDetail, SearchProducts } from './pages';

const serverSideRenderPages = [
  '/products/categories/[keyword]',
  '/products/brands/[keyword]',
  '/products/search/[keyword]',
  '/products/camel',
  '/products/[id]'
];

function PageSkeleton() {
  const router = useRouter();

  const isGoBack = useRecoilValue(isGoBackState);

  const [pathname, setPathName] = useState('/');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const currentPathNameRef = useRef('/');
  const isLoadingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isVisibleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const scrollTopTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      const newPathName = getPathNameByAsPath(url);

      if (isGoBack) return;

      const productsPages = [...serverSideRenderPages];
      productsPages.pop();

      const isNextProductsPage = productsPages.some(
        (productsPathName) => newPathName.indexOf(productsPathName) !== -1
      );
      const isCurrentProductsPage = productsPages.some(
        (productsPathName) => currentPathNameRef.current.indexOf(productsPathName) !== -1
      );

      if (isNextProductsPage && isCurrentProductsPage) return;

      if (serverSideRenderPages.includes(newPathName)) {
        setIsVisible(true);
        setPathName(newPathName);
        isLoadingTimerRef.current = setTimeout(() => setIsLoading(true));
      }
    };

    const handleRouteChangeComplete = (url: string) => {
      currentPathNameRef.current = getPathNameByAsPath(url);
      setIsLoading(false);

      if (!isGoBack) {
        scrollTopTimerRef.current = setTimeout(() => window.scrollTo({ top: 0 }), 120);
      }

      isVisibleTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 200);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events, isGoBack]);

  useEffect(() => {
    currentPathNameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (isLoadingTimerRef.current) {
        clearTimeout(isLoadingTimerRef.current);
      }
      if (isVisibleTimerRef.current) {
        clearTimeout(isVisibleTimerRef.current);
      }
      if (scrollTopTimerRef.current) {
        clearTimeout(scrollTopTimerRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <StyledPageSkeleton isLoading={isLoading}>
      {pathname === '/products/categories/[keyword]' && <CategoryProducts />}
      {pathname === '/products/camel' && <CategoryProducts />}
      {pathname === '/products/brands/[keyword]' && <BrandProducts />}
      {pathname === '/products/search/[keyword]' && <SearchProducts />}
      {pathname === '/products/[id]' && <ProductDetail />}
    </StyledPageSkeleton>
  );
}

export default PageSkeleton;
