import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Box, Dialog, Icon, light, useTheme } from 'mrcamel-ui';

import { CloseIcon, Img, Pagination, RotateButton } from './ImageDetailDialog.styles';

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
  const [imagesLoadStatus, setImagesLoadStatus] = useState<number[]>([]);

  const swiperRef = useRef<SwiperClass>();
  const transformsRef = useRef<(ReactZoomPanPinchRef | null)[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const isFirstChangeRef = useRef(false);

  const handleScale = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    setCurrentScale(scale);
  };

  const handleLoad = (index: number) => () => {
    const currentTransformRef = transformsRef.current[index];

    setImagesLoadStatus((prevState) => [...prevState, index]);

    if (currentTransformRef) {
      currentTransformRef.resetTransform();
    }
  };

  const handleSlideNextTransitionStart = () =>
    transformsRef.current.forEach((ref) => {
      if (ref) {
        ref.resetTransform();
      }
    });

  const handleSlideChange = (swiper: SwiperClass) => {
    const { realIndex } = swiper;
    // TODO loop 활성화 시, 간헐적으로 realIndex 싱크가 맞지 않는 문제가 있는데 이유를 찾지 못함, 임시방편 조치
    let newRealIndex = realIndex;

    if (!isFirstChangeRef.current && newRealIndex !== syncIndex) {
      newRealIndex -= 1;
    }
    isFirstChangeRef.current = true;

    setCurrentIndex(newRealIndex);

    if (typeof onChange === 'function') {
      onChange({ ...swiper, realIndex: newRealIndex });
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
      setImagesLoadStatus([]);
      setCurrentIndex(0);
      transformsRef.current = [];
      imagesRef.current = [];
      isFirstChangeRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    // +2 = loopSlide Count
    if (open && imagesLoadStatus.length === images.length + 2) {
      transformsRef.current.forEach((ref) => {
        if (ref) {
          ref.resetTransform();
        }
      });
    }
  }, [open, imagesLoadStatus, images, currentIndex, syncIndex]);

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
        onInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        nested
        shortSwipes={shortSwipes}
        followFinger={followFinger}
        onSlideNextTransitionStart={handleSlideNextTransitionStart}
        onSlideChange={handleSlideChange}
        initialSlide={syncIndex}
        loop={images.length > 1}
        style={{
          height: '100%'
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={`product-image-${image.slice(image.lastIndexOf('/') + 1)}`}>
            {({ isDuplicate }) => {
              const loopIndex = isDuplicate ? index + 10 : index;
              return (
                <TransformWrapper
                  ref={(ref) => {
                    if (ref) {
                      transformsRef.current[loopIndex] = ref;
                    }
                  }}
                  panning={{ disabled: panningDisabled }}
                  onPanning={handleScale}
                  onWheel={handleScale}
                  onPinching={handleScale}
                  doubleClick={{
                    mode: 'reset'
                  }}
                  centerOnInit
                >
                  <TransformComponent
                    wrapperStyle={{
                      width: '100%',
                      height: '100%'
                    }}
                    contentStyle={{
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Img
                      ref={(ref) => {
                        if (ref) {
                          imagesRef.current[loopIndex] = ref;
                        }
                      }}
                      src={image}
                      alt={`product-image-${image.slice(image.lastIndexOf('/') + 1)}`}
                      rotate={rotates[index]}
                      onLoad={handleLoad(loopIndex)}
                    />
                  </TransformComponent>
                </TransformWrapper>
              );
            }}
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
