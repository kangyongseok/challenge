import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const StyledListItem = styled.li`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-decoration: none;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  padding: 12px 20px;
  column-gap: 12px;
  cursor: pointer;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 auto;
  min-width: 0;
  row-gap: 4px;
`;

export const UserAvatar = styled.div`
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
  border-radius: 50%;
  min-width: 52px;
  width: 52px;
  height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HiddenImageLoader = styled.img`
  display: none;
`;

export const Title = styled(Typography)<{ disabled: boolean }>`
  color: ${({ disabled, theme: { palette } }) => disabled && palette.common.ui60};
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

export const Time = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.ui60};
  white-space: nowrap;
`;

export const Description = styled(Typography)<{ disabled: boolean }>`
  color: ${({ disabled, theme: { palette } }) => disabled && palette.common.ui60};
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;
