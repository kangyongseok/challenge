import React, { PropsWithChildren, ReactElement } from 'react';
import styled from '@emotion/styled';

interface GeneralTemplateProps {
  header?: ReactElement;
  footer?: ReactElement;
}

function GeneralTemplate({ children, header, footer }: PropsWithChildren<GeneralTemplateProps>) {
  return (
    <Wrapper>
      {header}
      <Content>{children}</Content>
      {footer}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Content = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  overflow-y: auto;

  @media (max-width: 320px) {
    padding: 0 16px;
  }
`;

export default GeneralTemplate;
