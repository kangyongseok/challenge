import { useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Tab, TabGroup } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, TAB_HEIGHT } from '@constants/common';
import { channelType } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';

interface ChannelsTabsProps {
  labels: { key: string; value: string }[];
  value: string;
}

function ChannelsTabs({ labels, value }: ChannelsTabsProps) {
  const router = useRouter();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const changeSelectedValue = useCallback(
    async (newValue: string | number) => {
      let title = attrProperty.title.ALL;
      const newChannelType = +newValue as keyof typeof channelType;

      if (channelType[newChannelType] === channelType['1']) {
        title = attrProperty.title.RECEIVE;
      }

      if (channelType[newChannelType] === channelType['2']) {
        title = attrProperty.title.SEND;
      }

      logEvent(attrKeys.channel.CLICK_TAB, {
        name: attrProperty.name.CHANNEL,
        title
      });

      router
        .replace(
          {
            pathname: '/channels',
            query: { type: newChannelType }
          },
          undefined,
          { shallow: true }
        )
        .then(() => window.scrollTo(0, 0));
    },
    [router]
  );

  return (
    <Box
      component="section"
      customStyle={{ position: 'relative', minHeight: TAB_HEIGHT, zIndex: 1 }}
    >
      <CustomTabGroup
        value={value}
        onChange={changeSelectedValue}
        showAppDownloadBanner={showAppDownloadBanner}
        fullWidth
      >
        {labels.map(({ key, value: labelValue }) => (
          <Tab key={`label-${key}`} text={labelValue} value={key} />
        ))}
      </CustomTabGroup>
    </Box>
  );
}

const CustomTabGroup = styled(TabGroup)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT : HEADER_HEIGHT};
  width: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  transition: top 0.5s;

  // TODO UI 라이브러리 컴포넌트 props 추가
  & button {
    flex: 1;
  }
`;

export default ChannelsTabs;
