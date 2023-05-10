import { Image } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

export const UserImage = styled(Image)<{
  isActive: boolean;
  isRound: boolean;
  showBorder: boolean;
}>`
  border: ${({ isActive, showBorder, theme: { palette } }) =>
    (isActive && `2px solid ${palette.primary.light}`) ||
    (showBorder && `2px solid ${palette.common.uiWhite}`)};
`;

export const HiddenImageLoader = styled.img`
  display: none;
`;

export const IconBox = styled.div<{
  width: number;
  height: number;
  isRound: boolean;
}>`
  min-width: ${({ width }) => width}px;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme: { palette } }) => palette.common.bg03};
  border-radius: ${({ isRound }) => (isRound ? '50%' : '16px')};
  border: ${({ theme: { palette } }) => `2px solid ${palette.common.uiWhite}`};
`;

export const Status = styled.div`
  /* position: absolute; */
  display: inline-flex;
  justify-content: center;
  width: 100%;
  transform: translateY(-50%);
`;
