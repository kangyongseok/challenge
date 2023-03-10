import type { GetServerSidePropsContext } from 'next';

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

import Initializer from '@library/initializer';

import { getCookies } from '@utils/cookies';

function CamelProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="camel" />}
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsCategoryTags variant="camel" />
        <ProductsFilter variant="camel" showDynamicFilter />
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="camel" />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="camel" />
      <ProductsOrderFilterBottomSheet />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initABTestIdentifierByCookie(getCookies({ req }));
  return {
    props: {}
  };
}

export default CamelProducts;
