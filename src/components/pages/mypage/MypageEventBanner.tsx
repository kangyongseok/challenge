import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Icon, Image, useTheme } from 'mrcamel-ui';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { MY_PAGE_CAMEL_INTERFERE_IN_KING_EVENT_BANNER_HIDE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function MypageEventBanner() {
  const router = useRouter();

  const [hide, setHide] = useState(false);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MY,
      title: '2302_CAMEL_OPINION',
      att: 'YES'
    });

    router.push('/events/interfereInKing');
  };

  const handleClickClose = (e: MouseEvent<HTMLOrSVGElement>) => {
    e.stopPropagation();

    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MY,
      title: '2302_CAMEL_OPINION',
      att: 'CLOSE'
    });

    setHide(true);
    LocalStorage.set(MY_PAGE_CAMEL_INTERFERE_IN_KING_EVENT_BANNER_HIDE, true);
  };

  useEffect(() => {
    if (LocalStorage.get<boolean>(MY_PAGE_CAMEL_INTERFERE_IN_KING_EVENT_BANNER_HIDE)) {
      setHide(true);
    } else {
      logEvent(attrKeys.events.VIEW_BANNER, {
        name: attrProperty.name.MY,
        title: '2302_CAMEL_OPINION',
        att: 'JOIN'
      });
    }
  }, []);

  if (hide) return null;

  return (
    <Box
      onClick={handleClick}
      customStyle={{
        position: 'relative',
        textAlign: 'center',
        backgroundColor: '#0B123E'
      }}
    >
      <Image
        height={104}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/home/event-interfere-in-king-banner.png`}
        alt="Banner Img"
        disableAspectRatio
      />
      <Icon
        name="CloseOutlined"
        width={16}
        height={16}
        color={common.cmnW}
        onClick={handleClickClose}
        customStyle={{
          position: 'absolute',
          top: 12,
          right: 12
        }}
      />
    </Box>
  );
}

export default MypageEventBanner;
