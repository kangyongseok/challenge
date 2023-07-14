import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren, RefObject } from 'react';

import { useRecoilValue } from 'recoil';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import { scrollEnable } from '@utils/scroll';

import { showAppDownloadBannerState } from '@recoil/common';

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

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useEffect(() => {
    if (open && targetRef.current) {
      const { clientWidth, clientHeight } = targetRef.current;
      const { top, left } = targetRef.current.getBoundingClientRect();
      const {
        width = 0,
        height = 0,
        top: spotlightTop = 0,
        left: spotlightLeft = 0
      } = customSpotlightPosition || {};
      setOffSetTop(top - height / 2 + spotlightTop);
      setOffSetLeft(left - width / 2 + spotlightLeft);
      setTargetWidth(clientWidth + width);
      setTargetHeight(clientHeight + height);
    }
  }, [open, targetRef, customSpotlightPosition, showAppDownloadBanner]);

  useEffect(() => {
    const handleResizeAndScroll = () => {
      if (targetRef.current) {
        const { clientWidth, clientHeight } = targetRef.current;
        const { top, left } = targetRef.current.getBoundingClientRect();
        const {
          width = 0,
          height = 0,
          top: spotlightTop = 0,
          left: spotlightLeft = 0
        } = customSpotlightPosition || {};
        setOffSetTop(top - height / 2 + spotlightTop);
        setOffSetLeft(left - width / 2 + spotlightLeft);
        setTargetWidth(clientWidth + width);
        setTargetHeight(clientHeight + height);
      }
    };

    window.addEventListener('resize', handleResizeAndScroll);
    window.addEventListener('scroll', handleResizeAndScroll);

    return () => {
      window.removeEventListener('resize', handleResizeAndScroll);
      window.removeEventListener('scroll', handleResizeAndScroll);
    };
  }, [customSpotlightPosition, targetRef, showAppDownloadBanner]);

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
      scrollEnable();
    };
  }, []);

  if (open) {
    return (
      <>
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
      </>
    );
  }

  return null;
}

export default OnBoardingSpotlight;
