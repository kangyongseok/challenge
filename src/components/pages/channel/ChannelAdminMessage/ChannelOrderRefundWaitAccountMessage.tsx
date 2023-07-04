import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';

import { fetchUserAccounts } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';

import { settingsAccountData } from '@recoil/settingsAccount';
import useSession from '@hooks/useSession';

interface ChannelOrderRefundWaitAccountMessageProps {
  message: AdminMessage;
  order?: Order | null;
}

function ChannelOrderRefundWaitAccountMessage({
  message: { data, createdAt },
  order
}: ChannelOrderRefundWaitAccountMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const resetAccountDataState = useResetRecoilState(settingsAccountData);

  const { isLoggedInWithSMS, data: accessUser } = useSession();

  const { data: userAccounts = [], isLoading } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: isLoggedInWithSMS
    }
  );

  if ((data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) || isLoading) return null;

  const handleClick = () => {
    resetAccountDataState();

    router.push('/mypage/settings/account');
  };

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
          거래취소
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          거래가 취소되었어요. 환불 받을 계좌를 입력해주세요.
        </Typography>
        {order?.reason ? (
          <Box
            customStyle={{
              width: '100%',
              margin: '20px 0',
              padding: 8,
              borderRadius: 8,
              backgroundColor: common.bg02
            }}
          >
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              사유
            </Typography>
            <Typography
              variant="body2"
              customStyle={{
                marginTop: 4
              }}
            >
              {order?.reason}
            </Typography>
          </Box>
        ) : (
          <Box
            customStyle={{
              width: '100%',
              height: 1,
              margin: '20px 0',
              backgroundColor: common.line01
            }}
          />
        )}
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
            <Typography variant="body2">0원</Typography>
          </Flexbox>
          <Flexbox justifyContent="space-between">
            <Typography
              variant="body2"
              customStyle={{
                color: common.ui60
              }}
            >
              환불방법
            </Typography>
            <Typography variant="body2">계좌입금</Typography>
          </Flexbox>
        </Flexbox>
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            marginTop: 11
          }}
        >
          <Typography variant="body2">환불금액</Typography>
          <Typography
            weight="medium"
            customStyle={{
              color: secondary.red.light
            }}
          >
            {commaNumber(order?.totalPrice || 0)}원
          </Typography>
        </Flexbox>
        {!isLoading && userAccounts.length === 0 && (
          <Button
            variant="ghost"
            brandColor="black"
            fullWidth
            onClick={handleClick}
            customStyle={{
              marginTop: 20
            }}
          >
            본인인증 및 환불계좌 입력
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

export default ChannelOrderRefundWaitAccountMessage;
