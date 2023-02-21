import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Image } from 'mrcamel-ui';
import dayjs from 'dayjs';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_INTERFERE_IN_KING_EVENT_HIDE_DATE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function HomeEventBannerBottomSheet() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_MAIN_MODAL, {
      name: attrProperty.name.MAIN,
      title: '2302_CAMEL_OPINION',
      att: 'YES'
    });

    router.push('/events/interfereInKing');
  };

  const handleClose = () => setOpen(false);

  const handleClickTodayHide = () => {
    LocalStorage.set(CAMEL_INTERFERE_IN_KING_EVENT_HIDE_DATE, dayjs().format('YYYY-MM-DD'));
    setOpen(false);
  };

  useEffect(() => {
    const hideDate = LocalStorage.get<string>(CAMEL_INTERFERE_IN_KING_EVENT_HIDE_DATE);

    // 이벤트 바텀시트 임시 비활성화
    if (hideDate) {
      if (dayjs().diff(hideDate, 'days') >= 1) {
        LocalStorage.remove(CAMEL_INTERFERE_IN_KING_EVENT_HIDE_DATE);
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.home.VIEW_MAIN_MODAL, {
        name: attrProperty.name.MAIN,
        title: '2302_CAMEL_OPINION',
        att: 'JOIN'
      });
    }
  }, [open]);

  return (
    <BottomSheet open={open} onClose={handleClose} disableSwipeable>
      <Image
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/event-interfere-in-king-ad.png`}
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
