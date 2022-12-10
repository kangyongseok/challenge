import type { PropsWithChildren, ReactElement } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { CustomStyle } from 'mrcamel-ui';
import styled from '@emotion/styled';

import MowebFooter from '@components/UI/organisms/MowebFooter';
import { AppDownloadBanner } from '@components/UI/organisms';

import { APP_DOWNLOAD_BANNER_HEIGHT, CAMEL_SUBSET_FONTFAMILY } from '@constants/common';

import { checkAgent } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

interface GeneralTemplateProps {
  header?: ReactElement;
  footer?: ReactElement;
  disablePadding?: boolean;
  hideAppDownloadBanner?: boolean;
  customStyle?: CustomStyle;
  subset?: boolean;
}

/**
 *
 * @param subset
 * @description 검색어 입력시 졎, 밙 같은 특수한 텍스트에 대한 대응으로 subset 폰트 파일 적용
 */
function GeneralTemplate({
  children,
  header,
  footer,
  disablePadding = false,
  hideAppDownloadBanner = false,
  customStyle,
  subset = false
}: PropsWithChildren<GeneralTemplateProps>) {
  const router = useRouter();

  const triggered = useReverseScrollTrigger(true);
  const isAppdownBannerState = useRecoilValue(showAppDownloadBannerState);

  const showMowebFooterCase = ['/', '/products/[id]', '/mypage', '/wishes'].includes(
    router.pathname
  );

  const paddingTopParser = () => {
    if (!checkAgent.isMobileApp() && triggered && !hideAppDownloadBanner && isAppdownBannerState) {
      return APP_DOWNLOAD_BANNER_HEIGHT;
    }

    return 0;
  };

  return (
    <Wrapper
      subset={subset}
      css={{
        position: 'relative',
        transition: 'padding-top 0.5s',
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

const Wrapper = styled.div<{ subset?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  font-family: ${({ subset }) => (subset ? CAMEL_SUBSET_FONTFAMILY : 'inherit')};
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
