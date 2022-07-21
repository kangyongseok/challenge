/* eslint-disable @typescript-eslint/ban-ts-comment */

import { isMobileBrowser } from '@utils/common';

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

    if (isMobileBrowser()) {
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

  if (isMobileBrowser()) {
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
