import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function ChannelCamelAuthFixBanner({
  type,
  platformName
}: {
  type?: 'external' | 'operator';
  platformName?: string;
}) {
  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();

  const router = useRouter();

  if (type === 'operator') {
    return (
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        gap={6}
        customStyle={{ background: common.bg02, padding: '12px 20px' }}
        onClick={() => {
          logEvent(attrKeys.productOrder.CLICK_CAMEL_GUIDE, {
            name: attrProperty.name.CHANNEL_DETAIL,
            title: attrProperty.title.OPERATOR
          });
          router.push('/guide/operator');
        }}
      >
        <Flexbox gap={6} alignment="flex-start">
          <Icon name="BoxFilled" size="small" color="primary" />
          <Box>
            <Typography variant="body2" weight="medium">
              <span style={{ color: primary.main }}>카멜 구매대행</span>으로 쉽고 안전하게
              거래해보세요!
            </Typography>
            <Typography
              variant="small2"
              weight="medium"
              customStyle={{ marginTop: 2 }}
              color="ui60"
            >
              {platformName} 매물도 정품검수로 사기 없이 안전거래
            </Typography>
          </Box>
        </Flexbox>
        <Icon name="Arrow2RightOutlined" width={16} />
      </Flexbox>
    );
  }

  if (type === 'external') {
    return (
      <Flexbox
        alignment="flex-start"
        gap={6}
        customStyle={{ background: secondary.blue.bgLight, padding: '12px 14px' }}
      >
        <Box>
          <Typography variant="body2" weight="medium">
            <span style={{ color: secondary.blue.main }}>카멜을 통해 타 플랫폼 판매자와 연결</span>
            되었습니다. 편하게 문의하세요!
          </Typography>
        </Box>
      </Flexbox>
    );
  }

  return (
    <Flexbox
      alignment="center"
      gap={6}
      customStyle={{ background: secondary.blue.bgLight, padding: '12px 14px' }}
    >
      <Icon name="ShieldFilled" size="small" color="primary-light" />
      <Typography variant="body2" weight="medium">
        카멜인증판매자입니다. 문제발생 시
        <span style={{ color: secondary.blue.main }}> 카멜이 200% 환불</span>
        해드립니다.
      </Typography>
    </Flexbox>
  );
}

export default ChannelCamelAuthFixBanner;
