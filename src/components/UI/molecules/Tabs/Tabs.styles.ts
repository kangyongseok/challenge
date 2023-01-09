import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';

import { TAB_HEIGHT } from '@constants/common';

import { TabsProps } from '.';

export const StyledTabs = styled.div`
  display: flex;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export const Tab = styled.button<
  Pick<TabsProps, 'brandColor'> & { selected: boolean; count: number }
>`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
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
  font-size: 15px;
  line-height: 21px;
  letter-spacing: -0.2px;
  text-align: center;
  min-height: ${TAB_HEIGHT}px;
  padding: 12px 10px;
  overflow: hidden;
  white-space: normal;
  width: ${({ count }) => `calc(100% / ${count})`};

  ${({
    theme: {
      palette: { common }
    },
    selected,
    brandColor
  }): CSSObject => {
    switch (brandColor) {
      case 'black':
        return {
          '&:after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: selected ? '2px' : '1px',
            background: selected ? common.ui20 : common.ui80
          }
        };
      default:
        return {
          '&:after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: selected ? '2px' : '1px',
            background: selected ? common.ui20 : common.ui80
          }
        };
    }
  }}
`;

export const BadgeText = styled(Typography)<{ selected: boolean; badge?: boolean }>`
  ${({ badge }): CSSObject => {
    return badge
      ? {
          background:
            'url(https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/images/ico/badge_new.png) no-repeat 100% 50%',
          backgroundSize: '16px'
        }
      : {};
  }};
  color: ${({ theme: { palette }, selected }) =>
    selected ? palette.common.ui20 : palette.common.ui60};
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
`;
