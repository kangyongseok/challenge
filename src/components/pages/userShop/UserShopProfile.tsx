import { useCallback, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Box, Button, Flexbox, Icon, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { APP_TOP_STATUS_HEIGHT, HEADER_HEIGHT, NEXT_IMAGE_BLUR_URL } from '@constants/common';

import { executedShareURl, isExtendedLayoutIOSVersion } from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

interface UserShopProfileProps {
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
  isCertificationSeller?: boolean;
}

function UserShopProfile({
  isLoading = false,
  title,
  description,
  imageProfile,
  imageBackground,
  nickName,
  curnScore,
  maxScore,
  areaName,
  shopDescription,
  isCertificationSeller = false
}: UserShopProfileProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const setDialogState = useSetRecoilState(dialogState);
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
    router.push('/user/shop/edit');
  }, [router]);

  const handleLoadComplete = () => {
    setImageRendered(true);
  };

  return (
    <Box component="section">
      <ImageWrapper>
        <BackgroundImage
          src={
            imageBackground ||
            imageProfile ||
            `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background.png`
          }
        >
          <Blur />
        </BackgroundImage>
      </ImageWrapper>
      <InfoWrapper>
        {isLoading ? (
          <>
            <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, padding: '0 20px' }}>
              <Skeleton
                width={96}
                height={96}
                disableAspectRatio
                round={16}
                customStyle={{ margin: '-40px auto 0' }}
              />
              <Flexbox direction="vertical" alignment="center" gap={4}>
                <Flexbox alignment="center" justifyContent="center" gap={2}>
                  <Skeleton width={90} height="24px" disableAspectRatio round={8} />
                  <Skeleton width={24} height="24px" disableAspectRatio round={8} />
                </Flexbox>
                <Flexbox alignment="center" justifyContent="center" gap={1}>
                  <Skeleton width={84} height="16px" disableAspectRatio round={8} />
                </Flexbox>
                <Flexbox alignment="center" customStyle={{ marginTop: 4 }}>
                  <Skeleton width={120} height="24px" disableAspectRatio round={8} />
                </Flexbox>
              </Flexbox>
              <Skeleton width="100%" height={60} disableAspectRatio round={8} />
            </Flexbox>
            <Flexbox alignment="center" gap={8} customStyle={{ padding: '32px 20px 12px' }}>
              <Skeleton minWidth="44px" width={44} height="44px" disableAspectRatio round={8} />
              <Skeleton width="100%" height={44} disableAspectRatio round={8} />
            </Flexbox>
          </>
        ) : (
          <>
            <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, padding: '0 20px' }}>
              <Flexbox justifyContent="center" alignment="center" customStyle={{ marginTop: -40 }}>
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
              </Flexbox>
              <Flexbox direction="vertical" alignment="center" gap={4}>
                <Flexbox alignment="center" justifyContent="center" gap={2}>
                  <Typography variant="h3" weight="bold">
                    {nickName}
                  </Typography>
                  {isCertificationSeller && (
                    <Icon name="SafeFilled" size="small" customStyle={{ color: primary.main }} />
                  )}
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
              {!!shopDescription && <Description>{shopDescription}</Description>}
            </Flexbox>
            <Flexbox
              direction="vertical"
              gap={8}
              customStyle={{
                marginBottom: -1,
                padding: '32px 20px 12px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)'
              }}
            >
              <Flexbox alignment="center" gap={8}>
                <Button size="large" customStyle={{ width: 44 }} onClick={handleClickShare}>
                  <Icon name="ShareOutlined" />
                </Button>
                <Button size="large" fullWidth onClick={handleClickEdit}>
                  수정하기
                </Button>
              </Flexbox>
            </Flexbox>
          </>
        )}
      </InfoWrapper>
    </Box>
  );
}

const ImageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  user-select: none;
  min-height: 160px;
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
  background: ${({ theme: { palette } }) => palette.common.overlay20};
  backdrop-filter: blur(8px);
`;

const ProfileImageWrap = styled(Flexbox)`
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 16px;
  background: ${({ theme: { palette } }) => palette.common.bg03};
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  user-select: none;
`;

const Description = styled(Typography)`
  word-break: keep-all;
  overflow: hidden;
  width: 100%;
`;

export default UserShopProfile;
