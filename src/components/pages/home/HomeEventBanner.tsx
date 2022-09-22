import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image, Skeleton } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

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

  const [type, setType] = useState('');

  const handleClick = () => {
    logEvent(attrKeys.myPortfolio.CLICK_MYPORTFOLIO_BANNER, {
      name: attrProperty.productName.MAIN
    });
    router.push('/myPortfolio');
  };

  useEffect(() => {
    if (isSuccess || (!isSuccess && !accessUser)) {
      setType('myPortfolio');
    }
  }, [accessUser, isSuccess]);

  return (
    <>
      {!type && <Skeleton width="100%" height="84px" disableAspectRatio />}
      {type === 'myPortfolio' && (
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
      )}
    </>
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

export default HomeEventBanner;
