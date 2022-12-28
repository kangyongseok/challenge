import { useCallback, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import {
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
import type { CustomStyle } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { UserAvatar } from '@components/UI/organisms';

import type { UserRoleLegit } from '@dto/user';
import type { LegitsBrand } from '@dto/model';

import { logEvent } from '@library/amplitude';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  commaNumber,
  executedShareURl,
  getRandomNumber,
  isExtendedLayoutIOSVersion
} from '@utils/common';

import { dialogState } from '@recoil/common';

interface LegitProfileInfoProps {
  profile?: UserRoleLegit;
  isLoading?: boolean;
  legitsBrands: LegitsBrand[];
  cntOpinion: number;
  showEdit?: boolean;
  hideBlur?: boolean;
  onClickEditProfile?: () => void;
  customStyle?: CustomStyle;
  infoCustomStyle?: CustomStyle;
}

function LegitProfileInfo({
  profile,
  isLoading = false,
  legitsBrands = [],
  cntOpinion,
  showEdit = false,
  hideBlur,
  onClickEditProfile,
  customStyle,
  infoCustomStyle
}: LegitProfileInfoProps) {
  const {
    userId,
    name = '',
    title = '',
    image = '',
    imageBackground = '',
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

  const targetBrandData = useMemo(
    () =>
      legitsBrands
        .filter((legitsBrand) =>
          targetBrandIds.some((targetBrandId) => targetBrandId === legitsBrand.id)
        )
        .slice(0, 15),
    [legitsBrands, targetBrandIds]
  );

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
      image:
        imageBackground ||
        `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-profile-background.png`,
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
  }, [cntOpinion, imageBackground, router.asPath, setDialogState]);

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

  return (
    <Wrapper css={customStyle}>
      <BackgroundImage
        src={
          imageBackground ||
          `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-profile-background.png`
        }
      >
        <Blur />
      </BackgroundImage>
      {isLoading ? (
        <>
          <Flexbox
            direction="vertical"
            gap={20}
            customStyle={{ flex: 1, padding: '32px 20px 20px' }}
          >
            <Flexbox gap={8} customStyle={{ marginBottom: 9 }}>
              <Flexbox direction="vertical" gap={8} customStyle={{ flex: 1 }}>
                <Skeleton width={100} height={32} round={8} disableAspectRatio />
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
                <Skeleton width="100%" height={40} round={8} disableAspectRatio />
              </Flexbox>
              <Skeleton width={80} height={80} round="50%" disableAspectRatio />
            </Flexbox>
            <Flexbox gap={4} customStyle={{ flexWrap: 'wrap' }}>
              {Array.from({ length: 10 }, (_, index) => (
                <Skeleton
                  key={`target-brand-${index}`}
                  width={Math.min(Math.max(45, getRandomNumber(2)), 110)}
                  height={24}
                  round={8}
                  disableAspectRatio
                />
              ))}
            </Flexbox>
          </Flexbox>
          <Flexbox direction="vertical" gap={8} customStyle={{ padding: 20 }}>
            <Flexbox alignment="center" gap={8}>
              <Skeleton width={128} height={44} round={8} disableAspectRatio />
              <Skeleton width={44} height={44} round={8} disableAspectRatio />
              <Skeleton width={44} height={44} round={8} disableAspectRatio />
            </Flexbox>
            {showEdit && <Skeleton width="100%" height={44} round={8} disableAspectRatio />}
          </Flexbox>
        </>
      ) : (
        <Flexbox
          direction="vertical"
          gap={32}
          customStyle={{
            position: 'relative',
            flex: 1,
            padding: '0 20px',
            ...infoCustomStyle
          }}
        >
          <Flexbox direction="vertical" gap={12} customStyle={{ flex: 1, zIndex: 3 }}>
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
                    __html: `${title
                      .replaceAll(/\r?\n/gi, '<br />')
                      .split('<br />')
                      .map((text) => text.replace(/^-|^- /, ''))
                      .join('<br />')}`
                  }}
                />
              </Flexbox>
              <UserAvatar
                src={image}
                dateActivated={dateActivated}
                customStyle={{ height: 'inherit' }}
                // onClick={() => router.push(`/products/${sellerId}/userInfo?tab=products`)}
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
          <Flexbox direction="vertical" gap={8} customStyle={{ paddingBottom: 20, zIndex: 3 }}>
            <Flexbox alignment="center" gap={8}>
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
              {/* 추후 활성화 */}
              {/* {(urlShop || '').trim().length > 0 && ( */}
              {/*  <Button size="large" onClick={handleClickMoveUrlShop}> */}
              {/*    <Icon name="HyperlinkOutlined" /> */}
              {/*  </Button> */}
              {/* )} */}
              <Button size="large" onClick={handleClickShare}>
                <Icon name="ShareOutlined" />
              </Button>
            </Flexbox>
            {showEdit && (
              <Button
                size="large"
                startIcon={<Icon name="EditOutlined" />}
                fullWidth
                onClick={onClickEditProfile}
              >
                프로필 수정
              </Button>
            )}
          </Flexbox>
          {!hideBlur && <BackgroundBlur />}
        </Flexbox>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  user-select: none;
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px;

  & > div {
    z-index: 1;
  }
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
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(6px);
`;

const BackgroundBlur = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 96px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 100%);
`;

export default LegitProfileInfo;
