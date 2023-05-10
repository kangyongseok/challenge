import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

import { historyState } from '@recoil/common';

function CamelSellerGuideHeader() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { asPaths, index } = useRecoilValue(historyState);

  const [triggered, setTriggered] = useState(false);

  const handleClick = () => {
    const prevAsPath = asPaths[index - 1];

    if (prevAsPath && prevAsPath.indexOf('/camelSeller/registerConfirm') !== -1) {
      router.back();
    } else {
      router.replace('/camelSeller/registerConfirm');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setTriggered(true);
      } else {
        setTriggered(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Header
      leftIcon={
        <Box onClick={handleClick} customStyle={{ padding: 16 }}>
          <Icon name="CloseOutlined" />
        </Box>
      }
      hideTitle={!triggered}
      isTransparent={!triggered}
      showRight={false}
      customStyle={{
        backgroundColor: triggered ? undefined : common.bg02,
        zIndex: triggered ? 11 : undefined
      }}
    >
      <Typography variant="h3" weight="bold">
        사진 등록 가이드
      </Typography>
    </Header>
  );
}

export default CamelSellerGuideHeader;
