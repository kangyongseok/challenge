import { ProductsSaveSearchPopup } from '@components/UI/organisms';
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

function BrandProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="brands" />}
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <ProductsCategoryTags variant="brands" />
        <ProductsFilter
          variant="brands"
          customStyle={{
            top: 101
          }}
        />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="brands" name={attrProperty.productName.BRAND_LIST} />
        <ProductsRelated />
        <ProductsTopButton />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsKeywordSaveFloatingButton variant="brands" />
      <ProductsFilterBottomSheet variant="brands" />
      <ProductsMapFilterBottomSheet />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordBottomSheet variant="brands" />
      <ProductsKeywordDialog />
      <ProductsSaveSearchPopup />
      <ProductsLegitFilterBottomSheet />
      <ProductsEventBottomBanner />
    </>
  );
}

export default BrandProducts;
