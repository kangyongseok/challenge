import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';

import type { AccessUser } from '@dto/userAuth';
import { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { loginBottomSheetState } from '@recoil/common';

import ProductBanner from './ProductBanner';

function ProductDetailBannerGroup({ product }: { product: Product | undefined }) {
  const { push } = useRouter();

  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);

  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);

  const bulterTargetBrands = ['샤넬', '디올', '구찌', '보테가베네타', '루이비통', '고야드'];
  const isButlerBrand = bulterTargetBrands.includes(product?.brand.name || '');
  const categoryBag = product?.category.parentId === 45;
  const categoryWatch = product?.category.parentId === 96;
  const isButlerPrice = (product?.price || 0) >= 3000000;
  const isWatchPrice = (product?.price || 0) >= 5000000;
  const isButlerBanner = isButlerBrand && categoryBag && isButlerPrice;
  const isWatchBanner = categoryWatch && isWatchPrice;

  const handleClickWatch = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT_DETAIL,
      att: 'BUTLER'
    });

    SessionStorage.set(sessionStorageKeys.butlerSource, 'PRODUCT_DETAIL');

    push('/events/butlerIntroWatch');
  };

  const handleClickButler = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PRODUCT_DETAIL,
      att: 'BUTLER'
    });

    SessionStorage.set(sessionStorageKeys.butlerSource, 'PRODUCT_DETAIL');

    push('/events/butlerIntro');
  };

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

  if (isWatchBanner) {
    return (
      <ProductBanner
        handleClick={handleClickWatch}
        bannerColor="#161617"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_watch_banner.png`}
        alt="사고싶은 시계 아직 찾지 못했다면?"
      />
    );
  }

  if (isButlerBanner) {
    return (
      <ProductBanner
        handleClick={handleClickButler}
        bannerColor="#161617"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_banner.png`}
        alt="사고싶은 가방 아직 찾지 못했다면?"
      />
    );
  }

  return (
    <ProductBanner
      handleClick={handleClickTransfer}
      bannerColor="#111A3D"
      src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/transfer-banner.png`}
      alt="내 상품 가져오기로 한번에 판매 등록!"
    />
  );
}

export default ProductDetailBannerGroup;
