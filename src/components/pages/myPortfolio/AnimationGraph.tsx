import { useEffect, useRef, useState } from 'react';

import { Flexbox } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

function AnimationGraph({ activeIndex }: { activeIndex: number }) {
  const [isDot, setIsDot] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsDot(false);
    timeoutRef.current = setTimeout(() => {
      setIsDot(true);
    }, 1700);
    return () => clearTimeout(timeoutRef.current);
  }, [activeIndex]);

  return (
    <StyledWrap justifyContent="center" alignment="center">
      <Graph index={activeIndex} />
      <VerticalLine />
      <Dot isDot={isDot}>
        <GraphDot />
      </Dot>
      <DotLine />
    </StyledWrap>
  );
}

const StyledWrap = styled(Flexbox)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Dot = styled.div<{ isDot: boolean }>`
  position: relative;
  right: 15px;
  top: -54px;
  opacity: ${({ isDot }) => (isDot ? 1 : 0)};
`;

const VerticalLine = styled.div`
  width: 1px;
  height: 160px;
  position: relative;
  right: 5px;
  background: ${({
    theme: {
      palette: { secondary }
    }
  }) => secondary.red.light};
  opacity: 0.4;
`;

const DotLine = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: 1px dashed
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui20};
  position: absolute;
  top: 50%;
  left: 0;
`;

const Path = styled.path`
  stroke-width: 3px;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: dash 4s linear alternate;
  animation-fill-mode: forwards;
  @keyframes dash {
    from {
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
`;

function Graph({ index }: { index: number }) {
  switch (index) {
    case 0:
    case 3:
      return <Graph01 />;
    case 1:
    case 4:
      return <Graph02 />;
    default:
      return <Graph03 />;
  }
}

function Graph01() {
  return (
    <svg
      width="360"
      height="117"
      viewBox="0 0 360 117"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_768_12756)">
        <Path
          d="M6 45C39.9123 45.8196 57.6865 110 93 110C139.315 110 141.521 15 180 15C219.704 15 223.758 62 267 62C307.131 62 330.453 33.8577 354 5"
          stroke="url(#paint0_linear_768_12756)"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_768_12756"
          x="0.5"
          y="0.5"
          width="359"
          height="116"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_768_12756" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_768_12756"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_768_12756"
          x1="354"
          y1="57"
          x2="6"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B20015" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Graph02() {
  return (
    <svg
      width="360"
      height="117"
      viewBox="0 0 360 117"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_768_12761)">
        <Path
          d="M6 55C39.9123 55.8196 44.5 110 93 110C141.5 110 151.147 90.4587 180 65C214 35 223.758 22 267 22C307.131 22 319.5 22 354 5"
          stroke="url(#paint0_linear_768_12761)"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_768_12761"
          x="0.5"
          y="0.499756"
          width="359"
          height="116"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_768_12761" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_768_12761"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_768_12761"
          x1="354"
          y1="57"
          x2="6"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B20015" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Graph03() {
  return (
    <svg
      width="360"
      height="117"
      viewBox="0 0 360 117"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_768_12766)">
        <Path
          d="M6 55C39.9123 55.8196 44.5 20 93 20C141.5 20 141.521 95 180 95C215 95 223.758 42 267 42C307.131 42 334 31.5 354 5"
          stroke="url(#paint0_linear_768_12766)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_768_12766"
          x="0.5"
          y="0.5"
          width="359"
          height="117"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_768_12766" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_768_12766"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_768_12766"
          x1="354"
          y1="57"
          x2="6"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B20015" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GraphDot() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_768_12758)">
        <circle cx="8" cy="7" r="6" fill="#E5001B" />
      </g>
      <defs>
        <filter
          id="filter0_d_768_12758"
          x="0"
          y="0"
          width="16"
          height="16"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_768_12758" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_768_12758"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default AnimationGraph;
