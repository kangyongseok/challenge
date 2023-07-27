import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { BottomSheet, Button, Flexbox, Image } from '@mrcamelhub/camel-ui';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { EVENT_AD_BANNER_HIDE_DATE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function CommonEventBannerBottomSheet() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_MAIN_MODAL, {
      name: attrProperty.name.MAIN,
      title: '2307_PRODUCT_FEE'
    });

    SessionStorage.set(sessionStorageKeys.hideCommonEventBannerBottomSheet, true);
    setOpen(false);

    router.push('/events/appFirstPayment');
  };

  const handleClose = () => {
    SessionStorage.set(sessionStorageKeys.hideCommonEventBannerBottomSheet, true);
    setOpen(false);
  };

  const handleClickTodayHide = () => {
    LocalStorage.set(EVENT_AD_BANNER_HIDE_DATE, dayjs().format('YYYY-MM-DD'));
    setOpen(false);
  };

  useEffect(() => {
    if (['/events/appFirstPayment', '/login'].includes(router.pathname)) return;

    const hide = SessionStorage.get<boolean>(sessionStorageKeys.hideCommonEventBannerBottomSheet);
    const hideDate = LocalStorage.get<string>(EVENT_AD_BANNER_HIDE_DATE);

    if (hideDate) {
      if (!hide && dayjs().diff(hideDate, 'days') >= 1) {
        LocalStorage.remove(EVENT_AD_BANNER_HIDE_DATE);
        setOpen(true);
      }
    } else if (!hide) {
      setOpen(true);
    }
  }, [router.pathname]);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.home.VIEW_MAIN_MODAL, {
        name: attrProperty.name.MAIN,
        title: '2307_CAMEL_PRODUCT',
        att: 'JOIN'
      });
    }
  }, [open]);

  return (
    <BottomSheet open={open} onClose={handleClose} disableSwipeable>
      <Image
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/app-first-payment-pop-banner.png`}
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

export default CommonEventBannerBottomSheet;
