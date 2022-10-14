import { useEffect, useState } from 'react';
import type { MouseEvent, PropsWithChildren, ReactElement } from 'react';

import styled from '@emotion/styled';

import Accordion, { AccordionProps } from '@components/UI/molecules/Accordion';

interface FilterAccordionProps
  extends Pick<
    AccordionProps,
    'summary' | 'expanded' | 'expandIcon' | 'button' | 'onClickButton' | 'showExpandIcon'
  > {
  customButton?: ReactElement;
  changeInterceptor?: (e: MouseEvent<HTMLDivElement>) => void;
}

function FilterAccordion({
  children,
  changeInterceptor,
  onClickButton,
  expanded,
  ...props
}: PropsWithChildren<FilterAccordionProps>) {
  const [newExpanded, setNewExpanded] = useState(false);

  useEffect(() => setNewExpanded(expanded), [expanded]);

  return (
    <Accordion
      variant="outlined"
      summaryVariant="body1"
      expanded={newExpanded}
      changeExpandedStatus={changeInterceptor || (() => setNewExpanded(!newExpanded))}
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
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui98};
`;

export default FilterAccordion;
