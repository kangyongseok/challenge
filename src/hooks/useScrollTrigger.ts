import { RefObject, useEffect, useRef, useState } from 'react';

import throttle from 'lodash-es/throttle';

interface UseScrollTriggerProps<T> {
  ref: RefObject<T>;
  additionalOffsetTop?: number;
  delay?: number;
}

export default function useScrollTrigger<T extends HTMLElement>({
  ref,
  additionalOffsetTop = 0,
  delay = 50
}: UseScrollTriggerProps<T>) {
  const [triggered, setTriggered] = useState<boolean>(false);
  const triggeredRef = useRef(false);
  const triggeredTopRef = useRef(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!ref || !ref.current) return;

      const { top = 0 } = ref.current.getBoundingClientRect();
      const { scrollY } = window;
      const { scrollTop } = document.documentElement;

      const offsetTop = top + scrollY;

      if (offsetTop + additionalOffsetTop < scrollTop && !triggeredRef.current) {
        setTriggered(true);
        triggeredRef.current = true;
        triggeredTopRef.current = offsetTop;
      } else if (
        scrollTop <= 0 ||
        (scrollTop <= triggeredTopRef.current - Math.abs(additionalOffsetTop) &&
          triggeredRef.current)
      ) {
        setTriggered(false);
        triggeredRef.current = false;
        triggeredTopRef.current = 0;
      }
    }, delay);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [additionalOffsetTop, delay, ref]);

  return triggered;
}
