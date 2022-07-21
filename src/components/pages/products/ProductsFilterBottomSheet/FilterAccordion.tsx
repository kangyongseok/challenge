import { useState } from 'react';
import type { MouseEvent, PropsWithChildren, ReactElement } from 'react';

import styled from '@emotion/styled';

import Accordion, { AccordionProps } from '@components/UI/molecules/Accordion';

interface FilterAccordionProps
  extends Pick<AccordionProps, 'summary' | 'expandIcon' | 'button' | 'onClickButton'> {
  customButton?: ReactElement;
  changeInterceptor?: (e: MouseEvent<HTMLDivElement>) => void;
}

function FilterAccordion({
  children,
  changeInterceptor,
  onClickButton,
  ...props
}: PropsWithChildren<FilterAccordionProps>) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion
      variant="outlined"
      summaryVariant="body1"
      expanded={expanded}
      changeExpandedStatus={changeInterceptor || (() => setExpanded(!expanded))}
      expandIconGreyColorKey="20"
      onClickButton={onClickButton}
      {...props}
      customStyle={{
        marginBottom: 0,
        padding: '0 20px',
        '& > div:first-of-type': {
          padding: '16px 0',
          borderRadius: 0
        },
        '& > div:last-of-type': {
          margin: '0 -20px',
          padding: 0
        },
        '&:not(:last-child)': {
          marginBottom: 0
        }
      }}
    >
      <Content>{children}</Content>
    </Accordion>
  );
}

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 16px 20px;
  background-color: ${({ theme: { palette } }) => palette.common.grey['98']};
`;

export default FilterAccordion;
