import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { SNSShareDialog, UserAvatar } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedActivatedTime } from '@utils/formats';
import {
  executedShareURl,
  getImagePathStaticParser,
  getImageResizePath,
  isExtendedLayoutIOSVersion
} from '@utils/common';

import type { ShareData } from '@typings/common';
import useSession from '@hooks/useSession';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

interface UserShopLegitProfileProps {
  isLoading?: boolean;
  title: string;
  description: string;
  curnScore: number;
  maxScore: number;
  areaName?: string;
  shopDescription: string;
  dateActivated: string;
}

function UserShopLegitProfile({
  isLoading = false,
  title,
  description,
  curnScore,
  maxScore,
  areaName,
  shopDescription,
  dateActivated
}: UserShopLegitProfileProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const getTimeForamt = getFormattedActivatedTime(dateActivated);

  const { data: accessUser } = useSession();

  const {
    userId,
    userNickName: nickName,
    userImageProfile: imageProfile,
    userImageBackground: imageBackground,
    data
  } = useQueryMyUserInfo();

  const [open, setOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({
    title,
    description,
    image: imageProfile,
    url: `${
      typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'
    }/userInfo/${userId}`
  });

  const handleClickShare = useCallback(() => {
    logEvent(attrKeys.userShop.CLICK_SHARE, {
      name: attrProperty.name.MY_STORE,
      att: 'LEGIT_SELLER'
    });

    const newShareData = {
      title,
      description,
      image: imageProfile,
      url: `${
        typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'
      }/userInfo/${userId}`
    };

    if (
      !executedShareURl({
        url: newShareData.url,
        title: newShareData.title,
        text: newShareData.description
      })
    ) {
      setOpen(true);
      setShareData(newShareData);
    }
  }, [description, imageProfile, title, userId]);

  const handleClickEdit = useCallback(() => {
    logEvent(attrKeys.userShop.CLICK_PROFILE_EDIT, {
      name: attrProperty.name.MY_STORE,
      att: 'LEGIT_SELLER'
    });

    if (accessUser?.userId) {
      router.push(`/legit/profile/${accessUser.userId}/edit`);
    }
  }, [accessUser?.userId, router]);

  const bgImage = !isLoading
    ? imageBackground ||
      imageProfile ||
      `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background-legit.png`
    : `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background-legit.png`;

  return (
    <>
      <Wrapper>
        <BackgroundImage
          src={getImageResizePath({ imagePath: getImagePathStaticParser(bgImage), h: 387 })}
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
                <Flexbox direction="vertical" alignment="center" gap={4}>
                  <Flexbox alignment="center" justifyContent="center" gap={4}>
                    <Typography variant="h3" weight="bold" color="uiWhite">
                      {nickName}
                    </Typography>
                    <BadgeLabel>
                      <Icon name="LegitFilled" size="small" color="cmnW" />
                      <Typography variant="body2" weight="medium" color="uiWhite">
                        감정사
                      </Typography>
                    </BadgeLabel>
                  </Flexbox>
                  <Flexbox alignment="center" gap={4} customStyle={{ marginTop: 4 }}>
                    {getTimeForamt && (
                      <Flexbox alignment="center">
                        {getTimeForamt.icon === 'time' ? (
                          <Icon
                            name="TimeOutlined"
                            color="uiWhite"
                            customStyle={{
                              marginRight: 2,
                              height: '14px !important',
                              width: 14
                            }}
                          />
                        ) : (
                          <Box
                            customStyle={{
                              width: 5,
                              height: 5,
                              background: common.uiWhite,
                              borderRadius: '50%',
                              marginRight: 5
                            }}
                          />
                        )}
                        <Typography variant="body2" color="uiWhite">
                          {getTimeForamt.text}
                        </Typography>
                      </Flexbox>
                    )}
                    {!!areaName && data?.info.value.isAreaOpen && (
                      <Flexbox alignment="center">
                        <Icon name="PinOutlined" width={16} height={16} color="uiWhite" />
                        <Typography variant="body2" color="uiWhite">
                          {areaName}
                        </Typography>
                      </Flexbox>
                    )}
                  </Flexbox>
                  {!!curnScore && !!maxScore && (
                    <Flexbox
                      alignment="center"
                      justifyContent="center"
                      gap={1}
                      customStyle={{ marginTop: 8 }}
                    >
                      {Array.from({ length: 5 }, (_, index) => {
                        return index <
                          (maxScore === 10
                            ? Math.floor(Number(curnScore) / 2)
                            : Number(curnScore)) ? (
                          <Icon name="StarFilled" width={16} height={16} color="#FFD911" />
                        ) : (
                          <Icon name="StarOutlined" width={16} height={16} color="#FFD911" />
                        );
                      })}
                    </Flexbox>
                  )}
                </Flexbox>
                {!!shopDescription && (
                  <Typography
                    color="uiWhite"
                    customStyle={{
                      wordBreak: 'keep-all',
                      overflow: 'hidden',
                      width: '100%'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: `${shopDescription.replace(/\r?\n/g, '<br />')}`
                    }}
                  />
                )}
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
      <SNSShareDialog open={open} onClose={() => setOpen(false)} shareData={shareData} />
    </>
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
  background-color: ${({ theme: { palette } }) => palette.common.uiBlack};
  border-radius: 12px;
`;

export default UserShopLegitProfile;
