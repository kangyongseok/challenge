import { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchContentsProducts } from '@api/common';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
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
  const {
    data: { contents: { id = 0, imageMain = '', url = '/' } = {} } = {},
    isSuccess: isSuccessContentsProducts
  } = useQuery(queryKeys.common.contentsProducts(0), () => fetchContentsProducts(0));

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (
      (isSuccess && isSuccessContentsProducts) ||
      (!isSuccess && !accessUser && isSuccessContentsProducts)
    ) {
      let newType = 'crazyCuration';
      const hideMyPortfolioReservationAd = SessionStorage.get(
        sessionStorageKeys.hideMyPortfolioReservationAd
      );
      const hideCrazyCurationEventBannerIds =
        SessionStorage.get<number[]>(sessionStorageKeys.hideCrazyCurationEventBannerIds) || [];

      if (getCookie('myPortfolioReserve') || hideMyPortfolioReservationAd) {
        newType = 'crazyCuration';
      } else if (
        getCookie(`hideCrazyCurationEventBanner-${id}`) ||
        hideCrazyCurationEventBannerIds.includes(id)
      ) {
        newType = 'myPortfolio';
      }

      setType(newType);
    }
  }, [isSuccess, isSuccessContentsProducts, id, accessUser]);

  useEffect(() => {
    if (!type) return;

    if (id && type === 'crazyCuration') {
      logEvent(attrKeys.crazycuration.viewMainModal, { att: 'CRAZY_WEEK' });

      const hideCrazyCurationEventBannerIds =
        SessionStorage.get<number[]>(sessionStorageKeys.hideCrazyCurationEventBannerIds) || [];

      if (
        getCookie(`hideCrazyCurationEventBanner-${id}`) ||
        hideCrazyCurationEventBannerIds.includes(id)
      )
        return;

      setSrc(imageMain);
      setOpen(true);
    } else {
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
    }
  }, [type, userInfo, id, imageMain]);

  const handleClickTodayHidden = () => {
    if (type === 'myPortfolio') {
      setCookie('myPortfolioReserve', 'done', 1);
      setOpen(false);
    } else {
      logEvent(attrKeys.crazycuration.clickNotToday, {
        name: attrProperty.name.main,
        title: attrProperty.title.modal
      });
      setCookie(`hideCrazyCurationEventBanner-${id}`, 'done', 1);
      setOpen(false);
    }
  };

  const handleClick = () => {
    if (type === 'myPortfolio') {
      logEvent(attrKeys.myPortfolio.CLICK_MYPORTFOLIO_BANNER, {
        name: attrProperty.productName.MYPORTFOLIO,
        value: randomNum === 0 ? 'A' : 'B',
        gender: userInfo?.info?.value?.gender || 'none'
      });
      router.push('/myPortfolio');
    } else {
      logEvent(attrKeys.crazycuration.clickCrazyWeek, {
        name: attrProperty.name.main,
        title: attrProperty.title.modal
      });
      router.push(url);
    }
  };

  const handleClose = () => {
    if (type === 'myPortfolio') {
      SessionStorage.set(sessionStorageKeys.hideMyPortfolioReservationAd, true);
      setOpen(false);
    } else {
      logEvent(attrKeys.crazycuration.clickClose, {
        name: attrProperty.name.main,
        title: attrProperty.title.modal
      });

      const hideCrazyCurationEventBannerIds =
        SessionStorage.get<number[]>(sessionStorageKeys.hideCrazyCurationEventBannerIds) || [];
      SessionStorage.set(
        sessionStorageKeys.hideCrazyCurationEventBannerIds,
        hideCrazyCurationEventBannerIds.concat([id])
      );
      setOpen(false);
    }
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
