import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Typography, useTheme } from 'mrcamel-ui';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import attrKeys from '@constants/attrKeys';

import { toastState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function EventMarketingAgree() {
  const router = useRouter();
  const { data: userInfo } = useQueryUserInfo();
  const setToastState = useSetRecoilState(toastState);
  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess: () => {
      setToastState({
        type: 'home',
        status: 'disAgree',
        customStyle: { bottom: 30 }
      });
    }
  });

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    logEvent(attrKeys.events.CLICK_PUSH_ON);

    if (!userInfo) {
      router.push({
        pathname: '/login',
        query: { openLogin: 'kakao', returnUrl: router.asPath }
      });
      return;
    }

    if (userInfo?.alarm?.isAgree) {
      setToastState({
        type: 'home',
        status: 'isAgree',
        customStyle: { bottom: 30 }
      });
    } else {
      switchAlarm({
        isNotiEvent: true
      });
    }
  };

  return (
    <Wrap>
      <Typography variant="h4" weight="bold">
        매주 오전 11시 업데이트!
      </Typography>
      <Typography customStyle={{ marginTop: 4 }}>
        내가 원하는 급처템, 놓치고 싶지 않다면?
      </Typography>
      <Button
        variant="solid"
        customStyle={{ marginTop: 20, background: common.ui95, color: common.ui20 }}
        onClick={handleClick}
      >
        마케팅 수신 동의하기
      </Button>
    </Wrap>
  );
}

const Wrap = styled.div`
  padding-bottom: 32px;
  margin-bottom: 32px;
  text-align: center;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  margin-left: -20px;
  width: calc(100% + 40px);
`;

export default EventMarketingAgree;
