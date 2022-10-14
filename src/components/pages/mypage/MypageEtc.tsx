import { useState } from 'react';

import { Button, Flexbox, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import LogoutModal from './LogoutDialog';
import ExitModal from './ExitDialog';

function MypageEtc() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [logoutToggle, setLogoutToggle] = useState(false);
  const [exitToggle, setExtToggle] = useState(false);

  const handleLogout = () => {
    logEvent(attrKeys.mypage.CLICK_LOGOUT);

    setLogoutToggle(true);
  };

  const handleWithdraw = () => {
    logEvent(attrKeys.mypage.CLICK_WITHDRAW);

    setExtToggle(true);
  };

  return (
    <Wrap gap={12} alignment="center" customStyle={{ color: common.ui60 }}>
      <EtcButton onClick={handleLogout}>로그아웃</EtcButton>
      <span>|</span>
      <EtcButton onClick={handleWithdraw}>회원탈퇴</EtcButton>
      <LogoutModal status={logoutToggle} setLogoutToggle={setLogoutToggle} />
      <ExitModal status={exitToggle} setExtToggle={setExtToggle} />
    </Wrap>
  );
}

const Wrap = styled(Flexbox)`
  margin: 32px 0 64px 0;
  font-size: ${({ theme: { typography } }) => typography.small1.size};
`;

const EtcButton = styled(Button)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  border: none;
  padding: 0;
`;

export default MypageEtc;
