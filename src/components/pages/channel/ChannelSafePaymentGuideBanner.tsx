import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function ChannelSafePaymentGuideBanner() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const router = useRouter();

  return (
    <Flexbox
      gap={8}
      alignment="center"
      justifyContent="space-between"
      onClick={() => {
        logEvent(attrKeys.productOrder.CLICK_CAMEL_GUIDE, {
          name: attrProperty.name.CHANNEL_DETAIL,
          title: attrProperty.title.ORDER
        });
        router.push('/products/purchasingInfo');
      }}
      customStyle={{
        padding: '12px 20px',
        backgroundColor: common.bg02
      }}
    >
      <Flexbox gap={8} alignment="flex-start">
        <Icon name="BangCircleFilled" width={16} height={16} color="primary-light" />
        <Flexbox direction="vertical" gap={2}>
          <Typography
            variant="body2"
            weight="medium"
            customStyle={{
              '& > span': {
                color: primary.light
              }
            }}
          >
            <span>안전결제</span>로 사기걱정 없이 거래하세요!
          </Typography>
          <Typography variant="body3" weight="medium" color="ui60">
            시세보다 낮은가격으로 계좌결제 유도하는 사기 급증
          </Typography>
        </Flexbox>
      </Flexbox>
      <Icon name="Arrow2RightOutlined" width={16} height={16} color="ui60" />
    </Flexbox>
  );
}

export default ChannelSafePaymentGuideBanner;
