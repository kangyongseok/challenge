import { useEffect, useRef, useState } from 'react';

import { throttle } from 'lodash-es';

function useTouchScrollTrigger(trigger = true, delay = 50) {
  const [touchTriggered, setTouchTriggered] = useState(true);
  const startTargetRef = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    startTargetRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = throttle((e: TouchEvent) => {
    setTouchTriggered(e.targetTouches[0].clientY > startTargetRef.current);
  }, delay);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchmove', handleTouchMove, false);
  }, [trigger, delay, handleTouchMove]);

  return touchTriggered;
}

export default useTouchScrollTrigger;
