import React, { PropsWithChildren, ReactElement } from 'react';
import styled from '@emotion/styled';

interface GeneralTemplateProps {
  header?: ReactElement;
  footer?: ReactElement;
}

function GeneralTemplate({ children, header, footer }: PropsWithChildren<GeneralTemplateProps>) {
  return (
    <Wrapper>
      {header && <Header>{header}</Header>}
      <Content>{children}</Content>
      {footer && <Footer>{footer}</Footer>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Header = styled.header``;

const Content = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Footer = styled.footer``;

export default GeneralTemplate;
