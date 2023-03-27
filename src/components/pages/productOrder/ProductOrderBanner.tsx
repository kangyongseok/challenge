import { useState } from 'react';

import { Box, Image } from 'mrcamel-ui';

import { SafePaymentGuideDialog } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function ProductOrderBanner() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.ORDER_PAYMENT,
      title: attrProperty.title.ORDER
    });

    setOpen((prevState) => !prevState);
  };

  return (
    <>
      <Box
        onClick={handleClick}
        customStyle={{
          backgroundColor: '#528BFF'
        }}
      >
        <Image
          height={104}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/banners/safe-payment-banner.png`}
          alt="Banner Img"
          disableAspectRatio
        />
      </Box>
      <SafePaymentGuideDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default ProductOrderBanner;
