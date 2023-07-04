import { useEffect } from 'react';

import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';

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
  ProductsOrderFilterBottomSheet,
  ProductsPageHead,
  ProductsRelated,
  ProductsStatus,
  ProductsStructuredData,
  ProductsTopButton
} from '@components/pages/products';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { convertSearchParamsByQuery } from '@utils/products';
import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';
import useHistoryManage from '@hooks/useHistoryManage';

function CategoryProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useProductKeywordAutoSave('categories');

  const { viewToast } = useHistoryManage();

  const toastStack = useToastStack();

  useEffect(() => {
    if (viewToast) {
      toastStack({
        children: (
          <>
            <p>전국의 중고명품을 모두 모았어요.</p>
            <p>원하는 매물을 둘러보세요!</p>
          </>
        )
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ProductsPageHead variant="categories" params={params} />
      <ProductsStructuredData variant="categories" params={params} />
      <GeneralTemplate
        header={<ProductsHeader variant="categories" />}
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsCategoryTags variant="categories" />
        <ProductsDynamicFilter />
        <Gap height={8} />
        <ProductsFilter variant="categories" />
        <ProductsFilterHistory variant="categories" />
        <ProductsStatus variant="categories" />
        <ProductsInfiniteGrid variant="categories" />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="categories" />
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
    variant: 'categories'
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

export default CategoryProducts;
