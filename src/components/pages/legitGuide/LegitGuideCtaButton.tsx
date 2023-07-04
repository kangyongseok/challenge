import { useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Tooltip, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { AppUpdateNoticeDialog, LegitRequestOnlyInAppDialog } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import useSession from '@hooks/useSession';

function LegitGuideCtaButton() {
  const router = useRouter();
  const { tab = 'upload' } = router.query;

  const {
    theme: {
      palette: {
        secondary: { red },
        common
      }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [openIOSNoticeDialog, setOpenIOSNoticeDialog] = useState(false);
  const [openAOSNoticeDialog, setOpenAOSNoticeDialog] = useState(false);

  const { isLoggedIn } = useSession();

  const handleClick = () => {
    if (!tab || tab === 'upload') {
      logEvent(attrKeys.legitGuide.CLICK_LEGIT_PROCESS, {
        name: attrProperty.legitName.LEGIT_HOWITWORKS
      });

      if (!checkAgent.isMobileApp()) {
        setOpen(true);

        return;
      }

      if (isNeedUpdateImageUploadIOSVersion()) {
        setOpenIOSNoticeDialog(true);
        return;
      }

      if (isNeedUpdateImageUploadAOSVersion()) {
        setOpenAOSNoticeDialog(true);
        return;
      }

      if (!isLoggedIn) {
        router.push({ pathname: '/login', query: { returnUrl: '/legit/guide' } });
        return;
      }

      router.push('/legit/request/selectCategory');
      return;
    }

    logEvent(attrKeys.legitGuide.CLICK_PRODUCT_LIST, {
      name: attrProperty.legitName.LEGIT_HOWITWORKS
    });

    router.push({
      pathname: '/products/brands/구찌',
      query: {
        parentIds: 98,
        idFilterIds: 101
      }
    });
  };

  if (tab === 'upload') {
    return (
      <>
        <Box customStyle={{ height: 92 }}>
          <StyledLegitGuideCtaButton onClick={handleClick}>
            <TooltipWrapper>
              <Tooltip
                open
                message={
                  <Typography
                    variant="body2"
                    weight="medium"
                    customStyle={{
                      color: common.cmnB,
                      '& > strong': {
                        color: red.light
                      }
                    }}
                  >
                    😎 <strong>무료진행</strong>중입니다!
                  </Typography>
                }
                placement="top"
                customStyle={{
                  top: 10,
                  height: 'fit-content',
                  zIndex: 0
                }}
              >
                <Button variant="solid" brandColor="primary" size="xlarge" fullWidth>
                  {tab === 'upload' ? '사진 올려서 감정신청해보기' : '구찌지갑 감정신청해보기'}
                </Button>
              </Tooltip>
            </TooltipWrapper>
          </StyledLegitGuideCtaButton>
        </Box>
        <LegitRequestOnlyInAppDialog open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Box customStyle={{ height: 92 }}>
        <StyledLegitGuideCtaButton onClick={handleClick}>
          <Button variant="solid" brandColor="primary" size="xlarge" fullWidth>
            {tab === 'upload' ? '사진 올려서 감정신청해보기' : '구찌지갑 감정신청해보기'}
          </Button>
        </StyledLegitGuideCtaButton>
      </Box>
      <LegitRequestOnlyInAppDialog open={open} onClose={() => setOpen(false)} />
      <AppUpdateNoticeDialog
        open={openIOSNoticeDialog}
        onClose={() => setOpenIOSNoticeDialog(false)}
        onClick={() => {
          if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callExecuteApp
          )
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              'itms-apps://itunes.apple.com/app/id1541101835'
            );
        }}
      />
      <AppUpdateNoticeDialog
        open={openAOSNoticeDialog}
        onClose={() => setOpenAOSNoticeDialog(false)}
        onClick={() => {
          if (window.webview && window.webview.callExecuteApp)
            window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
        }}
      />
    </>
  );
}

const StyledLegitGuideCtaButton = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 20px;
  width: 100%;
  z-index: 10;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
`;

const TooltipWrapper = styled.div`
  & > div {
    width: 100%;
  }
`;

export default LegitGuideCtaButton;
