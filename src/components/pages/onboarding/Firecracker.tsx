import { useEffect, useRef } from 'react';

import Lottie from 'lottie-web';
import styled from '@emotion/styled';

import animationData from '@data/profile_lottie.json';

function Firecracker() {
  const animationDom = useRef<HTMLDivElement>(null);
  const container = animationDom.current as HTMLDivElement;

  useEffect(() => {
    Lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData
    });
  }, [container]);

  return <AnimationWrap ref={animationDom} />;
}

const AnimationWrap = styled.div`
  position: absolute;
  top: -50px;
  left: 0;
  width: 100%;
  height: 300px;
  overflow: hidden;
`;

export default Firecracker;
