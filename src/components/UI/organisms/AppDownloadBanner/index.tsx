import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Image, Typography, dark } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { checkAgent, getImageResizePath, handleClickAppDownload } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

import {
  CamelIconBox,
  DownloadButtonBox,
  StyledAppDownloadBanner
} from './AppDownloadBanner.styles';

interface AppDownloadBannerProps {
  description?: string;
}

function AppDownloadBanner({
  description = '앱으로 대한민국 중고명품 모두 보기!'
}: AppDownloadBannerProps) {
  const router = useRouter();

  const [showAppDownloadBanner, setShowAppDownloadBannerState] = useRecoilState(
    showAppDownloadBannerState
  );
  const scrollTriggered = useReverseScrollTrigger();

  const handleClickDownload = () => {
    const getName = () => {
      let name = 'NONE';

      if (router.pathname === '/') {
        name = 'MAIN';
      } else if (router.pathname === '/search') {
        name = 'SEARCHMODAL';
      } else if (router.pathname === '/products/[id]') {
        name = 'PRODUCT_DETAIL';
      } else if (router.pathname === '/products/[id]/inquiry') {
        name = 'PRODUCT_INQUIRY';
      } else if (router.pathname.indexOf('/products/') !== -1) {
        name = 'PRODUCT_LIST';
      } else if (router.pathname === '/myPortfolio') {
        name = 'MY_PORTFOLIO';
      }

      return name;
    };
    const getTitle = () => {
      if (checkAgent.isIOS()) {
        return 'APPLE';
      }
      if (checkAgent.isAndroid()) {
        return 'ANDROID';
      }
      return 'APP';
    };

    logEvent(attrKeys.commonEvent.CLICK_APPDOWNLOAD, {
      name: getName(),
      title: getTitle(),
      att: 'BANNER'
    });

    handleClickAppDownload({
      name: getName()
    });
  };

  useEffect(() => {
    logEvent(attrKeys.commonEvent.VIEW_APPDOWNLOAD, {
      type: 'BANNER'
    });
  }, []);

  useEffect(() => {
    setShowAppDownloadBannerState(scrollTriggered);
  }, [setShowAppDownloadBannerState, scrollTriggered]);

  return (
    <StyledAppDownloadBanner scrollTriggered={scrollTriggered && showAppDownloadBanner}>
      <Flexbox alignment="center" customStyle={{ height: '100%' }} gap={6}>
        <CamelIconBox>
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/logo_icon_blue.png`,
              w: 32
            })}
            alt="Logo Img"
          />
        </CamelIconBox>
        <Box
          customStyle={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          <Typography weight="bold" variant="body2" color={dark.palette.common.uiBlack}>
            카멜 - 세상 모든 중고명품
          </Typography>
          <Typography weight="medium" variant="body2" noWrap color={dark.palette.common.uiBlack}>
            {description}
          </Typography>
        </Box>
        <DownloadButtonBox variant="solid" onClick={handleClickDownload}>
          <Typography color="cmn80">다운로드</Typography>
        </DownloadButtonBox>
      </Flexbox>
    </StyledAppDownloadBanner>
  );
}

export default AppDownloadBanner;
