import { Box, Typography, useTheme } from '@mrcamelhub/camel-ui';

function ChannelOfferRequestTipMessage() {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();

  return (
    <Box
      customStyle={{
        padding: 12,
        margin: '20px 0',
        backgroundColor: primary.bgLight,
        borderRadius: 8,
        textAlign: 'center'
      }}
    >
      <Typography
        variant="body2"
        customStyle={{
          color: primary.light
        }}
      >
        <strong>가격제안 성공 TIP</strong>
        <br />
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        "바로 결제 가능해요" 등 제안 이유를 말해보세요.
      </Typography>
    </Box>
  );
}

export default ChannelOfferRequestTipMessage;
