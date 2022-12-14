import { memo, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

import { Img } from './ImageDetailDialog.styles';

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
        <Img ref={imageRef} src={src} alt="Transform Img" rotate={rotate} onLoad={onImageLoad} />
      </TransformComponent>
    </TransformWrapper>
  );
}

export default memo(ImageTransform);
