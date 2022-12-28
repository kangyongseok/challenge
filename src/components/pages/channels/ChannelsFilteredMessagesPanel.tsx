import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import ChannelListSkeleton from '@components/UI/molecules/Skeletons/ChannelListSkeleton';

import type { ProductResult } from '@dto/product';
import type { Channel } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { PRODUCT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelReceivedMessageFilteredState } from '@recoil/channel';
import useQueryChannels from '@hooks/useQueryChannels';

import ChannelsSwipeActionList from './ChannelsSwipeActionList';
import ChannelsReceivedMessagesFilter from './ChannelsReceivedMessagesFilter';

function ChannelsFilteredMessagesPanel() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const isChannelReceivedMessageFiltered = useRecoilValue(channelReceivedMessageFilteredState);

  const {
    data: { channels, filteredChannels },
    isLoading,
    isFetched
  } = useQueryChannels({ type: 1 });

  useEffect(() => {
    logEvent(attrKeys.channel.VIEW_CHANNEL, { title: attrProperty.title.RECEIVE });
  }, []);

  return isLoading || (isFetched && filteredChannels.length > 0) ? (
    <>
      <ChannelsReceivedMessagesFilter isLoading={isLoading} />
      {isLoading ? (
        <Flexbox component="section" customStyle={{ margin: '12px 0' }}>
          {Array.from({ length: 1 }, (__, index) => (
            <ChannelListSkeleton key={`channel-skeleton-${index}`} />
          ))}
        </Flexbox>
      ) : (
        <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, margin: '12px 0px' }}>
          {isChannelReceivedMessageFiltered
            ? filteredChannels.map((filteredChannel) => (
                <Flexbox
                  key={`channel-product-filter-${
                    (filteredChannel[0].camel.product as ProductResult).id
                  }`}
                  direction="vertical"
                >
                  <Typography variant="body2" weight="bold" customStyle={{ padding: '8px 20px' }}>
                    {`${(filteredChannel[0].camel.product as ProductResult).title}${
                      [PRODUCT_STATUS['1'], PRODUCT_STATUS['2'], PRODUCT_STATUS['3']].includes(
                        PRODUCT_STATUS[
                          (filteredChannel[0].camel.product as ProductResult)
                            .status as keyof typeof PRODUCT_STATUS
                        ]
                      )
                        ? ' (판매완료)'
                        : ''
                    }`}
                  </Typography>
                  {filteredChannel.map((channel) => (
                    <ChannelsSwipeActionList
                      key={`channel-list-${(channel.camel.channel as Channel).id}`}
                      channel={channel}
                    />
                  ))}
                </Flexbox>
              ))
            : channels.map((channel) => (
                <Flexbox
                  key={`channel-list-${(channel.camel.channel as Channel).id}`}
                  direction="vertical"
                >
                  <ChannelsSwipeActionList channel={channel} />
                </Flexbox>
              ))}
          <Typography
            variant="body1"
            customStyle={{ padding: '52px 20px', textAlign: 'center', color: common.ui60 }}
          >
            최근 6개월의 대화 목록만 노출됩니다.
          </Typography>
        </Flexbox>
      )}
    </>
  ) : (
    <Flexbox
      component="section"
      direction="vertical"
      justifyContent="center"
      alignment="center"
      gap={20}
      customStyle={{ padding: '84px 20px' }}
    >
      <Box customStyle={{ fontSize: 52 }}>💬</Box>
      <Typography variant="h3" weight="bold" customStyle={{ color: common.ui60 }}>
        채팅 내역이 없어요
      </Typography>
    </Flexbox>
  );
}

export default ChannelsFilteredMessagesPanel;
