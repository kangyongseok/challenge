import { Box, Image, useTheme } from 'mrcamel-ui';

import { getImageResizePath } from '@utils/common';

function SettingsTransferIntro() {
  const {
    theme: {
      palette: { secondary }
    }
  } = useTheme();

  return (
    <Box
      component="section"
      customStyle={{
        margin: '0 -20px',
        textAlign: 'center',
        backgroundColor: secondary.blue.bgLight
      }}
    >
      <Image
        height={208}
        src={getImageResizePath({
          imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/my/transfer_main_banner.png`,
          h: 209
        })}
        alt="다른 곳에 있는 내 상품을 카멜에서 바로 판매하세요"
        round={8}
        disableAspectRatio
        customStyle={{
          margin: 'auto'
        }}
      />
    </Box>
  );
}

export default SettingsTransferIntro;
