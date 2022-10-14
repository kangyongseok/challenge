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

import attrProperty from '@constants/attrProperty';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';

function SearchProducts() {
  useProductKeywordAutoSave('search');

  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <ProductsHeader variant="search" />
            <ProductsRelatedKeywords />
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

export default SearchProducts;
