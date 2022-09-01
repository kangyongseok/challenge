import styled from '@emotion/styled';

import LegitGuideParticipantCard from './LegitGuideParticipantCard';

function LegitGuideHandsUp() {
  return (
    <StyledLegitGuideHandsUp>
      <Content>
        <LegitGuideParticipantCard
          avatarSrc={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/participants/lee.png`}
          description="경력 6년 명품감정사"
          subDescription="前 명품 거래액 1위 T사"
          legitCount={1000}
          customStyle={{
            position: 'absolute',
            top: 25,
            right: -50
          }}
        />
        <LegitGuideParticipantCard
          avatarSrc={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/participants/kim.png`}
          description="경력 3년 명품 감정사"
          subDescription="前 L감정원"
          legitCount={100}
          size="small"
          hideShadow
          customStyle={{
            position: 'absolute',
            top: '45%',
            left: -22
          }}
        />
        <LegitGuideParticipantCard
          avatarSrc={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/participants/yoon.png`}
          description="경력 12년 H사 대표"
          subDescription="現 중고명풉 매입 및 거래"
          legitCount={500}
          size="large"
          customStyle={{
            position: 'absolute',
            right: -40,
            bottom: 90
          }}
        />
      </Content>
    </StyledLegitGuideHandsUp>
  );
}

const StyledLegitGuideHandsUp = styled.section`
  width: 100%;
  padding: 0 55px;
  overflow: hidden;
`;

const Content = styled.section`
  position: relative;
  width: 100%;
  max-width: 257px;
  height: 356px;
  margin: 15px auto 0;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url('https://${process.env
    .IMAGE_DOMAIN}/assets/images/legit/legit-guide-hands-up.png');
  z-index: auto;
`;

export default LegitGuideHandsUp;
