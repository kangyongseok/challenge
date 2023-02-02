import { useMemo } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Image, Typography } from 'mrcamel-ui';
import { find } from 'lodash-es';
import dayjs from 'dayjs';
import { AdminMessage } from '@sendbird/chat/message';
import styled from '@emotion/styled';

import type { ChannelDetail } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { fetchProductList, putProductUpdateStatus } from '@api/product';

import { productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { PROMOTION_ATT, productStatusCode } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { checkAgent, commaNumber } from '@utils/common';

import { dialogState } from '@recoil/common';
import { channelPushPageState } from '@recoil/channel';
import { camelSellerIsMovedScrollState } from '@recoil/camelSeller';

interface ChannelAdminMessageProps {
  message: AdminMessage;
  productId: number;
  targetUserId: number;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

const CAMEL_ADMIN_MESSAGE_CUSTOM_TYPES = [
  'sellingPrice',
  'sellingLegit',
  'sellingInfo',
  'sellingUpdate'
];

function ChannelAdminMessage({
  message,
  productId,
  targetUserId,
  refetchChannel
}: ChannelAdminMessageProps) {
  const router = useRouter();
  const messageInfos = message.message.split('|');

  const setDialogState = useSetRecoilState(dialogState);
  const resetCamelSellerMoveScroll = useResetRecoilState(camelSellerIsMovedScrollState);

  const messageProductId = useMemo(() => Number(messageInfos[1] || 0), [messageInfos]);
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
      }
    ],
    [messageProductId]
  );

  const setChannelPushPageState = useSetRecoilState(channelPushPageState);

  const { mutate: mutatePutProductUpdateStatus, isLoading } = useMutation(putProductUpdateStatus);

  const handleClickViewAppointment = () => {
    router
      .push({
        pathname: `/channels/${router.query.id}/appointment`
      })
      .then(() => {
        if (checkAgent.isIOSApp()) window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
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

  const handleClickViewReviews = () => {
    logEvent(attrKeys.channel.CLICK_REVIEW_DETAIL, {
      name: attrProperty.name.CHANNEL_DETAIL,
      att: 'SEND'
    });

    const pathname = `/userInfo/${targetUserId}?tab=reviews`;

    if (checkAgent.isIOSApp()) {
      setChannelPushPageState('userInfo');
      window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
        JSON.stringify({
          pathname,
          redirectChannelUrl: router.asPath
        })
      );

      return;
    }

    router.push(pathname);
  };

  const buttonData = find(messageButtonData, { id: message.customType || '' });

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
          useChat: productDetail[0].sellerType !== productSellerType.collection,
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
        setDialogState({
          type: 'productSoldout'
        });
        return;
      }
      if (productStatus === productStatusCode.deleted) {
        setDialogState({
          type: 'productDelete'
        });
        return;
      }
      if (productStatus === productStatusCode.hidden) {
        setDialogState({
          type: 'productHidden'
        });
        return;
      }
      if (productStatus === productStatusCode.reservation) {
        setDialogState({
          type: 'productReservation'
        });
        return;
      }
    }
    if (buttonData?.action) {
      if (checkAgent.isIOSApp()) {
        setChannelPushPageState(buttonData.action.split('/')[1]);
        window.webkit?.messageHandlers?.callRedirect?.postMessage?.(
          JSON.stringify({
            pathname: buttonData.action,
            redirectChannelUrl: router.asPath
          })
        );
        return;
      }
      resetCamelSellerMoveScroll();

      router.push(buttonData.action);
    }
  };

  if (CAMEL_ADMIN_MESSAGE_CUSTOM_TYPES.includes(message.customType || '')) {
    return (
      <Box customStyle={{ marginBottom: 12 }}>
        <CamelAdminMessage>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/channel/${message.customType}.png`}
            alt={`custom-type-image-${message.messageId}`}
            disableAspectRatio
            customStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
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
                  <Typography variant="small1">{detail.title}</Typography>
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
    );
  }

  if (message.customType === 'appointmentPushNoti') {
    return (
      <PushNotiMessage variant="body2" weight="medium">
        {message.message}
      </PushNotiMessage>
    );
  }

  return (
    <AdminTextMessage variant="body2" weight="medium">
      {message.message.replace(/예약중으로 변경하기|약속보기|보낸 후기 보기/, '')}
      {message.customType === 'productReserve' && (
        <span onClick={handleClickUpdate}>예약중으로 변경하기</span>
      )}
      {message.customType === 'appointmentUpdated' && (
        <span onClick={handleClickViewAppointment}>약속보기</span>
      )}
      {message.customType === 'reviewSent' && (
        <span onClick={handleClickViewReviews}>보낸 후기 보기</span>
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
