import type { ReactElement } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  BOTTOM_NAVIGATION_HEIGHT,
  HEADER_HEIGHT
} from '@constants/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useViewportUnitsTrick from '@hooks/useViewportUnitsTrick';

interface WishesNoticeProps {
  message: string | ReactElement;
  moveTo: string;
  buttonLabel: string | ReactElement;
  imgName: string;
  onClickLog?: () => void;
}

function WishesNotice({ imgName, message, moveTo, buttonLabel, onClickLog }: WishesNoticeProps) {
  const router = useRouter();
  const { hiddenTab } = router.query;
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useViewportUnitsTrick();

  const handleClick = () => {
    if (onClickLog) onClickLog();

    if (moveTo === '/login') {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
    } else {
      router.push(moveTo);
    }
  };

  return (
    <Wrapper
      direction="vertical"
      alignment="center"
      justifyContent="center"
      showAppDownloadBanner={showAppDownloadBanner}
      isHiddenTab={hiddenTab === 'legit'}
    >
      <Flexbox
        direction="vertical"
        alignment="center"
        justifyContent="center"
        customStyle={{ flex: 1 }}
      >
        <NoticeImage
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/wishes/${imgName}.png`}
          width={240}
          alt={imgName}
          disableAspectRatio
        />
        <Box customStyle={{ marginTop: 32, textAlign: 'center' }}>{message}</Box>
      </Flexbox>
      <Button
        variant="contained"
        size="large"
        brandColor="primary"
        fullWidth
        onClick={handleClick}
        customStyle={{ marginBottom: 20 }}
      >
        {buttonLabel}
      </Button>
    </Wrapper>
  );
}

const Wrapper = styled(Flexbox)<{ showAppDownloadBanner: boolean; isHiddenTab: boolean }>`
  height: calc(
    100vh -
      ${({ showAppDownloadBanner, isHiddenTab }) => {
        let calcHeight =
          HEADER_HEIGHT +
          BOTTOM_NAVIGATION_HEIGHT +
          (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + 45 : 45);

        if (isHiddenTab) calcHeight += 25;
        return `${calcHeight}px`;
      }}
  );
  height: calc(
    (var(--vh, 1vh) * 100) -
      ${({ showAppDownloadBanner, isHiddenTab }) => {
        let calcHeight =
          HEADER_HEIGHT +
          BOTTOM_NAVIGATION_HEIGHT +
          (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + 45 : 45);

        if (isHiddenTab) calcHeight += 25;
        return `${calcHeight}px`;
      }}
  );
`;

const NoticeImage = styled(Image)`
  max-width: 181px;
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);

  @media (max-width: 360px) {
    max-width: 144px;
  }
`;

export default WishesNotice;
