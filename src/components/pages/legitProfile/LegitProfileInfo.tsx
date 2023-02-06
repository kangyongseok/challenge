import { useCallback, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Chip,
  Flexbox,
  Icon,
  Label,
  Skeleton,
  Typography,
  dark,
  useTheme
} from 'mrcamel-ui';
import styled from '@emotion/styled';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import type { UserRoleLegit } from '@dto/user';
import type { LegitsBrand } from '@dto/model';

import { logEvent } from '@library/amplitude';

import { fetchLegitProfile } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { APP_TOP_STATUS_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  commaNumber,
  executedShareURl,
  getRandomNumber,
  hasImageFile,
  isExtendedLayoutIOSVersion
} from '@utils/common';

import { dialogState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface LegitProfileInfoProps {
  profile?: UserRoleLegit;
  isLoading?: boolean;
  legitsBrands: LegitsBrand[];
  cntOpinion: number;
  sellerId?: number;
}

function LegitProfileInfo({
  profile,
  isLoading = false,
  legitsBrands = [],
  cntOpinion
}: LegitProfileInfoProps) {
  const {
    userId,
    name = '',
    title = '',
    dateActivated = '',
    targetBrandIds = [],
    cntReal = 0,
    cntFake = 0
    // urlShop
  } = profile || {};
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const setDialogState = useSetRecoilState(dialogState);
  const { data: accessUser } = useQueryAccessUser();
  const { data: profileInfo } = useQuery(
    queryKeys.users.legitProfile(Number(router.query.id)),
    () => fetchLegitProfile(Number(router.query.id)),
    {
      enabled: !!router.query.id
    }
  );

  const targetBrandData = useMemo(
    () =>
      legitsBrands
        .filter((legitsBrand) =>
          targetBrandIds.some((targetBrandId) => targetBrandId === legitsBrand.id)
        )
        .slice(0, 15),
    [legitsBrands, targetBrandIds]
  );
  const userImageProfile =
    (hasImageFile(profileInfo?.profile?.image) && profileInfo?.profile?.image) || '';
  const userImageBackground =
    (hasImageFile(profile?.imageBackground) && profile?.imageBackground) ||
    (userImageProfile.length > 0 && userImageProfile) ||
    `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background.png`;

  const handleClickShare = useCallback(() => {
    const shareData = {
      title:
        cntOpinion > 0
          ? `${cntOpinion}개 중고명품 감정한 감정사 | 카멜`
          : '중고명품 감정한 감정사 | 카멜',
      description:
        cntOpinion > 0
          ? `${cntOpinion}개의 중고명품을 감정한 믿음직한 감정사에요! 중고명품 의심이 되면 감정 의견을 받아보세요.`
          : '중고명품 의심이 되면 감정 의견을 받아보세요.',
      image: userImageBackground,
      url: `${typeof window !== 'undefined' ? window.location.origin : 'https://mrcamel.co.kr'}${
        router.asPath
      }`
    };

    logEvent(attrKeys.legit.CLICK_SHARE, {
      name: attrProperty.legitName.LEGIT_PROFILE
    });

    if (
      !executedShareURl({
        url: shareData.url,
        title: shareData.title,
        text: shareData.description
      })
    ) {
      setDialogState({ type: 'SNSShare', shareData });
    }
  }, [cntOpinion, userImageBackground, router.asPath, setDialogState]);

  const handleClickMoveToShop = () => {
    logEvent(attrKeys.legit.CLICK_SELLER_PRODUCT, {
      name: attrProperty.legitName.LEGIT_PROFILE
    });

    router.push({
      pathname: `/userInfo/${userId}`,
      query: {
        tab: 'products'
      }
    });
  };

  // const handleClickMoveUrlShop = () => {
  //   logEvent(attrKeys.legit.CLICK_PROFILE_LINK, {
  //     name: attrProperty.legitName.LEGIT_PROFILE
  //   });
  //
  //   window.open(urlShop as string, '_blank');
  // };

  const handleClickEdit = () => {
    router.push(`/legit/profile/${userId}/edit?targetTab=legit`);
  };

  return (
    <Wrapper>
      <BackgroundImage src={userImageBackground}>
        <Blur />
      </BackgroundImage>
      <Flexbox
        direction="vertical"
        customStyle={{
          flex: 1,
          paddingTop:
            HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0) + 20,
          position: 'relative'
        }}
      >
        {isLoading ? (
          <>
            <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, padding: '0 20px' }}>
              <Flexbox gap={8}>
                <Flexbox direction="vertical" gap={8} customStyle={{ flex: 1 }}>
                  <Skeleton width={100} height={32} disableAspectRatio round={8} />
                  <Flexbox gap={12} alignment="center" customStyle={{ marginBottom: 12 }}>
                    <Flexbox gap={4} alignment="center">
                      <Skeleton width={58} height={18} round={8} disableAspectRatio />
                      <Skeleton width={32} height={16} round={8} disableAspectRatio />
                    </Flexbox>
                    <Flexbox gap={4} alignment="center">
                      <Skeleton width={58} height={18} round={8} disableAspectRatio />
                      <Skeleton width={32} height={16} round={8} disableAspectRatio />
                    </Flexbox>
                  </Flexbox>
                  <Skeleton width="100%" height="40px" disableAspectRatio round={8} />
                </Flexbox>
                <Skeleton
                  width={80}
                  height={80}
                  disableAspectRatio
                  customStyle={{ borderRadius: '50%' }}
                />
              </Flexbox>
              <Flexbox gap={4} customStyle={{ flexWrap: 'wrap' }}>
                {Array.from({ length: 10 }, (_, index) => (
                  <Skeleton
                    key={`target-brand-${index}`}
                    width={Math.min(Math.max(45, getRandomNumber(2)), 110)}
                    height={24}
                    disableAspectRatio
                    round={8}
                  />
                ))}
              </Flexbox>
            </Flexbox>
            <Flexbox
              direction="vertical"
              gap={8}
              customStyle={{
                padding: '32px 20px 20px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)'
              }}
            >
              <Flexbox alignment="center" gap={8}>
                <Skeleton width={128} height={44} round={8} disableAspectRatio />
                <Skeleton width={44} height={44} round={8} disableAspectRatio />
                <Skeleton width={44} height={44} round={8} disableAspectRatio />
              </Flexbox>
            </Flexbox>
          </>
        ) : (
          <>
            <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, padding: '0 20px' }}>
              <Flexbox gap={8}>
                <Flexbox direction="vertical" gap={8} customStyle={{ flex: 1 }}>
                  <Typography variant="h2" weight="bold" customStyle={{ color: common.cmnW }}>
                    {name}
                  </Typography>
                  <Flexbox gap={12} alignment="center" customStyle={{ marginBottom: 12 }}>
                    <Flexbox alignment="center" gap={4}>
                      <Label
                        variant="darked"
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        text={
                          <Flexbox alignment="center" gap={2}>
                            <Icon name="OpinionAuthenticOutlined" width={12} height={12} />
                            <Typography
                              variant="small2"
                              weight="medium"
                              customStyle={{ color: common.cmnW }}
                            >
                              정품의견
                            </Typography>
                          </Flexbox>
                        }
                        size="xsmall"
                      />
                      <Typography
                        variant="body2"
                        weight="bold"
                        customStyle={{ color: dark.palette.primary.light }}
                      >
                        {commaNumber(cntReal)}건
                      </Typography>
                    </Flexbox>
                    <Flexbox alignment="center" gap={4}>
                      <Label
                        variant="darked"
                        brandColor="red"
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        text={
                          <Flexbox alignment="center" gap={2}>
                            <Icon name="OpinionAuthenticOutlined" width={12} height={12} />
                            <Typography
                              variant="small2"
                              weight="medium"
                              customStyle={{ color: common.cmnW }}
                            >
                              가품의심
                            </Typography>
                          </Flexbox>
                        }
                        size="xsmall"
                      />
                      <Typography
                        variant="body2"
                        weight="bold"
                        customStyle={{ color: dark.palette.secondary.red.light }}
                      >
                        {commaNumber(cntFake)}건
                      </Typography>
                    </Flexbox>
                  </Flexbox>
                  <Typography
                    variant="body1"
                    customStyle={{ color: common.cmnW }}
                    dangerouslySetInnerHTML={{
                      __html: title
                        .replace(/\r?\n/g, '<br />')
                        .split('<br />')
                        .map((text) => text.replace(/^-|^- /, ''))
                        .join('<br />')
                    }}
                  />
                </Flexbox>
                <UserAvatar
                  src={userImageProfile}
                  dateActivated={dateActivated}
                  width={80}
                  height={80}
                  iconCustomStyle={{ width: 40, height: 40 }}
                  isRound
                  showBorder={!dateActivated}
                  customStyle={{ height: 'inherit' }}
                />
              </Flexbox>
              <Flexbox gap={4} customStyle={{ flexWrap: 'wrap' }}>
                {targetBrandData.map(({ id, name: brandName }) => (
                  <Chip
                    key={`target-brand-${id}`}
                    size="xsmall"
                    variant="solid"
                    brandColor="black"
                    customStyle={{ backgroundColor: common.overlay40, whiteSpace: 'nowrap' }}
                  >
                    #{brandName}
                  </Chip>
                ))}
              </Flexbox>
            </Flexbox>
            <Box customStyle={{ background: common.gradation180 }}>
              <Flexbox
                alignment="center"
                gap={8}
                customStyle={{
                  marginBottom: -1,
                  padding: '32px 20px 20px'
                }}
              >
                {userId && ![56881, 70679].includes(userId) && (
                  <Button
                    size="large"
                    variant="solid"
                    brandColor="black"
                    customStyle={{ minWidth: 128 }}
                    startIcon={<Icon name="ShopOutlined" customStyle={{ color: common.cmnW }} />}
                    onClick={handleClickMoveToShop}
                  >
                    SHOP
                  </Button>
                )}
                <Button size="large" onClick={handleClickShare}>
                  <Icon name="ShareOutlined" />
                </Button>
              </Flexbox>
              {accessUser?.userId === userId && (
                <Flexbox customStyle={{ padding: '0 20px' }}>
                  <EditButton variant="solid" fullWidth size="xlarge" onClick={handleClickEdit}>
                    수정하기
                  </EditButton>
                </Flexbox>
              )}
            </Box>
          </>
        )}
      </Flexbox>
    </Wrapper>
  );
}

const EditButton = styled(Button)`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  font-size: ${({ theme: { typography } }) => typography.h4.size};
`;

const Wrapper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  user-select: none;
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

export default LegitProfileInfo;
