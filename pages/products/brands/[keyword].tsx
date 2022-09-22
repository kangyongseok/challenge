import type { GetServerSidePropsContext } from 'next';
import { Box } from 'mrcamel-ui';

import { ProductsSaveSearchPopup } from '@components/UI/organisms';
import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsCategoryTags,
  ProductsEventBottomBanner,
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

import Initializer from '@library/initializer';
import ABTest from '@library/abTest';

import attrProperty from '@constants/attrProperty';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { ABTestGroup } from '@provider/ABTestProvider';
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
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="A">
              <ProductsFilter variant="brands" />
            </ABTestGroup>
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="B">
              <ProductsFilter variant="brands" showDynamicFilter />
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
      <ProductsEventBottomBanner />
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

export default BrandProducts;
