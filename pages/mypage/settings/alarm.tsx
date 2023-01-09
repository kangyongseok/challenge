import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { MypageAlarmSetting, MypageAlarmSettingOff } from '@components/pages/mypage';

import { checkAgent } from '@utils/common';

function SettingAlarm() {
  const router = useRouter();
  const [systemSetting, setSystemSetting] = useState(false);

  useEffect(() => {
    setSystemSetting(router.query.setting === 'true');
  }, [router]);

  const handleClick = () => {
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

    window.getAuthPush = (result: string) => {
      setSystemSetting(JSON.parse(result));
    };

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

  if (!systemSetting) {
    return (
      <GeneralTemplate
        header={
          <Header showRight={false}>
            <Typography variant="h3" weight="bold">
              알림 설정
            </Typography>
          </Header>
        }
        footer={
          <Box customStyle={{ padding: '0 20px 40px' }}>
            <Button
              fullWidth
              brandColor="primary"
              variant="solid"
              size="xlarge"
              onClick={handleClick}
            >
              알림 켜기
            </Button>
          </Box>
        }
      >
        <MypageAlarmSettingOff />
      </GeneralTemplate>
    );
  }

  return (
    <GeneralTemplate
      disablePadding
      header={
        <Header showRight={false}>
          <Typography variant="h3" weight="bold">
            알림 설정
          </Typography>
        </Header>
      }
    >
      <MypageAlarmSetting />
    </GeneralTemplate>
  );
}

export default SettingAlarm;
