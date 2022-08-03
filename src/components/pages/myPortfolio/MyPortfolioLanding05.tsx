import { Box, Typography, useTheme } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

function MyPortfolioLanding05() {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <Box customStyle={{ textAlign: 'center', marginTop: 52 }}>
      <Typography weight="bold" customStyle={{ color: palette.primary.main }}>
        실거래가
      </Typography>
      <Typography variant="h2" weight="bold">
        내 명품 지금 실거래가는?
      </Typography>
      <Typography customStyle={{ marginTop: 12 }}>
        카멜만의 Ai기술로 측정된 실거래가를 알려드려요.
      </Typography>
      <Box customStyle={{ marginTop: 52 }}>
        <Image
          width="100%"
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_05.png`}
          alt="포인트 맵"
          disableAspectRatio
        />
      </Box>
    </Box>
  );
}

export default MyPortfolioLanding05;
