import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import ProductsSaveSearchFloatingButton from '@components/pages/products/ProductsSaveSearchFloatingButton';
import {
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
        <ProductsInfiniteGrid
          source={attrProperty.productSource.PRODUCT_LIST}
          variant="search"
          name={attrProperty.productName.SEARCH}
        />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsSaveSearchFloatingButton variant="search" />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsMapFilterBottomSheet />
      <ProductsSortFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="search" />
      <ProductsKeywordDialog />
    </>
  );
}

export default SearchProducts;
