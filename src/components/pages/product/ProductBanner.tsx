import { Box, Image, useTheme } from 'mrcamel-ui';

import { getImageResizePath } from '@utils/common';

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
      <Image
        height={104}
        src={getImageResizePath({
          imagePath: src,
          h: 52
        })}
        alt={alt}
        disableAspectRatio
      />
    </Box>
  );
}

export default ProductBanner;
