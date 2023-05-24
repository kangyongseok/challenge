import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  Type as ListType,
  SwipeAction,
  SwipeableList,
  SwipeableListItem,
  TrailingActions
} from 'react-swipeable-list';
import { useRouter } from 'next/router';
import { QueryClient, useMutation } from '@tanstack/react-query';
// import { BaseMessage } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { Button, Icon, Label, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { ListItem } from '@components/UI/atoms';

import type { ChannelDetail } from '@dto/channel';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import { channelUserType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImagePathStaticParser, getImageResizePath, hasImageFile } from '@utils/common';
import {
  getChannelTitle,
  // getCustomTypeMessage,
  getLastMessage,
  getLastMessageCreatedAt,
  // getLastMessageCreatedAt,
  getUnreadMessagesCount
} from '@utils/channel';

import { dialogState } from '@recoil/common';
import { channelBottomSheetStateFamily } from '@recoil/channel';
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
      palette: { common, secondary },
      typography
    }
  } = useTheme();

  const setDialogState = useSetRecoilState(dialogState);
  const [{ location }, setSelectTargetUserBottomSheetState] = useRecoilState(
    channelBottomSheetStateFamily('selectTargetUser')
  );

  const { data: accessUser } = useQueryAccessUser();

  const {
    notiOn: { mutate: mutateNotiOn, isLoading: isLoadingMutateNotiOn },
    notiOff: { mutate: mutateNotiOff, isLoading: isLoadingMutateNotiOff }
  } = useMutationChannelNoti();
  const { mutate: mutateLeaveChannel, isLoading: isLoadingMutateLeaveChannel } =
    useMutationLeaveChannel();
  const { mutate: mutatePutProductUpdateStatus, isLoading: isLoadingMutatePutProductUpdateStatus } =
    useMutation(putProductUpdateStatus);

  const isAdminBlockUser =
    camelChannel?.product?.productSeller?.type === 1 &&
    channelUserType[camelChannel?.channelUser?.type as keyof typeof channelUserType] !==
      channelUserType[1];

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

    setDialogState({
      type: 'leaveChannel',
      customStyle: { minWidth: 310, 'button + button': { backgroundColor: secondary.red.main } },
      async secondButtonAction() {
        logEvent(attrKeys.channel.CLICK_CHANNEL_POPUP, {
          name: attrProperty.name.CHANNEL_DETAIL,
          title: attrProperty.title.LEAVE,
          att: 'YES'
        });

        if (camelChannel.channel) await mutateLeaveChannel(camelChannel.channel.id);
      }
    });
  }, [
    camelChannel.channel,
    isLoadingMutateLeaveChannel,
    mutateLeaveChannel,
    secondary.red.main,
    setDialogState
  ]);

  const handleClickChannel = useCallback(() => {
    if (!camelChannel.channel) return;

    logEvent(attrKeys.channel.CLICK_CHANNEL_DETAIL, { name: attrProperty.name.CHANNEL });

    SessionStorage.remove(sessionStorageKeys.pushToSavedRedirectChannel);

    router.push(`/channels/${camelChannel.channel.id}`);
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

      setSelectTargetUserBottomSheetState((currVal) => ({
        open: false,
        isChannel: currVal.isChannel
      }));

      const productId = camelChannel.product.id;

      logEvent(attrKeys.channel.CLICK_CAMEL, {
        name: attrProperty.name.VIEW_SELECT_BUYER,
        att: location,
        ...camelChannel.product,
        id: productId
      });

      const targetUserId = camelChannel.channelTargetUser.user?.id;
      const targetUserName =
        camelChannel.channelTargetUser.user?.nickName || camelChannel.channelTargetUser.user?.name;
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

            queryClient.refetchQueries(queryKeys.products.product({ productId }));
            queryClient.invalidateQueries(queryKeys.channels.channels({ type: 1, size: 100 }));
            queryClient.invalidateQueries(queryKeys.users.products({ page: 0, status: [0, 4] }));
          },
          onSettled() {
            router.push({
              pathname: '/user/reviews/form',
              query: {
                productId,
                targetUserId,
                targetUserName,
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
      location,
      mutatePutProductUpdateStatus,
      router,
      setSelectTargetUserBottomSheetState
    ]
  );

  useEffect(() => {
    setNotiStatus(!!camelChannel.channelUser?.isNoti);
  }, [camelChannel.channelUser?.isNoti]);

  // const lastMessageTime = useMemo(() => {
  //   const dateDiff = dayjs(
  //     sendbirdChannel?.lastMessage?.createdAt || sendbirdChannel?.createdAt
  //   ).diff(dayjs(), 'day');
  //   return dayjs(sendbirdChannel?.lastMessage?.createdAt || sendbirdChannel?.createdAt).format(
  //     dateDiff < 0 ? 'MM월 DD일' : 'A hh:mm'
  //   );
  // }, [sendbirdChannel?.createdAt, sendbirdChannel?.lastMessage?.createdAt]);

  return isSelectTargetUser ? (
    <ListItem
      avatarUrl={
        !camelChannel.channelTargetUser?.user?.isDeleted
          ? (hasImageFile(camelChannel?.channelTargetUser?.user?.imageProfile) &&
              camelChannel?.channelTargetUser?.user?.imageProfile) ||
            (hasImageFile(camelChannel?.channelTargetUser?.user?.image) &&
              camelChannel?.channelTargetUser?.user?.image) ||
            ''
          : ''
      }
      title={getChannelTitle({
        targetUser: camelChannel.channelTargetUser,
        groupChannel: sendbirdChannel,
        isTargetUserBlocked,
        isAdminBlockUser,
        currentUserId: String(accessUser?.userId || '')
      })}
      description={
        camelChannel.lastMessageManage?.content.includes('사진을 보냈습니다.')
          ? camelChannel.lastMessageManage.content
          : camelChannel.lastMessageManage?.content || getLastMessage(sendbirdChannel) || ''
      }
      descriptionCustomStyle={{
        fontSize: typography.h4.size,
        lineHeight: typography.h4.lineHeight,
        letterSpacing: typography.h4.letterSpacing
      }}
      time={getLastMessageCreatedAt(camelChannel.lastMessageManage, sendbirdChannel)}
      // time={lastMessageTime}
      action={
        <Button
          size="large"
          variant="ghost"
          brandColor="black"
          onClick={handleClickSelectTargetUser}
          customStyle={{ minWidth: 55 }}
        >
          선택
        </Button>
      }
      customStyle={{ cursor: 'default' }}
    />
  ) : (
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
          avatarUrl={getImageResizePath({
            imagePath: getImagePathStaticParser(
              !camelChannel.channelTargetUser?.user?.isDeleted
                ? (hasImageFile(camelChannel?.channelTargetUser?.user?.imageProfile) &&
                    camelChannel?.channelTargetUser?.user?.imageProfile) ||
                    (hasImageFile(camelChannel?.channelTargetUser?.user?.image) &&
                      camelChannel?.channelTargetUser?.user?.image) ||
                    ''
                : ''
            ),
            w: 52
          })}
          title={getChannelTitle({
            targetUser: camelChannel.channelTargetUser,
            groupChannel: sendbirdChannel,
            isTargetUserBlocked,
            isAdminBlockUser,
            currentUserId: String(accessUser?.userId || '')
          })}
          description={
            camelChannel.lastMessageManage?.content.includes('사진을 보냈습니다.')
              ? camelChannel.lastMessageManage.content
              : camelChannel.lastMessageManage?.content || getLastMessage(sendbirdChannel) || ''
          }
          isAdminBlockUser={isAdminBlockUser}
          descriptionCustomStyle={{
            fontSize: typography.h4.size,
            lineHeight: typography.h4.lineHeight,
            letterSpacing: typography.h4.letterSpacing
          }}
          time={getLastMessageCreatedAt(camelChannel.lastMessageManage, sendbirdChannel)}
          // time={lastMessageTime}
          showNotificationOffIcon={!notiStatus}
          onClick={handleClickChannel}
          action={
            <>
              {!!sendbirdChannel?.unreadMessageCount && (
                <Badge
                  variant="solid"
                  brandColor="red"
                  text={getUnreadMessagesCount(sendbirdChannel.unreadMessageCount)}
                />
              )}
              <ProductImage
                url={getImageResizePath({
                  imagePath: getImagePathStaticParser(
                    camelChannel.product?.imageThumbnail || camelChannel.product?.imageMain || ''
                  ),
                  w: 44
                })}
              />
            </>
          }
          disabled={
            camelChannel.channelTargetUser?.user?.isDeleted ||
            camelChannel.userBlocks?.some(
              (blockedUser) =>
                blockedUser.userId === accessUser?.userId &&
                blockedUser.targetUser.id === camelChannel.channelTargetUser?.user?.id
            ) ||
            isAdminBlockUser
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

const ProductImage = styled.div<{ url?: string }>`
  display: flex;
  flex-direction: column;
  width: 44px;
  min-width: 44px;
  height: 44px;
  border-radius: 8px;
  background-image: ${({ url }) => `url(${url})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  cursor: pointer;
  visibility: visible;
`;

export default ChannelsSwipeActionList;
