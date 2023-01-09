import styled from '@emotion/styled';

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.overlay40};
  z-index: 2;
`;

export const WishButton = styled.button`
  width: 40px;
  height: 40px;
  margin-right: -8px;
  z-index: 3;
`;
