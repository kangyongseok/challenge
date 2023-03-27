import { useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';

import { SafePaymentGuideDialog } from '@components/UI/organisms';

import { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { loginBottomSheetState } from '@recoil/common';

function HomeMainBanner() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const handleChange = ({ activeIndex }: SwiperClass) => setCurrentIndex(activeIndex);

  const handleClickTransferBanner = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT_DETAIL,
      att: 'TRANSFER'
    });

    resetPlatformsState();
    resetDataState();

    if (!accessUser) {
      setLoginBottomSheet({
        open: true,
        returnUrl: '/mypage/settings/transfer'
      });
      return;
    }

    router.push('/mypage/settings/transfer');
  };

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.ORDER,
      att: 'SAFE_PAYMENT'
    });

    setOpen(true);
  };

  return (
    <>
      <Swiper
        onSlideChange={handleChange}
        style={{
          position: 'relative',
          width: '100%'
        }}
      >
        <SwiperSlide>
          <Box
            onClick={handleClick}
            customStyle={{
              height: 104,
              backgroundColor: '#528BFF'
            }}
          >
            <Image
              height={104}
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/banners/safe-payment-banner.png`,
                h: 104
              })}
              alt="Main Banner Img"
              disableAspectRatio
            />
          </Box>
        </SwiperSlide>
        <SwiperSlide>
          <Box
            onClick={handleClickTransferBanner}
            customStyle={{
              height: 104,
              backgroundColor: '#111A3D'
            }}
          >
            <Image
              height={104}
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/my/transfer-banner.png`,
                h: 104
              })}
              alt="내 상품 가져오기로 한번에 판매 등록 배너"
              disableAspectRatio
            />
          </Box>
        </SwiperSlide>
        <Flexbox
          alignment="center"
          justifyContent="center"
          customStyle={{
            position: 'absolute',
            right: 20,
            bottom: 12,
            padding: '2px 6px',
            borderRadius: 12,
            backgroundColor: common.ui20,
            zIndex: 10
          }}
        >
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{
              color: common.uiWhite,
              '& > span': {
                color: common.ui60
              }
            }}
          >
            {currentIndex + 1}
            <span>/2</span>
          </Typography>
        </Flexbox>
      </Swiper>
      <SafePaymentGuideDialog
        open={open}
        onClose={() => setOpen(false)}
        ctaType="viewSafePaymentProducts"
      />
    </>
  );
}

export default HomeMainBanner;
