import styled from '@emotion/styled';

export const UserImage = styled.div<{
  url?: string;
  width: number;
  height: number;
  isActive: boolean;
  isRound: boolean;
  showBorder: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  border: ${({ isActive, showBorder, theme: { palette } }) =>
    (isActive && `2px solid ${palette.primary.light}`) ||
    (showBorder && `2px solid ${palette.common.uiWhite}`)};
  border-radius: ${({ isRound }) => (isRound ? '50%' : '16px')};
  background-image: ${({ url }) => `url(${url})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
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
