import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

function ChannelCamelAuthFixBanner() {
  const {
    theme: {
      palette: { primary, secondary }
    }
  } = useTheme();
  return (
    <Flexbox
      alignment="center"
      gap={6}
      customStyle={{ background: secondary.blue.bgLight, padding: '12px 14px' }}
    >
      <Icon name="ShieldFilled" size="small" customStyle={{ color: primary.main }} />
      <Typography variant="body2" weight="medium">
        인증판매자로 상품 미발송 및 가품시{' '}
        <span style={{ color: secondary.blue.main }}>카멜이 100% 환불 보상</span>
      </Typography>
    </Flexbox>
  );
}

export default ChannelCamelAuthFixBanner;
