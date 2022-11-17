import { useRecoilValue } from 'recoil';

import { TopButton } from '@components/UI/molecules';

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
        bottom: 80
      }}
    />
  );
}

export default ProductsTopButton;
