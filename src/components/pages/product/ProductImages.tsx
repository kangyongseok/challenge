import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, SyntheticEvent } from 'react';

import type { Swiper as SwiperClass } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Avatar, Box, Icon, Typography } from 'mrcamel-ui';
import type { TypographyVariant } from 'mrcamel-ui';
import styled from '@emotion/styled';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

import Image from '@components/UI/atoms/Image';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';

import { pulse } from '@styles/transition';

import { PortalConsumer } from '@provider/PortalProvider';

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
  openLegit?: boolean;
}

function ProductImages({
  isLoading,
  product,
  getProductImageOverlay,
  openLegit
}: ProductImagesProps) {
  const [loadedImageMain, setLoadedImageMain] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageSwiper, setImageSwiper] = useState<SwiperClass | null>(null);
  const [imageModalSwiper, setImageModalSwiper] = useState<SwiperClass | null>(null);
  const [currentScale, setCurrentScale] = useState(1);
  const [shortSwipes, setShortSwipes] = useState(true);
  const [followFinger, setFollowFinger] = useState(true);
  const [panningDisabled, setPanningDisabled] = useState(true);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const transformsRef = useRef<(ReactZoomPanPinchRef | null)[]>([null]);
  const [isLoggedSwipeXPic, setIsLoggedSwipeXPic] = useState(false);

  const detailImages = useMemo(() => {
    if (product?.imageDetailsLarge) {
      return product.imageDetailsLarge.split('|');
    }

    if (product?.imageDetails) {
      return product.imageDetails.split('|');
    }

    return [];
  }, [product?.imageDetails, product?.imageDetailsLarge]);
  const modalImages = useMemo(() => {
    if (product?.imageMainLarge) {
      return [product.imageMainLarge, ...detailImages];
    }

    if (product?.imageMain) {
      return [product.imageMain, ...detailImages];
    }

    return detailImages;
  }, [detailImages, product?.imageMain, product?.imageMainLarge]);

  const handleClickCloseIcon = (e: SyntheticEvent<SVGElement>) => {
    e.stopPropagation();
    logEvent(attrKeys.products.CLICK_PICGALLERY_CLOSE);
    setOpenModal(false);
  };

  const handleSlideChange = useCallback(
    ({ activeIndex }: SwiperClass) => {
      if (!isLoggedSwipeXPic) {
        setIsLoggedSwipeXPic(true);
        logEvent(attrKeys.products.SWIPE_X_PIC, {
          name: attrProperty.productName.PICGALLERY,
          index: activeIndex
        });
      }
      setCurrentSlide(activeIndex);
      imageSwiper?.slideTo(activeIndex, 0);
      imageModalSwiper?.slideTo(activeIndex, 0);
    },
    [imageModalSwiper, imageSwiper, isLoggedSwipeXPic]
  );

  const handleScale = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    setCurrentScale(scale);
  };

  const handleImageLoad = (index: number) => () => {
    const currentTransformRef = transformsRef.current[index];

    if (currentTransformRef) {
      currentTransformRef.centerView();
      currentTransformRef.resetTransform();
    }
  };

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
    if (currentScale > 1) {
      setShortSwipes(false);
      setFollowFinger(false);
      setPanningDisabled(false);
    } else {
      setShortSwipes(true);
      setFollowFinger(true);
      setPanningDisabled(true);
    }
  }, [currentScale]);

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

  return (
    <>
      <Box ref={wrapperRef} customStyle={{ margin: '0 -20px' }}>
        <Swiper
          onSwiper={setImageSwiper}
          initialSlide={currentSlide}
          onSlideChange={handleSlideChange}
          preventClicks
        >
          {product && (
            <>
              {getProductImageOverlay({ status: product.status })}
              <Platform>
                <Avatar
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                    (product.siteUrl?.hasImage && product.siteUrl.id) ||
                    (product.site.hasImage && product.site?.id) ||
                    ''
                  }.png`}
                  alt="goods store icon"
                  customStyle={{
                    width: 20,
                    height: 20
                  }}
                />
                <Typography variant="body2" weight="bold" customStyle={{ marginLeft: 6 }}>
                  {product.siteUrl?.name || product.site.name}
                </Typography>
              </Platform>
            </>
          )}
          <SwiperSlide>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product?.imageMain || ''}
              alt="product imageMain"
              onLoad={() => setLoadedImageMain(true)}
              style={{ width: 0, height: 0, display: 'none' }}
            />
            {isLoading || !product || !loadedImageMain ? (
              <ImageSkeleton />
            ) : (
              <Image
                src={product.imageMain}
                alt="goods image"
                onClick={handleImageModal}
                data-index={1}
              />
            )}
          </SwiperSlide>
          {detailImages.map((image, i) => (
            <SwiperSlide key={`product-image-${image.slice(image.lastIndexOf('/') + 1)}`}>
              <Image src={image} alt="image" onClick={handleImageModal} data-index={i + 2} />
            </SwiperSlide>
          ))}
          <Pagination>
            {currentSlide + 1}/{detailImages.length + 1}
          </Pagination>
        </Swiper>
        {openLegit && (
          <ProductDetailLegitImageBottomBanner
            product={product as Product}
            data={product?.productLegit}
          />
        )}
      </Box>
      {modalImages.length > 0 && openModal && (
        <PortalConsumer>
          <ImageModal>
            <CloseIcon name="CloseOutlined" color="white" onClick={handleClickCloseIcon} />
            <Swiper
              onSwiper={setImageModalSwiper}
              nested
              shortSwipes={shortSwipes}
              followFinger={followFinger}
              onSlideChange={handleSlideChange}
              style={{ width: '100%' }}
              initialSlide={currentSlide}
            >
              {modalImages.map((image, index) => (
                <SwiperSlide key={`product-modal-image-${image.slice(image.lastIndexOf('/') + 1)}`}>
                  <TransformWrapper
                    ref={(ref) => {
                      transformsRef.current[index] = ref;
                    }}
                    panning={{ disabled: panningDisabled }}
                    onPanning={handleScale}
                    onWheel={handleScale}
                    onPinching={handleScale}
                    doubleClick={{ mode: 'reset' }}
                  >
                    <TransformComponent
                      wrapperStyle={{
                        zIndex: 100001,
                        width: '100%',
                        height: '100vh'
                      }}
                    >
                      <ProductImg
                        src={image}
                        alt={image.slice(image.lastIndexOf('/') + 1)}
                        onLoad={handleImageLoad(index)}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </SwiperSlide>
              ))}
            </Swiper>
            <ModalPagination>
              {currentSlide + 1}/{detailImages.length + 1}
            </ModalPagination>
          </ImageModal>
        </PortalConsumer>
      )}
    </>
  );
}

const ImageSkeleton = styled.div`
  background-color: ${({ theme }) => theme.palette.common.grey['90']};
  animation: ${pulse} 800ms linear 0s infinite alternate;
  width: 100%;
  height: 100vw;
`;

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
`;

const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100000;
  background-color: ${({ theme }) => theme.palette.common.black};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloseIcon = styled(Icon)`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100002;
`;

const ModalPagination = styled(Pagination)`
  width: fit-content;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
`;

const ProductImg = styled.img``;

export default memo(ProductImages);
