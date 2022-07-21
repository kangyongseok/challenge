import styled from '@emotion/styled';

export const Wrapper = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 144px;
  right: 14px;
  z-index: 3;

  ${({ show }) =>
    show
      ? {
          opacity: 1
        }
      : {
          opacity: 0,
          pointerEvents: 'none'
        }};

  transition: opacity 0.1s ease-in;
`;
