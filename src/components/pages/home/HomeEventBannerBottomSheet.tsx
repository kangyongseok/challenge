import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Image, Typography } from 'mrcamel-ui';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookie, setCookie } from '@utils/common';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

const BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio`;
const randomNum = Math.floor(Math.random() * 2);

const feMaleAdImages = [`${BASE_URL}/ad_reserve_F_A.jpg`, `${BASE_URL}/ad_reserve_F_B.jpg`];
const maleAdImages = [`${BASE_URL}/ad_reserve_M_A.jpg`, `${BASE_URL}/ad_reserve_M_B.jpg`];

function HomeEventBannerBottomSheet() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data: userInfo, isSuccess } = useQueryUserInfo();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (isSuccess || (!isSuccess && !accessUser)) {
      setType('myPortfolio');
    }
  }, [isSuccess, accessUser]);

  useEffect(() => {
    if (!type) return;

    const hideMyPortfolioReservationAd = SessionStorage.get(
      sessionStorageKeys.hideMyPortfolioReservationAd
    );
    if (getCookie('myPortfolioReserve') || hideMyPortfolioReservationAd) return;

    if (userInfo && userInfo.info.value.gender) {
      if (userInfo.info.value.gender === 'F') {
        setSrc(feMaleAdImages[randomNum]);
        setOpen(true);
        return;
      }
      setSrc(maleAdImages[randomNum]);
      setOpen(true);
    } else {
      setSrc(maleAdImages[randomNum]);
      setOpen(true);
    }
  }, [type, userInfo]);

  const handleClickTodayHidden = () => {
    setCookie('myPortfolioReserve', 'done', 1);
    setOpen(false);
  };

  const handleClick = () => {
    logEvent(attrKeys.myPortfolio.CLICK_MYPORTFOLIO_BANNER, {
      name: attrProperty.productName.MYPORTFOLIO,
      value: randomNum === 0 ? 'A' : 'B',
      gender: userInfo?.info?.value?.gender || 'none'
    });
    router.push('/myPortfolio');
  };

  const handleClose = () => {
    SessionStorage.set(sessionStorageKeys.hideMyPortfolioReservationAd, true);
    setOpen(false);
  };

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      disableSwipeable
      customStyle={{ borderTopRightRadius: 16, borderTopLeftRadius: 16, overflow: 'hidden' }}
    >
      <Image
        width="100%"
        src={src}
        alt="Event Banner Img"
        disableAspectRatio
        onClick={handleClick}
      />
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ height: 60, padding: '0 20px' }}
      >
        <Typography weight="medium" onClick={handleClickTodayHidden}>
          오늘 하루 보지않기
        </Typography>
        <Button customStyle={{ border: 'none' }} onClick={handleClose}>
          닫기
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

export default HomeEventBannerBottomSheet;
