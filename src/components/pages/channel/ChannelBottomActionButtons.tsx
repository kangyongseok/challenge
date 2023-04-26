import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import type { FileMessageCreateParams, SendableMessage } from '@sendbird/chat/lib/__definition';
import styled from '@emotion/styled';

import type { ProductOffer } from '@dto/productOffer';
import type { ProductResult } from '@dto/product';
import type { Order } from '@dto/order';
import type { ChannelAppointmentResult, ChannelDetail, UserReview } from '@dto/channel';

import SessionStorage from '@library/sessionStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import { productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import { productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getOrderStatusText } from '@utils/common';

import { toastState } from '@recoil/common';
import { channelDialogStateFamily } from '@recoil/channel';
import useMutationSendMessage from '@hooks/useMutationSendMessage';

interface ChannelBottomActionButtonsProps {
  hasSentMessage?: boolean;
  isFocused: boolean;
  lastMessageIndex: number;
  channelId: number;
  channelUrl: string;
  userName: string;
  isTargetUserNoti: boolean | undefined;
  isTargetUserSeller: boolean;
  targetUserName: string;
  targetUserId: number;
  product: ProductResult | null | undefined;
  productId: number;
  status: number | undefined;
  isDeletedProduct: boolean;
  appointment: ChannelAppointmentResult | undefined;
  userReview: UserReview | null | undefined;
  targetUserReview: UserReview | null | undefined;
  hasLastMessage: boolean;
  order?: Order | null;
  offers?: ProductOffer[] | null;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
  updateNewMessage: (msg: SendableMessage) => void;
}

