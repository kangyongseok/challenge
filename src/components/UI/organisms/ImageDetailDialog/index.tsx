import { ReactElement, useEffect, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Box, Dialog, Icon, light, useTheme } from 'mrcamel-ui';

import { CloseIcon, LegitImg, Pagination, RotateButton } from './ImageDetailDialog.styles';

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
  const [rotates, setRotates] = useState<number[]>([]);
  const transformsRef = useRef<(ReactZoomPanPinchRef | null)[]>([null]);

  const swiperRef = useRef<SwiperClass>();

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

  const handleClose = () => {
    if (swiperRef.current && typeof onChange === 'function') {
      const { realIndex, previousIndex } = swiperRef.current;

      // TODO loop 활성화 시, 간헐적으로 realIndex 싱크가 맞지 않는 문제가 있는데 이유를 찾지 못함, 임시방편 조치
      if (!syncIndex && realIndex === 1) {
        onChange({ ...swiperRef.current, realIndex: previousIndex });
      } else {
        onChange(swiperRef.current);
      }
    }
    onClose();
  };

  const handleSlideChange = (swiper: SwiperClass) => {
    const { realIndex, previousIndex } = swiper;

    // TODO loop 활성화 시, 간헐적으로 realIndex 싱크가 맞지 않는 문제가 있는데 이유를 찾지 못함, 임시방편 조치
    if (!syncIndex && realIndex === 1) {
      setCurrentIndex(previousIndex);
    } else {
      setCurrentIndex(realIndex);
    }

    const currentTransformRef = transformsRef.current[realIndex];

    if (currentTransformRef) {
      currentTransformRef.centerView();
      currentTransformRef.resetTransform();
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

  useEffect(() => {
    if (!rotates.length) {
      setRotates(new Array(images.length).fill(0));
    }
  }, [rotates, images]);

  useEffect(() => {
    if (!open) {
      setRotates([]);
    }
  }, [open]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
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
        onClick={handleClose}
        customStyle={{ cursor: 'pointer' }}
      />
      <Swiper
        onInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        nested
        shortSwipes={shortSwipes}
        followFinger={followFinger}
        onSlideChange={handleSlideChange}
        initialSlide={syncIndex}
        loop={images.length > 1}
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
              centerOnInit
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
                  rotate={rotates[index]}
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
      <RotateButton
        variant="contained"
        brandColor="black"
        size="large"
        startIcon={<Icon name="RotateOutlined" />}
        iconOnly
        onClick={() =>
          setRotates((prevRotates) => {
            return prevRotates.map((prevRotate, index) => {
              if (currentIndex === index) {
                const newRotate = prevRotate + 90;
                if (newRotate >= 360) {
                  return 0;
                }
                return newRotate;
              }
              return prevRotate;
            });
          })
        }
      />
    </Dialog>
  );
}

export default ImageDetailDialog;
