import type { GetServerSidePropsContext } from 'next';
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
  ProductsRelated,
  ProductsRelatedKeywords,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import Initializer from '@library/initializer';
import ABTest from '@library/abTest';

import attrProperty from '@constants/attrProperty';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { ABTestGroup } from '@provider/ABTestProvider';
import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';

function SearchProducts() {
  useProductKeywordAutoSave('search');

  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <ProductsHeader variant="search" />
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="A">
              <ProductsFilter variant="search" />
            </ABTestGroup>
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="B">
              <ProductsRelatedKeywords />
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

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initABTestIdentifierByCookie(req.cookies);

  return {
    props: {
      abTestIdentifier: ABTest.getIdentifier()
    }
  };
}

export default SearchProducts;
