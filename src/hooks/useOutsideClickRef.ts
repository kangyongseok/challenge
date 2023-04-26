import { useCallback, useEffect, useRef, useState } from 'react';

export type CallbackRef = (node: HTMLElementOrNull) => void;

export type HTMLElementOrNull = HTMLElement | null;

function useOutsideClickRef(
  handler: (e: MouseEvent | TouchEvent) => void,
  when = true
): [CallbackRef] {
  const savedHandler = useRef(handler);

  const [node, setNode] = useState<HTMLElementOrNull>(null);

  const memoizedCallback = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (node && !node.contains(e.target as Element)) {
        savedHandler.current(e);
      }
    },
    [node]
  );

  useEffect(() => {
    savedHandler.current = handler;
  });

  const ref = useCallback((el: HTMLElementOrNull) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (when) {
      document.addEventListener('click', memoizedCallback, true);
      document.addEventListener('mouseout', memoizedCallback, true);
    }

    return () => {
      if (when) {
        document.removeEventListener('click', memoizedCallback, true);
        document.removeEventListener('mouseout', memoizedCallback, true);
      }
    };
  }, [when, memoizedCallback]);

  return [ref];
}

export default useOutsideClickRef;
