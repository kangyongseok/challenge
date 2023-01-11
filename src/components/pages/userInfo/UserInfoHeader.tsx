import { Flexbox, ThemeProvider, Typography, useTheme } from 'mrcamel-ui';

import { UserAvatar } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT } from '@constants/common';

import UserInfoTabs from './UserInfoTabs';

interface UserInfoHeaderProps {
  triggered: boolean;
  userName: string;
  userImage: string;
  currentTab: string;
  userId: number;
  productCount: string;
  reviewCount: string;
}

function UserInfoHeader({
  triggered,
  userName,
  userImage,
  currentTab,
  userId,
  productCount,
  reviewCount
}: UserInfoHeaderProps) {
  const {
    theme: { zIndex }
  } = useTheme();

  return triggered ? (
    <>
      <Header showRight={false} titleCustomStyle={{ justifyContent: 'start' }}>
        <Flexbox
          alignment="center"
          gap={8}
          customStyle={{ marginLeft: -APP_DOWNLOAD_BANNER_HEIGHT }}
        >
          <UserAvatar
            src={userImage}
            width={32}
            height={32}
            isRound
            iconCustomStyle={{ width: 16, height: 16 }}
          />
          <Typography variant="h3" weight="bold">
            {userName}
          </Typography>
        </Flexbox>
      </Header>
      <UserInfoTabs
        value={currentTab}
        userId={userId}
        productCount={productCount}
        reviewCount={reviewCount}
        customStyle={{
          position: 'fixed',
          paddingTop: HEADER_HEIGHT - 2,
          width: '100%',
          zIndex: zIndex.header
        }}
      />
    </>
  ) : (
    <ThemeProvider theme="dark">
      <Header hideHeart isTransparent />
    </ThemeProvider>
  );
}

export default UserInfoHeader;
