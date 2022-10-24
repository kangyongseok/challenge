import { useCallback, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { UserAvatar } from '@components/UI/organisms';
import { Skeleton } from '@components/UI/atoms';

import type { UserRoleLegit } from '@dto/user';
import type { LegitsBrand } from '@dto/model';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { executedShareURl, getRandomNumber } from '@utils/common';

import { dialogState } from '@recoil/common';

interface LegitProfileInfoProps {
  profile?: UserRoleLegit;
  isLoading?: boolean;
  legitsBrands: LegitsBrand[];
  cntOpinion: number;
  showEdit?: boolean;
  onClickEditProfile?: () => void;
  customStyle?: CustomStyle;
  infoCustomStyle?: CustomStyle;
  sellerId?: number;
}

function LegitProfileInfo({
  profile,
  sellerId,
  isLoading = false,
  legitsBrands = [],
  cntOpinion,
  showEdit = false,
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
    targetBrandIds = []
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

    router.push(`/sellerInfo/${sellerId}?tab=products`);
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
          <Flexbox direction="vertical" gap={20} customStyle={{ flex: 1, padding: 20 }}>
            <Flexbox gap={8} customStyle={{ marginBottom: 9 }}>
              <Flexbox direction="vertical" gap={8} customStyle={{ flex: 1 }}>
                <Skeleton width="100px" height="32px" disableAspectRatio isRound />
                <Skeleton width="100%" height="40px" disableAspectRatio isRound />
              </Flexbox>
              <Skeleton
                width="96px"
                height="96px"
                disableAspectRatio
                customStyle={{ borderRadius: '50%' }}
              />
            </Flexbox>
            <Flexbox gap={4} customStyle={{ flexWrap: 'wrap' }}>
              {Array.from({ length: 10 }, (_, index) => (
                <Skeleton
                  key={`target-brand-${index}`}
                  width={`${Math.min(Math.max(45, getRandomNumber(2)), 110)}px`}
                  height="24px"
                  disableAspectRatio
                  isRound
                />
              ))}
            </Flexbox>
          </Flexbox>
          <Flexbox direction="vertical" gap={8} customStyle={{ padding: '20px 20px 64px' }}>
            <Flexbox alignment="center" gap={8}>
              <Skeleton width="128px" height="44px" disableAspectRatio isRound />
              <Skeleton width="44px" height="44px" disableAspectRatio isRound />
              <Skeleton width="44px" height="44px" disableAspectRatio isRound />
            </Flexbox>
            {showEdit && <Skeleton width="100%" height="44px" disableAspectRatio isRound />}
          </Flexbox>
        </>
      ) : (
        <Flexbox
          direction="vertical"
          customStyle={{ flex: 1, padding: '32px 20px 64px', ...infoCustomStyle }}
        >
          <Flexbox direction="vertical" gap={20} customStyle={{ flex: 1 }}>
            <Flexbox gap={8} customStyle={{ marginBottom: 9 }}>
              <Flexbox direction="vertical" gap={8} customStyle={{ flex: 1 }}>
                <Typography variant="h2" weight="bold" customStyle={{ color: common.cmnW }}>
                  {name}
                </Typography>
                <Typography
                  variant="body1"
                  customStyle={{ color: common.cmnW }}
                  dangerouslySetInnerHTML={{
                    __html: `${title.replaceAll(/\r?\n/gi, '<br />')}`
                  }}
                />
              </Flexbox>
              <UserAvatar
                src={image}
                dateActivated={dateActivated}
                customStyle={{ height: 'inherit' }}
                // onClick={() => router.push(`/products/${sellerId}/sellerInfo?tab=products`)}
              />
            </Flexbox>
            <Flexbox gap={4} customStyle={{ flexWrap: 'wrap' }}>
              {targetBrandData.map(({ id, name: brandName }) => (
                <Chip
                  key={`target-brand-${id}`}
                  size="xsmall"
                  variant="contained"
                  brandColor="black"
                  customStyle={{ backgroundColor: common.overlay40, whiteSpace: 'nowrap' }}
                >
                  #{brandName}
                </Chip>
              ))}
            </Flexbox>
          </Flexbox>
          <Flexbox direction="vertical" gap={8}>
            <Flexbox alignment="center" gap={8}>
              {userId && ![10029, 56881, 70679].includes(userId) && (
                <Button
                  size="large"
                  variant="contained"
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
  min-height: 520px;

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

export default LegitProfileInfo;