function ChannelBottomActionButtons({
  hasSentMessage,
  isFocused,
  lastMessageIndex,
  channelId,
  channelUrl,
  userName,
  isTargetUserNoti,
  isTargetUserSeller,
  targetUserId,
  targetUserName,
  product,
  productId,
  status,
  isDeletedProduct,
  appointment,
  userReview,
  targetUserReview,
  hasLastMessage,
  order,
  offers,
  refetchChannel,
  updateNewMessage
}: ChannelBottomActionButtonsProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setToastState = useSetRecoilState(toastState);
  const setOpenState = useSetRecoilState(channelDialogStateFamily('purchaseConfirm'));

  const { mutate: mutatePutProductUpdateStatus, isLoading } = useMutation(putProductUpdateStatus);
  const { mutate: mutateSendMessage } = useMutationSendMessage({ lastMessageIndex });

  const [currentOffer, setCurrentOffer] = useState<ProductOffer | null>(null);
  const [isPossibleOffer, setIsPossibleOffer] = useState(false);
  const [pending, setPending] = useState(false);

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

  const showPurchaseConfirmButton =
    getOrderStatusText({ status: order?.status, result: order?.result }) === '거래중' &&
    isTargetUserSeller;

  const handleClickPhoto = () => {
    if (isLoading) return;

    // if (checkAgent.isIOSApp()) {
    //   setOpenCameraOptionMenu((prevState) => !prevState);
    //   return;
    // }
    hiddenInputRef.current?.click();
  };

  const isOperatorProduct = product?.sellerType === productSellerType.operatorProduct;
  const isOperatorB2CProduct = product?.sellerType === productSellerType.operatorB2CProduct;
  const isOperatorC2CProduct = product?.sellerType === productSellerType.operatorC2CProduct;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // const file = e.target.files[0];
      const arr = Object.entries(e.target.files).map(([_, value]) => value);
      await mutateSendMessage({
        data: {
          channelId,
          content: `${userName}님이 사진을 보냈습니다.`,
          event: 'LAST_MESSAGE'
        },
        channelUrl,
        isTargetUserNoti,
        multipleImage: arr as FileMessageCreateParams[],
        userId: targetUserId,
        productId,
        callback: (msg) => {
          updateNewMessage(msg);
          e.target.value = '';
        }
      });
    }
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

    router.push({
      pathname: `/channels/${router.query.id}/appointment`
    });
  };

  const handleClickReview = () => {
    if (isLoading || !targetUserId) return;

    logEvent(attrKeys.channel.CLICK_REVIEW_SEND, { name: attrProperty.name.CHANNEL_DETAIL });
    logEvent(attrKeys.channel.VIEW_REVIEW_SEND_POPUP, {
      att: isTargetUserSeller ? 'BUYER' : 'SELLER'
    });

    if (isLoading) return;

    logEvent(attrKeys.channel.CLICK_CAMEL, {
      name: attrProperty.name.REVIEW_SEND,
      title: attrProperty.title.CHANNEL_DETAIL,
      att: isTargetUserSeller ? 'BUYER' : 'SELLER',
      id: product?.id,
      brand: product?.brand.name,
      category: product?.category.name,
      parentId: product?.category.parentId,
      site: product?.site.name,
      price: product?.price,
      cluster: product?.cluster,
      source: attrProperty.source.MAIN_PERSONAL,
      productType: product
        ? getProductType(product.productSeller.site.id, product.productSeller.type)
        : undefined,
      sellerType: product?.sellerType,
      productSellerId: product?.productSeller.id,
      productSellerType: product?.productSeller.type,
      productSellerAccount: product?.productSeller.account,
      useChat: product?.sellerType !== productSellerType.collection
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
  };

  const handleClickAsk = () => {
    logEvent(attrKeys.channel.CLICK_ASK, {
      name: attrProperty.name.CHANNEL_DETAIL
    });

    ChannelTalk.showMessenger();
  };

  const handleClickPriceOffer = () => {
    SessionStorage.set(sessionStorageKeys.productDetailOfferEventProperties, {
      source: 'CHANNEL_DETAIL'
    });

    router.push(`/channels/${router.query.id}/priceOffer`);
  };

  const handleClickPresetMessage = (message: string) => () => {
    if (pending) return;

    setPending(true);

    mutateSendMessage({
      data: { channelId, content: message, event: 'LAST_MESSAGE' },
      channelUrl,
      isTargetUserNoti,
      userId: targetUserId,
      productId,
      callback: (msg) => {
        updateNewMessage(msg);
        setPending(false);
      },
      failCallback: () => setPending(false)
    });
  };

  useEffect(() => {
    if (!offers) return;

    setCurrentOffer(offers[0]);
    setIsPossibleOffer(
      offers.filter(({ status: offerStatus }) => [1, 2, 4].includes(offerStatus)).length < 3 &&
        ![productStatus[1], productStatus[2], productStatus[3]].includes(
          productStatus[status as keyof typeof productStatus]
        ) &&
        isTargetUserSeller
    );
  }, [offers, status, isTargetUserSeller]);

  if (!hasSentMessage && !isFocused && (!offers || !offers.length)) {
    return (
      <Box
        customStyle={{
          padding: '20px 20px 8px',
          borderTop: `1px solid ${common.line02}`,
          boxShadow: '0px -2px 4px 0px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Typography variant="body2" weight="medium" color="ui60">
          간단한 질문 또는 가격제안으로 대화를 시작해보세요.
        </Typography>
        <Flexbox
          direction="vertical"
          gap={16}
          customStyle={{
            margin: '20px 0 28px'
          }}
        >
          <Flexbox
            gap={8}
            alignment="center"
            onClick={handleClickPresetMessage('안녕하세요, 구매가능한가요?')}
          >
            <Icon name="MessageFilled" width={20} height={20} color="ui80" />
            <Typography>안녕하세요, 구매가능한가요?</Typography>
          </Flexbox>
          <Flexbox
            gap={8}
            alignment="center"
            onClick={handleClickPresetMessage('안전결제 가능한가요?')}
          >
            <Icon name="MessageFilled" width={20} height={20} color="ui80" />
            <Typography>안전결제 가능한가요?</Typography>
          </Flexbox>
          {[119, 97, 104, 282, 283, 14].includes(product?.category?.parentId || 0) && (
            <Flexbox
              gap={8}
              alignment="center"
              onClick={handleClickPresetMessage('실착 사이즈가 어떻게 되나요?')}
            >
              <Icon name="MessageFilled" width={20} height={20} color="ui80" />
              <Typography>실착 사이즈가 어떻게 되나요?</Typography>
            </Flexbox>
          )}
          <Flexbox gap={8} alignment="center" onClick={handleClickPresetMessage('정품인가요?')}>
            <Icon name="MessageFilled" width={20} height={20} color="ui80" />
            <Typography>정품인가요?</Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox gap={8} alignment="center" onClick={handleClickPriceOffer}>
          <Icon name="WonCircleFilled" width={20} height={20} />
          <Typography>가격 제안하기</Typography>
        </Flexbox>
      </Box>
    );
  }

  return (
    <ActionButtons>
      <Chip
        variant="outline"
        startIcon={<Icon name="CameraFilled" />}
        disabled={isLoading}
        onClick={handleClickPhoto}
      >
        <HiddenInput
          id="fileUpload"
          ref={hiddenInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <Typography variant="h4" customStyle={{ whiteSpace: 'nowrap' }}>
          사진
        </Typography>
      </Chip>
      {!isDeletedProduct && !isOperatorB2CProduct && !isOperatorC2CProduct && (
        <>
          {isPossibleOffer && currentOffer?.status !== 1 && (
            <Chip
              variant="outline"
              startIcon={<Icon name="WonCircleFilled" />}
              onClick={handleClickPriceOffer}
              disabled={isLoading}
            >
              <Typography variant="h4" customStyle={{ whiteSpace: 'nowrap' }}>
                가격제안
              </Typography>
            </Chip>
          )}
          {showAppointmentButton && !showPurchaseConfirmButton && !isOperatorProduct && (
            <Chip
              variant="outline"
              startIcon={<Icon name="TimeFilled" />}
              disabled={isLoading}
              onClick={handleClickAppointment}
            >
              <Typography variant="h4" customStyle={{ whiteSpace: 'nowrap' }}>
                직거래 약속
              </Typography>
            </Chip>
          )}
          {showPurchaseConfirmButton && (
            <Chip
              variant="outline"
              startIcon={<Icon name="CheckOutlined" />}
              onClick={() =>
                setOpenState((prevState) => ({
                  ...prevState,
                  open: true
                }))
              }
              disabled={isLoading}
            >
              <Typography variant="h4" customStyle={{ whiteSpace: 'nowrap' }}>
                구매확정
              </Typography>
            </Chip>
          )}
          {showReviewButton && (
            <Chip startIcon={<Icon name="EditFilled" />} onClick={handleClickReview}>
              <Typography variant="h4" customStyle={{ whiteSpace: 'nowrap' }}>
                후기 보내기
              </Typography>
            </Chip>
          )}
          {!showReviewButton && (
            <Chip variant="outline" disabled={isLoading} onClick={handleClickAsk}>
              <Typography variant="h4" customStyle={{ whiteSpace: 'nowrap' }}>
                결제/환불 문의
              </Typography>
            </Chip>
          )}
        </>
      )}
    </ActionButtons>
  );
}

const ActionButtons = styled.div`
  width: 100%;
  padding: 12px 20px 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 4px;
  overflow-x: auto;
  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
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

export default ChannelBottomActionButtons;
