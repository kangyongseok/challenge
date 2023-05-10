import type { Variant } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/react';

export const StyledAccordion = styled.div`
  position: relative;
  display: grid;
  overflow: hidden;
  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const Summary = styled.div<{ variant: Variant }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 12px 16px;
  grid-column-start: 1;
  grid-row-start: 1;
  border-radius: 8px;
  cursor: pointer;

  ${({
    theme: {
      palette: { common }
    },
    variant
  }): CSSObject => {
    let cssObject: CSSObject;

    switch (variant) {
      case 'outline': {
        cssObject = {
          backgroundColor: common.uiWhite,
          '&:after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: '1px',
            background: '#f2f2f2'
          }
        };

        break;
      }
      case 'solid': {
        cssObject = {
          backgroundColor: '#f2f2f2'
        };

        break;
      }
      default: {
        cssObject = {};

        break;
      }
    }

    return cssObject;
  }}
`;

export const Details = styled.div<{ expanded: boolean }>`
  grid-column-start: 1;
  grid-row-start: 2;
  overflow: hidden;
  max-height: ${({ expanded }) => (expanded ? 9000 : 0)}px;
  padding: ${({ expanded }) => (expanded ? '10px 16px' : '0px 16px')};
  cursor: unset;
  transition: padding 0.2s ease-in-out, background-color 0.2s ease-in-out;
`;
