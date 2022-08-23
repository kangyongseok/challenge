import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { Button, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image, ProductLegitLabel } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface LegitTrialCardProps extends HTMLAttributes<HTMLDivElement> {
  result: 0 | 1 | 2 | 3;
  imageSrc: string;
  brandName: string;
  tutorialName: string;
}

function LegitTrialCard({
  result,
  imageSrc,
  brandName,
  tutorialName,
  ...props
}: LegitTrialCardProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const resultText = useMemo(() => {
    if (result === 1) {
      return '<strong>정품의견</strong>이<br /> 더 우세해요!';
    }
    if (result === 2) {
      return '<strong>가품의심의견</strong>이<br />있어요!';
    }
    return '<strong>실물감정</strong>을<br />추천해요';
  }, [result]);

  const handleClick = () => {
    let att = '감정불가';

    if (result === 1) att = '정품의견';
    if (result === 2) att = '가품의심';

    logEvent(attrKeys.legit.CLICK_LEGITCARD, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.LEGIT_VIDEO,
      att
    });
    router.push(`/legit/tutorial/${tutorialName}`);
  };

  return (
    <StyledLegitTrialCard {...props}>
      {result === 1 && (
        <ProductLegitLabel
          text="정품의견"
          customStyle={{
            position: 'absolute',
            top: 22,
            left: 22,
            zIndex: 1
          }}
        />
      )}
      {result === 2 && (
        <ProductLegitLabel
          variant="fake"
          text="가품의심"
          customStyle={{
            position: 'absolute',
            top: 22,
            left: 22,
            zIndex: 1
          }}
        />
      )}
      {result !== 1 && result !== 2 && (
        <ProductLegitLabel
          variant="impossible"
          text="감정불가"
          customStyle={{
            position: 'absolute',
            top: 22,
            left: 22,
            zIndex: 1
          }}
        />
      )}
      <Image
        width={80}
        height={80}
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${brandName}.png`}
        alt="Brand Logo Img"
        disableAspectRatio
        customStyle={{
          position: 'absolute',
          top: 12,
          right: 22,
          zIndex: 1
        }}
      />
      <TrialCardImg src={imageSrc} alt="TrialCard Img" />
      <Description tutorialName={tutorialName}>
        {/* TODO 추후 UI 라이브러리 업데이트 시 수정 필요 */}
        <Typography
          customStyle={{ color: common.white }}
          dangerouslySetInnerHTML={{ __html: resultText }}
        />
        <Button
          variant="contained"
          brandColor="black"
          size="medium"
          startIcon={<ArrowIcon />}
          onClick={handleClick}
          customStyle={{
            minWidth: 117
          }}
        >
          체험해 보기
        </Button>
      </Description>
      <BackgroundBlur />
    </StyledLegitTrialCard>
  );
}
const StyledLegitTrialCard = styled.div`
  position: relative;
  padding: 10px;
  width: 100%;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['16']};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
`;

const TrialCardImg = styled.img`
  width: 100%;
`;

const Description = styled.div<Pick<LegitTrialCardProps, 'tutorialName'>>`
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 20px);
  height: 72px;
  padding: 16px 12px 20px;
  border-radius: 0 0 8px 8px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url('https://${process.env
    .IMAGE_DOMAIN}/assets/images/legit/backdrop-filter-${({ tutorialName }) => tutorialName}.png');
`;

const BackgroundBlur = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  width: calc(100% - 20px);
  height: 100px;
  background: linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 8px 8px 0 0;
`;

// TODO UI 라이브러리 업데이트 시 수정 필요
function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.66675 14.1663V5.83301L14.1667 9.99967L6.66675 14.1663Z" fill="white" />
    </svg>
  );
}

export default LegitTrialCard;
