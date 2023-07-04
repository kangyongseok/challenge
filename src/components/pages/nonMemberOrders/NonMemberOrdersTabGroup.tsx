import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Tab, TabGroup } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

function NonMemberOrdersTabGroup() {
  const router = useRouter();
  const { tab = 'history' } = router.query;

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const handleChange = (newValue: string | number) =>
    router.replace({
      pathname: '/mypage/nonMember/orders',
      query: {
        tab: newValue
      }
    });

  return (
    <Box
      customStyle={{
        minHeight: 41
      }}
    >
      <StyledNonMemberOrdersTabGroup
        onChange={handleChange}
        value={String(tab)}
        fullWidth
        showAppDownloadBanner={showAppDownloadBanner}
      >
        <Tab text="주문내역" value="history" />
        <Tab text="문의" value="inquiry" />
      </StyledNonMemberOrdersTabGroup>
    </Box>
  );
}

const StyledNonMemberOrdersTabGroup = styled(TabGroup)<{ showAppDownloadBanner: boolean }>`
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

export default NonMemberOrdersTabGroup;
