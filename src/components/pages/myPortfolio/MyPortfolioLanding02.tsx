import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

function MyPortfolioLanding02({ isSmallHeight }: { isSmallHeight: boolean }) {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <StyledWrap>
      <Box customStyle={{ height: 52 }} />
      <Typography weight="bold" variant="h2" customStyle={{ width: 376, margin: '0 auto' }}>
        내 옷장 명품들이
      </Typography>
      <Typography weight="bold" variant="h2" customStyle={{ width: 376, margin: '0 auto' }}>
        1,000만원이 넘는다고요?
      </Typography>
      <Box>
        <Typography weight="bold" customStyle={{ color: palette.primary.main, marginTop: 12 }}>
          MY PORTFOLIO로 시세를 확인해보세요!
        </Typography>
        <Flexbox direction="vertical" gap={12} customStyle={{ marginTop: isSmallHeight ? 10 : 52 }}>
          <Image
            width="100%"
            height="auto"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/new_price_card_img.png`}
            alt="price_card"
            disableAspectRatio
            customStyle={{
              borderRadius: 20,
              filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
            }}
          />
          <Image
            width="100%"
            height="auto"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/new_product_card_img.jpg`}
            alt="product_card"
            disableAspectRatio
            customStyle={{
              borderRadius: 20,
              filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))'
            }}
          />
        </Flexbox>
      </Box>
    </StyledWrap>
  );
}

const StyledWrap = styled.div`
  padding: 0 32px;
`;

export default MyPortfolioLanding02;
