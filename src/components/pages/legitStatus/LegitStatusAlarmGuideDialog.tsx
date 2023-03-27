import { useEffect, useRef, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Dialog, Flexbox, Icon, Switch, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Badge } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import { legitStatusBottomSheetOpenTriggerState } from '@recoil/legitStatus';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function LegitStatusAlarmGuideDialog() {
  const router = useRouter();
  const { firstLegit } = router.query;
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();
  const setLegitStatusBottomSheetOpenTriggerState = useSetRecoilState(
    legitStatusBottomSheetOpenTriggerState
  );
  const [open, setOpen] = useState(false);

  const callAuthPushTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { userNickName } = useQueryMyUserInfo();

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_POPUP, {
      name: attrProperty.legitName.LEGIT_INFO,
      title: attrProperty.legitTitle.LEGIT_PUSHALERT
    });

    if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
      window.webview.moveToSetting();
    }
    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callMoveToSetting &&
      window.webkit.messageHandlers.callMoveToSetting.postMessage
    ) {
      window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
    }

    if (callAuthPushTimerRef.current) {
      clearTimeout(callAuthPushTimerRef.current);
    }

    callAuthPushTimerRef.current = setTimeout(() => {
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

  const handleClose = () => {
    setLegitStatusBottomSheetOpenTriggerState(true);
    setOpen(false);
  };

  useEffect(() => {
    if (
      firstLegit === 'true' &&
      checkAgent.isAndroidApp() &&
      window.webview &&
      window.webview.callAuthPush
    ) {
      window.webview.callAuthPush();
    } else if (
      firstLegit === 'true' &&
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callAuthPush &&
      window.webkit.messageHandlers.callAuthPush.postMessage
    ) {
      window.webkit.messageHandlers.callAuthPush.postMessage(0);
    } else {
      setLegitStatusBottomSheetOpenTriggerState(true);
    }

    window.getAuthPush = (result: string) => {
      if (!JSON.parse(result)) {
        logEvent(attrKeys.legit.VIEW_LEGIT_POPUP, {
          name: attrProperty.legitName.LEGIT_INFO,
          title: attrProperty.legitTitle.LEGIT_PUSHALERT
        });
        setOpen(true);
      } else {
        setLegitStatusBottomSheetOpenTriggerState(true);
      }
    };
  }, [firstLegit, setLegitStatusBottomSheetOpenTriggerState]);

  useEffect(() => {
    return () => {
      setLegitStatusBottomSheetOpenTriggerState(false);

      if (callAuthPushTimerRef.current) {
        clearTimeout(callAuthPushTimerRef.current);
      }
    };
  }, [setLegitStatusBottomSheetOpenTriggerState]);

  return (
    <Dialog open={open} onClose={handleClose} customStyle={{ width: '100%', maxWidth: 303 }}>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        {userNickName}님, 알림이 꺼져있어요!
        <br />
        감정결과 받으려면 알림을 ON 해주세요
      </Typography>
      <GuideBox alignment="center" justifyContent="space-between">
        <Flexbox gap={7}>
          <Badge
            open
            brandColor="red"
            width={12}
            height={12}
            customStyle={{
              top: -2,
              right: -2,
              border: `2px solid ${common.uiWhite}`
            }}
          >
            <Icon name="AlarmFilled" color={secondary.red.main} />
          </Badge>
          <Typography weight="medium">알림</Typography>
        </Flexbox>
        <Box customStyle={{ position: 'relative' }}>
          <Switch
            checked
            customStyle={{
              backgroundColor: '#3DC55E'
            }}
          />
          <Finger>👈</Finger>
        </Box>
      </GuideBox>
      <Box customStyle={{ marginTop: 40, textAlign: 'center' }}>
        <Button
          fullWidth
          variant="solid"
          brandColor="primary"
          onClick={handleClick}
          customStyle={{ maxWidth: 128, minWidth: 127 }}
        >
          1초 알림켜기
        </Button>
      </Box>
    </Dialog>
  );
}

const GuideBox = styled(Flexbox)`
  margin-top: 20px;
  padding: 12px 10px;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
`;

const Finger = styled.div`
  position: absolute;
  top: 10px;
  right: 2px;
  font-size: 40px;
  transform: rotate(37.71deg);
`;

export default LegitStatusAlarmGuideDialog;
