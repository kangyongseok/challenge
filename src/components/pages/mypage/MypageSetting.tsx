import { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Switch, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import type { Alarm } from '@dto/user';

import Sendbird from '@library/sendbird';
import { logEvent } from '@library/amplitude';

import { postNightAlarm } from '@api/user';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { themeState, toastState } from '@recoil/common';
import { sendbirdState } from '@recoil/channel';
import useMutationPostAlarm from '@hooks/useMutationPostAlarm';

interface SettingProps {
  data?: Alarm;
}

function MypageSetting({ data }: SettingProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const theme = useRecoilValue(themeState);
  const { initialized } = useRecoilValue(sendbirdState);
  const setToastState = useSetRecoilState(toastState);

  const [systemSetting, setSystemSetting] = useState(false);
  const [isChannelNoti, setIsChannelNoti] = useState(!!data?.isChannelNoti);
  const [isAgree, setIsAgree] = useState(false);
  const [isNight, setIsNight] = useState(false);

  const { mutate: switchNight } = useMutation(postNightAlarm, {
    onSuccess: () => {
      setIsNight((props) => !props);
      setToastState({ type: 'user', status: isNight ? 'disAgreeNight' : 'agreeNight' });
    }
  });

  const { mutate: mutatePostAlarm } = useMutationPostAlarm();

  const handleClickSetting = () => {
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
  };

  const handleClickChannelNotification = async () => {
    await mutatePostAlarm(
      {
        isAlarm: isAgree,
        isChannelNoti: !isChannelNoti
      },
      {
        onSuccess() {
          setToastState({
            type: 'user',
            status: isChannelNoti ? 'channelNotiOff' : 'channelNotiOn'
          });
        }
      },
      true
    );
  };

  const handleHoneyProductAlarmSwitch = () => {
    const { CLICK_PUSH_ON, CLICK_PUSH_OFF } = attrKeys.mypage;
    logEvent(!isAgree ? CLICK_PUSH_ON : CLICK_PUSH_OFF);

    mutatePostAlarm(
      {
        isAlarm: !isAgree,
        isChannelNoti
      },
      {
        onSuccess() {
          setIsAgree(!isAgree);
          setToastState({ type: 'user', status: isAgree ? 'disAgreeAlarm' : 'agreeAlarm' });
        }
      }
    );
  };

  const handleNightSwitch = () => {
    logEvent(attrKeys.mypage.CLICK_NIGHT_ALARM, {
      name: 'MY',
      att: !isNight ? 'YES' : 'NO'
    });

    switchNight(!isNight);
  };

  const handleClickControlBlockUser = () => {
    logEvent(attrKeys.mypage.CLICK_BLOCK_LIST, { name: attrProperty.name.MY });
    router.push('/mypage/settings/blockedUsers');
  };

  useEffect(() => {
    setIsAgree(!!data?.isAgree);
    setIsNight(!!data?.isNightAgree);
    setIsChannelNoti(!!data?.isChannelNoti);
  }, [data]);

  useEffect(() => {
    if (initialized) {
      Sendbird.isSnoozedNotification().then((result) => {
        if (result && result.isSnoozeOn === !!data?.isChannelNoti)
          setIsChannelNoti(!result.isSnoozeOn);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

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
    <Flexbox
      direction="vertical"
      gap={12}
      customStyle={{ padding: '32px 0 36px', borderBottom: `1px solid ${common.ui90}` }}
    >
      <Typography
        id="mypage-setting"
        variant="h4"
        weight="bold"
        customStyle={{ color: common.ui20 }}
      >
        설정
      </Typography>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ padding: '4px 0' }}
        onClick={handleClickSetting}
      >
        <Flexbox direction="vertical" gap={4}>
          <Title variant="body1" weight="medium">
            알림 설정
            <span>{systemSetting ? '켜짐' : '꺼짐'}</span>
          </Title>
          <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
            기기 설정에서 알림 설정을 변경해주세요.
          </Typography>
        </Flexbox>
        <Box customStyle={{ padding: '8px 0' }}>
          <Icon name="CaretRightOutlined" size="small" />
        </Box>
      </Flexbox>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ display: 'none', padding: '4px 0' }}
        onClick={() => router.push('/mypage/settings/theme')}
      >
        <Flexbox direction="vertical" gap={4}>
          <Title variant="body1" weight="medium">
            화면 테마
            <span>
              {theme === 'system' && '시스템 설정'}
              {theme === 'light' && '라이트 모드'}
              {theme === 'dark' && '다크 모드'}
            </span>
          </Title>
          <Typography variant="small1" customStyle={{ color: common.ui60 }}>
            나만의 화면 테마를 설정해보세요.
          </Typography>
        </Flexbox>
        <Box customStyle={{ padding: '8px 0' }}>
          <Icon name="CaretRightOutlined" size="small" />
        </Box>
      </Flexbox>
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ padding: '4px 0' }}>
        <Flexbox direction="vertical" gap={4}>
          <Title variant="body1" weight="medium">
            채팅 알림
          </Title>
          <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
            채팅이 오면 알려드려요.
          </Typography>
        </Flexbox>
        <Switch
          checked={isChannelNoti}
          onChange={handleClickChannelNotification}
          customStyle={{ width: 50, height: 30, '& > div': { width: 26, height: 26 } }}
        />
      </Flexbox>
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ padding: '4px 0' }}>
        <Flexbox direction="vertical" gap={4}>
          <Title variant="body1" weight="medium">
            맞춤 꿀매물 알림받기
          </Title>
          <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
            취향에 맞춰, 꿀매물이 올라오면 바로 알려드릴게요!
          </Typography>
          <Typography variant="small2" customStyle={{ color: common.ui60 }}>
            ({dayjs().format('YYYY.M.D')} 마케팅 수신 {isAgree ? '동의' : '미동의'})
          </Typography>
        </Flexbox>
        <Switch
          checked={isAgree}
          onChange={handleHoneyProductAlarmSwitch}
          customStyle={{ width: 50, height: 30, '& > div': { width: 26, height: 26 } }}
        />
      </Flexbox>
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ padding: '4px 0' }}>
        <Flexbox direction="vertical" gap={4}>
          <Title variant="body1" weight="medium">
            야간 방해금지 모드
          </Title>
          <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
            10시 이후 모든 알림을 아침에 받겠습니다.
          </Typography>
        </Flexbox>
        <Box>
          <Switch
            checked={isNight}
            onChange={handleNightSwitch}
            customStyle={{ width: 50, height: 30, '& > div': { width: 26, height: 26 } }}
          />
        </Box>
      </Flexbox>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ padding: '4px 0', cursor: 'pointer' }}
        onClick={handleClickControlBlockUser}
      >
        <Title variant="body1" weight="medium">
          차단 사용자 관리
        </Title>
        <Flexbox justifyContent="center" alignment="center" customStyle={{ height: 20, width: 20 }}>
          <Icon name="CaretRightOutlined" size="small" />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

const Title = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};

  & > span {
    margin-left: 8px;
    color: ${({ theme: { palette } }) => palette.common.ui60};
    font-weight: normal;
  }
`;

export default MypageSetting;
