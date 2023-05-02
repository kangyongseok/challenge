import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

interface LogoutProps {
  status: boolean;
  setLogoutToggle: (close: boolean) => void;
}

function LogoutDialog({ status, setLogoutToggle }: LogoutProps) {
  const router = useRouter();
  const handleLogout = () => {
    logEvent(attrKeys.mypage.SELECT_LOGOUT, {
      att: 'YES'
    });

    setLogoutToggle(false);
    router.push('/logout');
  };

  const handleMaintainLogin = () => {
    logEvent(attrKeys.mypage.SELECT_LOGOUT, {
      att: 'NO'
    });

    setLogoutToggle(false);
  };

  return (
    <Dialog open={status} onClose={() => setLogoutToggle(false)}>
      <Typography weight="medium" textAlign="center">
        모든 기기에서 로그아웃되고,
      </Typography>
      <Typography weight="medium" textAlign="center">
        다시 로그인하는 수고를 해야합니다
      </Typography>
      <Typography weight="medium" textAlign="center">
        그래도 로그아웃 하시겠어요?
      </Typography>
      <ButtonArea alignment="center" gap={10}>
        <Button
          fullWidth
          variant="ghost"
          brandColor="primary"
          customStyle={{ minWidth: 128 }}
          onClick={handleLogout}
        >
          로그아웃
        </Button>
        <Button
          fullWidth
          variant="solid"
          brandColor="primary"
          customStyle={{ minWidth: 128 }}
          onClick={handleMaintainLogin}
        >
          로그인 유지
        </Button>
      </ButtonArea>
    </Dialog>
  );
}

const ButtonArea = styled(Flexbox)`
  margin-top: 30px;
`;

export default LogoutDialog;
