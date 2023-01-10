import { Box, Image, Typography, useTheme } from 'mrcamel-ui';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

function MyPortfolioLanding03() {
  const {
    theme: { palette }
  } = useTheme();
  const { data: userInfo } = useQueryUserInfo();

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
        {userInfo?.info?.value?.gender === 'F' ? (
          <Image
            width="100%"
            height="auto"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_05_F.png`}
            alt="여성 샤넬 클래식 미디움 플립백 가격 그래프 이미지"
            disableAspectRatio
            disableSkeleton
          />
        ) : (
          <Image
            width="100%"
            height="auto"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/frame_05_M.png`}
            alt="남성 조던 1 레트로 하이 OG 블랙 모카 가격 그래프 이미지"
            disableAspectRatio
            disableSkeleton
          />
        )}
      </Box>
    </Box>
  );
}

export default MyPortfolioLanding03;
