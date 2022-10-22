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

import { fetchSearch } from '@api/product';

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
  req,
  query,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const convertedInitSearchParams = convertSearchParamsByQuery(query, {
    variant: 'search',
    defaultValue: {
      order: 'recommDesc',
      deviceId: req.cookies.deviceId
    }
  });

  const data = await fetchSearch(convertedInitSearchParams);

  if (data) {
    queryClient.setQueryData(queryKeys.products.searchOptions(convertedInitSearchParams), data);
    // TODO 매번 새로운 fetch 가 이루어지는데 정렬이 추천순인 경우 랜덤한 로직이 있어 이전에 사용자가 보던 데이터 유지가 안됨
    // queryClient.setQueryData(queryKeys.products.search(convertedInitSearchParams), {
    //   pages: [data],
    //   pageParams: [0]
    // });
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient),
      params: convertedInitSearchParams
    }
  };
}

export default SearchProducts;
