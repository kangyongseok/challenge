import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import Image from '@components/UI/atoms/Image';

function MyPortfolioLanding08() {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <Flexbox
      direction="vertical"
      customStyle={{ textAlign: 'center', marginTop: 52, height: '100%' }}
    >
      <Typography weight="bold" customStyle={{ color: palette.primary.main }}>
        판매하기
      </Typography>
      <Typography variant="h2" weight="bold">
        가장 빨리 팔 수 있는 가격은?
      </Typography>
      <Typography customStyle={{ marginTop: 12 }}>
        내 명품의 적정가부터 판매속도까지 똑똑하게 계산해요.
      </Typography>
      <Box customStyle={{ marginTop: 'auto' }}>
        <Image
          width="100%"
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_08.png`}
          alt="판매하기"
          disableAspectRatio
        />
      </Box>
    </Flexbox>
  );
}

export default MyPortfolioLanding08;
