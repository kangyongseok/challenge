import { MouseEvent, useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Tabs from '@components/UI/molecules/Tabs';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';

function UserShopTabs() {
  const router = useRouter();
  const { tab = '0' }: { tab?: string } = router.query;

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_MY_STORE, {
      name: attrProperty.name.MY_STORE,
      title: tab === '1' ? attrProperty.title.SOLD : attrProperty.title.SALE
    });
  }, [tab]);

  const handleChange = (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
    router.replace({
      pathname: '/user/shop',
      query: {
        tab: newValue
      }
    });
  };

  return (
    <Box customStyle={{ height: 41 }}>
      <StyledUserShopTabs
        showAppDownloadBanner={showAppDownloadBanner}
        brandColor="black"
        value={tab}
        changeValue={handleChange}
        labels={[
          {
            key: '0',
            value: '판매중'
          },
          {
            key: '1',
            value: '판매완료'
          }
        ]}
      />
    </Box>
  );
}

const StyledUserShopTabs = styled(Tabs)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + 56 : 56}px;
  width: 100%;
  margin: 0 -20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
`;

export default UserShopTabs;
