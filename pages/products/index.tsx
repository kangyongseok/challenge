import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsInfiniteGrid,
  ProductsKeywordDialog,
  ProductsLandingInfo,
  ProductsMapFilterBottomSheet,
  ProductsRelated,
  ProductsSortFilterBottomSheet,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

function Products() {
  return (
    <>
      <GeneralTemplate
        header={<Header isFixed disableProductsKeywordClickInterceptor={false} />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <ProductsLandingInfo />
        <ProductsFilter
          variant="search"
          customStyle={{
            top: 56
          }}
        />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsMapFilterBottomSheet />
      <ProductsSortFilterBottomSheet />
      <ProductsKeywordDialog />
    </>
  );
}

export default Products;
