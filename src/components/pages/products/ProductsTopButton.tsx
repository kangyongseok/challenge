import { useRecoilValue } from 'recoil';

import { TopButton } from '@components/UI/molecules';

import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { creazycurationProductsEventBottomBannerOpenState } from '@recoil/crazycuration';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

function ProductsTopButton() {
  const triggered = useReverseScrollTrigger();

  const open = useRecoilValue(creazycurationProductsEventBottomBannerOpenState);

  if (open) return null;

  return (
    <TopButton
      show={triggered}
      customStyle={{
        bottom: `calc(80px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'})`
      }}
    />
  );
}

export default ProductsTopButton;
