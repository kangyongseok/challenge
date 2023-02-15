import { useEffect, useState } from 'react';

import { Typography, useTheme } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';

function SettingsTransferHeader() {
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
      showRight={false}
      customStyle={{
        backgroundColor: !triggered ? common.bg03 : common.uiWhite
      }}
    >
      <Typography variant="h3" weight="bold">
        내 상품 가져오기
      </Typography>
    </Header>
  );
}

export default SettingsTransferHeader;
