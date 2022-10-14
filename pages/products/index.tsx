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

function Products() {
  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <Header disableProductsKeywordClickInterceptor={false} />
            <ProductsLandingInfo />
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

export default Products;
