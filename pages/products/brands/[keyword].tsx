import { QueryClient, dehydrate } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box } from 'mrcamel-ui';

import { ProductsSaveSearchPopup } from '@components/UI/organisms';
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

function BrandProducts({ params }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useProductKeywordAutoSave('brands');

  return (
    <>
      <ProductsPageHead variant="brands" params={params} />
      <GeneralTemplate
        header={<ProductsHeader variant="brands" />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <Box customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}>
          <ProductsCategoryTags variant="brands" />
          <ProductsFilter variant="brands" showDynamicFilter />
        </Box>
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="brands" name={attrProperty.productName.BRAND_LIST} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="brands" />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="brands" />
      <ProductsKeywordDialog />
      <ProductsSaveSearchPopup />
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
    variant: 'brands'
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

export default BrandProducts;
