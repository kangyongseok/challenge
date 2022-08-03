import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const Content = styled.div<{ isRound: boolean }>`
  position: relative;
  min-width: 134px;
  max-width: 134px;
  border-radius: ${({ theme: { box }, isRound }) => (isRound ? box.round['8'] : 0)};
  overflow: hidden;
`;

export const SkeletonWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

export const WishButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px 8px 0 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.button - 1};

  svg {
    background-color: rgba(0, 0, 0, 0.2);
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
  }) => common.grey['60']};
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
`;

export const MetaSocial = styled(Flexbox)`
  gap: 6px;
`;
