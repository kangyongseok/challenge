import { memo, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Box } from '@mrcamelhub/camel-ui';

import { heicToBlob } from '@utils/common';

import { Img, LoadingIcon } from './ImageDetailDialog.styles';

interface ImageTransformProps {
  transformsRef: MutableRefObject<(ReactZoomPanPinchRef | null)[]>;
  src: string;
  rotate: number;
  index: number;
  disablePanning: boolean;
  onZoomStart: () => void;
  onZoomStop: () => void;
  onChangeSwiperOption: (active: boolean) => void;
  onImageLoad: () => void;
}

function ImageTransform({
  transformsRef,
  src,
  rotate,
  index,
  disablePanning,
  onZoomStart,
  onZoomStop,
  onChangeSwiperOption,
  onImageLoad
}: ImageTransformProps) {
  const [panningDisabled, setPanningDisabled] = useState(true);
  const [currentScale, setCurrentScale] = useState(1);
  const [newSrc, setNewSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const zoomStopTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleScale = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    setCurrentScale(scale);
  };

  const handleZoomStart = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    setCurrentScale(scale);
    onZoomStart();
    onChangeSwiperOption(false);
  };

  const handleZoom = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    setCurrentScale(scale);
    onZoomStart();
    onChangeSwiperOption(false);
  };

  const handleZoomStop = ({ state: { scale } }: ReactZoomPanPinchRef) => {
    zoomStopTimerRef.current = setTimeout(() => {
      setCurrentScale(scale <= 1 ? 1 : scale);
      onZoomStop();
      if (scale <= 1) onChangeSwiperOption(true);
      zoomStopTimerRef.current = undefined;
    }, 200);
  };

  const handleError = () => {
    setIsLoading(true);
    heicToBlob(
      src.replace(
        /https:\/\/static.mrcamel.co.kr\//g,
        'https://mrcamel.s3.ap-northeast-2.amazonaws.com/'
      ),
      'image'
    ).then((response) => {
      setNewSrc(response || '');
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (currentScale > 1) {
      setPanningDisabled(false);
    } else {
      setPanningDisabled(true);
    }
  }, [currentScale]);

  useEffect(() => {
    setPanningDisabled(disablePanning);
  }, [disablePanning]);

  useEffect(() => {
    return () => {
      if (zoomStopTimerRef.current) {
        clearTimeout(zoomStopTimerRef.current);
      }
    };
  }, []);

  return (
    <TransformWrapper
      ref={(ref) => {
        if (ref) {
          // eslint-disable-next-line no-param-reassign
          transformsRef.current[index] = ref;
        }
      }}
      panning={{ disabled: panningDisabled }}
      onPanning={handleScale}
      onWheel={handleScale}
      onPinching={handleScale}
      onZoomStart={handleZoomStart}
      onZoom={handleZoom}
      onZoomStop={handleZoomStop}
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
        {isLoading && (
          <Box
            customStyle={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
          >
            <LoadingIcon width={50} height={50} name="LoadingFilled" color="uiWhite" />
          </Box>
        )}
        <Img
          ref={imageRef}
          src={newSrc || src}
          alt="Transform Img"
          rotate={rotate}
          onLoad={onImageLoad}
          onError={handleError}
          isLoading={isLoading}
        />
      </TransformComponent>
    </TransformWrapper>
  );
}

export default memo(ImageTransform);
