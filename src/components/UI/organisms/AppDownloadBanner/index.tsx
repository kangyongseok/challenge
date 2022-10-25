// import { useSetRecoilState } from 'recoil';
import { useEffect } from 'react';

import { useSetRecoilState } from 'recoil';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { Image } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { handleClickAppDownload } from '@utils/common';

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
  const setShowAppDownloadBannerState = useSetRecoilState(showAppDownloadBannerState);
  const triggered = useReverseScrollTrigger(true);
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    logEvent(attrKeys.commonEvent.VIEW_APPDOWNLOAD, {
      type: 'BANNER'
    });
  }, []);

  useEffect(() => {
    setShowAppDownloadBannerState(triggered);
  }, [setShowAppDownloadBannerState, triggered]);

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
  // const handleClickClose = () => {
  //   setShowAppDownloadBannerState(false);
  //   SessionStorage.set(sessionStorageKeys.hideAppDownloadBanner, true);
  // logEvent('CLICK_APPDOWNLOAD_CLOSE', {
  //   name: getPageNameByPathName(window.location.pathname),
  //   att: 'BANNER'
  // });
  // };

  return (
    <StyledAppDownloadBanner scrollTriggered={triggered}>
      <Flexbox alignment="center" customStyle={{ height: '100%' }} gap={6}>
        <CamelIconBox>
          <Image
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/logo_icon_blue.png`}
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
          <Typography weight="bold" variant="small1" customStyle={{ color: common.uiWhite }}>
            카멜 - 세상 모든 중고명품
          </Typography>
          <Typography
            weight="medium"
            variant="small1"
            customStyle={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: common.uiWhite
            }}
          >
            앱으로 대한민국 중고명품 모두 보기!
          </Typography>
        </Box>
        <DownloadButtonBox variant="contained" onClick={handleClickDownload}>
          <Typography customStyle={{ color: common.cmn80 }}>다운로드</Typography>
        </DownloadButtonBox>
      </Flexbox>
    </StyledAppDownloadBanner>
  );
}

export default AppDownloadBanner;
