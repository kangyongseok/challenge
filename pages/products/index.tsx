import type { GetServerSidePropsContext } from 'next';
import { Box } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsInfiniteGrid,
  ProductsKeywordDialog,
  ProductsLandingInfo,
  ProductsLegitFilterBottomSheet,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import Initializer from '@library/initializer';
import ABTest from '@library/abTest';

import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { ABTestGroup } from '@provider/ABTestProvider';

function Products() {
  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <Header disableProductsKeywordClickInterceptor={false} />
            <ProductsLandingInfo />
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="A">
              <ProductsFilter variant="search" />
            </ABTestGroup>
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="B">
              <ProductsFilter variant="search" showDynamicFilter />
            </ABTestGroup>
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
        <ProductsInfiniteGrid variant="search" />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initABTestIdentifierByCookie(req.cookies);

  return {
    props: {
      abTestIdentifier: ABTest.getIdentifier()
    }
  };
}

export default Products;
