import { useEffect, useRef, useState } from 'react';

import throttle from 'lodash-es/throttle';

export default function useReverseScrollTrigger(trigger = true, delay = 50) {
  const [triggered, setTriggered] = useState(true);
  const prevScrollYRef = useRef(0);

  const thrHandleScroll = useRef(
    throttle(() => {
      const { scrollY } = window;

      if (scrollY <= 0) {
        setTriggered(true);
      } else if (prevScrollYRef.current > scrollY) {
        setTriggered(true);
      } else if (prevScrollYRef.current < scrollY) {
        setTriggered(false);
      }

      prevScrollYRef.current = scrollY;
    }, delay)
  ).current;

  useEffect(() => {
    if (trigger) {
      window.addEventListener('scroll', thrHandleScroll);
    }

    return () => {
      if (trigger) {
        window.removeEventListener('scroll', thrHandleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return triggered;
}
