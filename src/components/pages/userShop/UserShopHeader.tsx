import { Flexbox, ThemeProvider, Typography, useTheme } from 'mrcamel-ui';

import { UserAvatar } from '@components/UI/organisms';
import Header from '@components/UI/molecules/Header';
import { UserShopTabs } from '@components/pages/userShop/index';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

interface UserShopHeaderProps {
  triggered: boolean;
  imageProfile: string;
  nickName: string;
  currentTab: string;
  reviewCount: number;
  sellCount: number;
  soldoutCount: number;
}

function UserShopHeader({
  triggered,
  imageProfile,
  nickName,
  currentTab,
  reviewCount,
  sellCount,
  soldoutCount
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
          paddingTop: `calc(${HEADER_HEIGHT - 2}px + ${
            isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'
          })`,
          width: '100%',
          zIndex: zIndex.header - 1
        }}
      />
    </>
  ) : (
    <ThemeProvider theme="dark">
      <Header isTransparent />
    </ThemeProvider>
  );
}

export default UserShopHeader;
