import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
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

function SearchProducts() {
  // TODO SearchBar isFixed Props 보완
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="search" />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <ProductsFilter
          variant="search"
          customStyle={{
            top: 58
          }}
        />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" name={attrProperty.productName.SEARCH} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsKeywordSaveFloatingButton variant="search" />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsMapFilterBottomSheet />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="search" />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export default SearchProducts;
