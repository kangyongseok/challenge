import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';

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
            <ProductsFilter variant="search" showDynamicFilter />
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

export async function getServerSideProps({
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
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
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
`;

export default CrmProducts;
