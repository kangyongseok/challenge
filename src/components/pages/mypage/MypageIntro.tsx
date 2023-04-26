import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Image, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  BOTTOM_NAVIGATION_HEIGHT,
  HEADER_HEIGHT,
  IOS_SAFE_AREA_TOP
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

function MypageIntro() {
  const router = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const handleClickLogin = () => {
    logEvent(attrKeys.mypage.CLICK_LOGIN, {
      name: attrProperty.name.MY
    });

    router.push('/login');
  };

  return (
    <Wrapper
      component="section"
      direction="vertical"
      alignment="center"
      showAppDownloadHeight={showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0}
    >
      <Flexbox
        direction="vertical"
        alignment="center"
        justifyContent="center"
        gap={32}
        customStyle={{ flex: 1 }}
      >
        <IntroImage
          width={181}
          height={231}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/login-img.png`}
          alt="Login Img"
          round={16}
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
        onClick={handleClickLogin}
        customStyle={{ marginBottom: 20 }}
      >
        로그인/가입하기
      </Button>
    </Wrapper>
  );
}

const Wrapper = styled(Flexbox)<{ showAppDownloadHeight: number }>`
  height: calc(
    100vh -
      (
        ${({ showAppDownloadHeight }) =>
          HEADER_HEIGHT + BOTTOM_NAVIGATION_HEIGHT + showAppDownloadHeight}px
      ) - ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );

  height: calc(
    (var(--vh, 1vh) * 100) -
      (
        ${({ showAppDownloadHeight }) =>
          HEADER_HEIGHT + BOTTOM_NAVIGATION_HEIGHT + showAppDownloadHeight}px
      ) - ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
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
