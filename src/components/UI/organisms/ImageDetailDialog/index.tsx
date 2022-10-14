import { ReactElement, useEffect, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Box, Dialog, Icon, light, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

interface ImageDetailDialogProps {
  open: boolean;
  onChange?: (swiper: SwiperClass) => void;
  onClose: () => void;
  images: string[];
  label?: ReactElement;
  syncIndex?: number;
}

function ImageDetailDialog({
  open,
  onChange,
  onClose,
  images = [],
  label,
  syncIndex = 0
}: ImageDetailDialogProps) {
  const {
    theme: {
      zIndex: { button }
    }
  } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(syncIndex);
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
        backgroundColor: light.palette.common.uiBlack,
        border: 'none'
      }}
    >
      {label && (
        <Box
          customStyle={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: button
          }}
        >
          {label}
        </Box>
      )}
      <CloseIcon
        name="CloseOutlined"
        color="white"
        onClick={onClose}
        customStyle={{ cursor: 'pointer' }}
      />
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
        {currentIndex + 1}/{images.length}
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
