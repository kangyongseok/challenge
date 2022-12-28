/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import {
  Type as ListType,
  SwipeAction,
  SwipeableList,
  SwipeableListItem,
  TrailingActions
} from 'react-swipeable-list';
import { QueryClient, useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Icon, Label, useTheme } from 'mrcamel-ui';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import styled from '@emotion/styled';

import { ListItem } from '@components/UI/atoms';

import type { ChannelDetail } from '@dto/channel';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import { channelUserType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';
import {
  getChannelTitle,
  getLastMessage,
  getLastMessageCreatedAt,
  getUnreadMessagesCount
} from '@utils/channel';

import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMutationLeaveChannel from '@hooks/useMutationLeaveChannel';
import useMutationChannelNoti from '@hooks/useMutationChannelNoti';

interface ChannelsSwipeActionListProps {
  channel: { sendbird: GroupChannel | undefined; camel: ChannelDetail };
  isSelectTargetUser?: boolean;
}

function ChannelsSwipeActionList({
  channel: { sendbird: sendbirdChannel, camel: camelChannel },
  isSelectTargetUser = false
}: ChannelsSwipeActionListProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common },
      typography
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const {
    notiOn: { mutate: mutateNotiOn, isLoading: isLoadingMutateNotiOn },
    notiOff: { mutate: mutateNotiOff, isLoading: isLoadingMutateNotiOff }
  } = useMutationChannelNoti();
  const { mutate: mutateLeaveChannel, isLoading: isLoadingMutateLeaveChannel } =
    useMutationLeaveChannel();
  const { mutate: mutatePutProductUpdateStatus, isLoading: isLoadingMutatePutProductUpdateStatus } =
    useMutation(putProductUpdateStatus);

  const isTargetUserBlocked = useMemo(
    () =>
      !!camelChannel.userBlocks?.some(
        (blockedUser) =>
          blockedUser.userId === accessUser?.userId &&
          blockedUser.targetUser.id === camelChannel?.channelTargetUser?.user?.id
      ),
    [accessUser?.userId, camelChannel?.channelTargetUser?.user?.id, camelChannel.userBlocks]
  );

  const [notiStatus, setNotiStatus] = useState(!!camelChannel.channelUser?.isNoti);

  const handleClickNoti = useCallback(async () => {
    if (isLoadingMutateNotiOn || isLoadingMutateNotiOff || !camelChannel?.channel) return;

    logEvent(attrKeys.channel.CLICK_CHANNEL_ALARM, {
      att: notiStatus ? 'OFF' : 'ON'
    });

    const channelId = camelChannel.channel.id;

    if (notiStatus) {
      await mutateNotiOff(channelId, {
        onSuccess() {
          setNotiStatus((prevState) => !prevState);
        }
      });
    } else {
      await mutateNotiOn(channelId, {
        onSuccess() {
          setNotiStatus((prevState) => !prevState);
        }
      });
    }
  }, [
    camelChannel.channel,
    isLoadingMutateNotiOff,
    isLoadingMutateNotiOn,
    notiStatus,
    mutateNotiOff,
    mutateNotiOn
  ]);

  const handleClickLeave = useCallback(async () => {
    if (isLoadingMutateLeaveChannel || !camelChannel.channel) return;

    logEvent(attrKeys.channel.CLICK_LEAVE, {
      name: attrProperty.name.CHANNEL
    });

    await mutateLeaveChannel(camelChannel.channel.id);
  }, [camelChannel.channel, isLoadingMutateLeaveChannel, mutateLeaveChannel]);

  const handleClickChannel = useCallback(() => {
    if (!camelChannel.channel) return;

    logEvent(attrKeys.channel.CLICK_CHANNEL_DETAIL, { name: attrProperty.name.CHANNEL });

    if (SessionStorage.get(sessionStorageKeys.pushToSavedRedirectChannel)) {
      SessionStorage.remove(sessionStorageKeys.pushToSavedRedirectChannel);
    }

    if (checkAgent.isIOSApp()) {
      window.webkit?.messageHandlers?.callChannel?.postMessage?.(
        `/channels/${camelChannel.channel.id}`
      );
    } else {
      router.push(`/channels/${camelChannel.channel.id}`);
    }
  }, [camelChannel.channel, router]);

  const handleClickSelectTargetUser = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (
        isLoadingMutatePutProductUpdateStatus ||
        !camelChannel.product ||
        !camelChannel.channelTargetUser
      )
        return;

      const productId = camelChannel.product.id;
      const targetUserId = camelChannel.channelTargetUser.user?.id;
      const isTargetUserSeller =
        channelUserType[camelChannel.channelTargetUser.type as keyof typeof channelUserType] ===
        channelUserType[1];

      mutatePutProductUpdateStatus(
        {
          productId,
          status: 1,
          soldType: 1,
          targetUserId
        },
        {
          onSuccess() {
            const queryClient = new QueryClient();

            queryClient.invalidateQueries(queryKeys.products.product({ productId }));
            queryClient.invalidateQueries(queryKeys.channels.channels({ type: 1, size: 100 }));
            queryClient.invalidateQueries(queryKeys.users.products({ page: 0, status: [0, 4] }));
          },
          onSettled() {
            router.replace({
              pathname: '/user/reviews/form',
              query: {
                productId,
                targetUserId,
                isTargetUserSeller
              }
            });
          }
        }
      );
    },
    [
      camelChannel.channelTargetUser,
      camelChannel.product,
      isLoadingMutatePutProductUpdateStatus,
      mutatePutProductUpdateStatus,
      router
    ]
  );

  useEffect(() => {
    setNotiStatus(!!camelChannel.channelUser?.isNoti);
  }, [camelChannel.channelUser?.isNoti]);

  return (
    <SwipeableList fullSwipe={false} type={ListType.IOS}>
      <SwipeableListItem
        onSwipeStart={() => logEvent(attrKeys.channel.SWIPE_X_CHANNEL_LIST)}
        trailingActions={
          <TrailingActions>
            <SwipeAction onClick={handleClickNoti}>
              <ActionContent disabled={isLoadingMutateNotiOn || isLoadingMutateNotiOff}>
                <Icon
                  name={notiStatus ? 'NotiOffOutlined' : 'NotiOutlined'}
                  customStyle={{ color: common.ui60 }}
                />
              </ActionContent>
            </SwipeAction>
            <SwipeAction onClick={handleClickLeave}>
              <ActionContent isRed disabled={isLoadingMutateLeaveChannel}>
                <Icon name="OutRightOutlined" customStyle={{ color: common.uiWhite }} />
              </ActionContent>
            </SwipeAction>
          </TrailingActions>
        }
      >
        <ListItem
          avatarUrl={
            camelChannel.channelTargetUser?.user?.image &&
            !camelChannel.channelTargetUser?.user?.isDeleted
              ? camelChannel.channelTargetUser.user.image
              : 'true'
          }
          title={getChannelTitle({
            targetUser: camelChannel.channelTargetUser,
            groupChannel: sendbirdChannel,
            isTargetUserBlocked,
            currentUserId: String(accessUser?.userId || '')
          })}
          description={
            getLastMessage(sendbirdChannel) || camelChannel.lastMessageManage?.content || ''
          }
          descriptionCustomStyle={{
            fontSize: typography.h4.size,
            lineHeight: typography.h4.lineHeight,
            letterSpacing: typography.h4.letterSpacing
          }}
          time={getLastMessageCreatedAt(camelChannel.lastMessageManage, sendbirdChannel)}
          showNotificationOffIcon={!notiStatus}
          onClick={handleClickChannel}
          action={
            isSelectTargetUser ? (
              <Button
                size="medium"
                variant="ghost"
                brandColor="black"
                onClick={handleClickSelectTargetUser}
              >
                선택
              </Button>
            ) : (
              <>
                {!!sendbirdChannel?.unreadMessageCount && (
                  <Badge
                    variant="solid"
                    brandColor="blue"
                    text={getUnreadMessagesCount(sendbirdChannel.unreadMessageCount)}
                  />
                )}
                <ProductImage
                  url={camelChannel.product?.imageThumbnail || camelChannel.product?.imageMain}
                  isVisible={
                    !!camelChannel.product?.status &&
                    PRODUCT_STATUS[camelChannel.product?.status as keyof typeof PRODUCT_STATUS] ===
                      PRODUCT_STATUS['3']
                  }
                />
              </>
            )
          }
          disabled={
            camelChannel.channelTargetUser?.user?.isDeleted ||
            camelChannel.userBlocks?.some(
              (blockedUser) =>
                blockedUser.userId === accessUser?.userId &&
                blockedUser.targetUser.id === camelChannel.channelTargetUser?.user?.id
            )
          }
        />
      </SwipeableListItem>
    </SwipeableList>
  );
}

const Badge = styled(Label)`
  display: flex;
  justify-content: center;
  padding: 8px 4px;
  border-radius: 12px;
  min-width: 24px;
`;

const ActionContent = styled.div<{ isRed?: boolean; disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  background-color: ${({ isRed, disabled, theme: { palette } }) =>
    (disabled && palette.common.ui60) ||
    (isRed && palette.secondary.red.light) ||
    palette.common.bg02};
  cursor: pointer;
`;

const ProductImage = styled.div<{ url?: string; isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-image: ${({ url }) => `url(${url})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  cursor: pointer;
  visibility: ${({ isVisible }) => (isVisible ? 'hidden' : 'visible')};
`;

export default ChannelsSwipeActionList;
