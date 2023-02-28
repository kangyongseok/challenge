import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, Skeleton, ThemeProvider, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import { logEvent } from '@library/amplitude';

import { HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { executedShareURl, isExtendedLayoutIOSVersion } from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface UserShopLegitProfileProps {
  isLoading?: boolean;
  title: string;
  description: string;
  curnScore: number;
  maxScore: number;
  areaName?: string;
  shopDescription: string;
}

function UserShopLegitProfile({
  isLoading = false,
  title,
  description,
  curnScore,
  maxScore,
  areaName,
  shopDescription
}: UserShopLegitProfileProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setDialogState = useSetRecoilState(dialogState);

  const { data: accessUser } = useQueryAccessUser();

  const {
    userNickName: nickName,
    userImageProfile: imageProfile,
    userImageBackground: imageBackground,
    data
  } = useQueryMyUserInfo();

  const handleClickShare = useCallback(() => {
    logEvent(attrKeys.userShop.CLICK_SHARE, {
      name: attrProperty.name.MY_STORE,
      att: 'LEGIT_SELLER'
    });

    const shareData = {
      title,
      description,
      image: imageProfile,
      url: `${typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'}${
        router.asPath
      }`
    };

    if (
      !executedShareURl({
        url: shareData.url,
        title: shareData.title,
        text: shareData.description
      })
    ) {
      setDialogState({ type: 'SNSShare', shareData });
    }
  }, [description, imageProfile, router.asPath, setDialogState, title]);

  const handleClickEdit = useCallback(() => {
    logEvent(attrKeys.userShop.CLICK_PROFILE_EDIT, {
      name: attrProperty.name.MY_STORE,
      att: 'LEGIT_SELLER'
    });

    if (accessUser?.userId) {
      router.push(`/legit/profile/${accessUser.userId}/edit`);
    }
  }, [accessUser?.userId, router]);

  return (
    <Wrapper>
      <BackgroundImage
        src={
          imageBackground ||
          imageProfile ||
          `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background-legit.png`
        }
      >
        <Blur />
      </BackgroundImage>
      <Info>
        {isLoading ? (
          <>
            <Flexbox
              direction="vertical"
              alignment="center"
              gap={12}
              customStyle={{ flex: 1, padding: '0 20px' }}
            >
              <Skeleton width={96} height={96} round={16} disableAspectRatio />
              <Flexbox direction="vertical" alignment="center" gap={4}>
                <Flexbox gap={4}>
                  <Skeleton width={50} height={24} round={8} disableAspectRatio />
                  <Skeleton width={50} height={24} round={12} disableAspectRatio />
                </Flexbox>
                <Skeleton width={84} height={16} round={8} disableAspectRatio />
              </Flexbox>
            </Flexbox>
            <Flexbox alignment="center" gap={8} customStyle={{ padding: '32px 20px 12px' }}>
              <Skeleton minWidth="44px" width={44} height={44} disableAspectRatio round={8} />
              <Skeleton width="100%" height={44} disableAspectRatio round={8} />
            </Flexbox>
          </>
        ) : (
          <>
            <Flexbox
              direction="vertical"
              alignment="center"
              gap={12}
              customStyle={{ flex: 1, padding: '0 20px' }}
            >
              <UserAvatar src={imageProfile} />
              <ThemeProvider theme="dark">
                <Flexbox direction="vertical" alignment="center" gap={4}>
                  <Flexbox alignment="center" justifyContent="center" gap={4}>
                    <Typography variant="h3" weight="bold">
                      {nickName}
                    </Typography>
                    <BadgeLabel>
                      <Icon name="LegitFilled" size="small" customStyle={{ color: common.cmnW }} />
                      <Typography variant="body2" weight="medium">
                        감정사
                      </Typography>
                    </BadgeLabel>
                  </Flexbox>
                  {!!curnScore && !!maxScore && (
                    <Flexbox alignment="center" justifyContent="center" gap={1}>
                      {Array.from({ length: 5 }, (_, index) => {
                        return index <
                          (maxScore === 10
                            ? Math.floor(Number(curnScore) / 2)
                            : Number(curnScore)) ? (
                          <Icon
                            name="StarFilled"
                            width={16}
                            height={16}
                            customStyle={{
                              color: '#FFD911'
                            }}
                          />
                        ) : (
                          <Icon
                            name="StarOutlined"
                            width={16}
                            height={16}
                            customStyle={{
                              color: '#FFD911'
                            }}
                          />
                        );
                      })}
                    </Flexbox>
                  )}
                  {!!areaName && data?.info.value.isAreaOpen && (
                    <Flexbox alignment="center" customStyle={{ marginTop: 4 }}>
                      <Icon name="PinOutlined" width={16} height={16} />
                      <Typography>{areaName}</Typography>
                    </Flexbox>
                  )}
                </Flexbox>
                {!!shopDescription && (
                  <Description
                    dangerouslySetInnerHTML={{
                      __html: `${shopDescription.replace(/\r?\n/g, '<br />')}`
                    }}
                  />
                )}
              </ThemeProvider>
            </Flexbox>
            <Flexbox
              alignment="center"
              gap={8}
              customStyle={{
                marginBottom: -1,
                padding: '32px 20px 20px',
                background: common.gradation180
              }}
            >
              <Button size="large" customStyle={{ width: 44 }} onClick={handleClickShare}>
                <Icon name="ShareOutlined" />
              </Button>
              <Button size="large" fullWidth onClick={handleClickEdit}>
                수정하기
              </Button>
            </Flexbox>
          </>
        )}
      </Info>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(312px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'});
  /* padding-top: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0}; */
  margin-top: calc(
    -${HEADER_HEIGHT}px - ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
`;

const BackgroundImage = styled.div<{ src: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(${({ src }) => src});
`;

const Blur = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  background: ${({ theme: { palette } }) => palette.common.overlay40};
  backdrop-filter: blur(8px);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  padding-top: calc(
    ${HEADER_HEIGHT}px + 20px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
`;

const BadgeLabel = styled.label`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  gap: 2px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  border-radius: 12px;
`;

const Description = styled(Typography)`
  word-break: keep-all;
  overflow: hidden;
  width: 100%;
`;

export default UserShopLegitProfile;
