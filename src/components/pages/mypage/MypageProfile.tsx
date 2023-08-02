import { useMemo } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import type { IconName } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';
import { CamelAuthLabel, Gap } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { mypageOrdersIsConfirmedState } from '@recoil/mypageOrders';
import { legitFilterGridParamsState } from '@recoil/legit';
import useMyProfileInfo from '@hooks/userMyProfileInfo';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function MypageProfile() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const resetLegitFilterGridParamsState = useResetRecoilState(legitFilterGridParamsState);
  const resetIsConfirmedState = useResetRecoilState(mypageOrdersIsConfirmedState);
  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);

  const { profileImage, snsType, isCertifiedSeller, isLegit, userId, nickName } =
    useMyProfileInfo();
  const { data: { roles = [] } = {} } = useQueryUserInfo();

  const TAB_MENU: {
    iconName: IconName;
    label: string;
    showBadge: boolean;
    url?: string;
    onClick?: () => void;
  }[] = useMemo(
    () => [
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
        iconName: 'LegitOutlined',
        label: '사진감정',
        showBadge: false,
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_LEGIT_MAIN, {
            name: attrProperty.name.MY
          });

          resetLegitFilterGridParamsState();

          queryClient
            .getQueryCache()
            .getAll()
            .forEach(({ queryKey }) => {
              if (queryKey.includes('productLegits') && queryKey.length >= 3) {
                queryClient.resetQueries(queryKey);
              }
            });

          const hasLegitRole = (roles as string[]).some(
            (role) => role.indexOf('PRODUCT_LEGIT') >= 0
          );

          if (hasLegitRole) {
            router.push('/legit/admin');
          } else {
            router.push('/legit');
          }
        }
      },
      {
        iconName: 'BoxDownOutlined',
        label: '상품가져오기',
        showBadge: false,
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_TRANSFER, {
            name: attrProperty.name.MY
          });

          resetPlatformsState();
          resetDataState();

          router.push('/mypage/settings/transfer');
        }
      },
      {
        iconName: 'FileOutlined',
        label: '거래내역',
        showBadge: false,
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_ORDER_LIST, {
            name: attrProperty.name.MY
          });

          resetIsConfirmedState();
          router.push('/mypage/orders');
        }
      }
    ],
    [
      queryClient,
      resetDataState,
      resetIsConfirmedState,
      resetLegitFilterGridParamsState,
      resetPlatformsState,
      roles,
      router
    ]
  );

  const handleClickEdit = () => {
    logEvent(attrKeys.mypage.CLICK_PROFILE_EDIT, {
      name: attrProperty.name.MY
    });
    if (isLegit) {
      router.push(`/legit/profile/${userId}/edit`);
    } else {
      router.push('/user/shop/edit');
    }
  };

  return (
    <Flexbox
      component="section"
      direction="vertical"
      justifyContent="center"
      customStyle={{
        padding: 20
      }}
    >
      <Flexbox gap={16} alignment="center">
        <Box customStyle={{ position: 'relative' }}>
          <UserAvatar
            src={profileImage || ''}
            width={60}
            height={60}
            iconCustomStyle={{ width: 32, height: 32 }}
          />
          {snsType === 'kakao' && (
            <SnsIconWrap bgColor="#FEE500">
              <Icon name="KakaoFilled" />
            </SnsIconWrap>
          )}
          {snsType === 'facebook' && (
            <SnsIconWrap bgColor="#528BFF">
              <Icon name="BrandFacebookFilled" color="uiWhite" />
            </SnsIconWrap>
          )}
          {snsType === 'apple' && (
            <SnsIconWrap bgColor="#313438">
              <Icon name="AppleFilled" color="uiWhite" />
            </SnsIconWrap>
          )}
        </Box>
        <Flexbox
          direction="vertical"
          justifyContent="center"
          gap={4}
          customStyle={{ maxWidth: 'calc(100% - 172px)' }}
        >
          <Flexbox alignment="center" gap={4} customStyle={{ flexWrap: 'nowrap' }}>
            <EllipsisText variant="h3" weight="bold">
              {nickName}
            </EllipsisText>
            {isCertifiedSeller && !isLegit && <CamelAuthLabel />}
            {isLegit && (
              <LegitBedge alignment="center" justifyContent="center" gap={3}>
                <Icon name="LegitFilled" width={10} height={10} color="uiWhite" />
                <Typography variant="small2" weight="medium" color="uiWhite">
                  감정사
                </Typography>
              </LegitBedge>
            )}
          </Flexbox>
          <Typography variant="body2" color="ui60">
            ID: {userId}
          </Typography>
        </Flexbox>
        <Button
          variant="ghost"
          brandColor="black"
          customStyle={{ marginLeft: 'auto' }}
          onClick={handleClickEdit}
        >
          수정하기
        </Button>
      </Flexbox>
      <Gap height={1} customStyle={{ margin: '32px 0 20px' }} />
      <Flexbox>
        {TAB_MENU.map(({ iconName, label, url, onClick }) => (
          <Flexbox
            key={`mypage-tab-menu-${label}`}
            direction="vertical"
            justifyContent="center"
            alignment="center"
            gap={4}
            customStyle={{ width: '100%', height: 48, cursor: 'pointer' }}
            onClick={onClick || (() => router.push(url || ''))}
          >
            <Flexbox alignment="center" customStyle={{ position: 'relative' }}>
              <Icon name={iconName} width={28} />
            </Flexbox>
            <Typography variant="body2" customStyle={{ whiteSpace: 'pre' }}>
              {label}
            </Typography>
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
`;

export default MypageProfile;
