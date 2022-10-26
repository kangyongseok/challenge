import { useEffect, useRef, useState } from 'react';

import throttle from 'lodash-es/throttle';

export default function useReverseScrollTrigger(trigger = true, delay = 50) {
  const [triggered, setTriggered] = useState(true);
  const prevScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const { scrollY } = window;
      const iosScrollBounceBlock = document.body.scrollHeight - window.innerHeight > scrollY;
      if (iosScrollBounceBlock) {
        if (scrollY <= 0) {
          setTriggered(true);
        } else if (prevScrollYRef.current > scrollY) {
          setTriggered(true);
        } else if (prevScrollYRef.current < scrollY) {
          setTriggered(false);
        }
        prevScrollYRef.current = scrollY;
      }
    }, delay);

    if (trigger) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (trigger) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [trigger, delay]);

  return triggered;
}
