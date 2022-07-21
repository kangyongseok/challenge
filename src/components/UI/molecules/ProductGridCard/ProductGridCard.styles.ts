import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

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
  // TODO UI 라이브러리 zIndex 값 조정 필요
  z-index: ${({ theme: { zIndex } }) => zIndex.button - 7};
`;

export const Title = styled(Typography)`
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  & > strong {
    color: ${({
      theme: {
        palette: { primary }
      }
    }) => primary.main};
  }
`;

export const Area = styled(Typography)`
  margin-top: 8px;
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
  margin-top: 4px;
  gap: 7px;
`;
