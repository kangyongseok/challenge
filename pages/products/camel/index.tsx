import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticPropsContext } from 'next';
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
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import { APP_TOP_STATUS_HEIGHT, locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function CamelProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="camel" />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <Box customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}>
          <ProductsCategoryTags variant="camel" />
          <ProductsFilter variant="camel" />
        </Box>
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="camel" name={attrProperty.productName.MAIN} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="camel" />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="camel" />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export async function getStaticProps({
  locale,
  defaultLocale = locales.ko.lng
}: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
    }
  };
}

export default CamelProducts;
