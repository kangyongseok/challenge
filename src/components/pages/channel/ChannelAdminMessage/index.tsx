import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { find } from 'lodash-es';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';
import { UserMessage } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { Box, Button, Flexbox, Icon, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { ProductOffer } from '@dto/productOffer';
import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchProductList, putProductUpdateStatus } from '@api/product';

import { productType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PROMOTION_ATT, productStatusCode } from '@constants/product';
import { messageStates } from '@constants/channel';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';
import { getOutgoingMessageState } from '@utils/channel';

import { camelSellerIsMovedScrollState } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import ChannelAdminMessageDialog from '../ChannelAdminMessageDialog';
import ChannelReviewSentMessage from './ChannelReviewSentMessage';
import ChannelReserveMessage from './ChannelReserveMessage';
import ChannelOrderSettleWaitMessage from './ChannelOrderSettleWaitMessage';
import ChannelOrderSettleWaitAccountMessage from './ChannelOrderSettleWaitAccountMessage';
import ChannelOrderSettleProgressMessage from './ChannelOrderSettleProgressMessage';
import ChannelOrderSettleCompleteMessage from './ChannelOrderSettleCompleteMessage';
import ChannelOrderRefundWaitMessage from './ChannelOrderRefundWaitMessage';
import ChannelOrderRefundWaitAccountMessage from './ChannelOrderRefundWaitAccountMessage';
import ChannelOrderRefundProgressMessage from './ChannelOrderRefundProgressMessage';
import ChannelOrderRefundCompleteMessage from './ChannelOrderRefundCompleteMessage';
import ChannelOrderPaymentProgressMessage from './ChannelOrderPaymentProgressMessage';
import ChannelOrderPaymentCompleteMessage from './ChannelOrderPaymentCompleteMessage';
import ChannelOrderPaymentCancelMessage from './ChannelOrderPaymentCancelMessage';
import ChannelOrderDeliveryWaitMessage from './ChannelOrderDeliveryWaitMessage';
import ChannelOrderDeliveryProgressWeekMessage from './ChannelOrderDeliveryProgressWeekMessage';
import ChannelOrderDeliveryProgressRemindMessage from './ChannelOrderDeliveryProgressRemindMessage';
import ChannelOrderDeliveryProgressMessage from './ChannelOrderDeliveryProgressMessage';
import ChannelOrderDeliveryCompleteMessage from './ChannelOrderDeliveryCompleteMessage';
import ChannelOfferRequestTipMessage from './ChannelOfferRequestTipMessage';
import ChannelOfferRequestMessage from './ChannelOfferRequestMessage';
import ChannelOfferApproveMessage from './ChannelOfferApproveMessage';
import ChannelOfferAdminTextMessage from './ChannelOfferAdminTextMessage';
import ChannelCreditSellerMessage from './ChannelCreditSellerMessage';
import ChannelAppointmentMessage from './ChannelAppointmentMessage';

