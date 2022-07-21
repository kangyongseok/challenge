import styled from '@emotion/styled';

export const Divider = styled.hr<{ active?: boolean }>`
  margin-top: 32px;
  border-color: ${({ theme }) => theme.palette.common.grey['90']};
  border-color: ${({ theme, active }) => active && theme.palette.primary.main};
  border-top-width: ${({ active }) => (active ? 2 : 1)}px;
`;
