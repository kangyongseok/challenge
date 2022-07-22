import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { CtaButton, Dialog, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { postWithdraw } from '@api/userAuth';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import checkAgent from '@utils/checkAgent';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ExitProps {
  status: boolean;
  setExtToggle: (close: boolean) => void;
}

function ExitDialog({ status, setExtToggle }: ExitProps) {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();

  const { refetch } = useQuery(queryKeys.userAuth.withdraw(), postWithdraw, {
    enabled: false,
    onSuccess: () => {
      if (checkAgent.isAndroidApp()) {
        if (window.webview && window.webview.callSetLogoutUser && accessUser)
          window.webview.callSetLogoutUser(accessUser.userId);
      }
      if (checkAgent.isIOSApp()) {
        if (
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.callSetLogoutUser &&
          accessUser
        ) {
          window.webkit.messageHandlers.callSetLogoutUser.postMessage(`${accessUser.userId}`);
        }
      }
      setExtToggle(false);
      router.push('/logout');
    }
  });

  const handleWithdraw = () => {
    logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
      att: 'YES'
    });

    refetch();
  };

  const handleMaintainWithdraw = () => {
    logEvent(attrKeys.mypage.SELECT_WITHDRAW, {
      att: 'NO'
    });

    setExtToggle(false);
  };

  return (
    <Dialog open={status} onClose={() => setExtToggle(false)}>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        지금까지 쌓아놓은 검색 이력과 찜 리스트,
      </Typography>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        맞춤 추천을 위한 정보가 모두 삭제됩니다.
      </Typography>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        그래도 회원탈퇴 하시겠어요?
      </Typography>
      <ButtonArea alignment="center" gap={10}>
        <CtaButton
          fullWidth
          variant="ghost"
          brandColor="primary"
          customStyle={{ width: 128 }}
          onClick={handleWithdraw}
        >
          회원탈퇴
        </CtaButton>
        <CtaButton
          fullWidth
          variant="contained"
          brandColor="primary"
          customStyle={{ width: 128 }}
          onClick={handleMaintainWithdraw}
        >
          회원정보 유지
        </CtaButton>
      </ButtonArea>
    </Dialog>
  );
}

const ButtonArea = styled(Flexbox)`
  margin-top: 30px;
`;

export default ExitDialog;
