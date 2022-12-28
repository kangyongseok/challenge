import { useCallback } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Tabs } from '@components/UI/molecules';

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
    async (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
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
      <CustomTabs
        value={value}
        changeValue={changeSelectedValue}
        labels={labels}
        showAppDownloadBanner={showAppDownloadBanner}
      />
    </Box>
  );
}

const CustomTabs = styled(Tabs)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT : HEADER_HEIGHT};
  width: 100%;
  transition: all 0.5s;

  & > button {
    padding: 0;

    & > h4 {
      padding: 0;
    }
  }
`;

export default ChannelsTabs;
