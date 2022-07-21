import { PropsWithChildren, ReactElement, useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { Box } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { AppDownloadBanner } from '@components/UI/organisms';

import SessionStorage from '@library/sessionStorage';

import sessionStorageKeys from '@constants/sessionStorageKeys';

import checkAgent from '@utils/checkAgent';

import { showAppDownloadBannerState } from '@recoil/common';

interface GeneralTemplateProps {
  header?: ReactElement;
  footer?: ReactElement;
  disablePadding?: boolean;
  hideAppDownloadBanner?: boolean;
}

function GeneralTemplate({
  children,
  header,
  footer,
  disablePadding = false,
  hideAppDownloadBanner = false
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
    <Wrapper>
      {!hideAppDownloadBanner && showAppDownloadBanner && (
        <>
          <AppDownloadBanner />
          <Box customStyle={{ height: 60 }} />
        </>
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
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ disablePadding }) => (!disablePadding ? '0 20px' : '')};

  @media (max-width: 320px) {
    padding: ${({ disablePadding }) => (!disablePadding ? '0 16px' : '')};
  }
`;

export default GeneralTemplate;
