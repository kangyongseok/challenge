import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import type { Swiper as SwiperClass } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Lazy } from 'swiper';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Typography, light } from 'mrcamel-ui';
import type { TypographyVariant } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';
import { Image, Skeleton } from '@components/UI/atoms';

import type { Product, SearchLowerProductsParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import ProductLastLowerPrice from './ProductLastLowerPrice';
import ProductDetailLegitImageBottomBanner from './ProductDetailLegitImageBottomBanner';

interface ProductImagesProps {
  isLoading: boolean;
  product?: Product;
  isProductLegit?: boolean;
  isCamelSellerProduct?: boolean;
  getProductImageOverlay: ({
    status,
    variant
  }: {
    status: number;
    variant?: TypographyVariant;
  }) => EmotionJSX.Element | null;
}

function ProductImages({
  isLoading,
  product,
  isProductLegit,
  getProductImageOverlay,
  isCamelSellerProduct
}: ProductImagesProps) {
  const router = useRouter();

  const [loadedImageMain, setLoadedImageMain] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageSwiper, setImageSwiper] = useState<SwiperClass | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isDisplay, setIsDisplay] = useState(true);
  const [isLoggedSwipeXPic, setIsLoggedSwipeXPic] = useState(false);
  const [searchRelatedProductsParams, setSearchRelatedProductsParams] =
    useState<SearchLowerProductsParams | null>(null);
  const { data: searchRelatedProducts } = useQuery(
    queryKeys.products.searchRelatedProducts(
      searchRelatedProductsParams as SearchLowerProductsParams
    ),
    () => fetchSearchRelatedProducts(searchRelatedProductsParams as SearchLowerProductsParams),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled: !!searchRelatedProductsParams
    }
  );

  useEffect(() => {
    if (searchRelatedProducts && !isLoading) {
      if (searchRelatedProducts.page.content.length < 8) {
        setIsDisplay(false);
      }
    }
  }, [isLoading, searchRelatedProducts]);

  useEffect(() => {
    if (product) {
      setSearchRelatedProductsParams({
        brandIds: product.brandId ? [product.brandId] : [],
        categoryIds: product.categoryId ? [product.categoryId] : [],
        line: product.line || undefined,
        related: 1,
        size: 8,
        idFilterIds: 30,
        scorePriceAvg: product.scorePriceAvg,
        quoteTitle: product.quoteTitle,
        productId: product.id
      });
    }
  }, [product]);

  const detailImages = useMemo(() => {
    if (product?.imageDetailsLarge) {
      const result = [
        ...product.imageDetailsLarge.split('|'),
        { lastComponent: <ProductLastLowerPrice type="lastImage" /> }
      ];

      if (searchRelatedProducts?.page.content && searchRelatedProducts.page.content.length < 8) {
        result.pop();
      }

      return result;
    }
    if (product?.imageDetails) {
      const result = [
        ...product.imageDetails.split('|'),
        { lastComponent: <ProductLastLowerPrice type="lastImage" /> }
      ];
      if (searchRelatedProducts?.page.content && searchRelatedProducts.page.content.length < 8) {
        result.pop();
      }
      return result;
    }

    return [];
  }, [product?.imageDetails, product?.imageDetailsLarge, searchRelatedProducts?.page.content]);

  const modalImages: string[] = useMemo(() => {
    let newModalImages: string[] = [];
    if (product?.imageDetailsLarge) {
      newModalImages = product.imageDetailsLarge.split('|');
    }
    if (product?.imageDetails) {
      newModalImages = product.imageDetails.split('|');
    }
    if (product?.imageMainLarge) {
      return [product.imageMainLarge, ...newModalImages];
    }

    if (product?.imageMain) {
      return [product.imageMain, ...newModalImages];
    }

    return newModalImages;
  }, [product]);

  const handleClickCloseIcon = () => {
    logEvent(attrKeys.products.CLICK_PICGALLERY_CLOSE);
    setOpenModal(false);
  };

  const handleSlideChange = useCallback(
    ({ realIndex }: SwiperClass) => {
      if (typeof detailImages[currentSlide] === 'object') {
        logEvent(attrKeys.products.VIEW_LOWPRICE_PRODUCT, {
          type: 'PIC'
        });
      }
      if (!isLoggedSwipeXPic) {
        setIsLoggedSwipeXPic(true);
        logEvent(attrKeys.products.SWIPE_X_PIC, {
          name: attrProperty.productName.PICGALLERY,
          index: realIndex
        });
      }
      setCurrentSlide(realIndex);
      imageSwiper?.slideTo(realIndex, 0);
    },
    [detailImages, currentSlide, isLoggedSwipeXPic, imageSwiper]
  );

  const handleImageModal = (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (target.dataset) {
      logEvent(attrKeys.products.CLICK_PIC, {
        att: target.dataset.index
      });
    }
    setOpenModal(true);
  };

  useEffect(() => {
    const newWrapperRef = wrapperRef.current;
    const disabledSafariSwipeBack = (e: TouchEvent) => {
      if (e.targetTouches[0].pageX > 20) return;

      e.preventDefault();
    };

    if (newWrapperRef) {
      newWrapperRef.addEventListener('touchstart', disabledSafariSwipeBack);
    }

    if (product) setLoadedImageMain(true);

    return () => {
      if (newWrapperRef) {
        newWrapperRef.removeEventListener('touchstart', disabledSafariSwipeBack);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (openModal) {
      setIsLoggedSwipeXPic(false);
      logEvent(attrKeys.products.VIEW_PICGALLERY, {
        name: attrProperty.productName.PRODUCT_DETAIL
      });
      scrollDisable();
    } else {
      scrollEnable();
    }

    return () => scrollEnable();
  }, [openModal]);

  useEffect(() => {
    if (imageSwiper) {
      imageSwiper.slideTo(0);
    }
  }, [router.query.id, imageSwiper]);

  const lowerPriceDisplay = () => {
    if (isDisplay && currentSlide === detailImages.length) return true;
    return false;
  };

  return (
    <>
      <Box
        ref={wrapperRef}
        customStyle={{
          margin: '0 -20px',
          paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0
        }}
      >
        <Swiper
          lazy
          modules={[Lazy]}
          onSwiper={setImageSwiper}
          initialSlide={currentSlide}
          onSlideChange={handleSlideChange}
          preventClicks
        >
          {product && !lowerPriceDisplay() && (
            <>
              {getProductImageOverlay({ status: product.status })}
              {!isCamelSellerProduct && (
                <Platform>
                  <Avatar
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                      (product.siteUrl?.hasImage && product.siteUrl?.id) ||
                      (product.site?.hasImage && product.site?.id) ||
                      ''
                    }.png`}
                    alt={`${product.siteUrl?.name || 'Platform'} Logo Img`}
                    customStyle={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <Typography
                    variant="body2"
                    weight="bold"
                    customStyle={{ marginLeft: 6, color: light.palette.common.ui20 }}
                  >
                    {product.siteUrl?.name || product.site.name}
                  </Typography>
                </Platform>
              )}
            </>
          )}
          <SwiperSlide>
            <Img
              className="swiper-lazy"
              src={product?.imageMain || ''}
              data-src={product?.imageMain || ''}
              alt="Product Main Img"
              onLoad={() => setLoadedImageMain(true)}
              style={{ width: 0, height: 0, display: 'none' }}
            />
            {isLoading || !product || !loadedImageMain ? (
              <Skeleton />
            ) : (
              <Image
                src={product.imageMain}
                alt="goods image"
                onClick={handleImageModal}
                data-index={1}
              />
            )}
          </SwiperSlide>
          {detailImages.map((image, i) => {
            if (i < 2) {
              return (
                <SwiperSlide
                  key={`product-image-${
                    typeof image === 'string'
                      ? image.slice(image.lastIndexOf('/') + 1)
                      : 'last-lower-price'
                  }`}
                  style={{ position: 'relative' }}
                >
                  {typeof image === 'string' ? (
                    <Image
                      src={image}
                      alt="image"
                      onClick={handleImageModal}
                      data-index={i + 2}
                      disableSkeletonRender
                    />
                  ) : (
                    <Box
                      customStyle={{
                        position: 'relative',
                        display: isDisplay ? 'block' : 'none'
                      }}
                    >
                      <BackgroundBlurImage
                        imageUrl={product?.imageMainLarge || (product?.imageMain as string)}
                      />
                      <LastImageContents justifyContent="center" alignment="center">
                        {image.lastComponent}
                      </LastImageContents>
                    </Box>
                  )}
                </SwiperSlide>
              );
            }

            if (currentSlide > 1) {
              return (
                <SwiperSlide
                  key={`product-image-${
                    typeof image === 'string'
                      ? image.slice(image.lastIndexOf('/') + 1)
                      : 'last-lower-price'
                  }`}
                  style={{ position: 'relative' }}
                >
                  {typeof image === 'string' ? (
                    <Image
                      src={image}
                      alt="image"
                      onClick={handleImageModal}
                      data-index={i + 2}
                      disableSkeletonRender
                    />
                  ) : (
                    <Box
                      customStyle={{
                        position: 'relative',
                        display: isDisplay ? 'block' : 'none'
                      }}
                    >
                      <BackgroundBlurImage
                        imageUrl={product?.imageMainLarge || (product?.imageMain as string)}
                      />
                      <LastImageContents justifyContent="center" alignment="center">
                        {image.lastComponent}
                      </LastImageContents>
                    </Box>
                  )}

                  {/* <SkeletonWrapper className="swiper-lazy-preloader">
                    <Skeleton />
                  </SkeletonWrapper> */}
                </SwiperSlide>
              );
            }
            return '';
          })}
          {!lowerPriceDisplay() && (
            <Pagination>
              {currentSlide + 1}/{modalImages.length}
            </Pagination>
          )}
        </Swiper>
        {(isProductLegit || product?.productLegit) && (
          <ProductDetailLegitImageBottomBanner
            product={product as Product}
            data={product?.productLegit}
          />
        )}
      </Box>
      {/* {console.log(detailImages, 'detail')} */}
      {/* {console.log(modalImages, 'modal')} */}
      {/* {console.log(currentSlide)} */}
      <ImageDetailDialog
        open={openModal}
        onClose={handleClickCloseIcon}
        onChange={handleSlideChange}
        images={modalImages}
        syncIndex={currentSlide}
        name={attrProperty.name.PRODUCT_DETAIL}
      />
    </>
  );
}

const Platform = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px 6px 10px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: ${({ theme }) => theme.box.round['8']};
  height: 32px;
`;

const Pagination = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: ${({ theme }) => theme.box.round['16']};
  padding: 6px 12px;
  font-size: ${({ theme: { typography } }) => typography.body2.size};
  font-weight: ${({ theme: { typography } }) => typography.body2.weight.bold};
  line-height: ${({ theme: { typography } }) => typography.body2.lineHeight};
  letter-spacing: ${({ theme: { typography } }) => typography.body2.letterSpacing};
  color: ${light.palette.common.ui20};
`;

const Img = styled.img``;

// const SkeletonWrapper = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   z-index: -1;
// `;

const LastImageContents = styled(Flexbox)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 20px;
`;

const BackgroundBlurImage = styled.div<{ imageUrl: string }>`
  background: ${({ imageUrl }) => `url(${imageUrl})`} no-repeat;
  filter: blur(8px);
  -webkit-filter: blur(8px);
  height: 100%;
  padding-top: 100%;
  background-size: cover;
  position: relative;
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

export default memo(ProductImages);
