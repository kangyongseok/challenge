import { Box, Flexbox, Icon, ThemeProvider, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { UserAvatar } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';
import { CamelAuthLabel } from '@components/UI/atoms';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';

import { getFormattedActivatedTime } from '@utils/formats';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import UserInfoTabs from './UserInfoTabs';

interface UserInfoHeaderProps {
  triggered: boolean;
  userName: string;
  userImage: string;
  currentTab: string;
  userId: number;
  productCount: string;
  reviewCount: string;
  isCertificationSeller?: boolean;
  dateActivated?: string;
}

function UserInfoHeader({
  triggered,
  userName,
  userImage,
  currentTab,
  userId,
  productCount,
  reviewCount,
  isCertificationSeller,
  dateActivated = ''
}: UserInfoHeaderProps) {
  const {
    theme: {
      palette: { common, primary },
      zIndex
    }
  } = useTheme();

  const getTimeForamt = getFormattedActivatedTime(dateActivated);

  return triggered ? (
    <>
      <Header showRight={false} titleCustomStyle={{ justifyContent: 'start' }}>
        <Flexbox
          alignment="center"
          gap={8}
          customStyle={{
            marginLeft: -APP_DOWNLOAD_BANNER_HEIGHT,
            color: common.cmnW,
            overflow: 'hidden',
            width: 'calc(100vw - 88px)'
          }}
        >
          <UserAvatar
            src={userImage}
            width={32}
            height={32}
            isRound
            iconCustomStyle={{ width: 16, height: 16 }}
          />
          <Flexbox direction="vertical">
            <Flexbox alignment="center" gap={4}>
              <Typography
                weight="bold"
                customStyle={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                {userName}
              </Typography>
              {isCertificationSeller && <CamelAuthLabel />}
            </Flexbox>
            {dateActivated && (
              <Flexbox alignment="center">
                {getTimeForamt.icon === 'time' ? (
                  <Icon
                    name="TimeOutlined"
                    customStyle={{
                      marginRight: 2,
                      height: '14px !important',
                      width: 14,
                      color: getTimeForamt.icon === 'time' ? common.ui60 : primary.light
                    }}
                  />
                ) : (
                  <Box
                    customStyle={{
                      width: 5,
                      height: 5,
                      background: getTimeForamt.icon === 'time' ? common.ui60 : primary.light,
                      borderRadius: '50%',
                      marginRight: 5
                    }}
                  />
                )}
                <Typography
                  variant="body3"
                  customStyle={{
                    color: getTimeForamt.icon === 'time' ? common.ui60 : primary.light
                  }}
                >
                  {getTimeForamt.text}
                </Typography>
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>
      </Header>
      <UserInfoTabs
        value={currentTab}
        userId={userId}
        productCount={productCount}
        reviewCount={reviewCount}
        isCertificationSeller={isCertificationSeller}
        customStyle={{
          position: 'fixed',
          paddingTop: `calc(${
            isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'
          } + ${HEADER_HEIGHT}px)`,
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
