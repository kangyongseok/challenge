import { useRecoilValue } from 'recoil';
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
  ProductsLegitFilterBottomSheet,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import Initializer from '@library/initializer';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  CMR_LANDING_INFO_HEIGHT,
  HEADER_HEIGHT,
  locales
} from '@constants/common';
import attrProperty from '@constants/attrProperty';

import { getCookies } from '@utils/cookies';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function CrmProducts() {
  const {
    theme: { zIndex }
  } = useTheme();
  const {
    query: { notice }
  } = useRouter();

  const { data: accessUser } = useQueryAccessUser();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <>
      <GeneralTemplate
        header={
          <Box
            customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}
          >
            <Header />
            {notice && (
              <Box customStyle={{ minHeight: CMR_LANDING_INFO_HEIGHT, position: 'relative' }}>
                <NoticeWrapper showAppDownloadBanner={showAppDownloadBanner}>
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
                    zIndex: zIndex.header,
                    top: showAppDownloadBanner
                      ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT
                      : HEADER_HEIGHT
                  }}
                />
              </Box>
            )}
            <ProductsFilter variant="search" showDynamicFilter />
          </Box>
        }
        footer={<BottomNavigation disableHideOnScroll={false} />}
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
      <ProductsLegitFilterBottomSheet />
    </>
  );
}

export async function getServerSideProps({
  req,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  Initializer.initABTestIdentifierByCookie(getCookies({ req }));
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
    }
  };
}

const NoticeWrapper = styled.div<{ showAppDownloadBanner: boolean }>`
  display: flex;
  flex-direction: column;
  position: fixed;
  padding: 8px 20px 16px 20px;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.header};
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT}px;
`;

export default CrmProducts;
