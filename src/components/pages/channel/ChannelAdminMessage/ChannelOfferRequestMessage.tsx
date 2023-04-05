import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation
} from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';

import type { ProductOffer } from '@dto/productOffer';
import type { ChannelDetail } from '@dto/channel';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import {
  deleteProductOfferCancel,
  putProductOfferApprove,
  putProductOfferRefuse
} from '@api/productOffer';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { checkAgent } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOfferRequestMessageProps {
  message: AdminMessage;
  offer?: ProductOffer | null;
  offersSize: number;
  isSeller: boolean;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelOfferRequestMessage({
  message: { createdAt },
  offer,
  offersSize,
  isSeller,
  refetchChannel
}: ChannelOfferRequestMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const [isSellerRequestOffer, setIsSellerRequestOffer] = useState(false);

  const { mutate, isLoading } = useMutation(putProductOfferApprove);
  const { mutate: mutateOfferRefuse, isLoading: isLoadingMutate } =
    useMutation(putProductOfferRefuse);
  const { mutate: mutateOfferCancel, isLoading: isLoadingCancelMutate } =
    useMutation(deleteProductOfferCancel);

  const handleClick = () => {
    if (!offer) return;

    logEvent(attrKeys.channel.CLICK_PRODUCT_OFFER, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: !isSellerRequestOffer ? 'SELLER' : 'BUYER',
      att: 'APPROVE',
      seq: offersSize
    });

    mutate(offer?.id, {
      onSuccess() {
        refetchChannel();
      }
    });
  };

  const handleClickRefuse = () => {
    if (!offer) return;

    logEvent(attrKeys.channel.CLICK_PRODUCT_OFFER, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: !isSellerRequestOffer ? 'SELLER' : 'BUYER',
      att: 'REFUSE',
      seq: offersSize
    });

    mutateOfferRefuse(offer?.id, {
      onSuccess() {
        refetchChannel();
      }
    });
  };

  const handleClickCancel = () => {
    if (!offer) return;

    mutateOfferCancel(offer?.id, {
      onSuccess() {
        refetchChannel();
      }
    });
  };

  const handleClickReversOffer = () => {
    logEvent(attrKeys.channel.CLICK_PURCHASE, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.SELLER,
      att: 'OFFER'
    });

    SessionStorage.set(sessionStorageKeys.productDetailOfferEventProperties, {
      source: 'CHANNEL_DETAIL'
    });

    if (checkAgent.isIOSApp()) {
      window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
    }

    router.push({
      pathname: `/channels/${router.query.id}/priceOffer`,
      query: {
        att: 'SELLER'
      }
    });
  };

  useEffect(() => {
    setIsSellerRequestOffer(offer?.userId !== accessUser?.userId && !isSeller);
  }, [accessUser?.userId, offer?.userId, isSeller]);

  if (isSellerRequestOffer) {
    return (
      <Flexbox
        gap={4}
        alignment="flex-end"
        customStyle={{
          margin: '20px 0'
        }}
      >
        <Box
          customStyle={{
            flexGrow: 1,
            maxWidth: 265,
            padding: 20,
            border: `1px solid ${common.line01}`,
            borderRadius: 20,
            overflow: 'hidden'
          }}
        >
          <Typography variant="h4" weight="bold">
            {commaNumber(offer?.price || 0)}원에 거래하고 싶어요.
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            {offer?.userName}님의 가격제안
          </Typography>
          {offer?.userId !== accessUser?.userId && !offer?.status && (
            <Flexbox
              gap={8}
              customStyle={{
                marginTop: 20
              }}
            >
              <Button
                fullWidth
                variant="ghost"
                brandColor="black"
                onClick={handleClickRefuse}
                disabled={!offer || isLoading || isLoadingMutate || isLoadingCancelMutate}
              >
                거절
              </Button>
              <Button
                fullWidth
                variant="solid"
                brandColor="black"
                onClick={handleClick}
                disabled={!offer || isLoading || isLoadingMutate || isLoadingCancelMutate}
              >
                수락
              </Button>
            </Flexbox>
          )}
          {offer?.userId === accessUser?.userId && !offer?.status && (
            <Button
              variant="ghost"
              brandColor="black"
              fullWidth
              onClick={handleClickCancel}
              disabled={!offer || isLoading || isLoadingMutate || isLoadingCancelMutate}
              customStyle={{
                marginTop: 20
              }}
            >
              가격제안 취소
            </Button>
          )}
        </Box>
        <Typography
          variant="small2"
          customStyle={{
            color: common.ui60
          }}
        >
          {dayjs(createdAt).format('A hh:mm')}
        </Typography>
      </Flexbox>
    );
  }

  return (
    <Flexbox
      gap={4}
      alignment="flex-end"
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Box
        customStyle={{
          flexGrow: 1,
          maxWidth: 265,
          padding: 20,
          border: `1px solid ${common.line01}`,
          borderRadius: 20,
          overflow: 'hidden'
        }}
      >
        <Typography variant="h4" weight="bold">
          {commaNumber(offer?.price || 0)}원에 거래하고 싶어요.
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          {offer?.userName}님의 가격제안
        </Typography>
        {offer?.userId !== accessUser?.userId && !offer?.status && (
          <Flexbox
            gap={8}
            customStyle={{
              marginTop: 20
            }}
          >
            <Button
              fullWidth
              variant="ghost"
              brandColor="black"
              onClick={handleClickRefuse}
              disabled={!offer || isLoading || isLoadingMutate || isLoadingCancelMutate}
            >
              거절
            </Button>
            <Button
              fullWidth
              variant="solid"
              brandColor="black"
              onClick={handleClick}
              disabled={!offer || isLoading || isLoadingMutate || isLoadingCancelMutate}
            >
              수락
            </Button>
          </Flexbox>
        )}
        {offer?.userId === accessUser?.userId && !offer?.status && (
          <Button
            variant="ghost"
            brandColor="black"
            fullWidth
            onClick={handleClickCancel}
            disabled={!offer || isLoading || isLoadingMutate || isLoadingCancelMutate}
            customStyle={{
              marginTop: 20
            }}
          >
            가격제안 취소
          </Button>
        )}
        {offer?.userId !== accessUser?.userId && !offer?.status && (
          <Flexbox
            gap={4}
            onClick={handleClickReversOffer}
            customStyle={{
              margin: '20px -20px -20px',
              padding: '12px 20px',
              backgroundColor: common.bg02
            }}
          >
            <Icon name="WonCircleFilled" width={20} height={20} />
            <Typography weight="medium">다른 가격으로 제안하기</Typography>
          </Flexbox>
        )}
      </Box>
      <Typography
        variant="small2"
        customStyle={{
          color: common.ui60
        }}
      >
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelOfferRequestMessage;
