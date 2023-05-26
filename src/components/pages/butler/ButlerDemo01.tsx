import { useEffect, useState } from 'react';

import { Box, Flexbox, Image, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { IOS_SAFE_AREA_BOTTOM, IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function ButlerDemo01({
  onClickNext,
  onClick,
  isSmallHeight
}: {
  isSmallHeight: boolean;
  onClick: () => void;
  onClickNext: () => void;
}) {
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    setInnerHeight(document.body.clientHeight);
  }, []);

  return (
    <StyledWrap>
      <Flexbox
        direction="vertical"
        customStyle={{ padding: '0 32px', marginTop: isSmallHeight ? '-32px' : IOS_SAFE_AREA_TOP }}
      >
        <Box
          customStyle={{
            height: `calc(52px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`
          }}
        />
        <Typography weight="bold" variant="h2" color="cmnW" customStyle={{ textAlign: 'center' }}>
          사고싶은 가방,
          <br />
          찾기 어려우신가요?
        </Typography>
      </Flexbox>
      <Flexbox
        customStyle={{ marginTop: 32 }}
        onClick={onClick}
        alignment="center"
        justifyContent="center"
      >
        <Image
          width={innerHeight < 700 ? '90%' : '100%'}
          height="auto"
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler_demo_01.png`}
          alt="카멜이 조건에 딱 맞는 메물을 안전하게 구매까지 도와드릴게요"
          round={20}
          disableAspectRatio
        />
      </Flexbox>
      <BottomFixComponent>
        <Typography
          variant="body1"
          color="white"
          textAlign="center"
          customStyle={{ marginTop: '20px' }}
          onClick={onClickNext}
        >
          더 알아보기
        </Typography>
        <ScrollNext
          alignment="center"
          justifyContent="center"
          onClick={onClickNext}
          direction="vertical"
        >
          <NextArrowIcon />
          <NextArrowIcon />
          <NextArrowIcon />
        </ScrollNext>
      </BottomFixComponent>
    </StyledWrap>
  );
}

const StyledWrap = styled.div`
  padding: 0 32px;
`;

const ScrollNext = styled(Flexbox)`
  position: absolute;
  bottom: -40px;
  left: 0;
  width: 100%;
  div {
    animation: bounce 1.2s infinite;
    margin-top: -4px;
  }

  div:nth-of-type(3) {
    animation-delay: -0.2s;
  }
  div:nth-of-type(4) {
    animation-delay: -0.4s;
  }
  @keyframes bounce {
    0% {
      opacity: 0;
      transform: rotate(45deg) translateY(-10px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(45deg) translateX(10px);
    }
  }
`;

const BottomFixComponent = styled.div`
  width: 100%;
  padding: 0 32px;
  position: absolute;
  bottom: calc(60px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'});
  left: 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
`;

const NextArrowIcon = styled.div`
  width: 15px;
  height: 15px;
  border-bottom: 3px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  border-right: 3px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  transform: rotate(45deg);
  margin-left: -20px;
`;

export default ButlerDemo01;
