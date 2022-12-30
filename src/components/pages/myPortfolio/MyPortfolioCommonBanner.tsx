import { useRouter } from 'next/router';
import { CustomStyle, Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

interface MyPortfolioCommonBannerProps {
  name: string;
  customStyle?: CustomStyle;
}

function MyPortfolioCommonBanner({ name, customStyle }: MyPortfolioCommonBannerProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  return (
    <MyPortfolioBanner
      onClick={() => {
        logEvent(attrKeys.myPortfolio.CLICK_MYPORTFOLIO_BANNER, {
          name
        });
        router.push('/myPortfolio');
      }}
      alignment="center"
      justifyContent="center"
      css={customStyle}
    >
      <Flexbox gap={1} direction="vertical">
        <Typography variant="h4" customStyle={{ color: common.cmnW }}>
          내가 쓰던 명품, 얼마에 팔릴까?
        </Typography>
        <Typography weight="bold" customStyle={{ color: common.cmnW, opacity: 0.7 }}>
          MY PORTFOLIO 사전예약
        </Typography>
      </Flexbox>
      <Flexbox alignment="center">
        <Image
          disableAspectRatio
          disableSkeleton
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/banner_small_shoes.png`}
          alt="나이키 운동화"
          width={120}
        />
      </Flexbox>
    </MyPortfolioBanner>
  );
}

const MyPortfolioBanner = styled(Flexbox)`
  background: linear-gradient(90deg, #1833ff 0%, #5800e5 100%);
  width: 100%;
  height: 84px;
  padding: 19px 0 19px 24px;
  @media (max-width: 345px) {
    h4,
    div {
      font-size: 12px;
    }
    img {
      width: 100px;
    }
  }
`;

export default MyPortfolioCommonBanner;
