import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

function LegitGuideIntro() {
  return (
    <StyledLegitGuideIntro>
      <IntroShoesWrapper>
        <Image
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-intro-shoes.png`}
          alt="Intro Shoes Img"
        />
      </IntroShoesWrapper>
      <IntroBagWrapper>
        <Image
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-intro-bag.png`}
          alt="Intro Bag Img"
        />
      </IntroBagWrapper>
      <Image
        width="246px"
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-real-or-fake.png`}
        alt="Intro Background Img"
        disableAspectRatio
      />
      <IntroTextWrapper>
        <Typography variant="h1" weight="bold">
          명품감정을
          <br />
          쉽고 편하게!
        </Typography>
        <Typography variant="h3" customStyle={{ marginTop: 32 }}>
          가품일까봐 구매가 고민될 때,
          <br />
          구매했는데 정가품이 궁금할 때,
          <br />
          <br />
          카멜에서 사진으로 쉽고 빠르게 감정하세요!
        </Typography>
      </IntroTextWrapper>
      <BackgroundBlur />
    </StyledLegitGuideIntro>
  );
}

const StyledLegitGuideIntro = styled.section`
  position: relative;
  width: 100%;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
`;

const IntroTextWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 40px;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

const IntroShoesWrapper = styled.div`
  position: absolute;
  top: -40px;
  left: 0;
  width: 237px;
  transform: translateX(-80px);
  z-index: 1;

  animation: slideInLeft 1s ease;

  @keyframes slideInLeft {
    0% {
      transform: translateX(-237px);
    }
    100% {
      transform: translateX(-80px);
    }
  }
`;

const IntroBagWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  right: 0;
  width: 177px;
  transform: translateX(80px);
  z-index: 1;

  animation: slideInRight 1s ease;

  @keyframes slideInRight {
    0% {
      transform: translateX(177px);
    }
    100% {
      transform: translateX(80px);
    }
  }
`;

const BackgroundBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(8px);
`;

export default LegitGuideIntro;
