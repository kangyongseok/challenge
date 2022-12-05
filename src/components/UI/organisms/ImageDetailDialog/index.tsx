import { useEffect, useRef, useState } from 'react';
import type { ReactElement, TouchEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Box, Dialog, Icon, light, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import {
  CloseIcon,
  Img,
  Pagination,
  RotateButton,
  ZoomInButton,
  ZoomOutButton
} from './ImageDetailDialog.styles';

interface ImageDetailDialogProps {
  open: boolean;
  onChange?: (swiper: SwiperClass) => void;
  onClose: () => void;
  images: string[];
  label?: ReactElement;
  syncIndex?: number;
  name?: string;
}

function ImageDetailDialog({
  open,
  onChange,
  onClose,
  images = [],
  label,
  syncIndex = 0,
  name
}: ImageDetailDialogProps) {
  const {
    theme: {
      zIndex: { button },
      palette: { common }
    }
  } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(syncIndex);
  const [currentScale, setCurrentScale] = useState(1);
  const [shortSwipes, setShortSwipes] = useState(true);
  const [followFinger, setFollowFinger] = useState(true);
  const [panningDisabled, setPanningDisabled] = useState(true);
  const [rotates, setRotates] = useState<number[]>([]);
  const [imagesLoadStatus, setImagesLoadStatus] = useState<number[]>([]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperClass>();
  const transformsRef = useRef<(ReactZoomPanPinchRef | null)[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const isFirstChangeRef = useRef(false);
  const swipeCloseTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const zoomStopTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const slideMovingRef = useRef(false);
  const pinchingRef = useRef(false);
  const metrics = useRef({
    touchStart: {
      dialogY: 0,
      touchY: 0
    },
    touchMove: {
      prevTouchY: 0
    }
  });

  const handleScale = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    setCurrentScale(scale);
    pinchingRef.current = true;
  };

  const handleZoomStop = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    zoomStopTimerRef.current = setTimeout(() => {
      setCurrentScale(scale < 1 ? 1 : scale);
      slideMovingRef.current = false;
      pinchingRef.current = false;
    }, 200);
  };

  const handlePinching = () => {
    pinchingRef.current = true;
  };

  const handleLoad = (index: number) => () => {
    const currentTransformRef = transformsRef.current[index];

    setImagesLoadStatus((prevState) => [...prevState, index]);

    if (currentTransformRef) {
      currentTransformRef.resetTransform();
    }
  };

  const handleSlideNextTransitionStart = () => {
    slideMovingRef.current = true;
    transformsRef.current.forEach((ref) => {
      if (ref) {
        ref.resetTransform();
      }
    });
  };

  const handleSlideMove = () => {
    slideMovingRef.current = true;
  };

  const handleSlideMoveEnd = () => {
    slideMovingRef.current = false;
  };

  const handleSlideChange = (swiper: SwiperClass) => {
    const { realIndex } = swiper;
    // TODO loop 활성화 시, 간헐적으로 realIndex 싱크가 맞지 않는 문제가 있는데 이유를 찾지 못함, 임시방편 조치
    let newRealIndex = realIndex;

    if (!isFirstChangeRef.current && newRealIndex !== syncIndex) {
      newRealIndex -= 1;
    }
    isFirstChangeRef.current = true;

    setCurrentIndex(newRealIndex);
    setCurrentScale(1);
    slideMovingRef.current = false;
    pinchingRef.current = false;

    if (typeof onChange === 'function') {
      onChange({ ...swiper, realIndex: newRealIndex });
    }
  };

  // https://blog.mathpresso.com/bottom-sheet-for-web-55ed6cc78c00
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!dialogRef.current || currentScale !== 1 || slideMovingRef.current || pinchingRef.current)
      return;

    if (swipeCloseTimerRef.current) {
      clearTimeout(swipeCloseTimerRef.current);
    }

    const { touchStart } = metrics.current;

    touchStart.dialogY = dialogRef.current.getBoundingClientRect().y;
    touchStart.touchY = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!dialogRef.current || currentScale !== 1 || slideMovingRef.current || pinchingRef.current)
      return;

    if (swipeCloseTimerRef.current) {
      clearTimeout(swipeCloseTimerRef.current);
    }

    const { touchStart, touchMove } = metrics.current;
    const currentTouch = e.touches[0];

    if (touchMove.prevTouchY === undefined) {
      touchMove.prevTouchY = touchStart.touchY;
    }

    const touchOffset = currentTouch.clientY - touchStart.touchY;
    let nextDialogY = touchStart.dialogY + touchOffset;

    if (nextDialogY <= 0) {
      nextDialogY = 0;
    }

    dialogRef.current.style.setProperty('transition', 'transform .2s');
    dialogRef.current.style.setProperty('transform', `translateY(${nextDialogY}px)`);
  };

  const handleTouchEnd = () => {
    if (!dialogRef.current || currentScale !== 1 || slideMovingRef.current || pinchingRef.current)
      return;
    const currentDialogY = dialogRef.current.getBoundingClientRect().y;

    if (currentDialogY > 10) {
      dialogRef.current.style.setProperty('transform', 'translateY(120%)');
      swipeCloseTimerRef.current = setTimeout(() => onClose(), 150);
    } else {
      dialogRef.current.removeAttribute('style');
    }

    metrics.current = {
      touchStart: {
        dialogY: 0,
        touchY: 0
      },
      touchMove: {
        prevTouchY: 0
      }
    };
  };

  const handleClickZoomIn = () => {
    if (name) {
      logEvent(attrKeys.legitResult.CLICK_THUMBPIC_BTN, {
        name,
        att: 'ZOOMIN'
      });
    }

    const currentTransformRef = transformsRef.current[currentIndex];

    if (currentTransformRef) {
      setShortSwipes(false);
      setFollowFinger(false);
      setPanningDisabled(false);
      pinchingRef.current = true;
      currentTransformRef.zoomIn();
    }
  };

  const handleClickZoomOut = () => {
    if (name) {
      logEvent(attrKeys.legitResult.CLICK_THUMBPIC_BTN, {
        name,
        att: 'ZOOMOUT'
      });
    }

    const currentTransformRef = transformsRef.current[currentIndex];

    if (currentTransformRef) {
      const { scale } = currentTransformRef.state;

      currentTransformRef.zoomOut();

      if (Math.floor(scale) <= 1) {
        slideMovingRef.current = false;
        pinchingRef.current = false;
        setCurrentScale(1);
        setShortSwipes(true);
        setFollowFinger(true);
        setPanningDisabled(true);
      } else {
        slideMovingRef.current = true;
        pinchingRef.current = true;
        setShortSwipes(false);
        setFollowFinger(false);
        setPanningDisabled(false);
      }
    }
  };

  const handleClickRotate = () => {
    if (name) {
      logEvent(attrKeys.legitResult.CLICK_THUMBPIC_BTN, {
        name,
        att: 'ROTATE'
      });
    }

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
    });
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
      setCurrentScale(1);
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

  useEffect(() => {
    return () => {
      if (swipeCloseTimerRef.current) {
        clearTimeout(swipeCloseTimerRef.current);
      }
      if (zoomStopTimerRef.current) {
        clearTimeout(zoomStopTimerRef.current);
      }
    };
  }, []);

  return (
    <Dialog
      ref={dialogRef}
      fullScreen
      open={open}
      onClose={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
            top: (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0) + 20,
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
        onSlideNextTransitionEnd={handleSlideMoveEnd}
        onSlideResetTransitionEnd={handleSlideMoveEnd}
        onSliderMove={handleSlideMove}
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
                  onZoomStop={handleZoomStop}
                  onZoom={handlePinching}
                  onZoomStart={handlePinching}
                  doubleClick={{
                    mode: 'reset'
                  }}
                  minScale={0.5}
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
      <ZoomOutButton
        variant="contained"
        brandColor="black"
        size="large"
        startIcon={<Icon name="MinusOutlined" />}
        iconOnly
        onClick={handleClickZoomOut}
      />
      <ZoomInButton
        variant="contained"
        brandColor="black"
        size="large"
        startIcon={<Icon name="PlusOutlined" />}
        iconOnly
        onClick={handleClickZoomIn}
      />
      <Pagination>
        {currentIndex + 1}/{images.length}
      </Pagination>
      <RotateButton
        variant="contained"
        brandColor="black"
        size="large"
        startIcon={
          // TODO UI 라이브러리 아이콘 업데이트 필요
          <svg
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.000135422 4.96498C0.00846863 4.87488 0.0230522 4.7853 0.0246143 4.69519C0.0371151 3.72696 0.0433655 2.75926 0.0589905 1.79103C0.0673237 1.28061 0.331385 0.935298 0.774614 0.825402C1.31837 0.690506 1.86993 1.06134 1.91368 1.61915C1.94128 1.97384 1.9168 2.33321 1.91628 2.68999C1.91628 3.05874 1.91628 3.42748 1.91628 3.82436C1.97566 3.77592 2.01993 3.74415 2.05951 3.70717C3.7767 2.11759 5.79441 1.17905 8.11993 0.903006C13.3413 0.283735 18.2798 3.64728 19.6027 8.75092C20.3251 11.5369 19.9642 14.1962 18.5678 16.7134C18.2913 17.2119 17.7434 17.3837 17.2746 17.1259C16.8069 16.8686 16.6517 16.3103 16.9319 15.8119C17.6715 14.4952 18.0788 13.0863 18.0856 11.5754C18.1022 7.69207 15.7481 4.39728 12.0767 3.13946C8.85222 2.03478 5.16993 2.99259 2.88555 5.53009C2.86003 5.55821 2.83659 5.58842 2.78034 5.65613C2.89649 5.65613 2.97514 5.65717 3.0543 5.65613C3.98347 5.64571 4.91211 5.6254 5.84128 5.62696C6.49441 5.62801 6.93503 6.28582 6.69597 6.88894C6.54493 7.27019 6.24753 7.48374 5.84076 7.48998C4.19753 7.51551 2.55378 7.53061 0.910032 7.54259C0.519928 7.54519 0.201178 7.30457 0.0600319 6.93842C0.0418015 6.89103 0.0204468 6.84467 0.00117683 6.7978C0.00117683 6.18686 0.00117683 5.57644 0.00117683 4.96551L0.000135422 4.96498Z"
              fill={common.uiWhite}
            />
          </svg>
        }
        iconOnly
        onClick={handleClickRotate}
      />
    </Dialog>
  );
}

export default ImageDetailDialog;
