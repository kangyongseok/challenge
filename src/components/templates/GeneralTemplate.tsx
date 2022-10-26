import type { PropsWithChildren, ReactElement } from 'react';

import { useRouter } from 'next/router';
import type { CustomStyle } from 'mrcamel-ui';
import { Box } from 'mrcamel-ui';
import styled from '@emotion/styled';

import MowebFooter from '@components/UI/organisms/MowebFooter';
import { AppDownloadBanner } from '@components/UI/organisms';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { checkAgent } from '@utils/common';

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
  const router = useRouter();

  const showMowebFooterCase = ['/', '/products/[id]', '/mypage', '/wishes'].includes(
    router.pathname
  );

  return (
    <Wrapper css={customStyle}>
      {!hideAppDownloadBanner && !(checkAgent.isIOSApp() || checkAgent.isAndroidApp()) && (
        <>
          <AppDownloadBanner />
          <Box customStyle={{ minHeight: APP_DOWNLOAD_BANNER_HEIGHT }} />
        </>
      )}
      {header}
      <Content disablePadding={disablePadding}>{children}</Content>
      {!(checkAgent.isIOSApp() || checkAgent.isAndroidApp()) &&
        showMowebFooterCase &&
        !router.query.redirect &&
        !router.query.userAgent && <MowebFooter />}
      {footer}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
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
