import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const Content = styled.div<{ size: number; isTimeline: boolean }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  position: relative;
  border-radius: ${({ theme: { box } }) => box.round['8']};
  &::before {
    content: '';
    ${({ isTimeline, theme: { palette } }) =>
      isTimeline && {
        width: '5px',
        height: '5px',
        background: palette.primary.dark,
        position: 'absolute',
        top: '15%',
        left: '-17px',
        borderRadius: '50%'
      }}
  }
`;

export const Title = styled(Typography)`
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  & > span {
    color: ${({
      theme: {
        palette: { primary }
      }
    }) => primary.main};
  }
`;

export const PriceDownLabel = styled.div`
  min-width: fit-content;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  border-color: ${({ theme: { palette } }) => palette.secondary.red.main};
  color: ${({ theme: { palette } }) => palette.secondary.red.main};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 3px 4px;
  font-size: 10px;
  font-weight: 500;
  svg {
    color: ${({ theme: { palette } }) => palette.secondary.red.main};
    margin-right: -4px;
  }
`;
