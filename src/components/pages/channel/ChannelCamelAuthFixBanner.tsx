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
      <Icon name="ShieldFilled" size="small" customStyle={{ color: primary.light }} />
      <Typography variant="body2" weight="medium">
        카멜인증판매자입니다. 문제발생 시
        <span style={{ color: secondary.blue.main }}> 카멜이 200% 환불</span>
        해드립니다.
      </Typography>
    </Flexbox>
  );
}

export default ChannelCamelAuthFixBanner;
