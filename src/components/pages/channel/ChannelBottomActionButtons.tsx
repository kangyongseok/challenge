import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Chip, Flexbox, Icon, Typography } from 'mrcamel-ui';
import dayjs from 'dayjs';
import type { SendableMessage } from '@sendbird/chat/lib/__definition';
import styled from '@emotion/styled';

import type { ChannelAppointmentResult, ChannelDetail, UserReview } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import { photoActionType, productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { dialogState, toastState } from '@recoil/common';
import useMutationSendMessage from '@hooks/useMutationSendMessage';

interface ChannelBottomActionButtonsProps {
  messageInputHeight: number;
  channelId: number;
  channelUrl: string;
  userName: string;
  isTargetUserNoti: boolean | undefined;
  isTargetUserSeller: boolean;
  targetUserName: string;
  targetUserId: number;
  productId: number;
  status: number | undefined;
  isDeletedProduct: boolean;
  appointment: ChannelAppointmentResult | undefined;
  userReview: UserReview | null | undefined;
  targetUserReview: UserReview | null | undefined;
  hasLastMessage: boolean;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
  updateNewMessage: (msg: SendableMessage) => void;
}

function ChannelBottomActionButtons({
  messageInputHeight,
  channelId,
  channelUrl,
  userName,
  isTargetUserNoti,
  isTargetUserSeller,
  targetUserId,
  targetUserName,
  productId,
  status,
  isDeletedProduct,
  appointment,
  userReview,
  targetUserReview,
  hasLastMessage,
  refetchChannel,
  updateNewMessage
}: ChannelBottomActionButtonsProps) {
  const router = useRouter();

  const setToastState = useSetRecoilState(toastState);
  const setDialogState = useSetRecoilState(dialogState);

  const { mutate: mutatePutProductUpdateStatus, isLoading } = useMutation(putProductUpdateStatus);
  const { mutate: mutateSendMessage } = useMutationSendMessage();

  const [openCameraOptionMenu, setOpenCameraOptionMenu] = useState(false);

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const showReviewButton = useMemo(() => {
    if (!!userReview || !hasLastMessage) return false;

    const appointmentDone =
      !!appointment && dayjs(appointment.dateAppointment).diff(dayjs(), 'seconds') > 0;

    if (productStatus[status as keyof typeof productStatus] === productStatus[4] && appointmentDone)
      return true;

    // 구매자
    if (
      isTargetUserSeller &&
      [productStatus[1], productStatus[2], productStatus[3]].includes(
        productStatus[status as keyof typeof productStatus]
      ) &&
      (!!targetUserReview || appointmentDone)
    )
      return true;

    // 판매자
    return [productStatus[1], productStatus[2], productStatus[3]].includes(
      productStatus[status as keyof typeof productStatus]
    );
  }, [appointment, hasLastMessage, isTargetUserSeller, status, targetUserReview, userReview]);

  const showAppointmentButton =
    !showReviewButton &&
    typeof status === 'number' &&
    [productStatus[0], productStatus[4]].includes(
      productStatus[status as keyof typeof productStatus]
    );

  const handleClickPhoto = () => {
    if (isLoading) return;

    if (checkAgent.isIOSApp()) {
      setOpenCameraOptionMenu((prevState) => !prevState);
      return;
    }

    hiddenInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      await mutateSendMessage({
        data: {
          channelId,
          content: `${userName}님이 사진을 보냈습니다.`,
          event: 'LAST_MESSAGE'
        },
        channelUrl,
        isTargetUserNoti,
        file,
        userId: targetUserId,
        productId,
        callback: (msg) => {
          updateNewMessage(msg);
          e.target.value = '';
        }
      });
    }
  };

  const handleClickCameraOption = (option: number) => () => {
    setOpenCameraOptionMenu(false);
    window.webkit?.messageHandlers?.callPhotoAttach?.postMessage?.(option);
  };

  const handleClickAppointment = () => {
    if (isLoading || !router.query.id) return;

    logEvent(attrKeys.channel.CLICK_APPOINTMENT, {
      name: attrProperty.name.CHANNEL_DETAIL,
      att: 'NEW'
    });

    if (!hasLastMessage) {
      setToastState({
        type: 'channel',
        status: 'disabledMakeAppointment',
        params: { userName: targetUserName }
      });

      return;
    }

    router
      .push({
        pathname: `/channels/${router.query.id}/appointment`
      })
      .then(() => {
        if (checkAgent.isIOSApp()) window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
      });
  };

  const handleClickReview = () => {
    if (isLoading || !targetUserId) return;

    logEvent(attrKeys.channel.CLICK_REVIEW_SEND, { name: attrProperty.name.CHANNEL_DETAIL });
    logEvent(attrKeys.channel.VIEW_REVIEW_SEND_POPUP, {
      att: isTargetUserSeller ? 'BUYER' : 'SELLER'
    });

    if (checkAgent.isIOSApp()) {
      window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
    }

    setDialogState({
      type: 'confirmDeal',
      content: (
        <Flexbox
          direction="vertical"
          alignment="center"
          gap={8}
          customStyle={{ padding: '12px 0' }}
        >
          <Typography variant="h3" weight="bold">
            {`${isTargetUserSeller ? '판매자' : '구매자'} ${targetUserName}님과 거래를 하셨나요?`}
          </Typography>
          {!isTargetUserSeller && (
            <Typography variant="h4">매물이 판매완료로 변경됩니다.</Typography>
          )}
        </Flexbox>
      ),
      firstButtonAction() {
        if (isLoading) return;

        logEvent(attrKeys.channel.CLICK_REVIEW_SEND_POPUP, {
          name: attrProperty.name.REVIEW_SEND,
          att: isTargetUserSeller ? 'BUYER' : 'SELLER'
        });

        if (isTargetUserSeller) {
          router.push({
            pathname: '/user/reviews/form',
            query: {
              productId,
              targetUserName,
              targetUserId,
              isTargetUserSeller
            }
          });
        } else {
          mutatePutProductUpdateStatus(
            { productId, status: 1, soldType: 1, targetUserId },
            {
              async onSuccess() {
                await refetchChannel();
                router.push({
                  pathname: '/user/reviews/form',
                  query: {
                    productId,
                    targetUserName,
                    targetUserId,
                    isTargetUserSeller
                  }
                });
              }
            }
          );
        }
      }
    });
  };

  return (
    <ActionButtons messageInputHeight={messageInputHeight}>
      <Chip
        size="large"
        variant="outline"
        startIcon={<Icon name="CameraFilled" />}
        disabled={isLoading}
      >
        <HiddenInput
          id="fileUpload"
          ref={hiddenInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <Typography variant="h4" onClick={handleClickPhoto} customStyle={{ whiteSpace: 'nowrap' }}>
          사진
        </Typography>
      </Chip>
      {!isDeletedProduct && (
        <>
          {showAppointmentButton && (
            <Chip
              size="large"
              variant="outline"
              startIcon={<Icon name="DateFilled" />}
              disabled={isLoading}
            >
              <Typography
                variant="h4"
                onClick={handleClickAppointment}
                customStyle={{ whiteSpace: 'nowrap' }}
              >
                직거래 약속
              </Typography>
            </Chip>
          )}
          {showReviewButton && (
            <Chip size="large" startIcon={<Icon name="EditFilled" />}>
              <Typography
                variant="h4"
                onClick={handleClickReview}
                customStyle={{ whiteSpace: 'nowrap' }}
              >
                후기 보내기
              </Typography>
            </Chip>
          )}
        </>
      )}
      <CameraOptionsWrapper open={openCameraOptionMenu}>
        <CameraOptions>
          <Flexbox
            alignment="center"
            gap={4}
            customStyle={{ padding: 8 }}
            onClick={handleClickCameraOption(photoActionType.album)}
          >
            <Icon name="ImageFilled" />
            <Typography variant="body1">앨범에서 선택하기</Typography>
          </Flexbox>
          <Flexbox
            alignment="center"
            gap={4}
            customStyle={{ padding: 8 }}
            onClick={handleClickCameraOption(photoActionType.camera)}
          >
            <Icon name="CameraFilled" />
            <Typography variant="body1">사진 촬영하기</Typography>
          </Flexbox>
        </CameraOptions>
      </CameraOptionsWrapper>
    </ActionButtons>
  );
}

const ActionButtons = styled.div<{ messageInputHeight: number }>`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
  box-sizing: content-box;
  margin: 0 16px
    ${({ messageInputHeight }) => (checkAgent.isIOSApp() ? 0 : messageInputHeight + 12) + 8}px;
  display: flex;
  column-gap: 8px;

  button {
    padding: 8px 10px;
    border-radius: 8px;
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0px, 0px, 0px, 0px);
  clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
`;

const CameraOptionsWrapper = styled.div<{ open: boolean }>`
  position: fixed;
  transform: translateY(-100%);
  left: 0;
  padding-left: 16px;
  padding-bottom: 8px;
  opacity: ${({ open }) => Number(open)};
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  transition: opacity 0.1s ease-in 0s;
`;

const CameraOptions = styled.div`
  padding: 4px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
`;

export default ChannelBottomActionButtons;
