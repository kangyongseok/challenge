import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import type { IconName } from 'mrcamel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';
import { Badge, Gap } from '@components/UI/atoms';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MypageProfile() {
  const router = useRouter();
  const {
    theme: {
      palette: { common, secondary, primary }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();
  const { data: myUserInfo } = useQueryMyUserInfo();
  const { userImageProfile, nickName } = useMemo(() => {
    const imageProfile = myUserInfo?.info?.value?.imageProfile;
    const image = myUserInfo?.info?.value?.image;

    return {
      userImageProfile:
        (!imageProfile?.split('/').includes('0.png') && imageProfile) ||
        (image?.split('/').includes('0.png') && image) ||
        '',
      nickName:
        myUserInfo?.info?.value?.nickName ||
        myUserInfo?.info?.value?.name ||
        `${accessUser?.userId || '회원'}`
    };
  }, [
    accessUser?.userId,
    myUserInfo?.info?.value?.image,
    myUserInfo?.info?.value?.imageProfile,
    myUserInfo?.info?.value?.name,
    myUserInfo?.info?.value?.nickName
  ]);

  const TAB_MENU: {
    iconName: IconName;
    label: string;
    showBadge: boolean;
    url?: string;
    onClick?: () => void;
  }[] = useMemo(
    () => [
      {
        iconName: 'ChatOutlined',
        label: '1:1 문의',
        showBadge: false,
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_ASK, {
            name: attrProperty.name.MY
          });

          ChannelTalk.showMessenger();
        }
      },
      {
        iconName: 'HeartOutlined',
        label: '찜/최근',
        showBadge: false,
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_WISH_LIST, {
            name: attrProperty.name.MY,
            type: attrProperty.type.PROFILE_TAB
          });

          router.push('/wishes');
        }
      },
      {
        iconName: 'ShopOutlined',
        label: '내 상점',
        showBadge: false,
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_MY_STORE, {
            name: attrProperty.name.MY
          });

          router.push('/user/shop');
        }
      },
      {
        iconName: 'BnPortfolioOutlined',
        label: '포트폴리오',
        showBadge: true,
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_MYPORTFOLIO, {
            name: attrProperty.name.MY,
            title: attrProperty.title.PROFILE_TAB
          });

          router.push('/myPortfolio');
        }
      }
    ],
    [router]
  );

  const handleClickEdit = () => {
    logEvent(attrKeys.mypage.CLICK_PROFILE_EDIT, {
      name: attrProperty.name.MY
    });
    if (
      myUserInfo?.roles.includes('PRODUCT_LEGIT') ||
      myUserInfo?.roles.includes('PRODUCT_LEGIT_HEAD')
    ) {
      router.push(`/legit/profile/${accessUser?.userId}/edit`);
    } else {
      router.push('/user/shop/edit');
    }
  };

  return (
    <Flexbox
      component="section"
      direction="vertical"
      justifyContent="center"
      customStyle={{ padding: '32px 20px 20px' }}
    >
      <Flexbox gap={20} alignment="center">
        <Box customStyle={{ position: 'relative' }}>
          <UserAvatar
            src={userImageProfile}
            width={64}
            height={64}
            iconCustomStyle={{ width: 32, height: 32 }}
          />
          {accessUser?.snsType === 'kakao' && (
            <SnsIconWrap bgColor="#FEE500">
              <Icon name="KakaoFilled" />
            </SnsIconWrap>
          )}
          {accessUser?.snsType === 'facebook' && (
            <SnsIconWrap bgColor="#528BFF">
              <Icon name="BrandFacebookFilled" customStyle={{ color: common.uiWhite }} />
            </SnsIconWrap>
          )}
          {accessUser?.snsType === 'apple' && (
            <SnsIconWrap bgColor="#313438">
              <Icon name="AppleFilled" customStyle={{ color: common.uiWhite }} />
            </SnsIconWrap>
          )}
        </Box>
        <Flexbox
          direction="vertical"
          justifyContent="center"
          gap={4}
          customStyle={{ maxWidth: 'calc(100% - 172px)' }}
        >
          <Flexbox alignment="center" gap={2} customStyle={{ flexWrap: 'wrap' }}>
            <EllipsisText variant="h3" weight="bold">
              {nickName}
            </EllipsisText>
            {myUserInfo?.isCertifiedSeller && <Icon name="SafeFilled" color={primary.light} />}
            {(myUserInfo?.roles.includes('PRODUCT_LEGIT') ||
              myUserInfo?.roles.includes('PRODUCT_LEGIT_HEAD')) && (
              <LegitBedge alignment="center" justifyContent="center" gap={3}>
                <Icon
                  name="LegitFilled"
                  customStyle={{ color: common.uiWhite, width: 10, height: 10 }}
                />
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{ color: common.uiWhite }}
                >
                  감정사
                </Typography>
              </LegitBedge>
            )}
          </Flexbox>
          <Typography variant="body1" customStyle={{ color: common.ui60 }}>
            ID: {accessUser?.userId}
          </Typography>
        </Flexbox>
        <Button
          startIcon={<Icon name="EditOutlined" />}
          customStyle={{ borderRadius: 22, minWidth: 68, marginLeft: 'auto' }}
          onClick={handleClickEdit}
        >
          수정
        </Button>
      </Flexbox>
      <Gap height={1} customStyle={{ margin: '20px 0' }} />
      <Flexbox>
        {TAB_MENU.map(({ iconName, label, showBadge, url, onClick }) => (
          <Flexbox
            key={`mypage-tab-menu-${label}`}
            direction="vertical"
            justifyContent="center"
            alignment="center"
            customStyle={{ width: '100%', height: 60, cursor: 'pointer' }}
            onClick={onClick || (() => router.push(url || ''))}
          >
            <Flexbox alignment="center" customStyle={{ height: '100%', position: 'relative' }}>
              <Icon name={iconName} customStyle={{ width: 24, height: 24 }} />
              {showBadge && (
                <Badge
                  open
                  type="alone"
                  width={44}
                  height={16}
                  customStyle={{
                    position: 'absolute',
                    top: 2,
                    left: 10,
                    backgroundColor: secondary.purple.main
                  }}
                >
                  <Typography variant="small2" weight="medium" customStyle={{ color: common.cmnW }}>
                    오픈알림
                  </Typography>
                </Badge>
              )}
            </Flexbox>
            <Typography customStyle={{ whiteSpace: 'pre' }}>{label}</Typography>
          </Flexbox>
        ))}
      </Flexbox>
    </Flexbox>
  );
}

export const EllipsisText = styled(Typography)`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const SnsIconWrap = styled.div<{ bgColor: string }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: ${({ bgColor }) => bgColor};
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 4px;
  svg {
    width: 100%;
    height: 100%;
  }
`;

const LegitBedge = styled(Flexbox)`
  background: ${({ theme: { palette } }) => palette.common.uiBlack};
  padding: 4px 7px;
  border-radius: 10px;
  min-width: 55px;
`;

export default MypageProfile;
