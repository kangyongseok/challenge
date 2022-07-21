import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import GeneralTemplate from '@components/templates/GeneralTemplate';
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

function CamelProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="camel" />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <ProductsCategoryTags variant="camel" />
        <ProductsFilter
          variant="camel"
          customStyle={{
            top: 101
          }}
        />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="camel" name={attrProperty.productName.MAIN} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="camel" />
      <ProductsMapFilterBottomSheet />
      <ProductsSortFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="camel" />
      <ProductsKeywordDialog />
    </>
  );
}

export default CamelProducts;
