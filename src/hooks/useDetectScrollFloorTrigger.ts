import { useEffect, useState } from 'react';

// TODO scroll container element 지정이 가능하도록, isFloor 의 목표치를 조정할 수 있도록 구현
export default function useDetectScrollFloorTrigger() {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const handleScroll = async () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      const isFloor = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if (isFloor) {
        setTriggered(true);
      } else {
        setTriggered(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    triggered
  };
}
