import BottomNavigation from '@components/UI/molecules/BottomNavigation';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsCategoryTags,
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsHeader,
  ProductsInfiniteGrid,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsSafePaymentBanner,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

function CamelProducts() {
  return (
    <>
      <GeneralTemplate
        header={<ProductsHeader variant="camel" />}
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsCategoryTags variant="camel" />
        <ProductsFilter variant="camel" showDynamicFilter />
        <Gap height={8} />
        <ProductsSafePaymentBanner />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="camel" />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="camel" />
      <ProductsOrderFilterBottomSheet />
    </>
  );
}

export default CamelProducts;
