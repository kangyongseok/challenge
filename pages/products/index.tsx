import { useRouter } from 'next/router';
import { Box, Icon, useTheme } from '@mrcamelhub/camel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsFilterHistory,
  ProductsInfiniteGrid,
  ProductsLandingInfo,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsSafePaymentBanner,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

function Products() {
  const router = useRouter();
  const {
    theme: { zIndex }
  } = useTheme();

  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <Header
              leftIcon={
                <Box
                  onClick={() => router.push('/')}
                  customStyle={{
                    padding: 16
                  }}
                >
                  <Icon name="HomeOutlined" />
                </Box>
              }
              customStyle={{ zIndex: zIndex.header + 1 }}
            />
            <ProductsLandingInfo />
          </Box>
        }
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsSafePaymentBanner />
        <ProductsFilter variant="search" />
        <ProductsFilterHistory variant="search" />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsOrderFilterBottomSheet />
    </>
  );
}

export default Products;
