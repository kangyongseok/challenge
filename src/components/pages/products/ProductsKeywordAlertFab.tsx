import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchAlarm, fetchUserKeywords } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { BOTTOM_NAVIGATION_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, handleClickAppDownload } from '@utils/common';

import {
  keywordAlertManageBottomSheetState,
  keywordAlertOffDialogOpenState
} from '@recoil/keywordAlert';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

function ProductsKeywordAlertFab() {
  const router = useRouter();
  const { keyword }: { keyword?: string } = router.query;

  const setKeywordAlertManageBottomSheetState = useSetRecoilState(
    keywordAlertManageBottomSheetState
  );
  const setKeywordAlertOffOpenState = useSetRecoilState(keywordAlertOffDialogOpenState);

  const [open, setOpen] = useState(false);
  const [openAlarmDialog, setOpenAlarmDialog] = useState(false);

  const triggered = useReverseScrollTrigger();

  const { data = [], isLoading } = useQuery(
    queryKeys.users.userKeywords(),
    () => fetchUserKeywords(),
    {
      refetchOnMount: true
    }
  );

  const { data: { isNotiKeyword } = {} } = useQuery(queryKeys.users.alarms(), fetchAlarm, {
    refetchOnMount: true
  });

  const handleClick = () => {
    if (!keyword) return;

    logEvent(attrKeys.products.CLICK_KEYWORD_ALERT, {
      name: attrProperty.name.PRODUCT_LIST,
      title: attrProperty.title.FLOATING,
      keyword: keyword.replace(/-/g, '')
    });

    if (!checkAgent.isMobileApp()) {
      setOpen(true);
      return;
    }

    window.getAuthPush = (result: string) => {
      if (!JSON.parse(result)) {
        setOpenAlarmDialog(true);
      } else {
        setOpenAlarmDialog(false);
      }
    };

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

    if (!isNotiKeyword) {
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        keyword: keyword.replace(/-/g, ' ')
      }));
      setKeywordAlertOffOpenState(true);
    } else {
      setKeywordAlertManageBottomSheetState((prevState) => ({
        ...prevState,
        open: true,
        keyword: keyword.replace(/-/g, ' ')
      }));
    }
  };

  const handleClickOnAlarm = () => {
    window.getAuthPush = (result: string) => {
      if (!JSON.parse(result)) {
        setOpenAlarmDialog(true);
      } else {
        setOpenAlarmDialog(false);
      }
    };

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
  };

  useEffect(() => {
    if (
      !isLoading &&
      (keyword || '').length <= 20 &&
      data.length < 50 &&
      !data.some(
        ({ keyword: dataKeyword }) => dataKeyword === (keyword || '').replace(/-/g, ' ')
      ) &&
      keyword
    ) {
      logEvent(attrKeys.products.VIEW_KEYWORD_ALERT, {
        name: attrProperty.name.PRODUCT_LIST,
        title: attrProperty.title.FLOATING,
        keyword: keyword.replace(/-/g, '')
      });
    }
  }, [data, isLoading, keyword]);

  if (
    isLoading ||
    (keyword || '').length > 20 ||
    data.length >= 50 ||
    data.some(({ keyword: dataKeyword }) => dataKeyword === (keyword || '').replace(/-/g, ' '))
  )
    return null;

  return (
    <>
      <StyledProductsKeywordAlertFab triggered={triggered} onClick={handleClick}>
        <Flexbox
          alignment="center"
          justifyContent="center"
          customStyle={{
            minWidth: 'fit-content'
          }}
        >
          <Icon name="AlarmFilled" width={20} height={20} color="uiWhite" />
        </Flexbox>
        <Flexbox
          alignment="center"
          customStyle={{
            flexGrow: 1,
            minWidth: 0
          }}
        >
          <Typography
            variant="h4"
            weight="bold"
            color="uiWhite"
            noWrap
            customStyle={{
              flexGrow: 1
            }}
          >
            {(keyword || '').replace(/-/g, ' ')}
          </Typography>
          &nbsp;
          <Typography
            variant="h4"
            color="uiWhite"
            customStyle={{
              minWidth: 'fit-content',
              whiteSpace: 'nowrap'
            }}
          >
            알림 받기
          </Typography>
        </Flexbox>
      </StyledProductsKeywordAlertFab>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Typography variant="h3" weight="bold" textAlign="center">
          알림을 받으려면
          <br />
          카멜 앱이 필요해요
        </Typography>
        <Typography
          textAlign="center"
          customStyle={{
            marginTop: 8
          }}
        >
          지금 바로 앱을 다운받아볼까요?
        </Typography>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 32
          }}
        >
          <Button
            variant="solid"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => handleClickAppDownload({})}
          >
            카멜 앱 다운로드
          </Button>
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => setOpen(false)}
          >
            취소
          </Button>
        </Flexbox>
      </Dialog>
      <Dialog open={openAlarmDialog} onClose={() => setOpenAlarmDialog(false)}>
        <Flexbox
          alignment="center"
          justifyContent="center"
          customStyle={{
            maxWidth: 52,
            maxHeight: 52,
            fontSize: 52,
            margin: 'auto'
          }}
        >
          🫢
        </Flexbox>
        <Typography
          variant="h3"
          weight="bold"
          textAlign="center"
          customStyle={{
            marginTop: 32
          }}
        >
          기기 알림이 꺼져있어요!
        </Typography>
        <Typography
          variant="h4"
          textAlign="center"
          customStyle={{
            marginTop: 8
          }}
        >
          키워드 알림을 받을 수 없어요.
          <br />
          설정으로 이동하여 알림을 켜주세요.
        </Typography>
        <Button
          variant="solid"
          brandColor="black"
          size="large"
          fullWidth
          onClick={handleClickOnAlarm}
          customStyle={{
            marginTop: 32
          }}
        >
          알림 켜기
        </Button>
      </Dialog>
    </>
  );
}

const StyledProductsKeywordAlertFab = styled.div<{
  triggered?: boolean;
}>`
  position: fixed;
  left: 50%;
  bottom: ${BOTTOM_NAVIGATION_HEIGHT + 20}px;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: calc(100% - 144px);
  padding: 8px 14px;
  border-radius: 36px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  transform: ${({ triggered }) => (triggered ? 'translate(-50%, 0)' : 'translate(-50%, 60px)')};
  transition: transform 0.5s;
`;

export default ProductsKeywordAlertFab;
