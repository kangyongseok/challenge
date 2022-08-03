import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

function MyPortfolioLanding03({
  isSmallHeight,
  currentSection,
  isHidden
}: {
  isSmallHeight: boolean;
  currentSection: number;
  isHidden: boolean;
}) {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <StyledWrap isAnimation={currentSection > 2}>
      <Box customStyle={{ height: isHidden ? 120 : 52 }} />
      <Typography
        weight="bold"
        variant="h2"
        customStyle={{ width: 400, margin: '0 auto', display: isHidden ? 'none' : 'block' }}
      >
        궁금했던 내 명품의 가치를
      </Typography>
      <Typography
        weight="bold"
        variant="h2"
        customStyle={{ width: 400, margin: '0 auto', display: isHidden ? 'none' : 'block' }}
      >
        가장 먼저 알아보세요.
      </Typography>
      <Box>
        <Typography weight="bold" customStyle={{ color: palette.primary.main, marginTop: 12 }}>
          MY PORTFOLIO 사전예약을 신청해보세요.
        </Typography>
        <Flexbox direction="vertical" gap={12} customStyle={{ marginTop: isSmallHeight ? 10 : 52 }}>
          <Image
            width="100%"
            height="auto"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/price_card_img.png`}
            alt="price_card"
            disableAspectRatio
          />
          <Image
            width="100%"
            height="auto"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/product_card_img.png`}
            alt="product_card"
            disableAspectRatio
          />
        </Flexbox>
      </Box>
    </StyledWrap>
  );
}

const StyledWrap = styled.div<{ isAnimation: boolean }>`
  padding: 0 20px;
  ${({ isAnimation }): CSSObject =>
    isAnimation
      ? {
          animation: 'fadeOut 1s forwards'
        }
      : {}};

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    5% {
      opacity: 0;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

export default MyPortfolioLanding03;
