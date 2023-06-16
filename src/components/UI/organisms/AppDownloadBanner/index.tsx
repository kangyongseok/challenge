import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { Box, Flexbox, Image, Typography, dark } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { getImageResizePath, handleClickAppDownload } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

import {
  CamelIconBox,
  DownloadButtonBox,
  StyledAppDownloadBanner
} from './AppDownloadBanner.styles';

function getPageNameByPathName(pathname: string) {
  let pageName = 'NONE';

  if (pathname === '/') {
    pageName = 'MAIN';
  } else if (pathname === '/search') {
    pageName = 'SEARCHMODAL';
  } else if (pathname === '/category') {
    pageName = 'CATEGORY';
  } else if (pathname === '/ranking') {
    pageName = 'HOT';
  } else if (pathname === '/productList') {
    pageName = 'PRODUCT_LIST';
  } else if (pathname.indexOf('/product/') >= 0) {
    pageName = 'PRODUCT_DETAIL';
  } else if (pathname === '/brands') {
    pageName = 'BRAND';
  }

  return pageName;
}

function AppDownloadBanner() {
  const [showAppDownloadBanner, setShowAppDownloadBannerState] = useRecoilState(
    showAppDownloadBannerState
  );

  const scrollTriggered = useReverseScrollTrigger(true);

  const handleClickDownload = () => {
    logEvent(attrKeys.commonEvent.CLICK_APPDOWNLOAD, {
      name: getPageNameByPathName(window.location.pathname),
      att: 'BANNER'
    });

    handleClickAppDownload({
      options: {
        name: getPageNameByPathName(window.location.pathname),
        att: 'BANNER'
      }
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
            앱으로 대한민국 중고명품 모두 보기!
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
