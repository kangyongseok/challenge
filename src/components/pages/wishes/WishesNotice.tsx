import { ReactElement, useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image } from '@components/UI/atoms';

// import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { checkAgent } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

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
  // const [isHeightSmall, setIsHeightSmall] = useState(false);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useEffect(() => {
    // setIsHeightSmall(
    //   (showAppDownloadBanner
    //     ? window.innerHeight - APP_DOWNLOAD_BANNER_HEIGHT
    //     : window.innerHeight) <= 667
    // );
  }, [showAppDownloadBanner]);

  const handleClick = () => {
    if (onClickLog) onClickLog();

    if (moveTo === '/login') {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
    } else {
      router.push(moveTo);
    }
  };

  return (
    <Flexbox
      direction="vertical"
      alignment="center"
      justifyContent="center"
      customStyle={{
        height: hiddenTab === 'legit' ? 'calc(100vh - 188px)' : 'calc(100vh) - 220px',
        paddingBottom: 0,
        marginTop: !(checkAgent.isAndroidApp() || checkAgent.isIOSApp()) ? 30 : 50
      }}
    >
      <Image
        disableAspectRatio
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/wishes/${imgName}.png`}
        width={240}
        // height={isHeightSmall ? 250 : 288}
        alt={imgName}
      />
      <Box customStyle={{ textAlign: 'center' }}>{message}</Box>
      <PositionButton
        fullWidth
        variant="contained"
        brandColor="primary"
        onClick={handleClick}
        isApp={!!(checkAgent.isAndroidApp() || checkAgent.isIOSApp())}
      >
        {buttonLabel}
      </PositionButton>
    </Flexbox>
  );
}

const PositionButton = styled(Button)<{ isApp: boolean }>`
  position: ${({ isApp }) => (isApp ? 'absolute' : 'block')};
  margin-top: ${({ isApp }) => (isApp ? 0 : '20px')};
  bottom: 83px;
  height: 48px;
  left: 20px;
  width: calc(100vw - 40px);
`;

export default WishesNotice;
