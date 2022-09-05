import { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image, Skeleton } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchContentsProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeEventBanner() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();
  const { data: isSuccess } = useQueryUserInfo();
  const {
    data: { contents: { imageMainBanner = '', url = '/' } = {} } = {},
    isSuccess: isSuccessContentsProducts
  } = useQuery(queryKeys.common.contentsProducts(0), () => fetchContentsProducts(0));

  const [type, setType] = useState('');

  const handleClick = () => {
    if (type === 'myPortfolio') {
      logEvent(attrKeys.myPortfolio.CLICK_MYPORTFOLIO_BANNER, {
        name: attrProperty.productName.MAIN
      });
      router.push('/myPortfolio');
    } else {
      logEvent(attrKeys.crazycuration.clickCrazyWeek, {
        name: attrProperty.name.main,
        title: attrProperty.title.banner
      });
      router.push(url);
    }
  };

  useEffect(() => {
    if (
      (isSuccess && isSuccessContentsProducts) ||
      (!isSuccess && !accessUser && isSuccessContentsProducts)
    ) {
      let newType = Math.random() < 0.5 ? 'myPortfolio' : 'crazyCuration';

      if (newType === 'crazyCuration' && !imageMainBanner) {
        newType = 'myPortfolio';
      }

      setType(newType);
    }
  }, [accessUser, isSuccess, isSuccessContentsProducts, imageMainBanner]);

  if (type === 'crazyCuration') {
    return (
      <Image
        width="100%"
        src={imageMainBanner}
        alt="Event Banner Img"
        onClick={handleClick}
        disableAspectRatio
      />
    );
  }

  if (type === 'myPortfolio') {
    return (
      <MyPortfolioBanner onClick={handleClick} alignment="center" justifyContent="center">
        <Flexbox gap={1} direction="vertical">
          <Typography variant="h4" customStyle={{ color: common.white }}>
            내가 쓰던 명품, 얼마에 팔릴까?
          </Typography>
          <Typography weight="bold" customStyle={{ color: common.white, opacity: 0.7 }}>
            MY PORTFOLIO 사전예약
          </Typography>
        </Flexbox>
        <Flexbox alignment="center">
          <Image
            disableAspectRatio
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/myportfolio/banner_small_shoes.png`}
            alt="나이키 운동화"
            width={120}
          />
        </Flexbox>
      </MyPortfolioBanner>
    );
  }

  return <Skeleton width="100%" height="84px" disableAspectRatio />;
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

export default HomeEventBanner;
