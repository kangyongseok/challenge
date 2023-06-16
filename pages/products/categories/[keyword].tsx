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

function CategoryProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useProductKeywordAutoSave('categories');

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
        <ProductsSafePaymentBanner />
        <ProductsFilter variant="categories" />
        <ProductsFilterHistory variant="categories" />
        <ProductsStatus />
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

export default CategoryProducts;
