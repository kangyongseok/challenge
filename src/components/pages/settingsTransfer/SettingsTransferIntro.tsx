import { Box, Image, Typography, useTheme } from 'mrcamel-ui';

function SettingsTransferIntro() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <Box
      component="section"
      customStyle={{
        margin: '0 -20px',
        padding: '11px 20px 32px',
        textAlign: 'center',
        backgroundColor: common.bg03
      }}
    >
      <Image
        width={136}
        height={146}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/transfer-main.png`}
        alt="Banner Img"
        round={8}
        disableAspectRatio
        customStyle={{
          margin: 'auto'
        }}
      />
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          marginTop: 32
        }}
      >
        내 상품 가져오기란,
      </Typography>
      <Typography
        customStyle={{
          marginTop: 4
        }}
      >
        다른 플랫폼에 업로드 한 내 상품을 간편하게
        <br />
        카멜 내 상점으로 가져와 판매할 수 있어요!
      </Typography>
    </Box>
  );
}

export default SettingsTransferIntro;
