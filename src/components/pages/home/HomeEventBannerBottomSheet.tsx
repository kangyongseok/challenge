import { useEffect, useState } from 'react';

import { BottomSheet, Button, Flexbox, Image } from 'mrcamel-ui';
import dayjs from 'dayjs';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { EVENT_AD_BANNER_HIDE_DATE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

function HomeEventBannerBottomSheet() {
  const [open, setOpen] = useState(false);

  const handleClickMoveToCamelSeller = useMoveCamelSeller({
    attributes: {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.MAIN_MODAL,
      source: 'MAIN'
    }
  });

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_MAIN_MODAL, {
      name: attrProperty.name.MAIN,
      title: '2302_CAMEL_PRODUCT',
      att: 'YES'
    });

    handleClickMoveToCamelSeller();
  };

  const handleClose = () => setOpen(false);

  const handleClickTodayHide = () => {
    LocalStorage.set(EVENT_AD_BANNER_HIDE_DATE, dayjs().format('YYYY-MM-DD'));
    setOpen(false);
  };

  useEffect(() => {
    const hideDate = LocalStorage.get<string>(EVENT_AD_BANNER_HIDE_DATE);

    // 이벤트 바텀시트 임시 비활성화
    if (hideDate) {
      if (dayjs().diff(hideDate, 'days') >= 1) {
        LocalStorage.remove(EVENT_AD_BANNER_HIDE_DATE);
        setOpen(true);
      }
    } else {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.home.VIEW_MAIN_MODAL, {
        name: attrProperty.name.MAIN,
        title: '2302_CAMEL_PRODUCT',
        att: 'JOIN'
      });
    }
  }, [open]);

  return (
    <BottomSheet open={open} onClose={handleClose} disableSwipeable>
      <Image
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/event-camel-seller-ad.png`}
        alt="Event Banner Img"
        disableAspectRatio
        onClick={handleClick}
        round="16px 16px 0 0"
        customStyle={{
          minHeight: 200
        }}
      />
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ padding: 8 }}>
        <Button variant="inline" size="large" onClick={handleClickTodayHide}>
          오늘 하루 보지않기
        </Button>
        <Button variant="inline" brandColor="black" size="large" onClick={handleClose}>
          닫기
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

export default HomeEventBannerBottomSheet;
