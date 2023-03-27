import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
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
  ProductsSafePaymentBanner,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  CMR_LANDING_INFO_HEIGHT,
  HEADER_HEIGHT,
  IOS_SAFE_AREA_TOP
} from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function CrmProducts() {
  const {
    theme: { zIndex }
  } = useTheme();
  const {
    query: { notice }
  } = useRouter();

  const { userNickName } = useQueryMyUserInfo();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <>
      <GeneralTemplate
        header={
          <Box customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0 }}>
            <Header />
            {notice && (
              <Box customStyle={{ minHeight: CMR_LANDING_INFO_HEIGHT, position: 'relative' }}>
                <NoticeWrapper showAppDownloadBanner={showAppDownloadBanner}>
                  <Typography variant="h4" weight="bold">
                    {userNickName}님
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
        <ProductsSafePaymentBanner />
        <ProductsStatus />
        <ProductsInfiniteGrid variant="search" />
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
