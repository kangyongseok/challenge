import { useEffect, useState } from 'react';

import { useMutation } from 'react-query';
import { Box, Flexbox, Icon, Switch, Toast, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import type { Alarm } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { postAlarm, postNightAlarm } from '@api/user';

import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

interface SettingProps {
  data?: Alarm;
}

function MypageSetting({ data }: SettingProps) {
  const {
    theme: { palette }
  } = useTheme();
  const [isAgree, setIsAgree] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [nightToast, setNightToast] = useState(false);
  const [alarmToast, setAlarmToast] = useState(false);
  const [systemSetting, setSystemSetting] = useState(false);

  const { mutate: switchNight } = useMutation(postNightAlarm, {
    onSuccess: () => {
      setIsNight((props) => !props);
    }
  });

  const { mutate: switchAlarm } = useMutation(postAlarm, {
    onSuccess: () => {
      setIsAgree((props) => !props);
    }
  });

  useEffect(() => {
    setIsAgree(!!data?.isAgree);
    setIsNight(!!data?.isNightAgree);
  }, [data]);

  const handleNightSwitch = () => {
    logEvent(attrKeys.mypage.CLICK_NIGHT_ALARM, {
      name: 'MY',
      att: !isNight ? 'YES' : 'NO'
    });

    switchNight(!isNight);
    setNightToast(true);
    setTimeout(() => {
      setNightToast(false);
    }, 2000);
  };

  const handleAlarmSwitch = () => {
    const { CLICK_PUSH_ON, CLICK_PUSH_OFF } = attrKeys.mypage;
    logEvent(!isAgree ? CLICK_PUSH_ON : CLICK_PUSH_OFF);

    switchAlarm(!isAgree);
    setAlarmToast(true);
    setTimeout(() => {
      setAlarmToast(false);
    }, 2000);
  };

  useEffect(() => {
    if (checkAgent.isAndroidApp() && window.webview && window.webview.callAuthPush) {
      window.webview.callAuthPush();
    }
    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callAuthPush &&
      window.webkit.messageHandlers.callAuthPush.postMessage
    ) {
      window.webkit.messageHandlers.callAuthPush.postMessage(0);
    }
    window.getAuthPush = (result: string) => {
      setSystemSetting(JSON.parse(result));
    };
  }, []);

  return (
    <Box
      customStyle={{
        padding: '32px 0 27px',
        borderBottom: `1px solid ${palette.common.grey['90']}`
      }}
    >
      <Typography
        id="mypage-setting"
        variant="h4"
        weight="bold"
        customStyle={{ color: palette.common.grey['20'], marginBottom: 16 }}
      >
        설정
      </Typography>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ marginBottom: 24 }}
        onClick={() => {
          if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
            window.webview.moveToSetting();
          }
          if (
            checkAgent.isIOSApp() &&
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callAuthPush &&
            window.webkit.messageHandlers.callAuthPush.postMessage
          ) {
            window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
          }
          setTimeout(() => {
            if (checkAgent.isAndroidApp() && window.webview && window.webview.callAuthPush) {
              window.webview.callAuthPush();
            }
            if (
              checkAgent.isIOSApp() &&
              window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers.callAuthPush &&
              window.webkit.messageHandlers.callAuthPush.postMessage
            ) {
              window.webkit.messageHandlers.callAuthPush.postMessage(0);
            }
          }, 3000);
        }}
      >
        <Box>
          <Flexbox>
            <Title variant="body1" weight="medium">
              알림 설정
            </Title>
            <Typography customStyle={{ color: palette.common.grey['60'], marginLeft: 10 }}>
              {systemSetting ? '켜짐' : '꺼짐'}
            </Typography>
          </Flexbox>
          <Content variant="small1">기기 설정에서 알림 설정을 변경해주세요.</Content>
        </Box>
        <Box>
          <Icon name="CaretRightOutlined" size="small" />
        </Box>
      </Flexbox>

      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ marginBottom: 24 }}>
        <Box>
          <Title variant="body1" weight="medium">
            맞춤 꿀매물 알림받기
          </Title>
          <Content variant="small1">취향에 맞춰, 꿀매물이 올라오면 바로 알려드릴게요!</Content>
          <Typography
            variant="small2"
            customStyle={{ color: palette.common.grey['60'], marginTop: 4 }}
          >
            ({dayjs().format('YYYY.M.D')} 마케팅 수신 {isAgree ? '동의' : '미동의'})
          </Typography>
        </Box>
        <Box>
          <Switch checked={isAgree} onChange={handleAlarmSwitch} />
        </Box>
      </Flexbox>

      <Flexbox alignment="center" justifyContent="space-between">
        <Box>
          <Title variant="body1" weight="medium">
            야간 방해금지 모드
          </Title>
          <Content variant="small1">10시 이후 모든 알림을 아침에 받겠습니다.</Content>
        </Box>
        <Box>
          <Switch checked={isNight} onChange={handleNightSwitch} />
        </Box>
      </Flexbox>
      <Toast open={nightToast} onClose={() => setNightToast(false)}>
        <Typography
          customStyle={{ textAlign: 'center', color: palette.common.white }}
          variant="small1"
        >
          야간 방해금지 모드가 {isNight ? '설정' : '해제'}되었어요
        </Typography>
      </Toast>
      <Toast open={alarmToast} onClose={() => setAlarmToast(false)}>
        <Typography
          customStyle={{ textAlign: 'center', color: palette.common.white }}
          variant="small1"
        >
          {dayjs().format('YYYY.M.D')} 마케팅 수신 {isAgree ? '동의' : '미동의'} 처리되었습니다.
          <br />
          (재설정: 마이 {'->'} 해제)
        </Typography>
      </Toast>
    </Box>
  );
}

const Title = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
`;

const Content = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.grey['40']};
  margin-top: 4px;
`;

export default MypageSetting;
