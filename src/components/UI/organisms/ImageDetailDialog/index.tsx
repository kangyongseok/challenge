import { useEffect, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Dialog, Icon, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import ProductLegitLabel from '@components/UI/atoms/ProductLegitLabel';

interface ImageDetailDialogProps {
  open: boolean;
  onChange?: (swiper: SwiperClass) => void;
  onClose: () => void;
  images: string[];
  legitResult?: 0 | 1 | 2 | 3;
  syncIndex?: number;
}

function ImageDetailDialog({
  open,
  onChange,
  onClose,
  images = [],
  legitResult,
  syncIndex
}: ImageDetailDialogProps) {
  const {
    theme: {
      palette: { common },
      zIndex: { button }
    }
  } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  const [shortSwipes, setShortSwipes] = useState(true);
  const [followFinger, setFollowFinger] = useState(true);
  const [panningDisabled, setPanningDisabled] = useState(true);
  const transformsRef = useRef<(ReactZoomPanPinchRef | null)[]>([null]);

  const handleScale = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    setCurrentScale(scale);
  };

  const handleLoad = (index: number) => () => {
    const currentTransformRef = transformsRef.current[index];

    if (currentTransformRef) {
      currentTransformRef.centerView();
      currentTransformRef.resetTransform();
    }
  };

  const handleSlideChange = (swiper: SwiperClass) => {
    const { activeIndex } = swiper;
    setCurrentIndex(activeIndex);

    if (typeof onChange === 'function') {
      onChange(swiper);
    }
  };

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

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      disablePadding
      customStyle={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: common.black,
        border: 'none'
      }}
    >
      {legitResult === 1 && (
        <ProductLegitLabel
          variant="authentic"
          text="정품의견"
          customStyle={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: button
          }}
        />
      )}
      {legitResult === 2 && (
        <ProductLegitLabel
          variant="fake"
          text="가품의견"
          customStyle={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: button
          }}
        />
      )}
      {legitResult === 3 && (
        <ProductLegitLabel
          variant="impossible"
          text="감정불가"
          customStyle={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: button
          }}
        />
      )}
      <CloseIcon name="CloseOutlined" color="white" onClick={onClose} />
      <Swiper
        nested
        shortSwipes={shortSwipes}
        followFinger={followFinger}
        onSlideChange={handleSlideChange}
        initialSlide={syncIndex}
        style={{
          textAlign: 'center'
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={`product-legit-image-${image.slice(image.lastIndexOf('/') + 1)}`}>
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
                  width: '100%',
                  height: '100vh'
                }}
                contentStyle={{
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <LegitImg
                  src={image}
                  alt={`product-legit-image-${image.slice(image.lastIndexOf('/') + 1)}`}
                  onLoad={handleLoad(index)}
                />
              </TransformComponent>
            </TransformWrapper>
          </SwiperSlide>
        ))}
      </Swiper>
      <Pagination>
        {typeof syncIndex === 'number' ? syncIndex + 1 : currentIndex + 1}/{images.length}
      </Pagination>
    </Dialog>
  );
}

const LegitImg = styled.img``;

const CloseIcon = styled(Icon)`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

const Pagination = styled.div`
  position: absolute;
  width: fit-content;
  left: 50%;
  padding: 6px 12px;
  bottom: 20px;
  right: 20px;
  border-radius: ${({ theme }) => theme.box.round['16']};
  background-color: rgba(255, 255, 255, 0.6);
  transform: translateX(-50%);
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
  font-size: ${({ theme: { typography } }) => typography.body2.size};
  font-weight: ${({ theme: { typography } }) => typography.body2.weight.bold};
  line-height: ${({ theme: { typography } }) => typography.body2.lineHeight};
  letter-spacing: ${({ theme: { typography } }) => typography.body2.letterSpacing};
`;

export default ImageDetailDialog;
