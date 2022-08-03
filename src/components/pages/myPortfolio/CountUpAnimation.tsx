import { useEffect, useState } from 'react';

const easeOutQuad = (t: number) => t * (2 - t);
const frameDuration = 1000 / 60;
function CountUpAnimation({
  countProps,
  duration = 2000
}: {
  countProps: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.round(duration / frameDuration);
    const counter = setInterval(() => {
      frame += 1;
      const progress = easeOutQuad(frame / totalFrames);
      setCount(countProps * progress);

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>{Math.floor(count)}</div>;
}

export default CountUpAnimation;
