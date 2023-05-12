import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import type { Swiper as SwiperClass } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Lazy } from 'swiper';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Image, Skeleton, light } from '@mrcamelhub/camel-ui';
import type { TypographyVariant } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';

import ImageDetailDialog from '@components/UI/organisms/ImageDetailDialog';

import type { Product, SearchLowerProductsParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImagePathStaticParser, getImageResizePath } from '@utils/common';

import ProductLastLowerPrice from './ProductLastLowerPrice';
import ProductDetailLegitImageBottomBanner from './ProductDetailLegitImageBottomBanner';

interface ProductImagesProps {
  isLoading: boolean;
  product?: Product;
  isProductLegit?: boolean;
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
  getProductImageOverlay
}: ProductImagesProps) {
  const router = useRouter();

  const [loadedImageMain, setLoadedImageMain] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [syncIndex, setSyncIndex] = useState(0);
  const [imageSwiper, setImageSwiper] = useState<SwiperClass | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isDisplay, setIsDisplay] = useState(true);
  const [isLoggedSwipeXPic, setIsLoggedSwipeXPic] = useState(false);
  const [searchRelatedProductsParams, setSearchRelatedProductsParams] =
    useState<SearchLowerProductsParams | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const { data: searchRelatedProducts, isFetched } = useQuery(
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
    setSyncIndex(currentSlide);
    setOpenModal(true);
  };

  const lowerPriceDisplay = () => {
    if (isDisplay && detailImages.length && currentSlide === detailImages.length) return true;
    return false;
  };

  useEffect(() => {
    if (searchRelatedProducts && !isLoading && isFetched) {
      if (searchRelatedProducts.page.content.length < 8) {
        setIsDisplay(false);
      } else {
        setIsDisplay(true);
      }
    }
  }, [isLoading, searchRelatedProducts, isFetched]);

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
    }
  }, [openModal]);

  useEffect(() => {
    if (imageSwiper) {
      imageSwiper.slideTo(0, 0);
    }
  }, [router.query.id, imageSwiper]);

  return (
    <>
      <Box
        ref={wrapperRef}
        customStyle={{
          margin: '0 -20px'
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
            <>{getProductImageOverlay({ status: product.status })}</>
          )}
          <SwiperSlide>
            <Img
              className="swiper-lazy"
              src={
                !loadFailed
                  ? getImageResizePath({
                      imagePath: getImagePathStaticParser(product?.imageMain || ''),
                      w: 425
                    })
                  : product?.imageMain || ''
              }
              data-src={
                !loadFailed
                  ? getImageResizePath({
                      imagePath: getImagePathStaticParser(product?.imageMain || ''),
                      w: 425
                    })
                  : product?.imageMain || ''
              }
              alt="Product Main Img"
              onLoad={() => setLoadedImageMain(true)}
              onError={() => setLoadFailed(true)}
              style={{ width: 0, height: 0, display: 'none' }}
            />
            {isLoading || !product || !loadedImageMain ? (
              <Skeleton />
            ) : (
              <Image
                src={
                  !loadFailed
                    ? getImageResizePath({
                        imagePath: getImagePathStaticParser(product?.imageMain || ''),
                        w: 425
                      })
                    : product?.imageMain || ''
                }
                alt={`${product.title} 이미지`}
                onClick={handleImageModal}
                onError={() => setLoadFailed(true)}
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
                      src={
                        !loadFailed
                          ? getImageResizePath({
                              imagePath: getImagePathStaticParser(image),
                              w: 425
                            })
                          : image
                      }
                      alt={`${product?.title} 이미지 ${i + 1}`}
                      onClick={handleImageModal}
                      onError={() => setLoadFailed(true)}
                      data-index={i + 2}
                    />
                  ) : (
                    <Box
                      customStyle={{
                        position: 'relative',
                        display: isDisplay ? 'block' : 'none'
                      }}
                    >
                      <BackgroundBlurImage
                        imageUrl={
                          !loadFailed
                            ? getImageResizePath({
                                imagePath: getImagePathStaticParser(
                                  product?.imageMainLarge || (product?.imageMain as string) || ''
                                ),
                                w: 425
                              })
                            : product?.imageMainLarge || product?.imageMain || ''
                        }
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
                      src={
                        !loadFailed
                          ? getImageResizePath({
                              imagePath: getImagePathStaticParser(image),
                              w: 425
                            })
                          : image
                      }
                      alt={`${product?.title} 이미지 ${i + 1}`}
                      onClick={handleImageModal}
                      onError={() => setLoadFailed(true)}
                      data-index={i + 2}
                    />
                  ) : (
                    <Box
                      customStyle={{
                        position: 'relative',
                        display: isDisplay ? 'block' : 'none'
                      }}
                    >
                      <BackgroundBlurImage
                        imageUrl={
                          !loadFailed
                            ? getImagePathStaticParser(
                                product?.imageMainLarge || (product?.imageMain as string)
                              )
                            : product?.imageMainLarge || product?.imageMain || ''
                        }
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
        {(isProductLegit || product?.productLegit) && product?.productLegit?.status && (
          <ProductDetailLegitImageBottomBanner
            product={product as Product}
            data={product?.productLegit}
          />
        )}
      </Box>
      <ImageDetailDialog
        open={openModal}
        onClose={handleClickCloseIcon}
        onChange={handleSlideChange}
        images={modalImages}
        syncIndex={syncIndex}
        name={attrProperty.name.PRODUCT_DETAIL}
      />
    </>
  );
}

const Pagination = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: ${({ theme }) => theme.box.round['16']};
  padding: 6px 12px;
  font-size: ${({ theme: { typography } }) => typography.body2.size};
  line-height: ${({ theme: { typography } }) => typography.body2.lineHeight};
  letter-spacing: ${({ theme: { typography } }) => typography.body2.letterSpacing};
  color: ${light.palette.common.uiWhite};
`;

const Img = styled.img``;

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
