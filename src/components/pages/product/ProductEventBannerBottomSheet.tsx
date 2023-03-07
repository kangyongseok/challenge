import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Image } from 'mrcamel-ui';
import dayjs from 'dayjs';

import UserTraceRecord from '@library/userTraceRecord';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { PRODUCT_EVENT_AD_BANNER_HIDE_DATE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function ProductEventBannerBottomSheet() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    logEvent(attrKeys.products.CLICK_MODAL, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: '2302_CAMEL_OPINION',
      att: 'YES'
    });

    router.push('/events/interfereInKing');
  };

  const handleClose = () => setOpen(false);

  const handleClickTodayHide = () => {
    LocalStorage.set(PRODUCT_EVENT_AD_BANNER_HIDE_DATE, dayjs().format('YYYY-MM-DD'));
    setOpen(false);
  };

  useEffect(() => {
    const hideDate = LocalStorage.get<string>(PRODUCT_EVENT_AD_BANNER_HIDE_DATE);

    // 최근 일주일 이내 당일을 제외한 재방문 && 매물 상세 2회 조회된 상태에서 매물 상세에 진입 시 노출
    if (
      UserTraceRecord.getLastVisitDateDiffDay() < -7 ||
      !UserTraceRecord.isReVisit() ||
      (UserTraceRecord?.getPageViewCount('product') || 0) < 2
    )
      return;

    if (hideDate) {
      if (dayjs().diff(hideDate, 'days') >= 1) {
        LocalStorage.remove(PRODUCT_EVENT_AD_BANNER_HIDE_DATE);
        setOpen(true);
      }
    } else {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.products.VIEW_MODAL, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: '2302_CAMEL_OPINION',
        att: 'JOIN'
      });
    }
  }, [open]);

  return (
    <BottomSheet open={false} onClose={handleClose} disableSwipeable>
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

export default ProductEventBannerBottomSheet;
