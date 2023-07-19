import { useEffect } from 'react';

import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsCategoryTags,
  ProductsDynamicFilter,
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsFilterHistory,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsListBanner,
  ProductsOrderFilterBottomSheet,
  ProductsPageHead,
  ProductsRelated,
  ProductsStatus,
  ProductsStructuredData,
  ProductsTopButton
} from '@components/pages/products';

import SessionStorage from '@library/sessionStorage';

import { fetchSearchMeta } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';

import { convertSearchParamsByQuery } from '@utils/products';
import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';
import { checkAgent } from '@utils/common';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';
import useHistoryManage from '@hooks/useHistoryManage';

function BrandProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { isGoToMain } = useHistoryManage();

  useProductKeywordAutoSave('brands');

  useEffect(() => {
    const handlePopState = () => {
      window.history.replaceState('', '', '/');
      router.replace('/');
    };

    const isSession = SessionStorage.get(sessionStorageKeys.isProductDetailPopState);

    if (isGoToMain && isSession && !checkAgent.isMobileApp()) {
      window.addEventListener('popstate', handlePopState);
    }

    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGoToMain]);

  return (
    <>
      <ProductsPageHead variant="brands" params={params} />
      <ProductsStructuredData variant="brands" params={params} />
      <GeneralTemplate
        header={<ProductsHeader variant="brands" />}
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsCategoryTags variant="brands" />
        <ProductsDynamicFilter />
        <ProductsListBanner />
        <Gap height={8} />
        <ProductsFilter variant="brands" />
        <ProductsFilterHistory variant="brands" />
        <ProductsStatus variant="brands" />
        <ProductsInfiniteGrid variant="brands" />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="brands" />
      <ProductsOrderFilterBottomSheet />
    </>
  );
}

export async function getServerSideProps({
  query,
  req,
  res,
  resolvedUrl
}: GetServerSidePropsContext) {
  if (query.keyword?.includes(' ')) {
    return {
      redirect: {
        destination: encodeURI(decodeURI(resolvedUrl).replace(/ /g, '-')),
        permanent: true
      }
    };
  }

  const params = convertSearchParamsByQuery(query, {
    variant: 'brands'
  });
  const accessUser = getAccessUserByCookies(getCookies({ req }));

  const isGoBack = req.cookies.isGoBack ? JSON.parse(req.cookies.isGoBack) : false;
  if (isGoBack) {
    res.setHeader('Set-Cookie', 'isGoBack=false;path=/');

    return {
      props: {
        params,
        accessUser
      }
    };
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(queryKeys.products.searchMeta(params), () =>
    fetchSearchMeta(params)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      params,
      accessUser
    }
  };
}

export default BrandProducts;
