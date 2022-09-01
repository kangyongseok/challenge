import { useMemo } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import ABTest from '@library/abTest';

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
