import { useEffect, useMemo, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper';
import type { Swiper as SwiperClass } from 'swiper';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';
import { Image, ProductLegitLabel } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

function LegitResultCardHolder() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState('');
  const [hideCardSwipeGuideIcon, setHideCardSwipeGuideIcon] = useState(true);

  const swiperRef = useRef<SwiperClass | null>();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    data: {
      legitOpinions = [],
      result = 0,
      productResult: {
        title = '',
        imageMain = '',
        imageMainLarge = '',
        imageDetails = '',
        imageDetailsLarge = '',
        price = 0,
        brand: { nameEng = '' } = {},
        siteUrl: { id: siteUrlId = 0, hasImage = false } = {}
      } = {}
    } = {}
  } = useQuery(queryKeys.products.productLegit({ productId }), () => fetchProductLegit(productId), {
    enabled: !!id
  });

  const images = useMemo(() => {
    let newImages: string[] = [];

    if (imageDetailsLarge) {
      newImages = imageDetailsLarge.split('|');
    } else if (imageDetails) {
      newImages = imageDetails.split('|');
    }

    if (imageMainLarge) {
      newImages = [imageMainLarge, ...newImages];
    } else if (imageMain) {
      newImages = [imageMain, ...newImages];
    }

    return newImages;
  }, [imageMain, imageMainLarge, imageDetails, imageDetailsLarge]);
  const resultText = useMemo(() => {
    if (result === 1) {
      return '<strong>정품의견</strong>이 더 우세해요!';
    }
    if (result === 2) {
      return '<strong>가품의심의견</strong>이 있어요!';
    }
    return '<strong>실물감정</strong>을 추천해요';
  }, [result]);
  const resultCount = useMemo(() => {
    return {
      authentic: legitOpinions.filter(({ result: opinionResult }) => opinionResult === 1).length,
      fake: legitOpinions.filter(({ result: opinionResult }) => opinionResult === 2).length,
      impossible: legitOpinions.filter(
        ({ result: opinionResult }) => opinionResult !== 1 && opinionResult !== 2
      ).length
    };
  }, [legitOpinions]);

  const handleSlideChange = ({ realIndex, slides }: SwiperClass) => {
    if (swiperRef.current) {
      logEvent(attrKeys.legitResult.SWIPE_X_THUMBPIC, {
        name: attrProperty.legitName.LEGIT_INFO,
        index: realIndex + 1
      });
    }
    setCurrentIndex(realIndex);

    const currentSlides = slides.filter((slide: HTMLDivElement) => {
      return realIndex === Number(slide.getAttribute('data-swiper-slide-index'));
    });

    if (currentSlides[0]) {
      const img = currentSlides[0].getElementsByTagName('img');

      if (img[0]) setBackgroundImageSrc(img[0].src);
    }
  };

  const handleClickSlide = () => {
    logEvent(attrKeys.legitResult.CLICK_THUMBPIC, {
      name: attrProperty.legitName.LEGIT_INFO
    });
    setOpen(true);
  };

  const handleClose = () => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(currentIndex);
    }
    setOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHideCardSwipeGuideIcon(false);

        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }

        scrollTimerRef.current = setTimeout(() => {
          setHideCardSwipeGuideIcon(true);
        }, 100);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <StyledLegitResultCardHolder>
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          customStyle={{ padding: '16px 16px 20px 20px' }}
        >
          <div>
            <Typography variant="h3" customStyle={{ color: common.white }}>
              사진감정 결과,
            </Typography>
            <ResultTitleTypography
              variant="h3"
              result={result}
              dangerouslySetInnerHTML={{ __html: resultText }}
            />
          </div>
          <Image
            width={80}
            height={80}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/transparent/${nameEng
              .toLocaleLowerCase()
              .split(' ')
              .join('')}.png`}
            alt="Brand Logo Img"
            disableAspectRatio
          />
        </Flexbox>
        <BackgroundImage src={backgroundImageSrc}>
          {result === 1 && (
            <ProductLegitLabel
              text="정품의견"
              customStyle={{
                position: 'absolute',
                top: -13,
                left: 20
              }}
            />
          )}
          {result === 2 && (
            <ProductLegitLabel
              variant="fake"
              text="가품의심"
              customStyle={{
                position: 'absolute',
                top: -13,
                left: 20
              }}
            />
          )}
          {result !== 1 && result !== 2 && (
            <ProductLegitLabel
              variant="impossible"
              text="감정불가"
              customStyle={{
                position: 'absolute',
                top: -13,
                left: 20
              }}
            />
          )}
          <Flexbox
            direction="vertical"
            alignment="center"
            justifyContent="center"
            customStyle={{
              width: '100%',
              height: '100%',
              padding: '0 20px',
              '& .swiper-slide-visible .product-legit-result-image': {
                opacity: 1
              },
              '& .swiper-slide-visible .waiting-behind-card': { opacity: 0 }
            }}
          >
            <Box customStyle={{ position: 'relative', width: '100%' }}>
              <SwipeGuideIcon
                name="CaretLeftOutlined"
                color="white"
                placement="left"
                hideIcon={hideCardSwipeGuideIcon}
              />
              <SwipeGuideIcon
                name="CaretRightOutlined"
                color="white"
                placement="right"
                hideIcon={hideCardSwipeGuideIcon}
              />
              <Swiper
                onInit={(swiper) => {
                  swiperRef.current = swiper;
                }}
                effect="cards"
                cardsEffect={{
                  rotate: false,
                  slideShadows: false
                }}
                loop
                modules={[EffectCards]}
                grabCursor
                onSlideChange={handleSlideChange}
                style={{ width: 160 }}
              >
                {images.map((image, index) => (
                  <SwiperSlide
                    // eslint-disable-next-line react/no-array-index-key
                    key={`product-legit-result-image-${index}`}
                    style={{
                      position: 'relative'
                    }}
                    onClick={handleClickSlide}
                  >
                    <Image
                      className="product-legit-result-image"
                      width={160}
                      height={160}
                      src={image}
                      alt="Product Legit Result Img"
                      disableAspectRatio
                      customStyle={{
                        borderRadius: 8,
                        opacity: 0,
                        transition: 'opacity .2s ease-in'
                      }}
                    />
                    <WaitingBehindCard className="waiting-behind-card" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
            <Typography
              variant="body2"
              customStyle={{ marginTop: 8, textAlign: 'center', color: common.white }}
            >
              {title}
            </Typography>
            <Flexbox gap={3} alignment="center" customStyle={{ marginTop: 3 }}>
              {hasImage && (
                <Avatar
                  width={15}
                  height={15}
                  src={`https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/images/platforms/${siteUrlId}.png`}
                  alt="Platform Logo Img"
                  customStyle={{ maxWidth: 15, maxHeight: 15 }}
                />
              )}
              <Typography weight="bold" customStyle={{ color: common.white }}>
                {commaNumber(getTenThousandUnitPrice(price))}만원
              </Typography>
            </Flexbox>
            <Flexbox gap={32} customStyle={{ marginTop: 20 }}>
              <Flexbox direction="vertical" alignment="center">
                <Flexbox gap={4} alignment="center">
                  <Icon
                    width={15}
                    height={15}
                    name="OpinionAuthenticFilled"
                    customStyle={{ color: common.white }}
                  />
                  <Typography variant="small2" customStyle={{ color: common.white }}>
                    정품의견
                  </Typography>
                </Flexbox>
                <Typography variant="h2" weight="bold" customStyle={{ color: common.white }}>
                  {resultCount.authentic}
                </Typography>
              </Flexbox>
              <Flexbox direction="vertical" alignment="center">
                <Flexbox gap={4} alignment="center">
                  <Icon
                    width={15}
                    height={15}
                    name="OpinionFakeFilled"
                    customStyle={{ color: common.white }}
                  />
                  <Typography variant="small2" customStyle={{ color: common.white }}>
                    가품의견
                  </Typography>
                </Flexbox>
                <Typography variant="h2" weight="bold" customStyle={{ color: common.white }}>
                  {resultCount.fake}
                </Typography>
              </Flexbox>
              <Flexbox direction="vertical" alignment="center">
                <Flexbox gap={4} alignment="center">
                  <Icon
                    width={15}
                    height={15}
                    name="OpinionImpossibleFilled"
                    customStyle={{ color: common.white }}
                  />
                  <Typography variant="small2" customStyle={{ color: common.white }}>
                    감정불가
                  </Typography>
                </Flexbox>
                <Typography variant="h2" weight="bold" customStyle={{ color: common.white }}>
                  {resultCount.impossible}
                </Typography>
              </Flexbox>
            </Flexbox>
          </Flexbox>
          <BackgroundImageBlur className="background-image-blur" />
        </BackgroundImage>
      </StyledLegitResultCardHolder>
      <ImageDetailDialog
        open={open}
        onChange={handleSlideChange}
        onClose={handleClose}
        images={images}
        legitResult={result}
        syncIndex={currentIndex}
      />
    </>
  );
}

const StyledLegitResultCardHolder = styled.section`
  margin-top: 24px;
  background-color: #151729;
  box-shadow: 0 16px 40px rgba(133, 133, 133, 0.2);
  border-radius: ${({ theme: { box } }) => box.round['8']};
