import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
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
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';

function BrandProducts() {
  useProductKeywordAutoSave('brands');

  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <ProductsHeader variant="brands" />
            <ProductsCategoryTags variant="brands" />
            <ProductsFilter variant="brands" showDynamicFilter />
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
        <>
          <Gap height={8} />
          <ProductsStatus />
          <ProductsInfiniteGrid variant="brands" name={attrProperty.productName.BRAND_LIST} />
          <Gap height={8} />
          <ProductsRelated />
        </>
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
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
    }
  };
}

export default BrandProducts;
