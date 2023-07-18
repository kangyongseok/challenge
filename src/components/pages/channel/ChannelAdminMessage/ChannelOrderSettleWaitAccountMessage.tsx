import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';

import { fetchUserAccounts } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { settingsAccountData } from '@recoil/settingsAccount';
import useSession from '@hooks/useSession';

interface ChannelOrderSettleWaitAccountMessageProps {
  message: AdminMessage;
  order?: Order | null;
  onClickOrderDetail: () => void;
}

function ChannelOrderSettleWaitAccountMessage({
  message: { data, createdAt },
  order,
  onClickOrderDetail
}: ChannelOrderSettleWaitAccountMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
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

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

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
          borderRadius: 20,
          overflow: 'hidden'
        }}
      >
        {order?.type === 2 && (
          <Typography
            variant="body3"
            weight="bold"
            color="primary-light"
            customStyle={{
              marginBottom: 4
            }}
          >
            카멜 구매대행
          </Typography>
        )}
        <Typography variant="h4" weight="bold">
          정산대기
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          판매한 물건이 구매확정되었어요.
          <br />
          정산 받을 계좌를 입력해주세요.
        </Typography>
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
            본인인증 및 정산계좌 입력하기
          </Button>
        )}
        <Flexbox
          alignment="center"
          gap={4}
          onClick={onClickOrderDetail}
          customStyle={{
            margin: '20px -20px -20px',
            padding: '12px 20px',
            backgroundColor: common.bg02
          }}
        >
          <Icon name="FileFilled" color="primary-light" />
          <Typography weight="medium" color="primary-light">
            주문상세보기
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

export default ChannelOrderSettleWaitAccountMessage;
