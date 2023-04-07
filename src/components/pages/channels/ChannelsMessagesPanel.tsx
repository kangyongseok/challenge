/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect } from 'react';

import { Box, CustomStyle, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import ChannelListSkeleton from '@components/UI/molecules/Skeletons/ChannelListSkeleton';

import { logEvent } from '@library/amplitude';

import { channelType } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useInfiniteQueryChannels from '@hooks/useInfiniteQueryChannels';

import ChannelsSwipeActionList from './ChannelsSwipeActionList';

interface ChannelsMessagesPanelProps {
  type: keyof typeof channelType;
  productId?: number;
  isSelectTargetUser?: boolean;
  customStyle?: CustomStyle;
}

function ChannelsMessagesPanel({
  isSelectTargetUser = false,
  customStyle,
  ...props
}: ChannelsMessagesPanelProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { channels, isInitialLoading, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQueryChannels(props);

  useEffect(() => {
    const { type, productId } = props;

    if (type === 0) logEvent(attrKeys.channel.VIEW_CHANNEL);

    if (type === 1 && !!productId)
      logEvent(attrKeys.channel.VIEW_CHANNEL, { title: attrProperty.title.PRODUCT });

    if (type === 2) logEvent(attrKeys.channel.VIEW_CHANNEL, { title: attrProperty.title.SEND });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleScroll = async () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      const isFloor = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if (hasNextPage && !isFetchingNextPage && isFloor) {
        await fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!isLoading && !channels.length) {
    return (
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

  return (
    <Flexbox
      component="section"
      direction="vertical"
      customStyle={{
        margin: '12px 0',
        flex: 1,
        ...customStyle
      }}
    >
      {isInitialLoading &&
        Array.from({ length: 10 }, (__, j) => (
          <ChannelListSkeleton key={`channel-skeleton-${j}`} />
        ))}
      {!isInitialLoading &&
        channels.map((channel) => (
          <ChannelsSwipeActionList
            key={`channel-${channel?.camel?.channel?.id}`}
            channel={channel}
            isSelectTargetUser={isSelectTargetUser}
          />
        ))}
    </Flexbox>
  );
}

export default ChannelsMessagesPanel;
