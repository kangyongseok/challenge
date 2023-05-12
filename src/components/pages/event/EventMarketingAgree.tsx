import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Button, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { putAlarm } from '@api/user';

import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

function EventMarketingAgree() {
  const router = useRouter();

  const toastStack = useToastStack();

  const { data: userInfo } = useQueryUserInfo();
  const { mutate: switchAlarm } = useMutation(putAlarm, {
    onSuccess: () => {
      toastStack({
        children: (
          <>
            <p>{dayjs().format('YYYY-MM-DD')} 마케팅 수신 동의 처리 되었습니다.</p>
            <p>(재설정: 마이 -{'>'} 해제)</p>
          </>
        ),
        bottom: 30
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
      toastStack({
        children: '이미 동의 중 입니다.',
        bottom: 30
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
