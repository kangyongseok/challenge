import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import type { AdminMessage } from '@sendbird/chat/message';

import { fetchUserAccounts } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { checkAgent } from '@utils/common';

import { settingsAccountData } from '@recoil/settingsAccount';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOrderSettleWaitAccountMessageProps {
  message: AdminMessage;
}

function ChannelOrderSettleWaitAccountMessage({
  message: { data, createdAt }
}: ChannelOrderSettleWaitAccountMessageProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const resetAccountDataState = useResetRecoilState(settingsAccountData);

  const { data: accessUser } = useQueryAccessUser();

  const { data: userAccounts = [], isLoading } = useQuery(
    queryKeys.users.userAccounts(),
    () => fetchUserAccounts(),
    {
      enabled: !!accessUser
    }
  );

  if (data && accessUser?.userId !== Number(JSON.parse(data)?.userId)) return null;

  const handleClick = () => {
    resetAccountDataState();

    if (checkAgent.isIOSApp()) {
      window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
    }

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
          구매확정
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
