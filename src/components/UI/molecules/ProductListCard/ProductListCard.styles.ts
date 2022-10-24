import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const Content = styled.div<{ isRound: boolean }>`
  position: relative;
  min-width: 134px;
  max-width: 134px;
  border-radius: ${({ theme: { box }, isRound }) => (isRound ? box.round['8'] : 0)};
  overflow: hidden;
`;

export const WishButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px 8px 0 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.button - 1};

  svg {
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.overlay20};
    border-radius: 50%;
    padding: 4px;
    margin-top: -4px;
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

export const Area = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

export const MetaSocial = styled(Flexbox)`
  gap: 6px;
`;
