import { Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

function ChannelCamelAuthFixBanner({ type }: { type?: 'external' | 'operator' }) {
  const {
    theme: {
      palette: { primary, secondary }
    }
  } = useTheme();

  if (type === 'operator') {
    return (
      <Flexbox
        alignment="flex-start"
        gap={6}
        customStyle={{ background: secondary.blue.bgLight, padding: '12px 14px' }}
      >
        <Icon name="TimeFilled" size="small" color="primary" />
        <Box>
          <Typography variant="body2" weight="medium">
            구매대행 서비스는{' '}
            <span style={{ color: primary.main }}>평일 07:00 ~ 18:00까지 운영</span>됩니다.
          </Typography>
          <Typography variant="small2" weight="medium" customStyle={{ marginTop: 2 }}>
            운영시간이 되면 순차적으로 최대한 빠르게 답변드리겠습니다.
          </Typography>
        </Box>
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
