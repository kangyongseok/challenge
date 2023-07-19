import { useEffect, useRef, useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';

import { inputFocusState } from '@recoil/common';

export default function useSafariInputFocus() {
  const inputFocus = useRecoilValue(inputFocusState);
  const resetInputFocusState = useResetRecoilState(inputFocusState);

  const [height, setHeight] = useState(0);

  const syncHeightRef = useRef(0);
  const isFocusingRef = useRef(false);
  const focusDurationTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (inputFocus) {
      isFocusingRef.current = true;

      if (focusDurationTimerRef.current) {
        clearTimeout(focusDurationTimerRef.current);
      }

      if (syncHeightRef.current) setHeight(syncHeightRef.current);

      focusDurationTimerRef.current = setTimeout(() => {
        const newHeight = window.innerHeight - (window?.visualViewport?.height || 0);

        setHeight(newHeight);
        syncHeightRef.current = newHeight;
        isFocusingRef.current = false;
      }, 600); // Safari Keyboard Open Animation Duration + 100
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
    const handleResize = () => {
      const newHeight = window.innerHeight - (window?.visualViewport?.height || 0);

      if (!newHeight) return;

      setHeight(newHeight);
      syncHeightRef.current = newHeight;
    };

    window?.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window?.visualViewport?.removeEventListener('resize', handleResize);
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
