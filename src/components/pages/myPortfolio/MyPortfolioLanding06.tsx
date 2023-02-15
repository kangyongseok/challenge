import { Box, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function MyPortfolioLanding06() {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();
  return (
    <Flexbox
      direction="vertical"
      customStyle={{
        textAlign: 'center',
        marginTop: `calc(52px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`,
        height: '100%'
      }}
    >
      <Typography weight="bold" customStyle={{ color: primary.main }}>
        판매하기
      </Typography>
      <Typography variant="h2" weight="bold">
        가장 빨리 팔 수 있는 가격은?
      </Typography>
      <Typography customStyle={{ marginTop: 12 }}>
        내 명품의 적정가부터 판매속도까지 똑똑하게 계산해요.
      </Typography>
      <Box customStyle={{ marginTop: 52 }}>
        <Image
          width="100%"
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/new_frame_06.png`}
          alt="판매하기"
          disableAspectRatio
          disableSkeleton
        />
      </Box>
    </Flexbox>
  );
}

export default MyPortfolioLanding06;
