import { PropsWithChildren, ReactElement, useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { Box } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { AppDownloadBanner } from '@components/UI/organisms';

import SessionStorage from '@library/sessionStorage';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { checkAgent } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

interface GeneralTemplateProps {
  header?: ReactElement;
  footer?: ReactElement;
  disablePadding?: boolean;
  hideAppDownloadBanner?: boolean;
  customStyle?: CustomStyle;
}

function GeneralTemplate({
  children,
  header,
  footer,
  disablePadding = false,
  hideAppDownloadBanner = false,
  customStyle
}: PropsWithChildren<GeneralTemplateProps>) {
  const [showAppDownloadBanner, setShowAppDownloadBannerState] = useRecoilState(
    showAppDownloadBannerState
  );

  useEffect(() => {
    if (!checkAgent.isMobileApp()) {
      const sessionBanner = SessionStorage.get(sessionStorageKeys.hideAppDownloadBanner);
      setShowAppDownloadBannerState(!sessionBanner);
    }
  }, [setShowAppDownloadBannerState]);

  return (
    <Wrapper css={customStyle}>
      {!hideAppDownloadBanner && showAppDownloadBanner && (
        <Box customStyle={{ minHeight: APP_DOWNLOAD_BANNER_HEIGHT, position: 'relative' }}>
          <AppDownloadBanner />
        </Box>
      )}
      {header}
      <Content disablePadding={disablePadding}>{children}</Content>
      {footer}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Content = styled.main<{ disablePadding: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: ${({ disablePadding }) => (!disablePadding ? '0 20px' : '')};

  @media (max-width: 320px) {
    padding: ${({ disablePadding }) => (!disablePadding ? '0 16px' : '')};
  }
`;

export default GeneralTemplate;
