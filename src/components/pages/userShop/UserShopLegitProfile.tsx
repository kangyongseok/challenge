import { useCallback, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button, Flexbox, Icon, Skeleton, ThemeProvider, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

// import UserAvatar from '@components/UI/organisms/UserAvatar';

import { APP_TOP_STATUS_HEIGHT, HEADER_HEIGHT, NEXT_IMAGE_BLUR_URL } from '@constants/common';

import { executedShareURl, isExtendedLayoutIOSVersion } from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface UserShopLegitProfileProps {
  isLoading?: boolean;
  title: string;
  description: string;
  imageProfile: string;
  imageBackground: string;
  nickName: string;
  curnScore: number;
  maxScore: number;
  areaName?: string;
  shopDescription: string;
}

function UserShopLegitProfile({
  isLoading = false,
  title,
  description,
  imageProfile,
  imageBackground,
  nickName,
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
  const { data: myUserInfo } = useQueryMyUserInfo();
  const [imageRendered, setImageRendered] = useState(false);

  const handleClickShare = useCallback(() => {
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
    if (accessUser?.userId) {
      router.push(`/legit/profile/${accessUser.userId}/edit`);
    }
  }, [accessUser?.userId, router]);

  const handleLoadComplete = () => {
    setImageRendered(true);
  };

  return (
    <Wrapper>
      <BackgroundImage
        src={
          imageBackground ||
          myUserInfo?.info.value.image ||
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
              <Skeleton
                width="96px"
                height="96px"
                disableAspectRatio
                customStyle={{ borderRadius: 16 }}
              />
              <Flexbox direction="vertical" alignment="center" gap={4}>
                <Flexbox alignment="center" justifyContent="center" gap={4}>
                  <Skeleton width={90} height={24} disableAspectRatio round={8} />
                  <Skeleton width={67} height={24} disableAspectRatio round={8} />
                </Flexbox>
                <Flexbox alignment="center" justifyContent="center">
                  <Skeleton width={84} height={16} disableAspectRatio round={8} />
                </Flexbox>
                <Flexbox alignment="center" customStyle={{ marginTop: 4 }}>
                  <Skeleton width={120} height={24} disableAspectRatio round={8} />
                </Flexbox>
              </Flexbox>
              <Skeleton width="100%" height={60} disableAspectRatio round={8} />
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
              <ProfileImageWrap justifyContent="center" alignment="center">
                {imageProfile && (
                  <Image
                    src={imageProfile}
                    alt="Profile"
                    onLoadingComplete={handleLoadComplete}
                    placeholder="blur"
                    blurDataURL={NEXT_IMAGE_BLUR_URL}
                    layout="fill"
                    objectFit="cover"
                    style={{ borderRadius: 16 }}
                  />
                )}
                {(!imageRendered || !imageProfile) && (
                  <Icon
                    name="UserFilled"
                    width={50}
                    height={50}
                    customStyle={{ color: common.ui80 }}
                  />
                )}
              </ProfileImageWrap>
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
                  {!!areaName && myUserInfo?.info.value.isAreaOpen && (
                    <Flexbox alignment="center" customStyle={{ marginTop: 4 }}>
                      <Icon name="PinOutlined" width={16} height={16} />
                      <Typography>{areaName}</Typography>
                    </Flexbox>
                  )}
                </Flexbox>
                {!!shopDescription && (
                  <Description
                    dangerouslySetInnerHTML={{
                      __html: `${shopDescription.replaceAll(/\r?\n/gi, '<br />')}`
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
  user-select: none;
  min-height: 312px;
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px;
  margin-top: -${HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)}px;
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

const ProfileImageWrap = styled(Flexbox)`
  position: relative;
  min-width: 96px;
  min-height: 96px;
  border-radius: 16px;
  background: ${({ theme: { palette } }) => palette.common.bg03};
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  padding-top: ${HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0) + 20}px;
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
