import { useEffect, useRef, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography } from 'mrcamel-ui';

import { Image } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookie, setCookie } from '@utils/common';

const BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio`;
const randomNum = Math.floor(Math.random() * 2);

const feMaleAdImages = [`${BASE_URL}/ad_reserve_F_A.jpg`, `${BASE_URL}/ad_reserve_F_B.jpg`];
const maleAdImages = [`${BASE_URL}/ad_reserve_M_A.jpg`, `${BASE_URL}/ad_reserve_M_B.jpg`];

function MyPortfolioReserveBottomSheet() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: userInfo, isSuccess } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const setCookieRef = useRef<(name: string, value: string, day: number) => void>();
  const getCookieRef = useRef<(name: string) => string>();
  const [adImage, setAdImage] = useState('');

  useEffect(() => {
    const hide = SessionStorage.get(sessionStorageKeys.hideMyPortfolioReservationAd);
    if (userInfo && userInfo.info.value.gender && !hide) {
      if (userInfo.info.value.gender === 'F') {
        setAdImage(feMaleAdImages[randomNum]);
        setOpen(true);
        return;
      }
      setAdImage(maleAdImages[randomNum]);
      setOpen(true);
      return;
    }
    if (isSuccess && !hide) {
      setAdImage(maleAdImages[randomNum]);
      setOpen(true);
    }
  }, [isSuccess, userInfo]);

  useEffect(() => {
    // 쿠키 생성 함수
    setCookieRef.current = setCookie;

    // 쿠키 가져오기 함수
    getCookieRef.current = getCookie;
  }, []);

  const handleClickTodayHidden = () => {
    if (setCookieRef.current) {
      setCookie('myPortfolioReserve', 'done', 1);
      setOpen(false);
    }
  };

  const handleClickRouteMyPortfolio = () => {
    logEvent(attrKeys.myPortfolio.CLICK_MYPORTFOLIO_BANNER, {
      name: attrProperty.productName.MYPORTFOLIO,
      value: randomNum === 0 ? 'A' : 'B',
      gender: userInfo?.info?.value?.gender || 'none'
    });
    router.push('/myPortfolio');
  };

  const handleClickClose = () => {
    SessionStorage.set(sessionStorageKeys.hideMyPortfolioReservationAd, true);
    setOpen(false);
  };

  return (
    <BottomSheet
      open={
        !!(getCookieRef.current && getCookieRef.current('myPortfolioReserve') !== 'done' && open)
      }
      onClose={handleClickClose}
      disableSwipeable
      customStyle={{ borderTopRightRadius: 16, borderTopLeftRadius: 16, overflow: 'hidden' }}
    >
      <Image disableAspectRatio src={adImage} onClick={handleClickRouteMyPortfolio} />
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{ height: 60, padding: '0 20px' }}
      >
        <Typography weight="medium" onClick={handleClickTodayHidden}>
          오늘 하루 보지않기
        </Typography>
        <Button customStyle={{ border: 'none' }} onClick={handleClickClose}>
          닫기
        </Button>
      </Flexbox>
    </BottomSheet>
  );
}

export default MyPortfolioReserveBottomSheet;
