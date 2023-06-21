import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductsFilter,
  ProductsFilterBottomSheet,
  ProductsFilterHistory,
  ProductsInfiniteGrid,
  ProductsLegitFilterBottomSheet,
  ProductsOrderFilterBottomSheet,
  ProductsRelated,
  ProductsStatus,
  ProductsTopButton
} from '@components/pages/products';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function CrmProducts() {
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
              <NoticeWrapper showAppDownloadBanner={showAppDownloadBanner}>
                <Typography variant="h4" weight="bold">
                  {userNickName}님
                </Typography>
                <Typography variant="h4" weight="bold" brandColor="primary">
                  {notice}
                </Typography>
              </NoticeWrapper>
            )}
          </Box>
        }
        footer={<BottomNavigation disableHideOnScroll={false} />}
        disablePadding
      >
        <ProductsFilter variant="search" />
        <ProductsFilterHistory variant="search" />
        <ProductsStatus variant="search" />
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
  padding: 8px 20px 16px 20px;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.header};
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT}px;
`;

export default CrmProducts;
