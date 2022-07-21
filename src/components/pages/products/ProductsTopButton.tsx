import { TopButton } from '@components/UI/molecules';

import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

function ProductsTopButton() {
  const triggered = useReverseScrollTrigger();
  return (
    <TopButton
      show={triggered}
      customStyle={{
        bottom: 136
      }}
    />
  );
}

export default ProductsTopButton;
