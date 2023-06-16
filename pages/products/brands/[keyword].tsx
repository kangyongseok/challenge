import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import BottomNavigation from '@components/UI/molecules/BottomNavigation';
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
  ProductsSafePaymentBanner,
  ProductsStatus,
  ProductsStructuredData,
  ProductsTopButton
} from '@components/pages/products';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { convertSearchParamsByQuery } from '@utils/products';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';

function BrandProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useProductKeywordAutoSave('brands');

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
        <ProductsSafePaymentBanner />
        <ProductsFilter variant="brands" />
        <ProductsFilterHistory variant="brands" />
        <ProductsStatus />
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

export default BrandProducts;
