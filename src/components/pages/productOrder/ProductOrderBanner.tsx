import { Box, Image } from 'mrcamel-ui';

function ProductOrderBanner() {
  return (
    <Box
      customStyle={{
        backgroundColor: '#528BFF'
      }}
    >
      <Image
        height={104}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/banners/safe-payment-banner.png`}
        alt="Banner Img"
        disableAspectRatio
      />
    </Box>
  );
}

export default ProductOrderBanner;
