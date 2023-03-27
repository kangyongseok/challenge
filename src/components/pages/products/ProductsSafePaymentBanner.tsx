import { useState } from 'react';

import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { SafePaymentGuideDialog } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function ProductsSafePaymentBanner() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_LIST,
      title: attrProperty.title.ORDER
    });

    setOpen((prevState) => !prevState);
  };

  return (
    <>
      <Flexbox
        justifyContent="center"
        alignment="center"
        gap={4}
        onClick={handleClick}
        customStyle={{
          padding: 12,
          textAlign: 'center',
          backgroundColor: common.ui20
        }}
      >
        <Icon name="WonCircleFilled" width={20} height={20} color={common.uiWhite} />
        <Typography
          weight="medium"
          customStyle={{
            color: common.uiWhite
          }}
        >
          지금 카멜은 안전결제 수수료 무료!
        </Typography>
      </Flexbox>
      <SafePaymentGuideDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default ProductsSafePaymentBanner;
