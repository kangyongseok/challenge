import { useEffect, useRef, useState } from 'react';
import type { ReactElement, TouchEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Box, Icon, light, useTheme } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { getImagePathStaticParser, isExtendedLayoutIOSVersion } from '@utils/common';

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

  const handleClose = () => {
    if (
      typeof onChange === 'function' &&
      swiperRef.current &&
      swiperRef.current.realIndex !== undefined
    ) {
      onChange(swiperRef.current);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleSlideMove = () => {
    if (images.length > 1) slideMovingRef.current = true;
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
      swipeCloseTimerRef.current = setTimeout(() => handleClose(), 50);
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
      onClose={handleClose}
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
      <Box
        customStyle={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0,
          height: HEADER_HEIGHT,
          zIndex: button,
          backgroundColor: common.overlay60
        }}
      >
        {label && (
          <Box
            customStyle={{
              position: 'absolute',
              top: `calc(16px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`,
              left: 16,
              zIndex: button
            }}
          >
            {label}
          </Box>
        )}
        <CloseIcon
          name="CloseOutlined"
          color="cmnW"
          onClick={handleClose}
          customStyle={{ cursor: 'pointer' }}
        />
      </Box>
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
              src={getImagePathStaticParser(image)}
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
        variant="solid"
        brandColor="black"
        size="large"
        startIcon={<Icon name="MinusOutlined" />}
        iconOnly
        onClick={handleClickZoomOut}
      />
      <ZoomInButton
        variant="solid"
        brandColor="black"
        size="large"
        startIcon={<Icon name="PlusOutlined" />}
        iconOnly
        onClick={handleClickZoomIn}
      />
      <RotateButton
        variant="solid"
        brandColor="black"
        size="large"
        startIcon={<Icon name="RotateCcwOutlined" color="uiWhite" />}
        iconOnly
        onClick={handleClickRotate}
      />
    </Dialog>
  );
}

export default ImageDetailDialog;
