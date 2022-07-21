import { useSetRecoilState } from 'recoil';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { Image } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';

import { getPageNameByPathName } from '@utils/getPageNameByPathName';
import handleClickAppDownload from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

import {
  CamelIconBox,
  DownloadButtonBox,
  StyledAppDownloadBanner
} from './AppDownloadBanner.styles';

function AppDownloadBanner() {
  const setShowAppDownloadBannerState = useSetRecoilState(showAppDownloadBannerState);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClickDownload = () =>
    handleClickAppDownload({
      options: {
        name: getPageNameByPathName(window.location.pathname),
        att: 'BANNER'
      }
    });

  const handleClickClose = () => {
    setShowAppDownloadBannerState(false);
    SessionStorage.set(sessionStorageKeys.hideAppDownloadBanner, true);
    logEvent('CLICK_APPDOWNLOAD_CLOSE', {
      name: getPageNameByPathName(window.location.pathname),
      att: 'BANNER'
    });
  };

  return (
    <StyledAppDownloadBanner>
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
          <Typography weight="medium" variant="small1">
            카멜 앱 1개로
          </Typography>
          <Typography
            weight="medium"
            variant="small1"
            customStyle={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            대한민국 중고명품 다 모아보세요!
          </Typography>
        </Box>
        <DownloadButtonBox
          variant="contained"
          brandColor="primary"
          endIcon={<Icon name="DownloadFilled" size="small" />}
          onClick={handleClickDownload}
        >
          <Typography weight="bold" variant="small2" customStyle={{ color: common.white }}>
            다운로드
          </Typography>
        </DownloadButtonBox>
        <Icon name="CloseOutlined" width={24} height={24} onClick={handleClickClose} />
      </Flexbox>
    </StyledAppDownloadBanner>
  );
}

export default AppDownloadBanner;
