import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import { KeywordAlertManageBottomSheet, KeywordAlertOffDialog } from '@components/UI/organisms';
import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsKeywordAlertFab,
  ProductsOrderFilterBottomSheet,
  ProductsPageHead,
  ProductsRelated,
  ProductsRelatedKeywords,
  ProductsSafePaymentBanner,
  ProductsStatus,
  ProductsStructuredData,
  ProductsTopButton
} from '@components/pages/products';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';

import { convertSearchParamsByQuery } from '@utils/products';

function SearchProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
        <ProductsFilter variant="search" showDynamicFilter />
        <Gap height={8} />
        <ProductsSafePaymentBanner />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" />
        <Gap height={8} />
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

  const isGoBack = req.cookies.isGoBack ? JSON.parse(req.cookies.isGoBack) : false;
  if (isGoBack) {
    res.setHeader('Set-Cookie', 'isGoBack=false;path=/');

    return {
      props: {
        params
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
      params
    }
  };
}

export default SearchProducts;
