import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { Button, CustomStyle, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';

import ChannelListSkeleton from '@components/UI/molecules/Skeletons/ChannelListSkeleton';
import { Empty } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { channelType } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import useInfiniteQueryChannels from '@hooks/useInfiniteQueryChannels';
import useDetectScrollFloorTrigger from '@hooks/useDetectScrollFloorTrigger';

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
  const router = useRouter();
  const { triggered } = useDetectScrollFloorTrigger();

  const {
    channels,
    isInitialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    fetchStatus
  } = useInfiniteQueryChannels(props);

  const handleClickProductsList = () => {
    router.push('/products');
  };

  useEffect(() => {
    const { type, productId } = props;

    if (type === 0) logEvent(attrKeys.channel.VIEW_CHANNEL);

    if (type === 1 && !!productId)
      logEvent(attrKeys.channel.VIEW_CHANNEL, { title: attrProperty.title.PRODUCT });

    if (type === 2) logEvent(attrKeys.channel.VIEW_CHANNEL, { title: attrProperty.title.SEND });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (triggered && !isFetchingNextPage && hasNextPage) fetchNextPage().then();
  }, [fetchNextPage, triggered, hasNextPage, isFetchingNextPage]);

  if (fetchStatus === 'idle' && !channels.length) {
    const isChannels = router.pathname.split('/').includes('channels');
    return (
      <Empty>
        <Image
          src={getImageResizePath({
            imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/empty_${
              isChannels ? 'think' : 'paper'
            }.png`,
            w: 52
          })}
          alt="empty img"
          width={52}
          height={52}
          disableAspectRatio
          disableSkeleton
        />
        <Flexbox direction="vertical" alignment="center" justifyContent="center" gap={8}>
          <Typography variant="h3" weight="bold" color="ui60">
            {isChannels ? '채팅 내역이' : '문의내역이'} 없어요
          </Typography>
          {!isChannels && (
            <Typography variant="h4" color="ui60">
              카멜에서 마음에 드는 매물을 찾아보세요
            </Typography>
          )}
        </Flexbox>
        {!isChannels && (
          <Button variant="ghost" brandColor="gray" onClick={handleClickProductsList} size="large">
            <Typography variant="h4" weight="medium">
              매물 보러가기
            </Typography>
          </Button>
        )}
      </Empty>
    );
  }

  return (
    <Flexbox
      component="section"
      direction="vertical"
      customStyle={{
        margin: '12px 0',
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
