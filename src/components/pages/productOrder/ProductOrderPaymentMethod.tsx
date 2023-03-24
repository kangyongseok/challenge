import { Box, Flexbox, RadioGroup, Typography, useTheme } from 'mrcamel-ui';

function ProductOrderPaymentMethod() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 20px'
      }}
    >
      <Typography variant="h3" weight="bold">
        결제방법
      </Typography>
      <Flexbox
        direction="vertical"
        gap={32}
        customStyle={{
          marginTop: 32
        }}
      >
        <RadioGroup text="무통장입금" size="large" checked />
        <RadioGroup
          text="카드"
          size="large"
          customStyle={{
            color: common.ui80
          }}
        />
        <Typography
          variant="body2"
          customStyle={{
            marginTop: -20,
            paddingLeft: 28,
            color: common.ui60
          }}
        >
          카드결제가 곧 업데이트 될 예정이에요.
        </Typography>
      </Flexbox>
    </Box>
  );
}

export default ProductOrderPaymentMethod;