interface ChannelAdminMessageProps {
  sendbirdChannel: GroupChannel;
  message: AdminMessage;
  productId: number;
  targetUserId: number;
  targetUserName: string;
  isSeller: boolean;
  orders: Order[];
  offers: ProductOffer[];
  hasUserReview: boolean;
  isTargetUserBlocked: boolean;
  isAdminBlockUser: boolean;
  status: number;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
  onClickSafePayment?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const CAMEL_ADMIN_MESSAGE_CUSTOM_TYPES = [
  'sellingPrice',
  'sellingLegit',
  'sellingInfo',
  'sellingUpdate',
  'sellingHoney',
  'sellingDuplicate'
];

function ChannelAdminMessage({
  sendbirdChannel: channel,
  message,
  productId,
  targetUserId,
  targetUserName,
  isSeller,
  orders,
  offers,
  hasUserReview,
  isTargetUserBlocked,
  isAdminBlockUser,
  status,
  refetchChannel,
  onClickSafePayment
}: ChannelAdminMessageProps) {
  const router = useRouter();
  const messageInfos = message.message.split('|');

  const [open, setOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState('');

  const resetCamelSellerMoveScroll = useResetRecoilState(camelSellerIsMovedScrollState);

  const messageProductId = useMemo(() => Number(messageInfos[1] || 0), [messageInfos]);
  const messageStatus = useMemo(
    () => getOutgoingMessageState(channel, message as UserMessage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channel.getUnreadMemberCount?.(message), channel.getUndeliveredMemberCount?.(message)]
  );

  const currentOrder = orders.find((findOrder) => findOrder.id === Number(message.message));
  const currentOffer = offers.find((findOffer) => findOffer.id === Number(message.message));

  const { data: accessUser } = useQueryAccessUser();
  const { data: productDetail } = useQuery(
    queryKeys.products.productList([messageProductId]),
    () => fetchProductList([messageProductId]),
    {
      enabled: !!messageProductId
    }
  );

  const messageButtonData = useMemo(
    () => [
      {
        id: 'sellingPrice',
        text: '가격 조정하기',
        icon: <Icon name="WonFilled" />,
        action: `/camelSeller/registerConfirm/${messageProductId}?anchor=price`,
        att: PROMOTION_ATT.PRICE
      },
      {
        id: 'sellingLegit',
        text: '무료 사진감정하기',
        icon: <Icon name="LegitFilled" />,
        action: `/legit/intro?productId=${messageProductId}`,
        att: PROMOTION_ATT.LEGIT
      },
      {
        id: 'sellingInfo',
        text: '정보 입력하기',
        icon: <Icon name="EditFilled" />,
        action: `/camelSeller/registerConfirm/${messageProductId}?anchor=surveyForm`,
        att: PROMOTION_ATT.INFO
      },
      {
        id: 'sellingUpdate',
        text: '끌올 하러가기',
        icon: <Icon name="Arrow4UpFilled" />,
        action: '/user/shop',
        att: PROMOTION_ATT.UPDATE
      },
      {
        id: 'sellingHoney',
        text: '개꿀매에서 내 매물 확인하기',
        icon: <Icon name="Arrow4RightFilled" />,
        action: '/events/dogHoney',
        att: PROMOTION_ATT.UPDATE
      },
      {
        id: 'sellingDuplicate',
        text: '새로 올라온 매물 보러가기',
        icon: <Icon name="Arrow4RightFilled" />,
        action: '/products/camel/새로%20올라왔어요!?order=postedAllDesc',
        att: PROMOTION_ATT.UPDATE
      }
    ],
    [messageProductId]
  );

  const buttonData = find(messageButtonData, { id: message.customType || '' });
  const isAdminMessageType = CAMEL_ADMIN_MESSAGE_CUSTOM_TYPES.includes(message.customType || '');
  const isByMe =
    (message.data && accessUser?.userId !== Number(JSON.parse(message.data)?.userId)) ||
    !message.data;

  const { mutate: mutatePutProductUpdateStatus, isLoading } = useMutation(putProductUpdateStatus);

  const handleClickViewAppointment = () => {
    router.push({
      pathname: `/channels/${router.query.id}/appointment`
    });
  };

  const handleClickUpdate = () => {
    if (isLoading) return;

    mutatePutProductUpdateStatus(
      { productId, status: 4 },
      {
        onSuccess() {
          refetchChannel();
        }
      }
    );
  };

  const handleClickAction = () => {
    const result = productDetail
      ? {
          id: productDetail[0].id,
          brand: productDetail[0].brand?.name,
          category: productDetail[0].category?.name,
          parentCategory: FIRST_CATEGORIES[productDetail[0].category?.id as number],
          site: productDetail[0].site?.name,
          price: productDetail[0].price,
          source: 'CHANNEL_DETAIL',
          sellerType: productDetail[0].sellerType,
          productSellerId: productDetail[0].productSeller?.id,
          productSellerType: productDetail[0].productSeller?.type,
          productSellerAccount: productDetail[0].productSeller?.account,
          useChat: productDetail[0].sellerType !== productType.collection,
          status: productDetail[0].status
        }
      : {};

    logEvent(attrKeys.channel.CLICK_BANNER, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.SALES_PROMOTION,
      att: buttonData?.att,
      ...result
    });

    if (productDetail) {
      const productStatus = productDetail?.map((detail) => detail.status)[0];

      if (productStatus === productStatusCode.soldOut) {
        setOpen(true);
        setDialogVariant('productSoldout');
        return;
      }
      if (productStatus === productStatusCode.deleted) {
        setOpen(true);
        setDialogVariant('productDelete');
        return;
      }
      if (productStatus === productStatusCode.hidden) {
        setOpen(true);
        setDialogVariant('productHidden');
        return;
      }
      if (productStatus === productStatusCode.reservation) {
        setOpen(true);
        setDialogVariant('productReservation');
        return;
      }
    }
    if (buttonData?.action) {
      resetCamelSellerMoveScroll();

      SessionStorage.set(sessionStorageKeys.legitIntroSource, 'CHANNEL');

      router.push(buttonData.action);
    }
  };

  useEffect(() => {
    if (isByMe && messageStates.read === messageStatus) {
      window.flexibleContent.scrollTo({
        top: window.flexibleContent.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isByMe, messageStatus]);

  if (isAdminMessageType) {
    return (
      <>
        <Box customStyle={{ marginBottom: 12 }}>
          <CamelAdminMessage>
            <Image
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/channel/${message.customType}.png`}
              alt={`custom-type-image-${message.messageId}`}
              disableAspectRatio
              customStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              style={{ minHeight: 161 }}
            />
            <CamelAdminMessageDetail dangerouslySetInnerHTML={{ __html: messageInfos[0] }} />
            {productDetail &&
              !!productDetail.length &&
              productDetail.map((detail) => (
                <Flexbox
                  key={detail.id}
                  alignment="center"
                  customStyle={{ padding: '0 20px' }}
                  gap={12}
                >
                  <Box customStyle={{ width: 50, height: 60, borderRadius: 8, overflow: 'hidden' }}>
                    <Image
                      alt={`product-image-id${detail.id}`}
                      src={detail.imageMain}
                      disableAspectRatio
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2">{detail.title}</Typography>
                    <Typography weight="bold" customStyle={{ marginTop: 4 }}>
                      {commaNumber(getTenThousandUnitPrice(detail.price))}만원
                    </Typography>
                  </Box>
                </Flexbox>
              ))}
            <Button
              fullWidth
              size="large"
              variant="ghost"
              brandColor="primary"
              customStyle={{ margin: '0 20px 20px', width: 'calc(100% - 40px)' }}
              startIcon={buttonData?.icon}
              onClick={handleClickAction}
            >
              {buttonData?.text}
            </Button>
          </CamelAdminMessage>
          <CreatedAt variant="small2">{dayjs(message.createdAt).format('A hh:mm')}</CreatedAt>
        </Box>
        <ChannelAdminMessageDialog
          variant={dialogVariant}
          open={open && !!dialogVariant}
          onClose={() => {
            setOpen(false);
            setDialogVariant('');
          }}
        />
      </>
    );
  }

  if (message.customType === 'creditSeller') {
    return <ChannelCreditSellerMessage message={message} />;
  }

  if (message.customType === 'appointmentPushNoti') {
    return (
      <PushNotiMessage variant="body2" weight="medium">
        {message.message}
      </PushNotiMessage>
    );
  }

  if (message.customType === 'offerRequest') {
    return (
      <ChannelOfferRequestMessage
        message={message}
        offer={currentOffer}
        offersSize={offers.length}
        isSeller={isSeller}
        refetchChannel={refetchChannel}
      />
    );
  }

  if (
    ['offerCancel', 'offerRefuse', 'offerTimeout', 'offerApproveTimeout'].includes(
      message.customType || ''
    )
  ) {
    return <ChannelOfferAdminTextMessage message={message} offer={currentOffer} />;
  }

  if (message.customType === 'offerApprove') {
    return (
      <ChannelOfferApproveMessage
        message={message}
        offer={currentOffer}
        order={orders[0]}
        isTargetUserBlocked={isTargetUserBlocked}
        isAdminBlockUser={isAdminBlockUser}
        isSeller={isSeller}
        status={status}
        targetUserName={targetUserName}
        onClickSafePayment={onClickSafePayment}
      />
    );
  }

  if (message.customType === 'offerRequestTip') {
    return <ChannelOfferRequestTipMessage />;
  }

  if (message.customType === 'orderPaymentProgress') {
    return <ChannelOrderPaymentProgressMessage message={message} order={currentOrder} />;
  }

  if (message.customType === 'orderPaymentComplete') {
    return (
      <ChannelOrderPaymentCompleteMessage
        message={message}
        order={currentOrder}
        isSeller={isSeller}
        refetchChannel={refetchChannel}
      />
    );
  }

  if (message.customType === 'orderPaymentCancel' || message.customType === 'orderDeliveryCancel') {
    return (
      <ChannelOrderPaymentCancelMessage
        message={message}
        order={currentOrder}
        isSeller={isSeller}
        targetUserName={targetUserName}
      />
    );
  }

  if (message.customType === 'orderRefundWait') {
    return (
      <ChannelOrderRefundWaitMessage
        message={message}
        order={currentOrder}
        isSeller={isSeller}
        targetUserName={targetUserName}
      />
    );
  }

  if (message.customType === 'orderDeliveryProgressWeek') {
    return (
      <ChannelOrderDeliveryProgressWeekMessage
        message={message}
        order={currentOrder}
        isSeller={isSeller}
      />
    );
  }

  if (message.customType === 'orderDeliveryWait') {
    return (
      <ChannelOrderDeliveryWaitMessage message={message} order={currentOrder} isSeller={isSeller} />
    );
  }

  if (message.customType === 'orderRefundWaitAccount') {
    return <ChannelOrderRefundWaitAccountMessage message={message} order={currentOrder} />;
  }
  if (message.customType === 'orderDeliveryComplete') {
    return (
      <ChannelOrderDeliveryCompleteMessage
        message={message}
        order={currentOrder}
        isSeller={isSeller}
      />
    );
  }
  if (message.customType === 'orderRefundProgress') {
    return <ChannelOrderRefundProgressMessage message={message} order={currentOrder} />;
  }

  if (message.customType === 'orderRefundComplete') {
    return <ChannelOrderRefundCompleteMessage message={message} order={currentOrder} />;
  }

  if (message.customType === 'orderDeliveryProgress') {
    return (
      <ChannelOrderDeliveryProgressMessage
        message={message}
        order={currentOrder}
        isSeller={isSeller}
      />
    );
  }

  if (message.customType === 'orderDeliveryProgressRemind') {
    return <ChannelOrderDeliveryProgressRemindMessage message={message} order={currentOrder} />;
  }

  if (message.customType === 'orderSettleWait') {
    return (
      <ChannelOrderSettleWaitMessage
        message={message}
        productId={productId}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        hasUserReview={hasUserReview}
        isSeller={isSeller}
        refetchChannel={refetchChannel}
      />
    );
  }

  if (message.customType === 'orderSettleWaitAccount') {
    return <ChannelOrderSettleWaitAccountMessage message={message} />;
  }

  if (message.customType === 'orderSettleProgress') {
    return (
      <ChannelOrderSettleProgressMessage
        message={message}
        order={currentOrder}
        productId={productId}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        hasUserReview={hasUserReview}
        isSeller={isSeller}
        refetchChannel={refetchChannel}
      />
    );
  }

  if (message.customType === 'orderSettleComplete') {
    return (
      <ChannelOrderSettleCompleteMessage
        message={message}
        order={currentOrder}
        productId={productId}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        hasUserReview={hasUserReview}
        isSeller={isSeller}
        refetchChannel={refetchChannel}
      />
    );
  }
  if (message.customType === 'reviewReceived') {
    return <Box />;
  }
  if (message.customType === 'reviewSent') {
    return (
      <ChannelReviewSentMessage
        message={message}
        targetUserName={targetUserName}
        targetUserId={targetUserId}
      />
    );
  }

  if (message.customType === 'channelReserve') {
    return <ChannelReserveMessage targetUserName={targetUserName} />;
  }

  if (message.customType === 'channelAppointment') {
    return <ChannelAppointmentMessage />;
  }

  return (
    <AdminTextMessage variant="body2" weight="medium">
      {message.message.replace(/예약중으로 변경하기|약속보기/, '')}
      {message.customType === 'productReserve' && (
        <span onClick={handleClickUpdate}>예약중으로 변경하기</span>
      )}
      {message.customType === 'appointmentUpdated' && (
        <span onClick={handleClickViewAppointment}>약속보기</span>
      )}
    </AdminTextMessage>
  );
}

const CamelAdminMessage = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  border-radius: 20px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  margin: 0 -4px;
`;

const CamelAdminMessageDetail = styled(Typography)`
  padding: 0 20px;

  p:first-of-type {
    font-weight: ${({ theme: { typography } }) => typography.h4.weight.bold};
    margin-bottom: 8px;
  }

  p:last-child {
    margin-top: 20px;
  }
`;

const CreatedAt = styled(Typography)`
  display: inline-flex;
  justify-content: flex-end;
  white-space: nowrap;
  color: ${({ theme: { palette } }) => palette.common.ui60};
`;

const PushNotiMessage = styled(Typography)`
  padding: 12px;
  margin: 20px 0;
  color: ${({ theme: { palette } }) => palette.primary.light};
  background-color: ${({ theme: { palette } }) => palette.primary.bgLight};
  border-radius: 8px;
  text-align: center;
  white-space: pre-wrap;
  word-break: break-all;
`;

const AdminTextMessage = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.ui60};
  text-align: center;
  margin: 20px 0;
  white-space: pre-wrap;
  word-break: break-all;

  span {
    margin-left: 3px;
    text-decoration: underline;
  }
`;

export default ChannelAdminMessage;
