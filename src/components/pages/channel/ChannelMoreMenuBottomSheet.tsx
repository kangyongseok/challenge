import { useCallback, useEffect } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { ChannelDetail } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { dialogState } from '@recoil/common';
import { channelBottomSheetStateFamily } from '@recoil/channel/atom';
import useMutationUserBlock from '@hooks/useMutationUserBlock';
import useMutationLeaveChannel from '@hooks/useMutationLeaveChannel';
import useMutationChannelNoti from '@hooks/useMutationChannelNoti';

interface ChannelMoreMenuBottomSheetProps {
  channelId: number;
  productId: number;
  isNotiOn: boolean;
  targetUserName: string;
  targetUserId: number;
  isTargetUserSeller: boolean;
  isTargetUserBlocked: boolean;
  isDeletedTargetUser: boolean;
  isCamelAdminUser?: boolean;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelMoreMenuBottomSheet({
  channelId,
  productId,
  isNotiOn,
  targetUserId,
  targetUserName,
  isTargetUserSeller,
  isTargetUserBlocked,
  isDeletedTargetUser,
  isCamelAdminUser,
  refetchChannel
}: ChannelMoreMenuBottomSheetProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { secondary }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const queryClient = useQueryClient();

  const [{ open }, setMoreBottomSheetState] = useRecoilState(channelBottomSheetStateFamily('more'));
  const setDialogState = useSetRecoilState(dialogState);

  const {
    notiOn: { mutate: mutateNotiOn, isLoading: isLaodingNoitOn },
    notiOff: { mutate: mutateNotiOff, isLoading: isLaodingNoitOff }
  } = useMutationChannelNoti();
  const {
    unblock: { mutate: mutateUnblock, isLoading: isLoadingMutateUnblock },
    block: { mutate: mutateBlock, isLoading: isLoadingMutateBlock }
  } = useMutationUserBlock();
  const { mutate: mutateLeaveChannel, isLoading: isLoadingMutateLeaveChannel } =
    useMutationLeaveChannel();

  const handleClose = useCallback(() => {
    setMoreBottomSheetState({ open: false, isChannel: true });
  }, [setMoreBottomSheetState]);

  const handleClickNoti = async () => {
    if (isLaodingNoitOn || isLaodingNoitOff) return;

    logEvent(attrKeys.channel.SELECT_CHANNEL_MORE, { att: isNotiOn ? 'ALARM_OFF' : 'ALARM_ON' });

    setMoreBottomSheetState({ open: false, isChannel: true });

    if (isNotiOn) {
      await mutateNotiOff(channelId);
    } else {
      await mutateNotiOn(channelId);
    }
  };

  const handleClickReport = () => {
    logEvent(attrKeys.channel.SELECT_CHANNEL_MORE, {
      att: 'REPORT'
    });

    setMoreBottomSheetState({ open: false, isChannel: true });

    router.push({
      pathname: '/user/report',
      query: { targetUserId, targetUserName, isTargetUserSeller }
    });
  };

  const handleClickBlock = async () => {
    if (isLoadingMutateUnblock || isLoadingMutateBlock) return;

    logEvent(attrKeys.channel.SELECT_CHANNEL_MORE, {
      att: isTargetUserBlocked ? 'BLOCK_OFF' : 'BLOCK_ON'
    });

    setMoreBottomSheetState({ open: false, isChannel: true });

    if (isTargetUserBlocked) {
      await mutateUnblock(targetUserId, {
        onSuccess() {
          refetchChannel();
          queryClient.invalidateQueries(queryKeys.products.product({ productId }));
          toastStack({
            children: `${targetUserName}님을 차단 해제했어요.`
          });
        }
      });
    } else {
      logEvent(attrKeys.channel.VIEW_CHANNEL_POPUP, { title: attrProperty.title.BLOCK });
      setDialogState({
        type: 'blockUser',
        customStyle: { minWidth: 311, 'button + button': { backgroundColor: secondary.red.main } },
        content: (
          <Flexbox direction="vertical" gap={8} customStyle={{ margin: '12px 0' }}>
            <Typography variant="h3" weight="bold" textAlign="center">
              {`${isTargetUserSeller ? '판매자' : '구매자'} ${targetUserName}님을`}
              <br />
              차단할까요?
            </Typography>
            <Typography variant="h4" textAlign="center">
              차단하면 서로의 글을 볼 수 없고
              <br />
              채팅을 할 수 없어요.
            </Typography>
          </Flexbox>
        ),
        firstButtonAction() {
          setMoreBottomSheetState({ open: true, isChannel: true });
        },
        async secondButtonAction() {
          logEvent(attrKeys.channel.CLICK_CHANNEL_POPUP, {
            title: attrProperty.title.BLOCK,
            att: 'YES'
          });
          await mutateBlock(targetUserId, {
            onSuccess() {
              refetchChannel();
              queryClient.invalidateQueries(queryKeys.products.product({ productId }));
              toastStack({
                children: `${
                  isTargetUserSeller ? '판매자' : '구매자'
                } ${targetUserName}을 차단했어요.`
              });
            }
          });
        }
      });
    }
  };

  const handleClickLeave = () => {
    if (isLoadingMutateLeaveChannel) return;

    logEvent(attrKeys.channel.SELECT_CHANNEL_MORE, { att: 'LEAVE' });
    logEvent(attrKeys.channel.VIEW_CHANNEL_POPUP, { title: attrProperty.title.LEAVE });

    setMoreBottomSheetState({ open: false, isChannel: true });
    setDialogState({
      type: 'leaveChannel',
      customStyle: { minWidth: 310, 'button + button': { backgroundColor: secondary.red.main } },
      firstButtonAction() {
        setMoreBottomSheetState({ open: true, isChannel: true });
      },
      async secondButtonAction() {
        logEvent(attrKeys.channel.CLICK_CHANNEL_POPUP, {
          name: attrProperty.name.CHANNEL_DETAIL,
          title: attrProperty.title.LEAVE,
          att: 'YES'
        });
        await mutateLeaveChannel(channelId);
      }
    });
  };

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.channel.VIEW_CHANNEL_MORE_MODAL, {
        name: attrProperty.name.CHANNEL_DETAIL
      });
    }
  }, [open]);

  return (
    <BottomSheet disableSwipeable open={open} onClose={handleClose}>
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
        <Flexbox direction="vertical">
          {!isDeletedTargetUser && (
            <>
              <Menu variant="h3" weight="medium" onClick={handleClickNoti}>
                {isNotiOn ? '알림 끄기' : '알림 켜기'}
              </Menu>
              {!isCamelAdminUser && (
                <>
                  <Menu variant="h3" weight="medium" onClick={handleClickReport}>
                    신고하기
                  </Menu>
                  <Menu variant="h3" weight="medium" onClick={handleClickBlock}>
                    {isTargetUserBlocked ? '차단 해제하기' : '차단하기'}
                  </Menu>
                </>
              )}
            </>
          )}
          <RedMenu variant="h3" weight="medium" onClick={handleClickLeave}>
            채팅방 나가기
          </RedMenu>
        </Flexbox>
        <Button size="xlarge" variant="ghost" brandColor="black" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

const RedMenu = styled(Menu)`
  color: ${({ theme: { palette } }) => palette.secondary.red.light};
`;

export default ChannelMoreMenuBottomSheet;
