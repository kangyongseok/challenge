import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import ProductsSaveSearchFloatingButton from '@components/pages/products/ProductsSaveSearchFloatingButton';
import {
  ProductsCategoryTags,
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsKeywordBottomSheet,
  ProductsKeywordDialog,
  ProductsMapFilterBottomSheet,
  ProductsRelated,
  ProductsSortFilterBottomSheet,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import attrProperty from '@constants/attrProperty';

function CategoryProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="categories" />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <ProductsCategoryTags variant="categories" />
        <ProductsFilter
          variant="categories"
          customStyle={{
            top: 101
          }}
        />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="categories" name={attrProperty.productName.CATEGORY} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsSaveSearchFloatingButton variant="categories" />
      <ProductsFilterBottomSheet variant="categories" />
      <ProductsMapFilterBottomSheet />
      <ProductsSortFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="categories" />
      <ProductsKeywordDialog />
    </>
  );
}

export default CategoryProducts;
