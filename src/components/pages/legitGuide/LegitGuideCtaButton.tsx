import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, getAppVersion, handleClickAppDownload, isProduction } from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitGuideCtaButton() {
  const router = useRouter();
  const { tab = 'upload' } = router.query;

  const setDialogState = useSetRecoilState(dialogState);

  const { data: accessUser } = useQueryAccessUser();

  const handleClick = () => {
    if (!tab || tab === 'upload') {
      logEvent(attrKeys.legitGuide.CLICK_LEGIT_PROCESS, {
        name: attrProperty.legitName.LEGIT_HOWITWORKS
      });

      if (checkAgent.isIOSApp() && getAppVersion() < 1143 && isProduction) {
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

      if (checkAgent.isAndroidApp() && isProduction) {
        setDialogState({
          type: 'legitRequestOnlyInIOS',
          customStyleTitle: { minWidth: 270 }
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
        parentIds: 98
      }
    });
  };

  return (
    <Box customStyle={{ height: 92 }}>
      <StyledLegitGuideCtaButton onClick={handleClick}>
        <Button variant="contained" brandColor="primary" size="xlarge" fullWidth>
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

export default LegitGuideCtaButton;
