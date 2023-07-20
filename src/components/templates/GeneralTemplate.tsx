import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { AppDownloadBanner, MowebFooter } from '@components/UI/organisms';

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
  hideMowebFooter,
  customStyle
}: PropsWithChildren<GeneralTemplateProps>) {
  const router = useRouter();

  const [activeViewportTrick, setActiveViewportTrickState] =
    useRecoilState(activeViewportTrickState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const triggered = useReverseScrollTrigger(true);

  useViewportUnitsTrick(!activeViewportTrick);

  const [paddingTop, setPaddingTop] = useState(0);
  const [openAppDownloadBanner, setOpenAppDownloadBanner] = useState(false);
  const [openMowebFooter, setOpenMowebFooter] = useState(false);

  useEffect(() => {
    setPaddingTop(
      triggered && !hideAppDownloadBanner && showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0
    );
  }, [hideAppDownloadBanner, showAppDownloadBanner, triggered]);

  useEffect(() => {
    setOpenAppDownloadBanner(!checkAgent.isMobileApp() && !hideAppDownloadBanner);
  }, [hideAppDownloadBanner]);

  useEffect(() => {
    const { redirect, userAgent } = router.query;

    setOpenMowebFooter(
      !(checkAgent.isIOSApp() || checkAgent.isAndroidApp()) &&
        ['/', '/products/[id]', '/wishes'].includes(router.pathname) &&
        !hideMowebFooter &&
        !redirect &&
        !userAgent
    );
  }, [router.pathname, router.query, hideMowebFooter]);

  useEffect(() => {
    setActiveViewportTrickState(true);
  }, [setActiveViewportTrickState]);

  return (
    <Wrapper activeViewportTrick={activeViewportTrick} paddingTop={paddingTop} css={customStyle}>
      {openAppDownloadBanner && <AppDownloadBanner />}
      {header}
      <Content disablePadding={disablePadding}>{children}</Content>
      {openMowebFooter && <MowebFooter />}
      {footer}
    </Wrapper>
  );
}

const Wrapper = styled.div<{ activeViewportTrick: boolean; paddingTop: number }>`
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
  padding-top: ${({ paddingTop }) => paddingTop}px;
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
