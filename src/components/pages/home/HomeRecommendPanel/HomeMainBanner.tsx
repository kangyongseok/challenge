import { useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Box, Button, Dialog, Flexbox, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { SafePaymentGuideDialog } from '@components/UI/organisms';

import { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import { ACCESS_USER, IS_CAMEL_BUTLER_EXHIBITION_ALARM } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { deviceIdState, loginBottomSheetState } from '@recoil/common';

function HomeMainBanner() {
  const router = useRouter();
  const toastStack = useToastStack();

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
  const [exhibition, setExhibitionOpen] = useState(false);

  const { mutate } = useMutation(postSurvey);

  const deviceId = useRecoilValue(deviceIdState);

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

  const handleClickExhibition = () => {
    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.BUTLER,
      att: 'EXHIBITION'
    });

    if (!accessUser) {
      setLoginBottomSheet({
        open: true,
        returnUrl: '/'
      });
      return;
    }

    setExhibitionOpen(true);
    // router.push('/butler/exhibition');
  };

  const handleClickOpenAlarm = () => {
    if (LocalStorage.get(IS_CAMEL_BUTLER_EXHIBITION_ALARM)) {
      toastStack({
        children: '이미 신청 되었습니다.'
      });
      setExhibitionOpen(false);
      return;
    }
    mutate(
      {
        deviceId,
        surveyId: 7,
        answer: 0,
        options: ''
      },
      {
        onSuccess() {
          toastStack({
            children: '오픈 알림 신청이 완료되었습니다.'
          });
          LocalStorage.set(IS_CAMEL_BUTLER_EXHIBITION_ALARM, true);
          setExhibitionOpen(false);
        }
      }
    );
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
            onClick={handleClickExhibition}
            customStyle={{
              height: 104,
              backgroundColor: '#EEECE8'
            }}
          >
            <Image
              height={104}
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/banners/exhibition_banner.png`,
                h: 104
              })}
              alt="구하기 힘든 샤넬 백팩 최상급 기획전"
              disableAspectRatio
            />
          </Box>
        </SwiperSlide>
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
            <span>/3</span>
          </Typography>
        </Flexbox>
      </Swiper>
      <SafePaymentGuideDialog
        open={open}
        onClose={() => setOpen(false)}
        ctaType="viewSafePaymentProducts"
      />
      <Dialog
        open={exhibition}
        onClose={() => setExhibitionOpen(false)}
        customStyle={{ width: 311, padding: '32px 20px 20px', textAlign: 'center' }}
      >
        <Image
          height={114}
          src={getImageResizePath({
            imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/chanel_exhibitions.png`,
            h: 114
          })}
          alt="기획전 오픈알림 샤넬 커밍순"
          disableAspectRatio
        />
        <Typography weight="bold" variant="h3" customStyle={{ marginTop: 8 }}>
          기획전이 오픈되면 알려드릴까요?
        </Typography>
        <Button
          fullWidth
          size="xlarge"
          variant="solid"
          brandColor="primary"
          customStyle={{ marginTop: 32 }}
          onClick={handleClickOpenAlarm}
        >
          오픈 알림받기
        </Button>
      </Dialog>
    </>
  );
}

export default HomeMainBanner;
