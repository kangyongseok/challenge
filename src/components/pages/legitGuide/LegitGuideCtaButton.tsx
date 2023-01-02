import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  handleClickAppDownload,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

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

  const setDialogState = useSetRecoilState(dialogState);

  const { data: accessUser } = useQueryAccessUser();

  const handleClick = () => {
    if (!tab || tab === 'upload') {
      logEvent(attrKeys.legitGuide.CLICK_LEGIT_PROCESS, {
        name: attrProperty.legitName.LEGIT_HOWITWORKS
      });

      if (!checkAgent.isMobileApp()) {
        setDialogState({
          type: 'legitRequestOnlyInApp',
          customStyleTitle: { minWidth: 270 },
          secondButtonAction() {
            handleClickAppDownload({});
          }
        });

        return;
      }

      if (isNeedUpdateImageUploadIOSVersion()) {
        setDialogState({
          type: 'appUpdateNotice',
          customStyleTitle: { minWidth: 269 },
          secondButtonAction: () => {
            if (
              window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers.callExecuteApp
            )
              window.webkit.messageHandlers.callExecuteApp.postMessage(
                'itms-apps://itunes.apple.com/app/id1541101835'
              );
          }
        });

        return;
      }

      if (isNeedUpdateImageUploadAOSVersion()) {
        setDialogState({
          type: 'appUpdateNotice',
          customStyleTitle: { minWidth: 269 },
          secondButtonAction: () => {
            if (window.webview && window.webview.callExecuteApp)
              window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
          }
        });
        return;
      }

      if (!accessUser) {
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
    );
  }

  return (
    <Box customStyle={{ height: 92 }}>
      <StyledLegitGuideCtaButton onClick={handleClick}>
        <Button variant="solid" brandColor="primary" size="xlarge" fullWidth>
          {tab === 'upload' ? '사진 올려서 감정신청해보기' : '구찌지갑 감정신청해보기'}
        </Button>
      </StyledLegitGuideCtaButton>
    </Box>
  );
}

const StyledLegitGuideCtaButton = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 20px;
  width: 100%;
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
