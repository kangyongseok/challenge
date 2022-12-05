import { useEffect, useState } from 'react';

import { Avatar, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { MyPortfolioCommonBanner } from '@components/pages/myPortfolio';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';

import attrProperty from '@constants/attrProperty';

function MypageWelcome() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [userData, setUserData] = useState<AccessUser>();
  useEffect(() => {
    setUserData(LocalStorage.get('accessUser') as AccessUser);
  }, []);

  return (
    <>
      <Box customStyle={{ margin: '0 -20px' }}>
        <MyPortfolioCommonBanner name={attrProperty.productName.MY} />
      </Box>
      <Flexbox alignment="center" customStyle={{ height: 80 }}>
        <AvatarArea>
          <Avatar
            src={userData?.image}
            customStyle={{ width: 48, height: 48, borderRadius: '50%' }}
          />
          {userData?.snsType === 'kakao' && (
            <KakaoIcon alignment="center" justifyContent="center" />
          )}
          {userData?.snsType === 'facebook' && (
            <FacebookIcon alignment="center" justifyContent="center" />
          )}
          {userData?.snsType === 'apple' && (
            <AppleIcon alignment="center" justifyContent="center" />
          )}
        </AvatarArea>
        <Box customStyle={{ marginLeft: 24 }}>
          <Typography customStyle={{ color: common.ui20 }} variant="body1" weight="medium">
            {userData?.userName || '회원'}님 안녕하세요
          </Typography>
          <Typography customStyle={{ color: common.ui60 }} variant="small1">
            ID: {userData?.userId}
          </Typography>
        </Box>
      </Flexbox>
    </>
  );
}

const AvatarArea = styled.div`
  min-width: 48px;
  position: relative;
  height: 48px;
  background: #eeeeee;
  border-radius: 50%;
`;

const IconBase = styled(Flexbox)`
  content: '';
  position: absolute;
  z-index: 1;
  right: -2px;
  bottom: -2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 rgb(93 93 101 / 30%);
  background-size: 244px;
  background-image: url('https://${process.env.IMAGE_DOMAIN}/assets/images/ico/ico_my_bg.png');
`;

const KakaoIcon = styled(IconBase)`
  background-position: -121px -72px;
`;

const FacebookIcon = styled(IconBase)`
  background-position: -193px -72px;
`;

const AppleIcon = styled(IconBase)`
  background-position: -157px -108px;
`;

export default MypageWelcome;
