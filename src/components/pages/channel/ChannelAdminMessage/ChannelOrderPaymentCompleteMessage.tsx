import { useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation
} from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { postOrderApprove } from '@api/order';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { getOrderStatusText } from '@utils/common';

import { channelDialogStateFamily } from '@recoil/channel';
import useSession from '@hooks/useSession';

interface ChannelOrderPaymentCompleteMessageProps {
  message: AdminMessage;
  order?: Order | null;
  isSeller: boolean;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelOrderPaymentCompleteMessage({
  message: { data, createdAt },
  order,
  isSeller,
  refetchChannel
}: ChannelOrderPaymentCompleteMessageProps) {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const setOpenState = useSetRecoilState(channelDialogStateFamily('saleRequestRefuse'));

  const { data: accessUser } = useSession();

  const { mutate } = useMutation(postOrderApprove);

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.PAYMENT_COMPLETE,
      att: 'APPROVE',
      orderId: order?.id
    });

    if (!order) return;

    mutate(order?.id, {
      onSuccess: async () => {
        await refetchChannel();
      }
    });
  };

  const handleClickRefuse = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: true
    }));

  if (isSeller || accessUser?.userId === 110) {
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
            borderRadius: 20
          }}
        >
          <Typography variant="h4" weight="bold">
            판매요청
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            구매자가 매물을 결제했어요.
            <br />
            판매하려면 판매승인 버튼을 눌러주세요.
            <br />
            {dayjs(order?.dateExpired).format('MM월 DD일')}까지 미확인시 주문이 취소됩니다.
          </Typography>
          {getOrderStatusText({ status: order?.status, result: order?.result }) === '거래대기' && (
            <Flexbox
              gap={8}
              customStyle={{
                marginTop: 20
              }}
            >
              <Button fullWidth onClick={handleClickRefuse}>
                거절
              </Button>
              <Button fullWidth variant="solid" brandColor="black" onClick={handleClick}>
                판매승인
              </Button>
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
          borderRadius: 20
        }}
      >
        <Typography variant="h4" weight="bold">
          결제완료
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          결제 금액은 거래가 끝날때까지 카멜이 안전하게 보관하고 있어요.
          <br />
          <br />
          판매자 승인 후 거래가 진행됩니다.
        </Typography>
        <Box
          customStyle={{
            width: '100%',
            height: 1,
            margin: '20px 0',
            backgroundColor: common.line01
          }}
        />
        <Flexbox direction="vertical" gap={4}>
          <Flexbox justifyContent="space-between">
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              가격
            </Typography>
            <Typography variant="body2">{commaNumber(order?.price || 0)}원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between">
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              안전결제수수료
            </Typography>
            <Typography variant="body2">{commaNumber(order?.fee || 0)}원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between">
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              결제방법
            </Typography>
            <Typography variant="body2">
              {order?.orderPayments[0].method === 0
                ? order?.orderPayments[0].agencyName
                : '무통장입금'}
            </Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            marginTop: 11
          }}
        >
          <Typography variant="body2">총 결제금액</Typography>
          <Typography
            weight="medium"
            customStyle={{
              color: secondary.red.light
            }}
          >
            {commaNumber(order?.totalPrice || 0)}원
          </Typography>
        </Flexbox>
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

export default ChannelOrderPaymentCompleteMessage;
