import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

export const StyledTabs = styled.div`
  display: flex;
`;

export const Tab = styled.button<{ selected: boolean; count: number }>`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background-color: ${({ theme: { palette } }) => palette.common.white};
  outline: 0;
  border: 0;
  margin: 0;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  appearance: none;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: -0.2px;
  text-align: center;
  min-height: 41px;
  padding: 10px 14px;
  overflow: hidden;
  white-space: normal;
  width: ${({ count }) => `calc(100% / ${count})`};

  ${({ theme: { palette }, selected }): CSSObject => ({
    '&:after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      height: selected ? '2px' : '1px',
      background: selected ? palette.primary.main : palette.common.grey[80]
    }
  })}
`;
