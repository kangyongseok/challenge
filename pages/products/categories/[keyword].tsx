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

import attrProperty from '@constants/attrProperty';

import useProductKeywordAutoSave from '@hooks/useProductKeywordAutoSave';

function CategoryProducts() {
  useProductKeywordAutoSave('categories');

  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <ProductsHeader variant="categories" />
            <ProductsCategoryTags variant="categories" />
            <ProductsFilter variant="categories" showDynamicFilter />
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
        <ProductsInfiniteGrid variant="categories" name={attrProperty.productName.CATEGORY} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="categories" />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="categories" />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export default CategoryProducts;
