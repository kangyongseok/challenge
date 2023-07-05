import { useEffect, useRef, useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';

import { inputFocusState } from '@recoil/common';

export default function useSafariInputFocus() {
  const inputFocus = useRecoilValue(inputFocusState);
  const resetInputFocusState = useResetRecoilState(inputFocusState);

  const [height, setHeight] = useState(0);

  const syncHeightRef = useRef(0);
  const isFocusingRef = useRef(true);
  const focusDurationTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const heightSyncIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (inputFocus) {
      isFocusingRef.current = true;

      if (focusDurationTimerRef.current) {
        clearTimeout(focusDurationTimerRef.current);
      }

      if (syncHeightRef.current) setHeight(syncHeightRef.current);

      focusDurationTimerRef.current = setTimeout(
        () => {
          let newHeight = window.innerHeight - (window?.visualViewport?.height || 0);

          if (!newHeight) newHeight = window.scrollY;

          setHeight(newHeight);
          syncHeightRef.current = newHeight;
          isFocusingRef.current = false;
          initializedRef.current = true;
        },
        initializedRef.current ? 600 : 1000
      ); // Safari Keyboard Open Animation Duration + 100
    } else {
      setHeight(0);
    }
  }, [inputFocus]);

  useEffect(() => {
    const handleScroll = () => {
      if (!inputFocus || !height || isFocusingRef.current) return;

      window.scrollTo({
        top: height
      });

      const inputs = document.getElementsByTagName('input');
      const textAreas = document.getElementsByTagName('textarea');

      [...Array.from(inputs), ...Array.from(textAreas)].forEach((input) => {
        input.blur();
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [inputFocus, height]);

  useEffect(() => {
    if (heightSyncIntervalRef.current) {
      clearInterval(heightSyncIntervalRef.current);
    }

    heightSyncIntervalRef.current = setInterval(() => {
      let newHeight = window.innerHeight - (window?.visualViewport?.height || 0);

      if (!newHeight) newHeight = window.scrollY;

      if (newHeight !== height && height && inputFocus && !isFocusingRef.current) {
        setHeight(newHeight);
        syncHeightRef.current = newHeight;
      }
    }, 10);

    return () => {
      if (heightSyncIntervalRef.current) {
        clearInterval(heightSyncIntervalRef.current);
      }
    };
  }, [height, inputFocus]);

  useEffect(() => {
    return () => {
      resetInputFocusState();

      if (focusDurationTimerRef.current) {
        clearTimeout(focusDurationTimerRef.current);
      }
    };
  }, [resetInputFocusState]);

  return {
    height
  };
}
