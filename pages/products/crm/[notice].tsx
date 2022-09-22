import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Box, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsInfiniteGrid,
  ProductsKeywordDialog,
  ProductsLegitFilterBottomSheet,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import Initializer from '@library/initializer';
import ABTest from '@library/abTest';

import attrProperty from '@constants/attrProperty';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { ABTestGroup } from '@provider/ABTestProvider';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function CrmProducts() {
  const {
    theme: { zIndex }
  } = useTheme();
  const {
    query: { notice }
  } = useRouter();

  const { data: accessUser } = useQueryAccessUser();

  return (
    <>
      <GeneralTemplate
        header={
          <Box>
            <Header disableProductsKeywordClickInterceptor={false} />
            {notice && (
              <Box customStyle={{ minHeight: 72, position: 'relative' }}>
                <NoticeWrapper>
                  <Typography variant="h4" weight="bold">
                    {`${(accessUser || {}).userName || '회원'}님`}
                  </Typography>
                  <Typography variant="h4" weight="bold" brandColor="primary">
                    {notice}
                  </Typography>
                </NoticeWrapper>
                <Gap
                  height={8}
                  customStyle={{
                    position: 'fixed',
                    marginTop: 64,
                    zIndex: zIndex.header
                  }}
                />
              </Box>
            )}
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="A">
              <ProductsFilter variant="search" />
            </ABTestGroup>
            <ABTestGroup name={abTestTaskNameKeys.dynamicFilter2209} belong="B">
              <ProductsFilter variant="search" showDynamicFilter />
            </ABTestGroup>
          </Box>
        }
        footer={
          <BottomNavigation
            disableHideOnScroll={false}
            disableProductsKeywordClickInterceptor={false}
          />
        }
        disablePadding
      >
        <Gap height={8} />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" name={attrProperty.productName.CRM} />
        <Gap height={8} />
        <ProductsRelated />
      </GeneralTemplate>
      <ProductsTopButton />
      <ProductsFilterBottomSheet variant="search" />
      <ProductsOrderFilterBottomSheet />
      <ProductsKeywordDialog />
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initABTestIdentifierByCookie(req.cookies);

  return {
    props: {
      abTestIdentifier: ABTest.getIdentifier()
    }
  };
}

const NoticeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  padding: 8px 20px 16px 20px;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.header};
  background-color: ${({ theme }) => theme.palette.common.white};
`;

export default CrmProducts;
