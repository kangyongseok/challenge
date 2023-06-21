import { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

// import { SafePaymentGuideDialog } from '@components/UI/organisms';
import { Gap } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { closeSafePaymentBannerState } from '@recoil/productsFilter';

function ProductsSafePaymentBanner() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [closeSafePayment, setCloseSafePaymentBannerState] = useRecoilState(
    closeSafePaymentBannerState
  );

  // const [open, setOpen] = useState(false);
  const [close, setClose] = useState(true);

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_LIST,
      title: attrProperty.title.ORDER
    });

    // setOpen((prevState) => !prevState);
  };

  useEffect(() => {
    setClose(closeSafePayment);
  }, [closeSafePayment]);

  if (close) return <Gap height={8} />;

  return (
    <>
      <Gap height={8} />
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        gap={4}
        onClick={handleClick}
        customStyle={{
          padding: '12px 20px',
          textAlign: 'center',
          backgroundColor: common.ui20
        }}
      >
        <Flexbox alignment="center" gap={4}>
          <Icon name="WonCircleFilled" width={20} height={20} color={common.uiWhite} />
          <Typography weight="medium" color="uiWhite">
            지금 카멜은 안전결제 수수료 무료!
          </Typography>
          <Typography color="ui80" customStyle={{ marginLeft: 4, textDecoration: 'underline' }}>
            자세히보기
          </Typography>
        </Flexbox>
        <Icon
          name="CloseOutlined"
          width={20}
          height={20}
          color="uiWhite"
          onClick={() => setCloseSafePaymentBannerState(true)}
        />
      </Flexbox>
      <Gap height={8} />
      {/* <SafePaymentGuideDialog open={open} onClose={() => setOpen(false)} /> */}
    </>
  );
}

export default ProductsSafePaymentBanner;
