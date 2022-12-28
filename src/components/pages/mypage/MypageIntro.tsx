import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Image, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ChannelTalk from '@library/channelTalk';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  BOTTOM_NAVIGATION_HEIGHT,
  HEADER_HEIGHT
} from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useViewportUnitsTrick from '@hooks/useViewportUnitsTrick';

function MypageIntro() {
  const router = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useViewportUnitsTrick();

  useEffect(() => {
    ChannelTalk.moveChannelButtonPosition(-50);

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, []);

  return (
    <Wrapper
      component="section"
      direction="vertical"
      alignment="center"
      showAppDownloadBanner={showAppDownloadBanner}
      isAppLayout={!!isExtendedLayoutIOSVersion()}
    >
      <Flexbox
        direction="vertical"
        alignment="center"
        justifyContent="center"
        gap={32}
        customStyle={{ flex: 1 }}
      >
        <IntroImage
          width="100%"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/login-img.png`}
          alt="Login Img"
          disableAspectRatio
        />
        <Flexbox direction="vertical" alignment="center" gap={8}>
          <Typography variant="h2" weight="bold">
            아직 프로필이 없어요!
          </Typography>
          <Typography customStyle={{ textAlign: 'center' }}>
            카멜 로그인해서
            <br />
            나만을 위한 추천을 받아보세요😘
          </Typography>
        </Flexbox>
      </Flexbox>
      <Button
        variant="solid"
        size="large"
        brandColor="primary"
        fullWidth
        onClick={() => router.push('/login')}
        customStyle={{ marginBottom: 20 }}
      >
        로그인/가입하기
      </Button>
    </Wrapper>
  );
}

const Wrapper = styled(Flexbox)<{ showAppDownloadBanner: boolean; isAppLayout: boolean }>`
  height: calc(
    100vh -
      ${({ showAppDownloadBanner, isAppLayout }) =>
        `${
          HEADER_HEIGHT +
          BOTTOM_NAVIGATION_HEIGHT +
          (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0) +
          (isAppLayout ? APP_TOP_STATUS_HEIGHT : 0)
        }px`}
  );
  height: calc(
    (var(--vh, 1vh) * 100) -
      ${({ showAppDownloadBanner, isAppLayout }) =>
        `${
          HEADER_HEIGHT +
          BOTTOM_NAVIGATION_HEIGHT +
          (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0) +
          (isAppLayout ? APP_TOP_STATUS_HEIGHT : 0)
        }px`}
  );
`;

const IntroImage = styled(Image)`
  max-width: 181px;
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);

  @media (max-width: 360px) {
    max-width: 144px;
  }
`;

export default MypageIntro;
