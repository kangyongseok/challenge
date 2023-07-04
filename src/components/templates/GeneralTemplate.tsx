import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import MowebFooter from '@components/UI/organisms/MowebFooter';
import { AppDownloadBanner } from '@components/UI/organisms';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { checkAgent } from '@utils/common';

import { activeViewportTrickState, showAppDownloadBannerState } from '@recoil/common';
import useViewportUnitsTrick from '@hooks/useViewportUnitsTrick';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

interface GeneralTemplateProps {
  header?: ReactElement;
  footer?: ReactElement;
  disablePadding?: boolean;
  hideAppDownloadBanner?: boolean;
  hideMowebFooter?: boolean;
  customStyle?: CustomStyle;
}

function GeneralTemplate({
  children,
  header,
  footer,
  disablePadding,
  hideAppDownloadBanner,
  customStyle
}: PropsWithChildren<GeneralTemplateProps>) {
  const router = useRouter();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [activeViewportTrick, setActiveViewportTrickState] =
    useRecoilState(activeViewportTrickState);

  const triggered = useReverseScrollTrigger(true);
  useViewportUnitsTrick(!activeViewportTrick);

  const showMowebFooterCase = ['/', '/products/[id]', '/wishes'].includes(router.pathname);

  const paddingTopParser = () => {
    if (!checkAgent.isMobileApp() && triggered && !hideAppDownloadBanner && showAppDownloadBanner) {
      return APP_DOWNLOAD_BANNER_HEIGHT;
    }

    return 0;
  };

  useEffect(() => {
    setActiveViewportTrickState(true);
  }, [setActiveViewportTrickState]);

  return (
    <Wrapper
      activeViewportTrick={activeViewportTrick}
      css={{
        paddingTop: paddingTopParser(),
        ...customStyle
      }}
    >
      {!hideAppDownloadBanner && !checkAgent.isMobileApp() && <AppDownloadBanner />}
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

const Wrapper = styled.div<{ activeViewportTrick: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${({ activeViewportTrick }) => (activeViewportTrick ? '100vh' : '100%')};
  ${({ activeViewportTrick }): CSSObject =>
    activeViewportTrick
      ? {
          height: 'calc((var(--vh, 1vh) * 100))'
        }
      : {}};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  transition: padding-top 0.5s;
`;

const Content = styled.main<{ disablePadding?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: ${({ disablePadding }) => (!disablePadding ? '0 20px' : '')};

  @media (max-width: 320px) {
    padding: ${({ disablePadding }) => (!disablePadding ? '0 16px' : '')};
  }
`;

export default GeneralTemplate;
