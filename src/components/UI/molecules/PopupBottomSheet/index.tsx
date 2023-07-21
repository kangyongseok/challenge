import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { BottomSheet, Button, Flexbox, Image } from '@mrcamelhub/camel-ui';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface PopupBottomSheetProps {
  src: string;
  alt: string;
  popupName: 'OPERATOR_DANGUN';
  onClick?: () => void;
  openProp?: boolean;
  isOnceDay?: boolean; // 하루 한번만 노출
  isNeverShowAgain?: boolean; // 다시보지않기
  isTodayShowAgain?: boolean; // 오늘 하루 보지 않기
}

function PopupBottomSheet({
  src,
  alt,
  openProp,
  popupName,
  isOnceDay,
  isNeverShowAgain,
  isTodayShowAgain,
  onClick
}: PopupBottomSheetProps) {
  const [open, setOpen] = useState(false);

  const handleClickHide = () => {
    if (isNeverShowAgain) {
      LocalStorage.set(popupName, '2500-12-30');
    }
    if (isTodayShowAgain) {
      LocalStorage.set(popupName, dayjs().format('YYYY-MM-DD'));
    }
    setOpen(false);
  };

  useEffect(() => {
    const getFirstViewDate = LocalStorage.get(popupName) as Date;
    const isPreviousDate = dayjs().diff(getFirstViewDate, 'day') > 0;
    if (isOnceDay && openProp && (!getFirstViewDate || isPreviousDate)) {
      setOpen(true);
      LocalStorage.set(popupName, dayjs().format('YYYY-MM-DD'));
    }
  }, [isOnceDay, openProp, popupName]);

  const handleClose = () => setOpen(false);

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
        src={src}
        alt={alt}
        disableAspectRatio
        onClick={onClick}
        round="16px 16px 0 0"
        customStyle={{
          minHeight: 200
        }}
      />
      <Flexbox alignment="center" justifyContent="space-between" customStyle={{ padding: 8 }}>
        <Button variant="inline" size="large" onClick={handleClickHide}>
          {isNeverShowAgain ? '다시보지않기' : '오늘 하루 보지않기'}
        </Button>
        <Button variant="inline" brandColor="black" size="large" onClick={handleClose}>
          닫기
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

export default PopupBottomSheet;
