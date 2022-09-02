import BottomNavigation from '@components/UI/molecules/BottomNavigation';
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
  ProductsKeywordSaveFloatingButton,
  ProductsLegitFilterBottomSheet,
  ProductsMapFilterBottomSheet,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
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
      <ProductsKeywordSaveFloatingButton variant="categories" />
      <ProductsFilterBottomSheet variant="categories" />
      <ProductsMapFilterBottomSheet />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="categories" />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
      <ProductsEventBottomBanner />
    </>
  );
}

export default CategoryProducts;
