import { PropsWithChildren, RefObject, useEffect, useRef, useState } from 'react';

import type { CustomStyle } from 'mrcamel-ui';

import { PortalConsumer } from '@provider/PortalProvider';

import { Backdrop, Spotlight } from './OnBoardingSpotlight.styles';

interface OnBoardingSpotlightProps<T> {
  open: boolean;
  onClose: () => void;
  targetRef: RefObject<T>;
  customSpotlightPosition?: {
    width?: number;
    height?: number;
    top?: number;
    left?: number;
  };
  customStyle?: CustomStyle;
}

function OnBoardingSpotlight({
  children,
  open,
  onClose,
  targetRef,
  customSpotlightPosition,
  customStyle
}: PropsWithChildren<OnBoardingSpotlightProps<HTMLElement>>) {
  const [offsetTop, setOffSetTop] = useState(0);
  const [offsetLeft, setOffSetLeft] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);

  const [backdropOpen, setBackdropOpen] = useState(false);

  const backdropOpenTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (targetRef.current) {
      const { clientWidth, clientHeight } = targetRef.current;
      const { scrollY, scrollX } = window;
      const { top, left } = targetRef.current.getBoundingClientRect();
      const {
        width = 0,
        height = 0,
        top: spotlightTop = 0,
        left: spotlightLeft = 0
      } = customSpotlightPosition || {};
      setOffSetTop(top + scrollY + spotlightTop);
      setOffSetLeft(left + scrollX + spotlightLeft);
      setTargetWidth(clientWidth + width);
      setTargetHeight(clientHeight + height);
    }
  }, [open, targetRef, customSpotlightPosition]);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden';

      if (backdropOpenTimerRef.current) {
        clearTimeout(backdropOpenTimerRef.current);
      }

      backdropOpenTimerRef.current = setTimeout(() => setBackdropOpen(true), 100);
    }

    return () => {
      if (backdropOpenTimerRef.current) {
        clearTimeout(backdropOpenTimerRef.current);
      }
      document.documentElement.removeAttribute('style');
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (backdropOpenTimerRef.current) {
        clearTimeout(backdropOpenTimerRef.current);
      }
      document.documentElement.removeAttribute('style');
    };
  }, []);

  if (open) {
    return (
      <PortalConsumer>
        <Backdrop backdropOpen={backdropOpen} onClick={onClose}>
          <Spotlight
            offsetTop={offsetTop}
            offsetLeft={offsetLeft}
            targetWidth={targetWidth}
            targetHeight={targetHeight}
            css={customStyle}
          />
        </Backdrop>
        {children}
      </PortalConsumer>
    );
  }

  return null;
}

export default OnBoardingSpotlight;
