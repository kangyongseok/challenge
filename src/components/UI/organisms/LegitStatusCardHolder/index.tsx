import { ReactElement, useMemo, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper';
import type { Swiper as SwiperClass } from 'swiper';
import { Avatar, Box, Flexbox, Label, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';
import { Image, LegitLabel } from '@components/UI/atoms';

import type { ProductLegit } from '@dto/productLegit';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import {
  BackgroundImage,
  BackgroundImageBlur,
  ImageShield,
  ResultTitleTypography,
  StyledLegitStatusCardHolder
} from './LegitStatusCardHolder.styles';

export interface LegitStatusCardHolderProps {
  productLegit: ProductLegit;
  title?: ReactElement | string;
  simplify?: boolean;
  name?: string;
}

function getLegitResultLabel(result: 0 | 1 | 2 | 3) {
  if (result === 1) {
    return <LegitLabel variant="authentic" text="정품의견" />;
  }

  if (result === 2) {
    return <LegitLabel variant="fake" text="가품의심" />;
  }

  if (result === 3) {
    return <LegitLabel variant="impossible" text="감정불가" />;
  }

  return undefined;
}

function LegitStatusCardHolder({
  productLegit: {
    result = 0,
    dateCreated,
    status,
    cntTargetOpinions,
    productResult: {
      title: productTitle = '',
      quoteTitle = '',
      imageMain = '',
      imageMainLarge = '',
      imageDetails = '',
      imageDetailsLarge = '',
      price = 0,
      brand: { nameEng = '' },
      site,
      siteUrl,
      postType,
      photoGuideDetails = []
    }
  },
  title,
  simplify,
  name
}: LegitStatusCardHolderProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { id: siteId = 0, hasImage: siteHasImage = false } = site || {};
  const { id: siteUrlId = 0, hasImage: siteUrlHasImage = false } = siteUrl || {};

  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [syncIndex, setSyncIndex] = useState(0);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState('');
  const [labelText, setLabelText] = useState('');

  const swiperRef = useRef<SwiperClass | null>();

  const images = useMemo(() => {
    let newImages: string[] = [];

    if (imageMainLarge) {
      newImages = [imageMainLarge];
    } else if (imageMain) {
      newImages = [imageMain];
    }

    if (imageDetailsLarge) {
      newImages = newImages.concat(imageDetailsLarge.split('|'));
    } else if (imageDetails) {
      newImages = newImages.concat(imageDetails.split('|'));
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
      const img = currentSlides[0].getElementsByClassName('product-legit-result-image');

      if (!img[0]) return;

      const src = img[0].getAttribute('data-src');

      setBackgroundImageSrc(src || '');
    }
  };

  const handleImageDetailDialogSlideChange = ({ realIndex, slides }: SwiperClass) => {
    setCurrentIndex(realIndex);

    const findPhotoGuideDetail = (photoGuideDetails || []).find((_, index) => index === realIndex);

    if (findPhotoGuideDetail) setLabelText(findPhotoGuideDetail.commonPhotoGuideDetail.name);

    const currentSlides = slides.filter((slide: HTMLDivElement) => {
      return realIndex === Number(slide.getAttribute('data-swiper-slide-index'));
    });

    if (currentSlides[0]) {
      const img = currentSlides[0].getElementsByClassName('product-legit-result-image');

      if (!img[0]) return;

      const src = img[0].getAttribute('data-src');

      setBackgroundImageSrc(src || '');
    }
  };

  const handleClickSlide = (dataIndex: number) => () => {
    logEvent(attrKeys.legitResult.CLICK_THUMBPIC, {
      name: attrProperty.legitName.LEGIT_INFO
    });

    const findPhotoGuideDetail = (photoGuideDetails || []).find((_, index) => index === dataIndex);

    setOpen(true);
    setSyncIndex(dataIndex);

    if (findPhotoGuideDetail) setLabelText(findPhotoGuideDetail.commonPhotoGuideDetail.name);
  };

  const handleClose = () => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(currentIndex);
    }
    setOpen(false);
  };

  return (
    <>
      <StyledLegitStatusCardHolder simplify={simplify}>
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          customStyle={{ padding: '16px 16px 20px 20px' }}
        >
          {title || (
            <div>
              {status === 20 ? (
                <Typography variant="h3" weight="medium" customStyle={{ color: common.cmnW }}>
                  {cntTargetOpinions}명의 감정 전문가들이
                  <br />
                  감정중입니다.
                </Typography>
              ) : (
                <>
                  <Typography variant="h3" customStyle={{ color: common.cmnW }}>
                    사진감정 결과,
                  </Typography>
                  <ResultTitleTypography
                    variant="h3"
                    result={result}
                    dangerouslySetInnerHTML={{ __html: resultText }}
                  />
                </>
              )}
            </div>
          )}
          <Image
            width={80}
            height={80}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/black/${nameEng
              .toLocaleLowerCase()
              .split(' ')
              .join('')}.jpg`}
            alt="Brand Logo Img"
            disableAspectRatio
            customStyle={{
              mixBlendMode: 'screen'
            }}
          />
        </Flexbox>
        <BackgroundImage src={backgroundImageSrc} simplify={simplify}>
          {!simplify && result === 1 && (
            <LegitLabel
              text="정품의견"
              customStyle={{
                position: 'absolute',
                top: -13,
                left: 20
              }}
            />
          )}
          {!simplify && result === 2 && (
            <LegitLabel
              variant="fake"
              text="가품의심"
              customStyle={{
                position: 'absolute',
                top: -13,
                left: 20
              }}
            />
          )}
          {!simplify && result !== 1 && result !== 2 && (
            <LegitLabel
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
              padding: '0 20px'
            }}
          >
            <Box customStyle={{ position: 'relative', width: '100%' }}>
              <Swiper
                loop
                onInit={(swiper) => {
                  swiperRef.current = swiper;
                }}
                slidesPerView="auto"
                effect="coverflow"
                coverflowEffect={{
                  rotate: 0,
                  depth: 700,
                  stretch: 80,
                  slideShadows: false
                }}
                modules={[EffectCoverflow]}
                grabCursor
                onSlideChange={handleSlideChange}
                centeredSlides
                style={{
                  width: 202
                }}
              >
                {images.map((image, index) => (
                  <SwiperSlide
                    // eslint-disable-next-line react/no-array-index-key
                    key={`product-legit-result-image-${index}`}
                    style={{
                      position: 'relative',
                      width: 160,
                      height: 160,
                      borderRadius: 8
                    }}
                    onClick={handleClickSlide(index)}
                  >
                    {({ isActive }) => (
                      <>
                        <Image
                          variant="backgroundImage"
                          className="product-legit-result-image"
                          width={160}
                          height={160}
                          src={image}
                          data-src={image}
                          alt="Legit Result Img"
                          customStyle={{
                            borderRadius: 8
                          }}
                        />
                        <ImageShield isActive={isActive} />
                      </>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
            <Typography
              variant="h4"
              customStyle={{ marginTop: 32, textAlign: 'center', color: common.cmnW }}
            >
              {postType === 2 ? quoteTitle : productTitle}
            </Typography>
            {postType === 2 ? (
              <Typography variant="body2" customStyle={{ marginTop: 4, color: common.ui80 }}>
                신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
              </Typography>
            ) : (
              <Flexbox gap={5} alignment="center" customStyle={{ marginTop: 10 }}>
                {(siteUrlHasImage || siteHasImage) && (
                  <Avatar
                    width={20}
                    height={20}
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                      (siteUrlHasImage && siteUrlId) || (siteHasImage && siteId) || siteId
                    }.png`}
                    alt="Platform Logo Img"
                    customStyle={{ maxWidth: 20, maxHeight: 20 }}
                  />
                )}
                <Typography variant="h3" weight="bold" customStyle={{ color: common.cmnW }}>
                  {commaNumber(getTenThousandUnitPrice(price))}만원
                </Typography>
              </Flexbox>
            )}
          </Flexbox>
          {!simplify && <BackgroundImageBlur className="background-image-blur" />}
        </BackgroundImage>
      </StyledLegitStatusCardHolder>
      <ImageDetailDialog
        open={open}
        onChange={handleImageDetailDialogSlideChange}
        onClose={handleClose}
        images={images}
        label={
          <Flexbox gap={4}>
            {getLegitResultLabel(result)}
            {labelText && <Label variant="ghost" brandColor="black" text={labelText} />}
          </Flexbox>
        }
        syncIndex={syncIndex}
        name={name}
      />
    </>
  );
}

export default LegitStatusCardHolder;