`;

const ResultTitleTypography = styled(Typography)<{ result: 0 | 1 | 2 | 3 }>`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  ${({
    theme: {
      palette: { primary, secondary, common }
    },
    result
  }): CSSObject => {
    switch (result) {
      case 1:
        return {
          '& > strong': {
            color: primary.light
          }
        };
      case 2:
        return {
          '& > strong': {
            color: secondary.red.light
          }
        };
      default:
        return {
          '& > strong': {
            color: common.white
          }
        };
    }
  }};
`;

const BackgroundImage = styled.div<{ src: string }>`
  position: relative;
  width: 100%;
  height: 335px;
  border-radius: ${({ theme: { box } }) => box.round['16']};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  background-image: url(${({ src }) => src});

  & *:not(.background-image-blur) {
    z-index: 1;
  }
`;

const BackgroundImageBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  background-color: rgba(21, 25, 54, 0.7);
  backdrop-filter: blur(10px);
`;

const SwipeGuideIcon = styled(Icon)<{
  hideIcon?: boolean;
  placement: 'left' | 'right';
}>`
  position: absolute;
  top: 50%;
  ${({ placement }): CSSObject => {
    switch (placement) {
      case 'left':
        return {
          left: 0
        };
      default:
        return {
          right: 0
        };
    }
  }}
  transform: translateY(-50%);
  opacity: ${({ hideIcon }) => (hideIcon ? 0 : 0.5)};
`;

const WaitingBehindCard = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  border-radius: ${({ theme: { box } }) => box.round['8']};
  opacity: 0.1;
  transition: opacity 0.2s ease-in;
`;

export default LegitResultCardHolder;
