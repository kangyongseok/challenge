import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Tab, TabGroup } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

function MypageOrdersTabGroup() {
  const router = useRouter();
  const { tab = 'buy' } = router.query;

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <Box
      customStyle={{
        minHeight: 41
      }}
    >
      <StyledMypageOrdersTabGroup
        showAppDownloadBanner={showAppDownloadBanner}
        onChange={(newValue) =>
          router.replace({
            pathname: '/mypage/orders',
            query: {
              tab: newValue
            }
          })
        }
        value={String(tab)}
        fullWidth
      >
        <Tab text="구매" value="buy" />
        <Tab text="판매" value="sale" />
      </StyledMypageOrdersTabGroup>
    </Box>
  );
}

const StyledMypageOrdersTabGroup = styled(TabGroup)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  width: 100%;

  top: ${({ showAppDownloadBanner }) => {
    return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
      showAppDownloadBanner ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT : HEADER_HEIGHT
    }px)`;
  }};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};

  transition: top 0.5s;
`;

export default MypageOrdersTabGroup;
