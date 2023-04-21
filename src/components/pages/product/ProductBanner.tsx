import { Box, Image, useTheme } from 'mrcamel-ui';

function ProductBanner({
  handleClick,
  bannerColor,
  src,
  alt
}: {
  handleClick: () => void;
  bannerColor: string;
  src: string;
  alt: string;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <Box
      onClick={handleClick}
      customStyle={{
        margin: '0 -20px',
        borderBottom: `8px solid ${common.bg02}`,
        backgroundColor: bannerColor
      }}
    >
      <Image height={104} src={src} alt={alt} disableAspectRatio />
    </Box>
  );
}

export default ProductBanner;
