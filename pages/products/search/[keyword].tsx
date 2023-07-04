import { useEffect } from 'react';

import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';

import { KeywordAlertManageBottomSheet, KeywordAlertOffDialog } from '@components/UI/organisms';
import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsDynamicFilter,
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsFilterHistory,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsKeywordAlertFab,
  ProductsOrderFilterBottomSheet,
  ProductsPageHead,
  ProductsRelated,
  ProductsRelatedKeywords,
  ProductsStatus,
  ProductsStructuredData,
  ProductsTopButton
} from '@components/pages/products';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';

import { convertSearchParamsByQuery } from '@utils/products';
import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';
import useHistoryManage from '@hooks/useHistoryManage';

function SearchProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useProductKeywordAutoSave('search');
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
      <ProductsPageHead variant="search" params={params} />
      <ProductsStructuredData variant="search" params={params} />
      <GeneralTemplate
        header={<ProductsHeader variant="search" />}
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsRelatedKeywords />
        <ProductsDynamicFilter />
        <Gap height={8} />
        <ProductsFilter variant="search" />
        <ProductsFilterHistory variant="search" />
        <ProductsStatus variant="search" />
        <ProductsInfiniteGrid variant="search" />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsKeywordAlertFab />
      <ProductsOrderFilterBottomSheet />
      <KeywordAlertManageBottomSheet
        name={attrProperty.name.PRODUCT_LIST}
        title={attrProperty.title.FLOATING}
      />
      <KeywordAlertOffDialog />
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
    variant: 'search'
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

export default SearchProducts;
