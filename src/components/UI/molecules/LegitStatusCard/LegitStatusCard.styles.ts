import { Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

export const StyledLegitStatusCard = styled(Flexbox)<{ useInAdmin?: boolean; status: number }>`
  cursor: pointer;
  ${({ useInAdmin, status }) =>
    useInAdmin && status === 30
      ? {
          opacity: 0.5
        }
      : {}};
`;

export const ImageBox = styled.div`
  position: relative;
  min-width: 100px;
  max-width: 100px;
  border-radius: ${({
    theme: {
      box: { round }
    }
  }) => round['8']};
`;

export const Content = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const Title = styled(Typography)`
  margin-top: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
