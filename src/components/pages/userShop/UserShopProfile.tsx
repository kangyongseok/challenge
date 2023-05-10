import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';
import { CamelAuthLabel } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { DEFAUT_BACKGROUND_IMAGE, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedActivatedTime } from '@utils/formats';
import {
  executedShareURl,
  getImagePathStaticParser,
  getImageResizePath,
  isExtendedLayoutIOSVersion
} from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

interface UserShopProfileProps {
  isLoading?: boolean;
  title: string;
  description: string;
  curnScore: number;
  maxScore: number;
  areaName?: string;
  shopDescription: string;
  isCertificationSeller?: boolean;
  dateActivated: string;
}

function UserShopProfile({
  isLoading = false,
  title,
  description,
  curnScore,
  maxScore,
  areaName,
  shopDescription,
  isCertificationSeller = false,
  dateActivated = ''
}: UserShopProfileProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common, primary }
    }
  } = useTheme();

  const setDialogState = useSetRecoilState(dialogState);
  const {
    userId,
    userNickName: nickName,
    userImageProfile: imageProfile,
    userImageBackground: imageBackground,
    data
  } = useQueryMyUserInfo();

  const handleClickShare = useCallback(() => {
    logEvent(attrKeys.userShop.CLICK_SHARE, {
      name: attrProperty.name.MY_STORE,
      att: 'SELLER'
    });

    const shareData = {
      title,
      description,
      image: imageProfile,
      url: `${
        typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'
      }/userInfo/${userId}`
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
  }, [description, imageProfile, setDialogState, title, userId]);

  const getTimeForamt = getFormattedActivatedTime(dateActivated);

  const handleClickEdit = useCallback(() => {
    logEvent(attrKeys.userShop.CLICK_PROFILE_EDIT, {
      name: attrProperty.name.MY_STORE,
      att: 'SELLER'
    });

    router.push('/user/shop/edit');
  }, [router]);

  const bgImage = !isLoading
    ? imageBackground || imageProfile || DEFAUT_BACKGROUND_IMAGE
    : DEFAUT_BACKGROUND_IMAGE;

  return (
    <Box component="section">
      <ImageWrapper>
        <BackgroundImage
          src={getImageResizePath({ imagePath: getImagePathStaticParser(bgImage), h: 160 })}
        >
          <Blur />
        </BackgroundImage>
      </ImageWrapper>
      <InfoWrapper>
        {isLoading ? (
          <>
            <Flexbox
              direction="vertical"
              alignment="center"
              gap={12}
              customStyle={{ flex: 1, padding: '0 20px' }}
            >
              <Skeleton
                width={96}
                height={96}
                disableAspectRatio
                round={16}
                customStyle={{ margin: '-40px auto 0' }}
              />
              <Skeleton width={90} height={24} disableAspectRatio round={8} />
            </Flexbox>
            <Flexbox alignment="center" gap={8} customStyle={{ padding: '32px 20px 12px' }}>
              <Skeleton minWidth={44} width={44} height={44} disableAspectRatio round={8} />
              <Skeleton width="100%" height={44} disableAspectRatio round={8} />
            </Flexbox>
          </>
        ) : (
          <>
            <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, padding: '0 20px' }}>
              <Flexbox justifyContent="center" alignment="center" customStyle={{ marginTop: -40 }}>
                <UserAvatar src={imageProfile} showBorder />
              </Flexbox>
              <Flexbox direction="vertical" alignment="center" gap={4}>
                <Flexbox alignment="center" justifyContent="center" gap={2}>
                  <Typography variant="h3" weight="bold">
                    {nickName}
                  </Typography>
                  {isCertificationSeller && <CamelAuthLabel />}
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
                <Flexbox alignment="center" gap={4} customStyle={{ marginTop: 4 }}>
                  {getTimeForamt && (
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
                        variant="body2"
                        customStyle={{
                          color: getTimeForamt.icon === 'time' ? common.ui60 : primary.light
                        }}
                      >
                        {getTimeForamt.text}
                      </Typography>
                    </Flexbox>
                  )}
                  {!!areaName && data?.info.value.isAreaOpen && (
                    <Flexbox alignment="center">
                      <Icon name="PinOutlined" width={16} height={16} />
                      <Typography variant="body2">{areaName}</Typography>
                    </Flexbox>
                  )}
                </Flexbox>
              </Flexbox>
              {!!shopDescription && (
                <Description
                  dangerouslySetInnerHTML={{
                    __html: shopDescription.replace(/\r?\n/g, '<br />')
                  }}
                />
              )}
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
  min-height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + 160px);
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
  background: ${({ theme: { palette } }) => palette.common.overlay20};
  backdrop-filter: blur(8px);
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const Description = styled(Typography)`
  word-break: keep-all;
  overflow: hidden;
  width: 100%;
`;

export default UserShopProfile;
