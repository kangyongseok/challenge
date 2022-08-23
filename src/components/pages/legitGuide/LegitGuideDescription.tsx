import { Box, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import LegitIntro from '../legit/LegitLivePanel/LegitIntro';

function LegitGuideDescription() {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();
  return (
    <StyledLegitGuideDescription>
      <Box customStyle={{ padding: '0 20px' }}>
        <LegitIntro forceRender />
      </Box>
      <Box customStyle={{ marginTop: 58, fontSize: 36 }}>☝️</Box>
      <Typography variant="h2" weight="bold" customStyle={{ marginTop: 8 }}>
        사진 올릴 필요 없어요!
      </Typography>
      <Typography variant="h2">사고싶은 매물에서 바로 신청</Typography>
      <Box customStyle={{ position: 'relative', maxWidth: 285, margin: '10px auto 0' }}>
        <Image
          variant="backgroundImage"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-my-guide.png`}
          alt="Legit Guide Img"
          customStyle={{
            position: 'relative',
            paddingTop: '125%'
          }}
        >
          <Box
            customStyle={{
              position: 'absolute',
              left: '50%',
              bottom: -3,
              fontSize: 40,
              transform: 'translateX(-50%) rotate(40deg)'
            }}
          >
            👈
          </Box>
        </Image>
      </Box>
      <Typography customStyle={{ marginTop: 10 }}>궁금한 매물의 상세화면에서</Typography>
      <Typography customStyle={{ '& > strong': { color: primary.main } }}>
        <strong>실시간 사진감정</strong>을 누르면
      </Typography>
      <Typography>판매중인 사진을 기반으로 사진감정이 시작돼요!</Typography>
      <Box customStyle={{ marginTop: 64, fontSize: 36 }}>✌️</Box>
      <Typography variant="h2" weight="bold" customStyle={{ marginTop: 8 }}>
        1시간 이내로
      </Typography>
      <Typography variant="h2">다수의 전문가가 감정의견!</Typography>
      <Box customStyle={{ maxWidth: 285, margin: '10px auto 0' }}>
        <Image
          variant="backgroundImage"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-guide-result.png`}
          alt="Legit Guide Img"
          customStyle={{ backgroundPosition: '0 -35px' }}
        />
      </Box>
      <Typography customStyle={{ marginTop: 30, '& > strong': { color: primary.main } }}>
        1시간 이내로 <strong>전국에 흩어져있는 명품 전문가</strong>들이
      </Typography>
      <Typography>감정의견을 보내줘요.</Typography>
      <Typography>앱 알림으로 알려드릴게요 :)</Typography>
    </StyledLegitGuideDescription>
  );
}

const StyledLegitGuideDescription = styled.section`
  margin: -40px 0 0;
  padding: 56px 0 64px;
  text-align: center;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  box-shadow: 0px -8px 20px rgba(0, 0, 0, 0.05);
  border-radius: 24px 24px 0 0;
  overflow: hidden;
`;

export default LegitGuideDescription;
