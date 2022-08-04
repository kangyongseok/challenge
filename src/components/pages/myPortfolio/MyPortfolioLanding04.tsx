import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

const cardData = [
  { img: 'Icon01', title: '무료 정품검수', description: '사전예약자 한정 1회 무료' },
  { img: 'Icon02', title: '상세 보고서', description: '누구보다 빨리 받는 내 명품의 보고서' },
  { img: 'Icon03', title: '판매자 권한 부여', description: '카멜에서 상품을 판매해보세요!' }
];

function MyPortfolioLanding04({ isAnimation }: { isAnimation: boolean }) {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <Flexbox customStyle={{ padding: '0 32px', height: '100%' }} direction="vertical">
      <Box customStyle={{ height: 52 }} />
      <AnimationText isAnimation={isAnimation}>
        <Typography weight="bold" variant="h2" customStyle={{ width: 376, margin: '0 auto' }}>
          궁금했던 내 명품의 가치를
        </Typography>
        <Typography weight="bold" variant="h2" customStyle={{ width: 376, margin: '0 auto' }}>
          가장 먼저 알아보세요.
        </Typography>
      </AnimationText>
      <Typography weight="bold" customStyle={{ color: palette.primary.main, marginTop: 12 }}>
        사전예약 혜택을 확인해보세요!
      </Typography>
      <Flexbox
        gap={12}
        direction="vertical"
        customStyle={{ flex: 1 }}
        alignment="center"
        justifyContent="center"
      >
        {cardData.map(({ img, title, description }) => (
          <Card key={`card-${title}`} alignment="center">
            <Image
              width={58}
              height={58}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/icon/${img}.png`}
              alt="product_card"
              disableAspectRatio
            />
            <Box>
              <Typography variant="h4" weight="bold">
                {title}
              </Typography>
              <Typography variant="small1">{description}</Typography>
            </Box>
          </Card>
        ))}
      </Flexbox>
    </Flexbox>
  );
}

const Card = styled(Flexbox)`
  background: ${({ theme: { palette } }) => palette.common.white};
  border-radius: 12px;
  width: 100%;
  height: 80px;
  padding: 0 10px;
`;

const AnimationText = styled.div<{ isAnimation: boolean }>`
  ${({ isAnimation }): CSSObject =>
    isAnimation
      ? {
          animation: 'fadeIn 2s forwards'
        }
      : { display: 'none' }}
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    90% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

export default MyPortfolioLanding04;
