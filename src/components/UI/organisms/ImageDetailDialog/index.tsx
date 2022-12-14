import { useEffect, useRef, useState } from 'react';
import type { ReactElement, TouchEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Box, Dialog, Icon, light, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import ImageTransform from './ImageTransform';
import {
  CloseIcon,
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
      palette: { common },
      zIndex: { button }
    }
  } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(syncIndex);
  const [rotates, setRotates] = useState<number[]>([]);
  const [shortSwipes, setShortSwipes] = useState(true);
  const [followFinger, setFollowFinger] = useState(true);
  const [panningDisabled, setPanningDisabled] = useState(true);

  const dialogRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperClass>();
  const transformsRef = useRef<(ReactZoomPanPinchRef | null)[]>([]);
  const swipeCloseTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const slideMovingRef = useRef(false);
  const zoomStatusRef = useRef(false);
  const metrics = useRef({
    touchStart: {
      dialogY: 0,
      touchY: 0
    },
    touchMove: {
      prevTouchY: 0
    }
  });

  const handleSlideMove = () => {
    slideMovingRef.current = true;
  };

  const handleSlideMoveEnd = () => {
    slideMovingRef.current = false;
  };

  const handleSlideChange = (swiper: SwiperClass) => {
    const { realIndex, previousIndex } = swiper;

    setCurrentIndex(realIndex);
    setShortSwipes(true);
    setFollowFinger(true);
    setPanningDisabled(true);
    slideMovingRef.current = false;
    zoomStatusRef.current = false;

    const previousTransformRef = transformsRef.current[previousIndex];

    if (previousTransformRef) previousTransformRef.resetTransform();
    if (typeof onChange === 'function') {
      onChange(swiper);
    }
  };

  const handleZoomStart = () => {
    zoomStatusRef.current = true;
  };

  const handleZoomStop = () => {
    slideMovingRef.current = false;
    zoomStatusRef.current = false;
  };

  const handleChangeSwiperOption = (active: boolean) => {
    setShortSwipes(active);
    setFollowFinger(active);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!dialogRef.current || slideMovingRef.current || zoomStatusRef.current) return;

    if (swipeCloseTimerRef.current) {
      clearTimeout(swipeCloseTimerRef.current);
    }

    const { touchStart } = metrics.current;

    touchStart.dialogY = dialogRef.current.getBoundingClientRect().y;
    touchStart.touchY = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!dialogRef.current || slideMovingRef.current || zoomStatusRef.current) return;

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
    if (!dialogRef.current || slideMovingRef.current || zoomStatusRef.current) return;

    const currentDialogY = dialogRef.current.getBoundingClientRect().y;

    if (currentDialogY > 10) {
      dialogRef.current.style.setProperty('transform', 'translateY(120%)');
      swipeCloseTimerRef.current = setTimeout(() => onClose(), 50);
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
      slideMovingRef.current = true;
      zoomStatusRef.current = true;
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
        zoomStatusRef.current = false;
        setShortSwipes(true);
        setFollowFinger(true);
        setPanningDisabled(true);
      } else {
        slideMovingRef.current = true;
        zoomStatusRef.current = true;
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

  const handleLoad = (index: number) => () => {
    const currentTransformRef = transformsRef.current[index];

    if (currentTransformRef) {
      currentTransformRef.resetTransform();
    }
  };

  const handleDoubleClick = () => {
    setShortSwipes(true);
    setFollowFinger(true);
    setPanningDisabled(true);
    slideMovingRef.current = false;
    zoomStatusRef.current = false;
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('contextmenu', handleContextMenu);

    if (!open) window.removeEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [open]);

  useEffect(() => {
    if (open && !rotates.length) {
      setRotates(new Array(images.length).fill(0));
    }
  }, [rotates, images, open]);

  useEffect(() => {
    if (!open) {
      setRotates([]);
      setCurrentIndex(0);
      setShortSwipes(true);
      setFollowFinger(true);
      transformsRef.current = [];
      slideMovingRef.current = false;
      zoomStatusRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (swipeCloseTimerRef.current) {
        clearTimeout(swipeCloseTimerRef.current);
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
      <CloseIcon name="CloseOutlined" color="white" onClick={onClose} />
      <Swiper
        onInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        nested
        shortSwipes={shortSwipes}
        followFinger={followFinger}
        onSlideNextTransitionStart={handleSlideMove}
        onSlideNextTransitionEnd={handleSlideMoveEnd}
        onSlideResetTransitionEnd={handleSlideMoveEnd}
        onSliderMove={handleSlideMove}
        onSlideChange={handleSlideChange}
        onDoubleClick={handleDoubleClick}
        initialSlide={syncIndex}
        style={{
          height: '100%'
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={`image-detail-${image.slice(image.lastIndexOf('/') + 1)}`}
            style={{
              position: 'relative'
            }}
          >
            <ImageTransform
              transformsRef={transformsRef}
              src={image}
              rotate={rotates[index]}
              index={index}
              disablePanning={panningDisabled}
              onZoomStart={handleZoomStart}
              onZoomStop={handleZoomStop}
              onChangeSwiperOption={handleChangeSwiperOption}
              onImageLoad={handleLoad(index)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <Pagination>
        {currentIndex + 1}/{images.length}
      </Pagination>
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
      <RotateButton
        variant="contained"
        brandColor="black"
        size="large"
        startIcon={
          // TODO UI 라이브러리 아이콘 업데이트 필요
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.9999 7.96499C21.9915 7.87488 21.9769 7.7853 21.9754 7.69519C21.9629 6.72696 21.9566 5.75926 21.941 4.79103C21.9327 4.28061 21.6686 3.9353 21.2254 3.8254C20.6816 3.69051 20.1301 4.06134 20.0863 4.61915C20.0587 4.97384 20.0832 5.33321 20.0837 5.68999C20.0837 6.05874 20.0837 6.42749 20.0837 6.82436C20.0243 6.77592 19.9801 6.74415 19.9405 6.70717C18.2233 5.11759 16.2056 4.17905 13.8801 3.90301C8.65872 3.28374 3.72018 6.64728 2.39726 11.7509C1.67486 14.5369 2.0358 17.1962 3.43216 19.7134C3.70872 20.2119 4.25664 20.3837 4.72539 20.1259C5.19309 19.8686 5.3483 19.3103 5.06809 18.8119C4.32851 17.4952 3.92122 16.0863 3.91445 14.5754C3.89778 10.6921 6.25195 7.39728 9.9233 6.13946C13.1478 5.03478 16.8301 5.99259 19.1144 8.53009C19.14 8.55821 19.1634 8.58842 19.2197 8.65613C19.1035 8.65613 19.0249 8.65717 18.9457 8.65613C18.0165 8.64571 17.0879 8.6254 16.1587 8.62696C15.5056 8.62801 15.065 9.28582 15.304 9.88894C15.4551 10.2702 15.7525 10.4837 16.1592 10.49C17.8025 10.5155 19.4462 10.5306 21.09 10.5426C21.4801 10.5452 21.7988 10.3046 21.94 9.93842C21.9582 9.89103 21.9796 9.84467 21.9988 9.7978C21.9988 9.18686 21.9988 8.57644 21.9988 7.96551L21.9999 7.96499Z"
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
