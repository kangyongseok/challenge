import { useEffect, useRef, useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';

import { inputFocusState } from '@recoil/common';

export default function useSafariKeyboardFocus() {
  const inputFocus = useRecoilValue(inputFocusState);
  const resetInputFocusState = useResetRecoilState(inputFocusState);

  const [height, setHeight] = useState(0);
  const [isKeyboardFocusing, setIsKeyboardFocusing] = useState(false);
  const prevCalcHeightRef = useRef(0);

  const keyboardFocusDurationTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const heightSyncIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const keyboardFocusScrollYRef = useRef(0);

  useEffect(() => {
    if (inputFocus) {
      if (keyboardFocusDurationTimerRef.current) {
        clearTimeout(keyboardFocusDurationTimerRef.current);
      }

      setHeight(prevCalcHeightRef.current);
      setIsKeyboardFocusing(true);

      keyboardFocusDurationTimerRef.current = setTimeout(() => {
        const newHeight = window.innerHeight - (window?.visualViewport?.height || 0);
        setHeight(newHeight);
        prevCalcHeightRef.current = newHeight;
        keyboardFocusScrollYRef.current = window.scrollY;

        // 최초 focus 활성화 시 스크롤 disabled 이벤트 내 로직이 정상 동작하지 않는 문제 대응
        if (!keyboardFocusScrollYRef.current) keyboardFocusScrollYRef.current = 1;

        setIsKeyboardFocusing(false);
      }, 600); // Safari Keyboard Open Animation Duration + 100
    } else {
      setHeight(0);
      keyboardFocusScrollYRef.current = 0;
    }
  }, [inputFocus]);

  useEffect(() => {
    const handleScroll = () => {
      if (!inputFocus) return;

      if (keyboardFocusScrollYRef.current) {
        window.scrollTo({
          top: keyboardFocusScrollYRef.current
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [inputFocus]);

  useEffect(() => {
    if (heightSyncIntervalRef.current) {
      clearInterval(heightSyncIntervalRef.current);
    }

    heightSyncIntervalRef.current = setInterval(() => {
      const newHeight = window.innerHeight - (window?.visualViewport?.height || 0);
      if (newHeight !== height && inputFocus && !isKeyboardFocusing) {
        setHeight(newHeight);
      }
    }, 10);

    return () => {
      if (heightSyncIntervalRef.current) {
        clearInterval(heightSyncIntervalRef.current);
      }
    };
  }, [height, inputFocus, isKeyboardFocusing]);

  useEffect(() => {
    return () => {
      resetInputFocusState();

      if (keyboardFocusDurationTimerRef.current) {
        clearTimeout(keyboardFocusDurationTimerRef.current);
      }
    };
  }, [resetInputFocusState]);

  return {
    height
  };
}
