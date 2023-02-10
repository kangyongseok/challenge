import { useEffect } from 'react';

import { Box, Image } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface HomeBannerCardProps {
  src: string;
  pathname: string;
  backgroundColor: string;
  onClick: () => void;
}

function HomeBannerCard({ src, pathname, backgroundColor, onClick }: HomeBannerCardProps) {
  useEffect(() => {
    if (pathname === '/events/interfereInKing') {
      logEvent(attrKeys.events.VIEW_BANNER, {
        name: attrProperty.name.MAIN,
        title: '2302_CAMEL_OPINION',
        att: 'JOIN'
      });
    }
  }, [pathname]);

  return (
    <Box
      onClick={onClick}
      customStyle={{
        margin: '0 -20px',
        textAlign: 'center',
        backgroundColor
      }}
    >
      {src && <Image height={104} src={src} alt="Banner Img" disableAspectRatio />}
    </Box>
  );
}

export default HomeBannerCard;
