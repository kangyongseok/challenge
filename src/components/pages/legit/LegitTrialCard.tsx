import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { Button, Icon, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LegitLabel } from '@components/UI/atoms';

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
        <LegitLabel
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
        <LegitLabel
          opinion="fake"
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
        <LegitLabel
          opinion="impossible"
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
        <Typography
          customStyle={{ color: common.cmnW }}
          dangerouslySetInnerHTML={{ __html: resultText }}
        />
        <Button
          variant="solid"
          brandColor="black"
          size="medium"
          startIcon={<Icon name="Arrow3RightFilled" />}
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
      mode,
      palette: { common }
    }
  }) => (mode === 'light' ? common.uiWhite : common.line01)};
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

export default LegitTrialCard;
