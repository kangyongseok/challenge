/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect } from 'react';

import { AutoSizer, InfiniteLoader, List, WindowScroller } from 'react-virtualized';
import type { Index, ListRowProps } from 'react-virtualized';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

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
}

function ChannelsMessagesPanel({
  isSelectTargetUser = false,
  ...props
}: ChannelsMessagesPanelProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { channels, isLoading, isFetched, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQueryChannels(props);

  const loadMoreRows = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const rowRenderer = useCallback(
    ({ key, index, style }: ListRowProps) => {
      const channel = channels[index];

      return channel ? (
        <div key={key} style={style}>
          <ChannelsSwipeActionList channel={channel} isSelectTargetUser={isSelectTargetUser} />
        </div>
      ) : null;
    },
    [channels, isSelectTargetUser]
  );

  useEffect(() => {
    const { type, productId } = props;

    if (type === 0) logEvent(attrKeys.channel.VIEW_CHANNEL);

    if (type === 1 && !!productId)
      logEvent(attrKeys.channel.VIEW_CHANNEL, { title: attrProperty.title.PRODUCT });

    if (type === 2) logEvent(attrKeys.channel.VIEW_CHANNEL, { title: attrProperty.title.SEND });
    // eslint-disable-next-line
  }, []);

  return isLoading || (isFetched && channels.length > 0) ? (
    <Flexbox component="section" direction="vertical" customStyle={{ margin: '12px 0', flex: 1 }}>
      {channels.length === 0 && isLoading ? (
        Array.from({ length: 10 }, (__, j) => <ChannelListSkeleton key={`channel-skeleton-${j}`} />)
      ) : (
        // @ts-ignore
        <InfiniteLoader
          isRowLoaded={({ index }: Index) => !!channels[index]}
          loadMoreRows={loadMoreRows}
          rowCount={hasNextPage ? channels.length + 1 : channels.length}
        >
          {({ registerChild, onRowsRendered }) => (
            // @ts-ignore
            <WindowScroller>
              {({ height, isScrolling, scrollTop, scrollLeft }) => (
                // @ts-ignore
                <AutoSizer disableHeight>
                  {({ width }) => (
                    // @ts-ignore
                    <List
                      ref={registerChild}
                      onRowsRendered={onRowsRendered}
                      width={width}
                      autoHeight
                      height={height}
                      rowCount={channels.length}
                      rowHeight={76}
                      rowRenderer={rowRenderer}
                      scrollTop={scrollTop}
                      scrollLeft={scrollLeft}
                      isScrolling={isScrolling}
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
        </InfiniteLoader>
      )}
    </Flexbox>
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

export default ChannelsMessagesPanel;
