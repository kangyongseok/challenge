import { useMemo } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { logEvent } from '@library/amplitude';
import ABTest from '@library/abTest';

import { getCookie, setCookie } from '@utils/common';

import type { ABTestBelong } from '@typings/common';

interface ABTestProviderProps {
  identifier?: Record<string, number>;
}

function ABTestProvider({ children, identifier = {} }: PropsWithChildren<ABTestProviderProps>) {
  useMemo(() => {
    if (Object.keys(identifier).length) ABTest.setIdentifier(identifier);
  }, [identifier]);
  return children as ReactElement;
}

export function ABTestCookie({ name, cookieName }: { name: string; cookieName: string }) {
  if (getCookie(cookieName)) return;
  const postfix = ABTest.getPostfix(name) as { A: string; B: string };
  if (ABTest.getBelong(name) === 'A') {
    logEvent(postfix.A as string);
    setCookie(cookieName, 'true', 1);
  } else {
    logEvent(postfix.B as string);
    setCookie(cookieName, 'false', 1);
  }
}

export function ABTestGroup({
  children,
  name,
  belong
}: PropsWithChildren<{ name: string; belong: ABTestBelong }>) {
  if (ABTest.getBelong(name) === belong) {
    return children as ReactElement;
  }
  return null;
}

export default ABTestProvider;
