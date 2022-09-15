import { Flexbox, Label, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const WishButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px 8px 0 0;
  z-index: ${({ theme: { zIndex } }) => zIndex.button - 7};

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

export const TodayWishViewLabel = styled(Label)<{ compact?: boolean }>`
  position: absolute;
  left: ${({ compact }) => (compact ? 0 : '12px')};
  bottom: -4px;
  z-index: 2;
`;
