import { QueryClient, dehydrate } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box } from 'mrcamel-ui';

import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsKeywordBottomSheet,
  ProductsKeywordDialog,
  ProductsLegitFilterBottomSheet,
  ProductsOrderFilterBottomSheet,
  ProductsPageHead,
  ProductsRelated,
  ProductsRelatedKeywords,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';

import { convertSearchParamsByQuery } from '@utils/products';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';

function SearchProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useProductKeywordAutoSave('search');

  return (
    <>
      <ProductsPageHead variant="search" params={params} />
      <GeneralTemplate
        header={
          <Box>
            <ProductsHeader variant="search" />
            <ProductsRelatedKeywords />
            <ProductsFilter variant="search" showDynamicFilter />
          </Box>
        }
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" name={attrProperty.productName.SEARCH} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="search" />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export async function getServerSideProps({
  query,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const params = convertSearchParamsByQuery(query, {
    variant: 'search'
  });

  const data = await fetchSearchMeta(params);

  if (data) {
    queryClient.setQueryData(queryKeys.products.searchMeta(params), data);
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient),
      params
    }
  };
}

export default SearchProducts;
