import { Flexbox, ThemeProvider, Typography, useTheme } from 'mrcamel-ui';

import { UserAvatar } from '@components/UI/organisms';
import Header from '@components/UI/molecules/Header';
import { UserShopTabs } from '@components/pages/userShop/index';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT } from '@constants/common';

interface UserShopHeaderProps {
  triggered: boolean;
  imageProfile: string;
  nickName: string;
  currentTab: string;
  sellCount: number;
  soldoutCount: number;
  reviewCount: number;
}

function UserShopHeader({
  triggered,
  imageProfile,
  nickName,
  currentTab,
  sellCount,
  soldoutCount,
  reviewCount
}: UserShopHeaderProps) {
  const {
    theme: { zIndex }
  } = useTheme();

  return triggered ? (
    <>
      <Header
        hideHeart
        showRight={false}
        isTransparent={!triggered}
        titleCustomStyle={{ justifyContent: 'start' }}
      >
        <Flexbox
          alignment="center"
          gap={8}
          customStyle={{ marginLeft: -APP_DOWNLOAD_BANNER_HEIGHT }}
        >
          <UserAvatar
            src={imageProfile || ''}
            width={32}
            height={32}
            isRound
            iconCustomStyle={{ width: 16, height: 16 }}
          />
          <Typography variant="h3" weight="bold">
            {nickName}
          </Typography>
        </Flexbox>
      </Header>
      <UserShopTabs
        value={currentTab}
        sellCount={sellCount}
        soldoutCount={soldoutCount}
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

export default UserShopHeader;
