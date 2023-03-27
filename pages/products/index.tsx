import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Box, Icon, useTheme } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsInfiniteGrid,
  ProductsLandingInfo,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import Initializer from '@library/initializer';
import ABTest from '@library/abTest';

import { getCookies } from '@utils/cookies';

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
        <ProductsFilter variant="search" showDynamicFilter />
        <Gap height={8} />
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

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initABTestIdentifierByCookie(getCookies({ req }));
  return {
    props: {
      abTestIdentifier: ABTest.getIdentifier()
    }
  };
}

export default Products;
