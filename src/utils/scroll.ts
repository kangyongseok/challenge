/* eslint-disable @typescript-eslint/ban-ts-comment */

import { checkAgent } from '@utils/common';

const originalStyle = {
  html: typeof document !== 'undefined' ? { ...document.documentElement.style } : undefined,
  body: typeof document !== 'undefined' ? { ...document.body.style } : undefined,
  top: 0
};

let lockedNum = 0;

export const scrollDisable = () => {
  const $html = document.documentElement;
  const $body = document.body;

  if (lockedNum === 0) {
    const scrollTop = $html.scrollTop || $body.scrollTop;

    originalStyle.body = { ...$body.style };
    originalStyle.html = { ...$html.style };
    originalStyle.top = scrollTop;

    if (
      checkAgent.isAllMobileWeb(
        (typeof window !== 'undefined' && window.navigator.userAgent) || undefined
      )
    ) {
      $html.style.height = '100%';
      $html.style.overflow = 'hidden';
      $body.style.top = `-${scrollTop}px`;
      $body.style.width = '100vw';
      $body.style.height = 'auto';
      $body.style.position = 'fixed';
    } else {
      const scrollBarWidth = window.innerWidth - $body.clientWidth;

      $body.style.paddingRight = `${scrollBarWidth}px`;
    }

    $body.style.overflow = 'hidden';
    // @ts-ignore
    $body.style['-webkit-overflow-scrolling'] = 'none';
    $body.style.touchAction = 'none';

    lockedNum += 1;
  }
};

export const scrollEnable = () => {
  if (lockedNum !== 1) return;

  lockedNum -= 1;

  const $html = document.documentElement;
  const $body = document.body;

  if (
    checkAgent.isAllMobileWeb(
      (typeof window !== 'undefined' && window.navigator.userAgent) || undefined
    )
  ) {
    $html.style.height = originalStyle.html?.height || '';
    $html.style.overflow = originalStyle.html?.overflow || '';

    ['top', 'width', 'height', 'overflow', 'position'].forEach((x) => {
      // @ts-ignore
      $body.style[x] = originalStyle.body[x] || '';
    });
  } else {
    ['overflow', 'boxSizing', 'paddingRight'].forEach((x) => {
      // @ts-ignore
      $body.style[x] = originalStyle.body[x] || '';
    });
  }

  $body.style.removeProperty('-webkit-overflow-scrolling');
  $body.style.removeProperty('touch-action');

  window.scrollTo(0, originalStyle.top);
};

export function getCenterScrollLeft({
  scrollWidth,
  clientWidth,
  targetOffsetLeft,
  targetClientWidth
}: {
  scrollWidth: number;
  clientWidth: number;
  targetOffsetLeft: number;
  targetClientWidth: number;
}) {
  const targetLeft = targetOffsetLeft + targetClientWidth / 2;
  let scrollLeft = 0;

  if (targetLeft <= clientWidth / 2) {
    scrollLeft = 0;
  } else if (scrollWidth - targetLeft <= clientWidth / 2) {
    scrollLeft = scrollWidth - clientWidth;
  } else {
    scrollLeft = targetLeft - clientWidth / 2;
  }

  return scrollLeft;
}

export function scrollCenterIndex(scrollAreaEl: HTMLDivElement, target: HTMLButtonElement) {
  let position = 0;
  const el = scrollAreaEl;
  const listHeight = el.scrollHeight;
  const halfHeight = el.clientHeight / 2;
  const targetTop = target.offsetTop;
  const selectTargetPos = targetTop + 30 / 2;
  if (selectTargetPos <= halfHeight) {
    position = 0;
  } else if (listHeight - selectTargetPos <= halfHeight) {
    position = listHeight - el.clientHeight;
  } else {
    position = selectTargetPos - halfHeight;
  }
  el.scrollTo(0, position);
}
