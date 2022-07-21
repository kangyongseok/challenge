import styled from '@emotion/styled';

export const StyledBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme: { palette } }) => palette.primary.main};
`;
