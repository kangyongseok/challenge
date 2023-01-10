import { useRouter } from 'next/router';
import { Flexbox, ThemeProvider, Typography, useTheme } from 'mrcamel-ui';

import { UserAvatar } from '@components/UI/organisms';
import Header from '@components/UI/molecules/Header';
import { UserShopTabs } from '@components/pages/userShop/index';

import { HEADER_HEIGHT } from '@constants/common';

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
  const router = useRouter();
  const {
    theme: { zIndex }
  } = useTheme();

  return triggered ? (
    <>
      <Header
        hideHeart
        showRight={false}
        isTransparent={!triggered}
        onClickLeft={() => router.replace('/mypage')}
        titleCustomStyle={{ justifyContent: 'start' }}
      >
        <Flexbox alignment="center" gap={8} customStyle={{ marginLeft: -48 }}>
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
      <Header hideHeart isTransparent onClickLeft={() => router.replace('/mypage')} />
    </ThemeProvider>
  );
}

export default UserShopHeader;