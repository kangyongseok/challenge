import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticPropsContext } from 'next';

import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsCategoryTags,
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';

function CamelProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="camel" />}
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsCategoryTags variant="camel" />
        <ProductsFilter variant="camel" />
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="camel" name={attrProperty.productName.MAIN} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="camel" />
      <ProductsOrderFilterBottomSheet />
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
