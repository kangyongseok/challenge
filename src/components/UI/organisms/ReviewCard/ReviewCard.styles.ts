import styled from '@emotion/styled';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  padding: 20px;
  background-color: ${({ theme: { palette } }) => palette.common.bg03};
  border-radius: 8px;
  user-select: none;
`;
