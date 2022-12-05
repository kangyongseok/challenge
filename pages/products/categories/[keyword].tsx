import { QueryClient, dehydrate } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box } from 'mrcamel-ui';

import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsCategoryTags,
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
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { APP_TOP_STATUS_HEIGHT, locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';

import { convertSearchParamsByQuery } from '@utils/products';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';

function CategoryProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useProductKeywordAutoSave('categories');
  return (
    <>
      <ProductsPageHead variant="categories" params={params} />
      <GeneralTemplate
        header={<ProductsHeader variant="categories" />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <Box customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}>
          <ProductsCategoryTags variant="categories" />
          <ProductsFilter variant="categories" showDynamicFilter />
        </Box>
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="categories" name={attrProperty.productName.CATEGORY} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="categories" />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="categories" />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export async function getServerSideProps({
  query,
  req,
  res,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const params = convertSearchParamsByQuery(query, {
    variant: 'categories'
  });

  const isGoBack = req.cookies.isGoBack ? JSON.parse(req.cookies.isGoBack) : false;
  if (isGoBack) {
    res.setHeader('Set-Cookie', 'isGoBack=false;path=/');

    return {
      props: {
        ...(await serverSideTranslations(locale || defaultLocale)),
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
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient),
      params
    }
  };
}

export default CategoryProducts;
