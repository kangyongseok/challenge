import { Label } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const LabelDivider = styled.hr`
  height: 7px;
  width: 1px;
  margin: auto 0;
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.light};
  z-index: 1;
`;

export const CustomLabel = styled(Label)<{ isSingle: boolean }>`
  border-radius: ${({ isSingle }) => (isSingle ? 4 : 0)}px;

  :first-of-type {
    border-radius: ${({ isSingle }) => !isSingle && '4px 0 0 4px'};
  }
  :not(:first-of-type) {
    margin-left: -1px;
  }
  :last-of-type {
    border-radius: ${({ isSingle }) => !isSingle && '0 4px 4px 0'};
  }
`;
