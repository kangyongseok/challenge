import { useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { loginBottomSheetState } from '@recoil/common';

import ProductBanner from './ProductBanner';

function ProductDetailBannerGroup() {
  const { push } = useRouter();

  const {
    palette: { common }
  } = useTheme();

  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChange = ({ activeIndex }: SwiperClass) => setCurrentIndex(activeIndex);

  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);

  const handleClickTransfer = () => {
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

    push('/mypage/settings/transfer');
  };

  return (
    <Swiper
      onSlideChange={handleChange}
      style={{
        position: 'relative',
        width: 'calc(100% + 40px)',
        margin: '0 -20px'
      }}
    >
      <SwiperSlide>
        <ProductBanner
          handleClick={handleClickTransfer}
          bannerColor="#111A3D"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/transfer-banner.png`}
          alt="내 상품 가져오기로 한번에 판매 등록!"
        />
      </SwiperSlide>
      <Flexbox
        alignment="center"
        justifyContent="center"
        customStyle={{
          position: 'absolute',
          right: 20,
          bottom: 20,
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
            display: 'none',
            color: common.uiWhite,
            '& > span': {
              color: common.ui60
            }
          }}
        >
          {currentIndex + 1}
          <span>/1</span>
        </Typography>
      </Flexbox>
    </Swiper>
  );
}

export default ProductDetailBannerGroup;
