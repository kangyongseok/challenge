import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect, useRef } from 'react';

import { useRecoilState } from 'recoil';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { activeViewportTrickState } from '@recoil/common';
import useViewportUnitsTrick from '@hooks/useViewportUnitsTrick';

interface FlexibleTemplateProps {
  header?: ReactElement;
  footer?: ReactElement;
  disablePadding?: boolean;
  customStyle?: CustomStyle;
}

function FlexibleTemplate({
  children,
  header,
  footer,
  disablePadding,
  customStyle
}: PropsWithChildren<FlexibleTemplateProps>) {
  const [activeViewportTrick, setActiveViewportTrickState] =
    useRecoilState(activeViewportTrickState);

  useViewportUnitsTrick(!activeViewportTrick);

  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActiveViewportTrickState(true);
  }, [setActiveViewportTrickState]);

  useEffect(() => {
    if (contentRef.current) {
      window.flexibleContent = contentRef.current;
    }
  }, []);

  return (
    <Wrapper activeViewportTrick={activeViewportTrick} css={customStyle}>
      {header}
      <Content ref={contentRef} disablePadding={disablePadding}>
        {children}
      </Content>
      {footer}
    </Wrapper>
  );
}

const Wrapper = styled.div<{ activeViewportTrick: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${({ activeViewportTrick }) => (activeViewportTrick ? '100vh' : '100%')};
  ${({ activeViewportTrick }): CSSObject =>
    activeViewportTrick
      ? {
          height: 'calc((var(--vh, 1vh) * 100))'
        }
      : {}};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
`;

const Content = styled.main<{ disablePadding?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  overscroll-behavior: none;
  padding: ${({ disablePadding }) => (!disablePadding ? '0 20px' : '')};

  @media (max-width: 320px) {
    padding: ${({ disablePadding }) => (!disablePadding ? '0 16px' : '')};
  }
`;

export default FlexibleTemplate;
