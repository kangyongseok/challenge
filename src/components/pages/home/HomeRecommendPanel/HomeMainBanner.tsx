import { useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { loginBottomSheetState } from '@recoil/common';
import useSession from '@hooks/useSession';

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

  const { isLoggedIn } = useSession();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChange = ({ activeIndex }: SwiperClass) => setCurrentIndex(activeIndex);

  const handleClickTransferBanner = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT_DETAIL,
      att: 'TRANSFER'
    });

    resetPlatformsState();
    resetDataState();

    if (!isLoggedIn) {
      setLoginBottomSheet({
        open: true,
        returnUrl: '/mypage/settings/transfer'
      });
      return;
    }

    router.push('/mypage/settings/transfer');
  };

  const handleClickOperatorFee = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      att: 'OPERATOR_FEE'
    });

    router.push('/guide/operator');
  };

  // const handleClick = () => {
  //   logEvent(attrKeys.home.CLICK_BANNER, {
  //     att: 'appFirstPayment'
  //   });
  //   router.push('/events/appFirstPayment');
  // };

  return (
    <Swiper
      onSlideChange={handleChange}
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      {/* <SwiperSlide> */}
      {/*  <Box */}
      {/*    onClick={handleClick} */}
      {/*    customStyle={{ */}
      {/*      height: 104, */}
      {/*      backgroundColor: primary.main */}
      {/*    }} */}
      {/*  > */}
      {/*    <Image */}
      {/*      height={104} */}
      {/*      src={getImageResizePath({ */}
      {/*        imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/banners/app-first-payment-event-banner.png`, */}
      {/*        h: 104 */}
      {/*      })} */}
      {/*      alt="Main Banner Img" */}
      {/*      disableAspectRatio */}
      {/*    /> */}
      {/*  </Box> */}
      {/* </SwiperSlide> */}
      <SwiperSlide>
        <Box
          onClick={handleClickOperatorFee}
          customStyle={{
            height: 104,
            backgroundColor: '#425BFF'
          }}
        >
          <Image
            height={104}
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/my/operator_fee_banner.png`,
              h: 104
            })}
            alt="사기, 안전결제 거부, 막말에 지쳤다면? 카멜이 대신 거래해드려요!"
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
  );
}

export default HomeMainBanner;
