import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Icon, Typography, useTheme } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';

function CamelSellerGuideHeader() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [triggered, setTriggered] = useState(false);

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
        <Box onClick={() => router.back()} customStyle={{ padding: 16 }}>
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
