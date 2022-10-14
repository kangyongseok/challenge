import styled from '@emotion/styled';

export const Divider = styled.hr<{ active?: boolean }>`
  margin-top: 32px;
  border-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui90};
  border-color: ${({
    theme: {
      palette: { primary }
    },
    active
  }) => active && primary.main};
  border-top-width: ${({ active }) => (active ? 2 : 1)}px;
`;
